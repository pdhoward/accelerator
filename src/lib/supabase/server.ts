import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous marketing client, used server-side by
 * app/waitlist/route.ts (insert-only into sm_waitlist; design.md §8) and by
 * lib/fit-scan/budget.ts. Private assessment history instead uses the
 * server-only service-role client below. No service-role credential is exposed.
 */
export function createWaitlistClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.local.example).",
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/** Server-only history access. Never import into a client component. */
export function createReviewClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Assessment history is not configured.");
  return createClient(url, key, { auth: { persistSession: false } });
}
