import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { faqItems } from "@/content/faq";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Explore planned onboarding and ongoing crew services. Scope, availability and commercial terms are confirmed after an assessment.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />
      <PageHero
        eyebrow="Pricing"
        title="A clear scope. An agreed budget. Ongoing improvement."
        description="Our planned offer combines onboarding with an ongoing crew subscription. Complex applications can use a separately scoped managed engagement. Final inclusions and pricing are confirmed before you commit."
      />
      <PricingTiers />
      <FaqAccordion />
    </>
  );
}
