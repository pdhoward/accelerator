import type { FitScanResult } from "./types";

export type BusinessContext = {
  goal: string;
  mustPreserve: string;
  changeFrequency: "unknown" | "rarely" | "monthly" | "weekly";
};

type PublicEvidence = Pick<FitScanResult, "verdict" | "audits">;

/** Business interpretation is separate from immutable public technical scores. */
export function buildStartingPoint(report: PublicEvidence, context: BusinessContext) {
  const capabilities = report.audits
    .filter((audit) => audit.category === "application" && audit.status === "pass")
    .map((audit) => audit.title);
  const goal = context.goal.trim() || null;
  const mustPreserve = context.mustPreserve.trim() || null;
  const limitedDepth = report.verdict === "low-value";
  const frequentChange = context.changeFrequency === "weekly" || context.changeFrequency === "monthly";
  const needsCompatibilityReview = ["not-a-fit", "replatform", "roadmap", "cms"].includes(report.verdict);
  const opportunity = needsCompatibilityReview
    ? "technical-review"
    : limitedDepth && goal && frequentChange
      ? "clarify-depth"
      : limitedDepth
        ? "focused-care"
        : "governed-improvement";
  const recommendations = {
    "technical-review": "Start with a compatibility review. There may be a useful business improvement here, but access, architecture and delivery requirements need checking before promising a crew engagement.",
    "clarify-depth": "Your priorities suggest recurring work beyond what the public scan reveals. Start with a short business review to locate that work; retain the public technical assessment until deeper evidence is available.",
    "focused-care": "Start with focused maintenance and a review of your primary visitor journey. If this is mainly a content site with occasional updates, an ongoing specialist crew may offer limited additional value.",
    "governed-improvement": "Explore one bounded improvement with an expert lead. Confirm the business outcome, map the affected capability and agree the evidence needed before considering an ongoing crew.",
  };
  return {
    opportunity: opportunity as keyof typeof recommendations,
    recommendation: recommendations[opportunity],
    capabilities,
    agreement: { goal, mustPreserve, status: "draft-not-approved" as const },
    unknowns: [
      "Your internal business rules and the expected results of key processes are not established by a public scan.",
      "Repository tests, release approvals, deployment pipeline and regression coverage require supporting evidence.",
      "Customer outcomes, transaction reliability and return on investment need business data, not a technical score.",
    ],
    suggestedCheck: mustPreserve
      ? "Turn the rule you described into a worked example: agree its inputs, expected result and failure cases, then check the proposed change preserves that agreed rule."
      : "Choose one visitor or customer journey, agree its inputs and expected result, and check that it completes without breaking existing behavior.",
  };
}
