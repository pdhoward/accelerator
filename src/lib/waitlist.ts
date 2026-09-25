import { z } from "zod";

export const waitlistRoles = ["founder", "cto", "product", "partner", "investor", "other"] as const;

export const waitlistSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(waitlistRoles).optional(),
  // Company or app URL. Stored in the sm_waitlist.property_name column, whose
  // name predates the Accelerator repositioning.
  propertyName: z.string().max(200).optional(),
  // Honeypot — real users never see or fill this field; see waitlist-form.tsx.
  // Deliberately unconstrained: a filled value must pass validation so the
  // route handler can silently no-op instead of tipping off the bot with a
  // validation error.
  company: z.string().optional(),
  source: z.string().max(200).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const waitlistRoleLabels: Record<(typeof waitlistRoles)[number], string> = {
  founder: "Founder / CEO",
  cto: "CTO / Engineering lead",
  product: "Product",
  partner: "Agency / SI partner",
  investor: "Investor",
  other: "Other",
};
