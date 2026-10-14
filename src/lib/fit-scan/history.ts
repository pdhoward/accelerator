import { createReviewClient } from "@/lib/supabase/server";
import { prepareReview } from "./review-entry";
import { historyUrl } from "./perspective";
import type { FitScanResult, ReviewReceipt } from "./types";

export async function recordReview(url: string, result: FitScanResult | null, cached: boolean): Promise<ReviewReceipt | null> {
  try {
    const { row, receipt } = prepareReview(historyUrl(url), result, cached);
    const { error } = await createReviewClient().from("sm_starting_point_reviews").insert(row).abortSignal(AbortSignal.timeout(4000));
    if (error) throw error;
    return receipt;
  } catch {
    // No URL, comments, token or DB detail in application logs.
    console.warn("starting-point: history unavailable");
    return null;
  }
}
