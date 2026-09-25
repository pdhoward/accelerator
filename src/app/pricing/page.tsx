import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { faqItems } from "@/content/faq";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Commission your application once, then operate it on the Accelerator. Priced per application, not per seat.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />
      <PageHero
        eyebrow="Pricing"
        title="Priced on outcomes, not seats"
        description="A fixed fee to commission your application, then a monthly fee to operate it, with an operator from us until your team is ready to take over."
      />
      <PricingTiers />
      <FaqAccordion />
    </>
  );
}
