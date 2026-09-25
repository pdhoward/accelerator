import { NextResponse } from "next/server";
import { z } from "zod";

import { admitScan } from "@/lib/fit-scan/budget";
import { normalizeTarget, runFitScan, ScanError } from "@/lib/fit-scan/scan";
import type { FitScanResult } from "@/lib/fit-scan/types";

// PageSpeed + the analyst can take ~45s on a slow site.
export const maxDuration = 60;

/**
 * Spend and abuse limits live in lib/fit-scan/budget.ts (shared, in Postgres).
 * Results are cached per URL for 10 minutes per instance, so repeat views of
 * the same report cost nothing and don't count against a visitor's limit.
 */
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { result: FitScanResult; expiresAt: number }>();

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
    key = `${target.hostname}${target.pathname.replace(/\/+$/, "")}${target.search}`;
  } catch (err) {
    const message = err instanceof ScanError ? err.message : "Enter a website address.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.result);
  }

  const ip =
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const admission = await admitScan(ip, host);
  if (!admission.allowed) {
    const error =
      admission.reason === "global"
        ? "The Fit Scan is very busy right now — try again later this hour."
        : "You've reached the scan limit for now — try again in an hour.";
    return NextResponse.json({ error }, { status: 429 });
  }

  try {
    const result = await runFitScan(parsed.data.url, { allowAnalyst: admission.analyst });
    cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ScanError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("fit-scan failed", err);
    return NextResponse.json({ error: "The scan failed unexpectedly. Try again." }, { status: 500 });
  }
}
