import type { FitScanResult } from "./types";

export const REPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function reportSiteKey(url: URL) {
  return url.hostname.toLowerCase().replace(/^www\./, "") + (url.port ? `:${url.port}` : "");
}

export function isRecentReport(result: FitScanResult, now = Date.now()) {
  const time = Date.parse(result.scannedAt);
  return Number.isFinite(time) && time <= now && time > now - REPORT_TTL_MS;
}

/** Never share a visitor's receipt or query strings through the report cache. */
export function publicReport(result: FitScanResult): FitScanResult {
  const cleanUrl = (raw: string) => { const url = new URL(raw); url.search = ""; url.hash = ""; url.username = ""; url.password = ""; return url.toString(); };
  return { ...result, url: cleanUrl(result.url), finalUrl: cleanUrl(result.finalUrl), review: undefined, reusedReport: undefined };
}
