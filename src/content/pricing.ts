export type PricingTier = {
  id: string;
  name: string;
  positioning: string;
  price: string;
  cadence: string;
  highlighted?: boolean;
  ctaLabel: string;
  ctaHref: string;
  features: string[];
};

/**
 * Indicative ranges from cypress-actions/accelerator.md §6 — proposals, not a
 * rate card. Each engagement is quoted after a scoping call.
 */
export const pricingTiers: PricingTier[] = [
  {
    id: "commission",
    name: "Commission",
    positioning: "Bring your application up to speed",
    price: "$30K–$120K",
    cadence: "fixed fee · ~6 weeks",
    ctaLabel: "Apply for commissioning",
    ctaHref: "/#waitlist",
    features: [
      "Application Model + invariants",
      "Held-out test suite on a test database",
      "Discipline Pack installed",
      "Shadow replay of your recent work",
      "Readiness Report + live AC1–AC2 autonomy",
    ],
  },
  {
    id: "operate",
    name: "Operate",
    positioning: "The Accelerator, running your app",
    price: "$6K–$20K",
    cadence: "per month · by change volume and assurance level",
    highlighted: true,
    ctaLabel: "Apply for commissioning",
    ctaHref: "/#waitlist",
    features: [
      "Continuous build, test, refactor and release",
      "Independent assurance on every change",
      "Evidence package for every change",
      "Control Room seats for your operators",
      "Model spend included — no per-token bill",
    ],
  },
  {
    id: "managed",
    name: "Managed Operator",
    positioning: "We run the Control Room until you're ready to",
    price: "+$10K–$20K",
    cadence: "per month · tapers as your team takes over",
    ctaLabel: "Talk to us",
    ctaHref: "/company",
    features: [
      "A dedicated Strategic Machines operator",
      "Weekly mission and backlog review",
      "Operator training for your team",
      "Incident on-call with the Accelerator",
      "Handover plan: managed → co-operated → yours",
    ],
  },
];

export const pricingDifferentiators = [
  {
    title: "Priced on outcomes",
    description: "You pay for accepted change and assurance, not seats or “AI developers.”",
  },
  {
    title: "A fraction of a team",
    description: "A three-engineer team costs $600K+ a year. The Accelerator targets 25–50% of that.",
  },
  {
    title: "Knowledge you keep",
    description: "The Application Model, tests and evidence history stay yours.",
  },
];
