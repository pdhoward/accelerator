import { z } from "zod";

export const pageVisitSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  path: z.string().min(1).max(500).regex(/^\/(?!\/)[^?#\s]*$/),
  referrerHost: z.string().max(253).regex(/^[a-z0-9.-]+$/i).nullable(),
  landing: z.boolean(),
}).strict();

/** Referrals are evidence of navigation, not keyword/ranking measurements. */
export function trafficSource(referrerHost: string | null, siteHost: string) {
  if (!referrerHost) return "direct-or-unknown";
  if (referrerHost === siteHost) return "internal";
  if (/^(www\.)?(google\.(?:[a-z]{2,3}|(?:co|com)\.[a-z]{2})|bing\.com|duckduckgo\.com|search\.yahoo\.com|ecosia\.org|search\.brave\.com|startpage\.com)$/i.test(referrerHost)) return "search";
  return "referral";
}
