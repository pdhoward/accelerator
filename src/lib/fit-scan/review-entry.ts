import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { FitScanResult } from "./types";

export const feedbackHash = (token: string) => createHash("sha256").update(token).digest("hex");

/** Accepts a URL already sanitized by historyUrl at the persistence boundary. */
export function prepareReview(safeUrl: string, result: FitScanResult | null, cached: boolean) {
  const id = randomUUID();
  const token = randomBytes(32).toString("hex");
  return {
    receipt: { id, token },
    row: {
      id, feedback_token_hash: feedbackHash(token), website_url: safeUrl,
      host: new URL(safeUrl).hostname, status: result ? "completed" : "failed",
      cache_hit: cached, fit_score: result?.fitScore ?? null, verdict: result?.verdict ?? null,
    },
  };
}
