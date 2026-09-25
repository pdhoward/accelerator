import { site } from "@/content/site";
import { primaryFeatures, secondaryFeatures } from "@/content/features";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { FitScanBand } from "@/components/marketing/fit-scan-band";
import { ShiftSection } from "@/components/marketing/shift-section";
import { CustomerSpotlight } from "@/components/marketing/customer-spotlight";
import { CommissioningTimeline } from "@/components/marketing/commissioning-timeline";
import { EvidenceSection } from "@/components/marketing/evidence-section";
import { AutonomyLadder } from "@/components/marketing/autonomy-ladder";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { PartnerBand } from "@/components/marketing/partner-band";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata = buildMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ShiftSection />
      <FitScanBand />
      <CustomerSpotlight />
      <CommissioningTimeline />
      <EvidenceSection />
      <AutonomyLadder />
      <FeatureGrid primary={primaryFeatures} secondary={secondaryFeatures} />
      <PricingTiers />
      <PartnerBand />
      <WaitlistCta />
      <FaqAccordion />
    </>
  );
}
