import { z } from "zod";

export const perspectiveSchema = z.object({
  reviewId: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  goal: z.string().trim().max(1000),
  mustPreserve: z.string().trim().max(1000),
  changeFrequency: z.enum(["unknown", "rarely", "monthly", "weekly"]),
  name: z.string().trim().max(120).default(""),
  company: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(50).regex(/^[0-9+().\-\sxext]*$/i).default(""),
}).strict().refine((input) => input.goal.length > 0 || input.mustPreserve.length > 0 || input.changeFrequency !== "unknown" || input.name.length > 0 || input.company.length > 0 || input.phone.length > 0, {
  message: "Add your perspective or contact details before saving.",
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
