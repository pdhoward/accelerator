import { isIP } from "node:net";
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

/** Vercel's location headers are URL-encoded ("S%C3%A3o%20Paulo"); absent locally. */
function header(request: Request, name: string, max = 120) {
  const v = request.headers.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, max);
  } catch {
    return v.slice(0, max);
  }
}

/** A referrer kept to hostname and path: no query strings (they can carry personal data). */
function cleanReferrer(v: string | undefined) {
  if (!v) return null;
  try {
    const u = new URL(v);
    return `${u.hostname}${u.pathname}`.slice(0, 300);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";

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

  const { email, role, propertyName, company, source, page, referrer } = parsed.data;

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

  const base = { email, role: role ?? null, property_name: propertyName ?? null, source: source ?? null };
  // Every request is its own row, with where it came from (supabase/sm_waitlist_requests.sql).
  const full = {
    ...base,
    page: page?.slice(0, 300) ?? null,
    referrer: cleanReferrer(referrer),
    ip_address: isIP(ip) ? ip : null,
    country: header(request, "x-vercel-ip-country", 8),
    region: header(request, "x-vercel-ip-country-region", 16),
    city: header(request, "x-vercel-ip-city"),
    user_agent: header(request, "user-agent", 300),
  };

  let { error } = await supabase.from("sm_waitlist").insert(full);
  // Before the table change runs, the new columns don't exist: save what the old table holds.
  if (error && (error.code === "PGRST204" || error.code === "42703")) {
    console.error("sm_waitlist is missing the request columns; run supabase/sm_waitlist_requests.sql.");
    ({ error } = await supabase.from("sm_waitlist").insert(base));
  }

  if (error) {
    // Unique violation on email (only until the table change runs): already on the list.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }
    console.error("sm_waitlist insert:", error.code, error.message);
    return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
