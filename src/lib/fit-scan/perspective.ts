import { z } from "zod";

export const perspectiveSchema = z.object({
  reviewId: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  goal: z.string().trim().max(1000),
  mustPreserve: z.string().trim().max(1000),
  changeFrequency: z.enum(["unknown", "rarely", "monthly", "weekly"]),
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(200),
  email: z.string().trim().max(254).email(),
  phone: z.string().trim().max(50).regex(/^[0-9+().\-\sxext]*$/i).default(""),
}).strict();

/** Keep query strings and fragments (which can contain tokens) out of history. */
export function historyUrl(raw: string) {
  const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported website address");
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}
