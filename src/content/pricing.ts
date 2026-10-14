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

/** Planned offers; availability, scope and final terms are confirmed after assessment. */
export const pricingTiers: PricingTier[] = [
  {
    "id": "boarding",
    "name": "Boarding",
    "positioning": "Establish the foundations for your crew",
    "price": "$2,500 target",
    "cadence": "planned one-time onboarding · subject to fit and agreed scope",
    "ctaLabel": "Discuss onboarding",
    "ctaHref": "/#waitlist",
    "features": [
      "Business interview and capability survey",
      "Connection setup and permission boundaries",
      "Agreed priorities, business rules and acceptance checks",
      "Initial crew and verification baseline",
      "Final inclusions confirmed before purchase"
    ]
  },
  {
    "id": "crew",
    "name": "Crew",
    "positioning": "Ongoing improvement under your direction",
    "price": "Pricing to be confirmed",
    "cadence": "planned monthly subscription · scoped to your site",
    "highlighted": true,
    "ctaLabel": "Request a walkthrough",
    "ctaHref": "/#waitlist",
    "features": [
      "One accountable team lead with specialist support",
      "Shared recommendations, previews and decision records",
      "Capability inventory and business vital signs",
      "Verification evidence linked to agreed work",
      "Usage limits and included services agreed in writing"
    ]
  },
  {
    "id": "managed",
    "name": "Managed engagement",
    "positioning": "Additional support for complex applications",
    "price": "Custom scope",
    "cadence": "separately quoted onboarding and ongoing support",
    "ctaLabel": "Discuss your application",
    "ctaHref": "/#waitlist",
    "features": [
      "Architecture and migration assessment",
      "Additional stabilization and integration work",
      "Human advisory and operational support",
      "Agreed responsibilities and service boundaries",
      "A written scope, budget and delivery plan"
    ]
  }
];

export const pricingDifferentiators = [
  {
    "title": "A clear commercial agreement",
    "description": "Onboarding and subscription fees, usage limits and service inclusions are agreed before work begins."
  },
  {
    "title": "Authority stays with you",
    "description": "Set priorities and budgets; your crew coordinates delivery and brings consequential decisions back to you."
  },
  {
    "title": "Knowledge you keep",
    "description": "The planned Library keeps business rules, designs and evidence connected, with open-format export."
  }
];
