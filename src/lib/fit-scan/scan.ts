import { getAnalyst } from "./analyst";
import { countSitemapUrls, extractSignals } from "./detect";
import { runLighthouse } from "./lighthouse";
import { normalizeTarget, safeFetch, ScanError } from "./safe-fetch";
import { scoreSignals } from "./score";
import type { FitScanResult } from "./types";

export { normalizeTarget, ScanError };

async function fetchOptional(url: URL, maxBytes: number): Promise<string | null> {
  try {
    const res = await safeFetch(url, { timeoutMs: 6_000, maxBytes, maxRedirects: 2 });
    return res.status === 200 ? res.body : null;
  } catch {
    return null;
  }
}

export async function runFitScan(rawUrl: string, { allowAnalyst }: { allowAnalyst: boolean }): Promise<FitScanResult> {
  const target = normalizeTarget(rawUrl);
  const page = await safeFetch(target);
  if (page.status >= 400) {
    throw new ScanError(`${page.finalUrl.hostname} returned HTTP ${page.status}, so there's nothing to analyze.`);
  }

  const origin = new URL("/", page.finalUrl);
  const lighthouse = runLighthouse(page.finalUrl.toString());
  const [robotsTxt, sitemapXml] = await Promise.all([
    fetchOptional(new URL("/robots.txt", origin), 200_000),
    fetchOptional(new URL("/sitemap.xml", origin), 3_000_000),
  ]);
  const robotsLooksReal = robotsTxt && /user-agent|sitemap|disallow|allow/i.test(robotsTxt) ? robotsTxt : null;
  const sitemapCount = sitemapXml && /<(urlset|sitemapindex)/i.test(sitemapXml) ? countSitemapUrls(sitemapXml) : null;

  const signals = extractSignals({
    html: page.body,
    headers: page.headers,
    finalUrl: page.finalUrl,
    headerMs: page.headerMs,
    bytes: page.bytes,
    robotsTxt: robotsLooksReal,
    sitemapUrlCount: sitemapCount,
  });
  const scannedAt = new Date();
  const scored = scoreSignals(signals, scannedAt.getUTCFullYear());

  const notes: string[] = [
    "This is an outside-in scan. It sees only what any visitor's browser sees. Code quality, tests, backlog and pipeline are assessed from the repository in commissioning week 1.",
  ];
  if (page.truncated) notes.push("The home page was very large, so only its first 2 MB were analyzed.");
  if (signals.visibleText.length < 200) {
    notes.push("Very little text was rendered server-side. This is likely a client-rendered app, so some signals may be missed.");
  }

  // Spend guard: the paid analyst runs only when the shared budget admits it,
  // and never on sites that clearly aren't candidates.
  const worthAnalyzing = scored.verdict !== "not-a-fit" && scored.verdict !== "low-value";
  const analyst = allowAnalyst && worthAnalyzing ? getAnalyst() : null;
  if (!allowAnalyst && worthAnalyzing && getAnalyst()) {
    notes.push("The AI analyst isn't available for this scan (daily budget reached or paused), so there's no written analysis. The scores are unaffected.");
  }
  const [lh, analysis] = await Promise.all([
    lighthouse,
    analyst
      ? analyst.analyze({ url: page.finalUrl.toString(), signals, scored }).catch((err) => {
          console.error("fit-scan analyst failed", err);
          notes.push("The AI analyst was unavailable for this scan; the scores above are unaffected.");
          return null;
        })
      : Promise.resolve(null),
  ]);
  if (!lh) notes.push("Lighthouse scores were unavailable for this scan (Google PageSpeed is busy or over quota). Try again shortly.");

  return {
    url: target.toString(),
    finalUrl: page.finalUrl.toString(),
    scannedAt: scannedAt.toISOString(),
    verdict: scored.verdict,
    verdictLabel: scored.verdictLabel,
    verdictDetail: scored.verdictDetail,
    fitScore: scored.fitScore,
    categories: scored.categories,
    detected: {
      framework: signals.framework,
      stackTier: scored.stackTierLabel,
      hosting: signals.hosting,
      services: signals.services,
    },
    audits: scored.audits,
    dayOneBacklog: scored.dayOneBacklog,
    lighthouse: lh,
    analysis,
    notes,
  };
}
