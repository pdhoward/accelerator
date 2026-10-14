"use client";

import { Download, FileText } from "lucide-react";
import type { FitScanResult } from "@/lib/fit-scan/types";
import { buildStartingPoint, type BusinessContext } from "@/lib/fit-scan/starting-point";
import { Button } from "@/components/ui/button";

const OPPORTUNITY = {
  "focused-care": "A lighter approach may be enough",
  "clarify-depth": "Your business context deserves a closer look",
  "technical-review": "Confirm technical compatibility first",
  "governed-improvement": "Explore a first governed improvement",
};

export function StartingPointRecord({ result, context }: { result: FitScanResult; context: BusinessContext }) {
  const record = buildStartingPoint(result, context);
  function download() {
    const payload = {
      format: "accelerator-starting-point-v1",
      createdAt: new Date().toISOString(),
      status: "draft-not-approved",
      businessContext: { ...context, source: "visitor-provided-not-independently-verified" },
      startingPoint: record,
      publicScan: { ...result, review: undefined },
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${new URL(result.finalUrl).hostname}-starting-point.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-labelledby="starting-record-title" className="rounded-3xl border border-aurora-violet/40 bg-aurora-violet/5 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-aurora-cyan"><FileText className="size-4" /> Your starting record · draft</p>
          <h2 id="starting-record-title" className="mt-3 text-2xl font-semibold text-white">{OPPORTUNITY[record.opportunity]}</h2>
        </div>
        <Button variant="outline" onClick={download}><Download className="size-4" /> Download record</Button>
      </div>
      <p className="mt-4 text-lg leading-relaxed text-fog">{record.recommendation}</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-obsidian-border bg-obsidian-2 p-5">
          <h3 className="font-semibold text-white">What you want to accomplish</h3>
          <p className="mt-1 text-xs text-aurora-cyan">Your input · not yet an agreed requirement</p>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm text-fog">{record.agreement.goal ?? "Not specified yet. What should this site do better for your business?"}</p>
          <h4 className="mt-5 text-sm font-medium text-white">What must remain true</h4>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-fog">{record.agreement.mustPreserve ?? "Not specified yet. Which rule or customer experience must a change protect?"}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-obsidian-border bg-obsidian-2 p-5">
          <h3 className="font-semibold text-white">Visible capability signals</h3>
          <p className="mt-1 text-xs text-aurora-cyan">Public-page observations · confirm the underlying behavior</p>
          {record.capabilities.length ? <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-fog">{record.capabilities.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-3 text-sm leading-relaxed text-fog">No strong application signals were found on the scanned page. This may be a content site, or deeper functions may be hidden from public view.</p>}
        </div>
        <div className="min-w-0 rounded-xl border border-obsidian-border bg-obsidian-2 p-5">
          <h3 className="font-semibold text-white">A proposed first proof</h3>
          <p className="mt-1 text-xs text-gold-bright">Recommendation · discuss before committing work</p>
          <p className="mt-3 text-sm leading-relaxed text-fog">{record.suggestedCheck}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-obsidian-border bg-obsidian-2 p-5">
          <h3 className="font-semibold text-white">What we still need to understand</h3>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-fog">{record.unknowns.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-mist">Submit the perspective form to apply your answers to this draft. When saving is available, submitted comments are stored with this assessment in Supabase; save failures are shown explicitly above. Draft edits remain in the browser until submitted. Download includes the applied answers, but no private review token. Comments are not sent to the AI analyst or automatically attached to a walkthrough request. This record does not authorize delivery.</p>
    </section>
  );
}
