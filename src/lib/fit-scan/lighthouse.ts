import type { LighthouseScores } from "./types";

/**
 * Real Lighthouse category scores via Google's PageSpeed Insights API (mobile).
 * Works without a key at a low shared quota; set PAGESPEED_API_KEY for a
 * dedicated one. Returns null on any failure — the scan never depends on it.
 */
export async function runLighthouse(url: string, timeoutMs = 45_000): Promise<LighthouseScores | null> {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url);
  api.searchParams.set("strategy", "mobile");
  for (const c of ["performance", "accessibility", "best-practices", "seo"]) api.searchParams.append("category", c);
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set("key", process.env.PAGESPEED_API_KEY);

  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      lighthouseResult?: { categories?: Record<string, { score: number | null } | undefined> };
    };
    const cats = json.lighthouseResult?.categories;
    if (!cats) return null;
    const pct = (key: string) => {
      const score = cats[key]?.score;
      return typeof score === "number" ? Math.round(score * 100) : null;
    };
    return {
      performance: pct("performance"),
      accessibility: pct("accessibility"),
      bestPractices: pct("best-practices"),
      seo: pct("seo"),
    };
  } catch {
    return null;
  }
}
