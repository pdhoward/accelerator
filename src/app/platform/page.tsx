import { primaryFeatures, secondaryFeatures } from "@/content/features";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";
import { ShiftSection } from "@/components/marketing/shift-section";
import { FiveLayers } from "@/components/marketing/five-layers";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { EvidenceSection } from "@/components/marketing/evidence-section";
import { LibrarySection } from "@/components/marketing/library-section";
import { ToolbeltSection } from "@/components/marketing/toolbelt-section";
import { ExecutiveWorkspace } from "@/components/marketing/executive-workspace";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";
import { SeeItWork } from "@/components/marketing/see-it-work";
import { WorkPackages } from "@/components/marketing/work-packages";
import { IndustriesSection } from "@/components/marketing/industries-section";

export const metadata = buildMetadata({
  title: "The Accelerator",
   description:
    "Lead your website’s evolution with an expert AI crew, business vital signs and a lasting record of decisions, delivery and proof.",
  path: "/platform",
});

export default function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="The Accelerator"
        title="Lead your website’s evolution with an expert team at your side."
        description="One accountable team lead and a crew trained for your industry. Every change arrives as a complete package: the design, the plan, the tests and your approvals, kept together for good. You decide what matters; the crew does the rest. Platform preview, now delivering on Machine Shop."
      />
      <SeeItWork />
      <WorkPackages />
      <ExecutiveWorkspace />
      <IndustriesSection />
      <FiveLayers />
      <LibrarySection />
      <FeatureGrid primary={primaryFeatures} secondary={secondaryFeatures} />
      <EvidenceSection />
      <ToolbeltSection />

      <ShiftSection />
      <WaitlistCta />
    </>
  );
}
