import { NextResponse } from "next/server";
import { z } from "zod";

import { admitScan } from "@/lib/fit-scan/budget";
import { normalizeTarget, runFitScan, ScanError } from "@/lib/fit-scan/scan";
import type { FitScanResult } from "@/lib/fit-scan/types";
import { recordReview } from "@/lib/fit-scan/history";
import { readSavedReport, saveReport } from "@/lib/fit-scan/report-cache";
import { isRecentReport, publicReport, reportSiteKey } from "@/lib/fit-scan/report-cache-policy";

// PageSpeed + the analyst can take ~45s on a slow site.
export const maxDuration = 60;

/**
 * Spend and abuse limits live in lib/fit-scan/budget.ts (shared, in Postgres).
 * Reuse a site's original public report for seven days, backed by Supabase.
 * Visitor receipts and perspective/contact details are never shared.
 */
const cache = new Map<string, FitScanResult>();
function remember(key: string, result: FitScanResult) {
  if (!cache.has(key) && cache.size >= 256) cache.delete(cache.keys().next().value!);
  cache.set(key, result);
}

const bodySchema = z.object({ url: z.string().min(1).max(2048) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a website address." }, { status: 400 });
  }

  // Cheap validation first, so rejected input never counts against the limit.
  let key: string;
  let host: string;
  try {
    const target = normalizeTarget(parsed.data.url);
    host = target.hostname;
    key = reportSiteKey(target);
  } catch (err) {
    const message = err instanceof ScanError ? err.message : "Enter a website address.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const memory = cache.get(key);
  const cached = memory && isRecentReport(memory) ? memory : await readSavedReport(key);
  if (cached) {
    remember(key, cached);
    const review = await recordReview(parsed.data.url, cached, true);
    return NextResponse.json({ ...cached, review, reusedReport: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const ip =
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const admission = await admitScan(ip, host);
  if (!admission.allowed) {
    const error =
      admission.reason === "global"
        ? "The starting-point assessment is very busy right now — try again later this hour."
        : "You've reached the scan limit for now — try again in an hour.";
    return NextResponse.json({ error }, { status: 429 });
  }

  try {
    const result = publicReport(await runFitScan(parsed.data.url, { allowAnalyst: admission.analyst }));
    remember(key, result);
    const persisted = await saveReport(key, result);
    const review = await recordReview(parsed.data.url, result, false);
    return NextResponse.json({ ...result, review, reusedReport: false, notes: [...result.notes, ...(!persisted ? ["The shared report cache is unavailable. This report may not be reusable after a server restart."] : [])] }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    await recordReview(parsed.data.url, null, false);
    if (err instanceof ScanError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("fit-scan failed", err);
    return NextResponse.json({ error: "The scan failed unexpectedly. Try again." }, { status: 500 });
  }
}
