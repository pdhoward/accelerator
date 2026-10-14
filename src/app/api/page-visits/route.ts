import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createReviewClient } from "@/lib/supabase/server";
import { pageVisitSchema, trafficSource } from "@/lib/traffic";

const salt = randomBytes(32).toString("hex");
const recent = new Map<string, { count: number; until: number }>();

export async function POST(request: Request) {
  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return new NextResponse(null, { status: 204 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new NextResponse(null, { status: 403 });
  const parsed = pageVisitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  // Soft instance-local abuse guard; no IP or IP hash is stored with page views.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = createHash("sha256").update(salt + ip).digest("hex");
  const now = Date.now();
  if (recent.size > 5000) for (const [k, value] of recent) if (value.until < now) recent.delete(k);
  if (recent.size >= 5000 && !recent.has(key)) return new NextResponse(null, { status: 429 });
  const entry = recent.get(key);
  if (entry && entry.until > now) {
    if (++entry.count > 120) return new NextResponse(null, { status: 429 });
  } else recent.set(key, { count: 1, until: now + 60_000 });
  const value = parsed.data;
  try {
    const { error } = await createReviewClient().from("sm_page_visits").upsert({
      id: value.id, session_id: value.sessionId, page_path: value.path,
      referrer_host: value.referrerHost, is_landing: value.landing,
      traffic_source: trafficSource(value.referrerHost, new URL(request.url).hostname),
      suspected_bot: /bot|crawler|spider|headless|lighthouse/i.test(request.headers.get("user-agent") ?? ""),
    }, { onConflict: "id", ignoreDuplicates: true }).abortSignal(AbortSignal.timeout(3000));
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ saved: false }, { status: 503 });
  }
}
