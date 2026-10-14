import { createReviewClient } from "@/lib/supabase/server";
import type { FitScanResult } from "./types";
import { isRecentReport, publicReport } from "./report-cache-policy";

export async function readSavedReport(siteKey: string): Promise<FitScanResult | null> {
  try {
    const { data, error } = await createReviewClient().from("sm_fit_scan_reports")
      .select("report").eq("site_key", siteKey).abortSignal(AbortSignal.timeout(3000)).maybeSingle();
    if (error || !data?.report) return null;
    const result = data.report as FitScanResult;
    return isRecentReport(result) ? publicReport(result) : null;
  } catch { return null; }
}

export async function saveReport(siteKey: string, result: FitScanResult) {
  try {
    const { error } = await createReviewClient().from("sm_fit_scan_reports").upsert({
      site_key: siteKey, report: publicReport(result), scanned_at: result.scannedAt,
    }, { onConflict: "site_key" }).abortSignal(AbortSignal.timeout(3000));
    return !error;
  } catch { return false; }
}
