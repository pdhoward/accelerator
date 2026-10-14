"use client";

import * as React from "react";
import { AlertTriangle, Check, Info, Loader2, ScanSearch, Sparkles, X } from "lucide-react";

import type { Audit, AuditCategory, FitScanResult, FitVerdict } from "@/lib/fit-scan/types";
import { cn } from "@/lib/utils";
import type { BusinessContext } from "@/lib/fit-scan/starting-point";
import { StartingPointRecord } from "@/components/marketing/starting-point-record";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/marketing/score-gauge";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

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
  hygiene: "Site care: findings to review",
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
  const [context, setContext] = React.useState<BusinessContext>({ goal: "", mustPreserve: "", changeFrequency: "unknown" });
  const [draftContext, setDraftContext] = React.useState<BusinessContext>({ goal: "", mustPreserve: "", changeFrequency: "unknown" });
  const [saving, setSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<FitScanResult | null>(null);
  const autoRan = React.useRef(false);

  const scan = React.useCallback(async (target: string) => {
    if (!target.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setContext({ goal: "", mustPreserve: "", changeFrequency: "unknown" });
    setDraftContext({ goal: "", mustPreserve: "", changeFrequency: "unknown" });
    setSaveMessage(null);
    setSaveError(null);
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
      setLoading(false);
    }
  }, []);

  async function savePerspective(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result || saving) return;
    setContext({ ...draftContext });
    setSaveMessage(null);
    setSaveError(null);
    if (!result.review) {
      setSaveError("Your starting record was updated locally, but assessment history is unavailable. Comments have not been saved. You can download the draft or run a new review later to retry saving.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/fit-scan/perspective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: result.review.id, token: result.review.token, ...draftContext }),
      });
      const body = await response.json();
      if (!response.ok || body.saved !== true) throw new Error(body.error ?? "Your comments could not be saved. Please retry.");
      setSaveMessage("Your perspective is saved. Your starting record is updated—no new scan was needed.");
    } catch (err) {
      setSaveError(`${err instanceof Error ? err.message : "Your comments could not be saved."} Your updated draft is still available below and can be downloaded.`);
    } finally {
      setSaving(false);
    }
  }

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
        className="mx-auto flex w-full max-w-3xl flex-col gap-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={url} onChange={(e) => { setUrl(e.target.value); if (result) { setResult(null); setContext({ goal: "", mustPreserve: "", changeFrequency: "unknown" }); setDraftContext({ goal: "", mustPreserve: "", changeFrequency: "unknown" }); setSaveMessage(null); setSaveError(null); } }} placeholder="yourapp.com" aria-label="Website address" className="h-13 min-w-0 flex-1 text-base" disabled={loading || saving} />
          <Button type="submit" variant="gold" size="lg" disabled={loading || saving || !url.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
            {loading ? "Reviewing…" : "Discover my starting point"}
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-mist">Step 1: review the public website. We record the assessed website, time, outcome and technical summary in Supabase when available; URL query strings are omitted. Business comments are collected only when you submit the separate perspective form after the review. <a href="/legal/privacy" className="underline">Privacy details</a></p>

      </form>

      {loading && <div role="status" className="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-2xl border border-obsidian-border bg-obsidian-2/60 p-6"><Loader2 className="mt-1 size-5 shrink-0 animate-spin text-aurora-cyan" /><div><p className="text-white">Reviewing public signals and available technical evidence…</p><p className="mt-2 text-sm text-fog">The assessment may include an AI analyst and Google PageSpeed results. Availability varies; missing evidence will be identified in the report.</p></div></div>}

      {error && (
        <p className="mx-auto max-w-2xl rounded-xl border border-red-400/30 bg-red-400/5 px-5 py-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {result && !loading && (
        <>
          <div className="mx-auto w-full max-w-3xl">
            <p className="mb-4 text-sm text-aurora-cyan" role="status">Step 1 complete · public review ready for {new URL(result.finalUrl).hostname}</p>
            {!result.review && <p className="mb-4 rounded-xl border border-gold/30 p-4 text-sm text-gold-bright">Assessment history is unavailable. This review is not saved; you can still update and download a local draft.</p>}
            <form onSubmit={savePerspective} className="flex flex-col gap-4">
        <fieldset className="rounded-2xl border border-obsidian-border bg-obsidian-2/50 p-5" disabled={saving}>
          <legend className="px-2 text-sm font-medium text-white">Step 2 · Add your perspective</legend>
          <p className="mb-5 text-sm leading-relaxed text-fog">Your public review is ready. Add your business context, then submit it separately to update your starting record without repeating the scan. Choose Save my perspective to store your comments with this review in Supabase; the AI analyst does not receive them.</p>
          <div className="flex flex-col gap-5">
            <label htmlFor="business-goal" className="flex flex-col gap-2 text-sm text-white">What should this site do better for your business?
              <textarea id="business-goal" value={draftContext.goal} onChange={(e) => { setDraftContext((c) => ({ ...c, goal: e.target.value })); setSaveMessage(null); setSaveError(null); }} maxLength={1000} rows={3} placeholder="For example: generate more qualified inquiries, simplify bookings, or keep content accurate." className="w-full rounded-xl border border-obsidian-border bg-obsidian p-3 text-fog focus-visible:outline-2 focus-visible:outline-aurora-cyan" />
            </label>
            <label htmlFor="business-invariant" className="flex flex-col gap-2 text-sm text-white">What must a change never break?
              <textarea id="business-invariant" value={draftContext.mustPreserve} onChange={(e) => { setDraftContext((c) => ({ ...c, mustPreserve: e.target.value })); setSaveMessage(null); setSaveError(null); }} maxLength={1000} rows={2} placeholder="For example: prices follow our agreed rules, or every inquiry reaches the right team." className="w-full rounded-xl border border-obsidian-border bg-obsidian p-3 text-fog focus-visible:outline-2 focus-visible:outline-aurora-cyan" />
            </label>
            <label htmlFor="change-frequency" className="flex flex-col gap-2 text-sm text-white">How often does the site need meaningful changes?
              <select id="change-frequency" value={draftContext.changeFrequency} onChange={(e) => { setDraftContext((c) => ({ ...c, changeFrequency: e.target.value as BusinessContext["changeFrequency"] })); setSaveMessage(null); setSaveError(null); }} className="w-full rounded-xl border border-obsidian-border bg-obsidian p-3 text-fog">
                <option value="unknown">Not sure yet</option><option value="rarely">Occasional content or small updates</option><option value="monthly">Recurring improvements each month</option><option value="weekly">Frequent changes or business workflows</option>
              </select>
            </label>
          </div>
          <p className="mt-4 text-xs text-mist">Please leave out credentials and personal customer data. These are draft inputs, not approved requirements.</p>
        </fieldset>
              <Button type="submit" variant="gold" size="lg" disabled={saving} className="self-start">
                {saving && <Loader2 className="size-4 animate-spin" />}
                {saving ? "Saving…" : result.review ? "Save my perspective" : "Update draft locally"}
              </Button>
              {saveMessage && <p role="status" className="text-sm text-signal">{saveMessage}</p>}
              {saveError && <p role="alert" className="text-sm text-gold-bright">{saveError}</p>}
              {result.review && <p className="text-xs text-mist">Public review saved. Submitted comments are linked to this review, not automatically to an email or walkthrough request. <a href="/legal/privacy" className="underline">How we use this information</a></p>}
            </form>
          </div>
          <FitScanReport result={result} context={context} />
        </>
      )}
    </div>
  );
}

function FitScanReport({ result, context }: { result: FitScanResult; context: BusinessContext }) {
  const grouped = (["stack", "application", "delivery", "hygiene"] as const).map((cat) => ({
    cat,
    audits: result.audits
      .filter((a) => a.category === cat)
      .sort((a, b) => ["fail", "warn", "info", "pass"].indexOf(a.status) - ["fail", "warn", "info", "pass"].indexOf(b.status)),
  }));
  const host = new URL(result.finalUrl).hostname;

  return (
    <div className="flex flex-col gap-8">
      <StartingPointRecord result={result} context={context} />
      <div><h2 className="text-2xl font-semibold text-white">Technical fit and public evidence</h2><p className="mt-2 text-sm leading-relaxed text-fog">Observed {new Date(result.scannedAt).toLocaleString()}. Scores are deterministic public-site indicators, not a measure of business value or proof of internal reliability. Hidden capabilities may be missed.</p></div>
      {/* Verdict */}
      <div className="grid items-center gap-8 rounded-3xl border border-obsidian-border bg-obsidian-2/60 p-6 sm:p-10 lg:grid-cols-[auto_1fr]">
        <ScoreGauge score={result.fitScore} label="Public-site fit" size={148} />
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
      <p className="text-xs leading-relaxed text-mist">Public-site fit combines stack fit (45%), visible application depth (35%) and hosting/delivery signals (20%). Site care is reported separately. These heuristics do not measure commercial return or verify an internal release pipeline.</p>

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
      {!result.lighthouse && <p className="rounded-xl border border-obsidian-border p-4 text-sm text-fog">Mobile Lighthouse evidence is unavailable for this assessment. No performance or accessibility score has been inferred.</p>}

      {/* Analyst */}
      {result.analysis && (
        <div className="rounded-3xl border border-aurora-violet/30 bg-obsidian-2/60 p-6 sm:p-8 border-glow-aurora">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-aurora-cyan">
            <Sparkles className="size-3.5" /> AI interpretation · {result.analysis.analyst}
          </p>
          <p className="mt-4 text-lg text-white">{result.analysis.businessSummary}</p>
          <p className="mt-1 text-sm text-mist">{result.analysis.applicationType}</p>
          <p className="mt-4 leading-relaxed text-fog">{result.analysis.pitch}</p>

          <h3 className="mt-8 font-semibold text-white">Proposed improvements to discuss</h3>
          <ol className="mt-3 flex flex-col gap-2">
            {result.analysis.firstBacklog.map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-obsidian-border bg-obsidian px-4 py-3">
                <span className="mt-0.5 rounded-md bg-aurora-gradient px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">Suggestion</span>
                <span>
                  <span className="text-sm font-medium text-white">{item.title}</span>
                  <span className="block text-sm text-fog">{item.why}</span>
                </span>
              </li>
            ))}
          </ol>

          {result.analysis.risks.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold text-white">Questions for a deeper review</h3>
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
              {cat === "hygiene" && <span className="ml-2 font-mono text-xs text-gold-bright">{result.dayOneBacklog} findings</span>}
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
        <h3 className="text-2xl font-semibold text-white">Bring your starting record to an expert conversation.</h3>
        <p className="max-w-lg text-fog">
          Review your priorities with us, challenge the assumptions and choose a proportionate next step.
          A deeper review can include repository, test and delivery evidence with your permission.
          Download your record to keep the context; this request sends contact details only. Comments saved above remain in the separate assessment history.
        </p>
        <WaitlistForm defaultCompany={host} source="fit-scan" />
      </div>
    </div>
  );
}
