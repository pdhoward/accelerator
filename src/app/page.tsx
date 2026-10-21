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
import { LibrarySection } from "@/components/marketing/library-section";
import { ToolbeltSection } from "@/components/marketing/toolbelt-section";
import { ExecutiveWorkspace } from "@/components/marketing/executive-workspace";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { PartnerBand } from "@/components/marketing/partner-band";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { SeeItWork } from "@/components/marketing/see-it-work";
import { WorkPackages } from "@/components/marketing/work-packages";
import { IndustriesSection } from "@/components/marketing/industries-section";

export const metadata = buildMetadata({
  title: site.tagline,
  description: site.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <SeeItWork />
      <WorkPackages />
      <ExecutiveWorkspace />
      <TrustBar />
      <IndustriesSection />
      <ShiftSection />
      <FitScanBand />
      <CustomerSpotlight />
      <LibrarySection />
      <CommissioningTimeline />
      <EvidenceSection />
      <ToolbeltSection />

      <FeatureGrid primary={primaryFeatures} secondary={secondaryFeatures} />
      <PricingTiers />
      <PartnerBand />
      <WaitlistCta />
      <FaqAccordion />
    </>
  );
}
