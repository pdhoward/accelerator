"use client";

import * as React from "react";
import { AlertTriangle, Check, Info, Loader2, ScanSearch, Sparkles, X } from "lucide-react";

import type { Audit, AuditCategory, FitScanResult, FitVerdict } from "@/lib/fit-scan/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/marketing/score-gauge";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

const STAGES = [
  "Fetching the site…",
  "Reading the stack and headers…",
  "Checking robots.txt and the sitemap…",
  "Running Lighthouse via Google PageSpeed…",
  "Asking the analyst for a first backlog…",
];

const VERDICT_STYLE: Record<FitVerdict, string> = {
  strong: "border-signal/40 bg-signal/10 text-signal",
  candidate: "border-aurora-cyan/40 bg-aurora-cyan/10 text-aurora-cyan",
  cms: "border-gold/40 bg-gold/10 text-gold-bright",
  roadmap: "border-aurora-violet/40 bg-aurora-violet/10 text-aurora-violet",
  "low-value": "border-gold/40 bg-gold/10 text-gold-bright",
  replatform: "border-gold/40 bg-gold/10 text-gold-bright",
  "not-a-fit": "border-red-400/40 bg-red-400/10 text-red-400",
};

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  stack: "Stack",
  application: "Application",
  delivery: "Delivery",
  hygiene: "Hygiene: your day-one backlog",
};

function StatusIcon({ status }: { status: Audit["status"] }) {
  if (status === "pass") return <Check className="size-4 shrink-0 text-signal" />;
  if (status === "warn") return <AlertTriangle className="size-4 shrink-0 text-gold-bright" />;
  if (status === "fail") return <X className="size-4 shrink-0 text-red-400" />;
  return <Info className="size-4 shrink-0 text-mist" />;
}

export function FitScanTool({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = React.useState(initialUrl);
  const [loading, setLoading] = React.useState(false);
  const [stage, setStage] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<FitScanResult | null>(null);
  const autoRan = React.useRef(false);

  const scan = React.useCallback(async (target: string) => {
    if (!target.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 4500);
    try {
      const res = await fetch("/api/fit-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "The scan failed. Try again.");
      else setResult(json as FitScanResult);
    } catch {
      setError("The scan failed. Try again.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialUrl && !autoRan.current) {
      autoRan.current = true;
      void scan(initialUrl);
    }
  }, [initialUrl, scan]);

  return (
    <div className="flex flex-col gap-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void scan(url);
        }}
        className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
      >
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourapp.com"
          aria-label="Website address"
          className="h-13 flex-1 text-base"
          disabled={loading}
        />
        <Button type="submit" variant="gold" size="lg" disabled={loading || !url.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
          {loading ? "Scanning…" : "Run Fit Scan"}
        </Button>
      </form>

      {loading && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-obsidian-border bg-obsidian-2/60 p-6" aria-live="polite">
          {STAGES.map((s, i) => (
            <p key={s} className={cn("flex items-center gap-2 text-sm transition-colors", i < stage ? "text-fog" : i === stage ? "text-white" : "text-mist/50")}>
              {i < stage ? <Check className="size-3.5 text-signal" /> : i === stage ? <Loader2 className="size-3.5 animate-spin text-aurora-cyan" /> : <span className="size-3.5" />}
              {s}
            </p>
          ))}
          <p className="mt-2 text-xs text-mist">Usually 15–45 seconds.</p>
        </div>
      )}

      {error && (
        <p className="mx-auto max-w-2xl rounded-xl border border-red-400/30 bg-red-400/5 px-5 py-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {result && <FitScanReport result={result} />}
    </div>
  );
}

function FitScanReport({ result }: { result: FitScanResult }) {
  const grouped = (["stack", "application", "delivery", "hygiene"] as const).map((cat) => ({
    cat,
    audits: result.audits
      .filter((a) => a.category === cat)
      .sort((a, b) => ["fail", "warn", "info", "pass"].indexOf(a.status) - ["fail", "warn", "info", "pass"].indexOf(b.status)),
  }));
  const host = new URL(result.finalUrl).hostname;

  return (
    <div className="flex flex-col gap-8">
      {/* Verdict */}
      <div className="grid items-center gap-8 rounded-3xl border border-obsidian-border bg-obsidian-2/60 p-6 sm:p-10 lg:grid-cols-[auto_1fr]">
        <ScoreGauge score={result.fitScore} label="Accelerator fit" size={148} />
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-mist">{host}</p>
          <span className={cn("w-fit rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest", VERDICT_STYLE[result.verdict])}>
            {result.verdictLabel}
          </span>
          <p className="text-lg leading-relaxed text-white">{result.verdictDetail}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[result.detected.framework ?? "Framework unknown", result.detected.hosting ?? "Hosting unknown", ...result.detected.services].map((chip) => (
              <span key={chip} className="rounded-full border border-obsidian-border bg-obsidian px-3 py-1 text-xs text-fog">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category gauges */}
      <div className="grid grid-cols-2 gap-6 rounded-3xl border border-obsidian-border bg-obsidian-2/40 p-6 sm:grid-cols-4 sm:p-8">
        {result.categories.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-1">
            <ScoreGauge score={c.score} label={c.label} />
            <p className="text-center text-[11px] text-mist">{c.summary}</p>
          </div>
        ))}
      </div>

      {result.lighthouse && (
        <div className="rounded-3xl border border-obsidian-border bg-obsidian-2/40 p-6 sm:p-8">
          <p className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-mist">Lighthouse · mobile · via Google PageSpeed</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <ScoreGauge score={result.lighthouse.performance} label="Performance" size={76} />
            <ScoreGauge score={result.lighthouse.accessibility} label="Accessibility" size={76} />
            <ScoreGauge score={result.lighthouse.bestPractices} label="Best practices" size={76} />
            <ScoreGauge score={result.lighthouse.seo} label="SEO" size={76} />
          </div>
        </div>
      )}

      {/* Analyst */}
      {result.analysis && (
        <div className="rounded-3xl border border-aurora-violet/30 bg-obsidian-2/60 p-6 sm:p-8 border-glow-aurora">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-aurora-cyan">
            <Sparkles className="size-3.5" /> Analyst read · {result.analysis.analyst}
          </p>
          <p className="mt-4 text-lg text-white">{result.analysis.businessSummary}</p>
          <p className="mt-1 text-sm text-mist">{result.analysis.applicationType}</p>
          <p className="mt-4 leading-relaxed text-fog">{result.analysis.pitch}</p>

          <h3 className="mt-8 font-semibold text-white">What the Accelerator would take on first</h3>
          <ol className="mt-3 flex flex-col gap-2">
            {result.analysis.firstBacklog.map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-obsidian-border bg-obsidian px-4 py-3">
                <span className="mt-0.5 rounded-md bg-aurora-gradient px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">{item.level}</span>
                <span>
                  <span className="text-sm font-medium text-white">{item.title}</span>
                  <span className="block text-sm text-fog">{item.why}</span>
                </span>
              </li>
            ))}
          </ol>

          {result.analysis.risks.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold text-white">What only the code can answer</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {result.analysis.risks.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-fog">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-mist" />
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Audits */}
      <div className="grid gap-6 lg:grid-cols-2">
        {grouped.map(({ cat, audits }) => (
          <div key={cat} className={cn("rounded-2xl border border-obsidian-border bg-obsidian-2/40 p-6", cat === "hygiene" && "lg:col-span-2")}>
            <h3 className="font-semibold text-white">
              {CATEGORY_LABEL[cat]}
              {cat === "hygiene" && <span className="ml-2 font-mono text-xs text-gold-bright">{result.dayOneBacklog} items</span>}
            </h3>
            <ul className={cn("mt-4 grid gap-x-6 gap-y-3", cat === "hygiene" && "sm:grid-cols-2")}>
              {audits.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5">
                  <StatusIcon status={a.status} />
                  <span>
                    <span className="block text-sm text-white">{a.title}</span>
                    <span className="block text-xs text-fog">{a.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-obsidian-border p-5">
        {result.notes.map((n) => (
          <p key={n} className="text-xs text-mist">
            {n}
          </p>
        ))}
      </div>

      {/* Lead capture */}
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-gold/30 bg-gold/[0.04] p-8 text-center">
        <h3 className="text-2xl font-semibold text-white">Want the inside-out version?</h3>
        <p className="max-w-lg text-fog">
          Commissioning week 1 reads the repository, tests and backlog, and turns this outside-in scan
          into a Readiness Report. Apply and we&apos;ll follow up.
        </p>
        <WaitlistForm defaultCompany={host} source="fit-scan" />
      </div>
    </div>
  );
}
