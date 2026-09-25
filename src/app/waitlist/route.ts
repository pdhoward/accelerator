import { NextResponse } from "next/server";

import { waitlistSchema } from "@/lib/waitlist";
import { createWaitlistClient } from "@/lib/supabase/server";

/**
 * Lightweight in-memory rate limit — resets on cold start / per-instance,
 * so it's a soft speed bump against casual abuse, not a real distributed
 * limiter. Fine for a pre-GA waitlist form; revisit if this sees real spam.
 */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const requestLog = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = requestLog.get(ip);
  if (!entry || now > entry.resetAt) {
    requestLog.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { email, role, propertyName, company, source } = parsed.data;

  // Honeypot tripped — pretend success so bots don't learn to adapt.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  let supabase: ReturnType<typeof createWaitlistClient>;
  try {
    supabase = createWaitlistClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Waitlist is not configured yet — see .env.local.example." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("sm_waitlist").insert({
    email,
    role: role ?? null,
    property_name: propertyName ?? null,
    source: source ?? null,
  });

  if (error) {
    // Unique violation on email — treat as a friendly "already on the list."
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }
    return NextResponse.json({ error: "Could not join the waitlist." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
