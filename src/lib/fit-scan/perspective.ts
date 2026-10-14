import { z } from "zod";

export const perspectiveSchema = z.object({
  reviewId: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  goal: z.string().trim().max(1000),
  mustPreserve: z.string().trim().max(1000),
  changeFrequency: z.enum(["unknown", "rarely", "monthly", "weekly"]),
}).strict().refine((input) => input.goal.length > 0 || input.mustPreserve.length > 0 || input.changeFrequency !== "unknown", {
  message: "Add a goal, a protected rule or a change frequency before saving.",
});

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
