import { NextResponse } from "next/server";
import { createReviewClient } from "@/lib/supabase/server";
import { feedbackHash } from "@/lib/fit-scan/review-entry";
import { perspectiveSchema } from "@/lib/fit-scan/perspective";

export async function POST(request: Request) {
  // Cross-site forms must not be able to submit a visitor's comments.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Submit your perspective from this website." }, { status: 403 });
  }
  const parsed = perspectiveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your comments, contact details and review session, then try again." }, { status: 400 });
  const input = parsed.data;
  try {
    const now = new Date();
    const { data, error } = await createReviewClient()
      .from("sm_starting_point_reviews")
      .update({
        business_goal: input.goal || null,
        must_preserve: input.mustPreserve || null,
        change_frequency: input.changeFrequency,
        contact_name: input.name || null,
        company_name: input.company || null,
        phone_number: input.phone || null,
        perspective_saved_at: now.toISOString(),
      })
      .eq("id", input.reviewId)
      .eq("feedback_token_hash", feedbackHash(input.token))
      .eq("status", "completed")
      .gt("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .select("id")
      .abortSignal(AbortSignal.timeout(5000));
    if (error) throw error;
    if (!data || data.length !== 1) return NextResponse.json({ error: "This review session has expired or could not be verified. Run a new review to save comments." }, { status: 409 });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Your comments could not be saved. Your draft is still here; please retry." }, { status: 503 });
  }
}
