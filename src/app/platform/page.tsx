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
        description="Explore options with one accountable team lead. Specialists help refine the design, verify the work and explain the evidence. You set priorities and approve consequential decisions. Platform preview: capabilities are being proven on Machine Shop."
      />
      <ExecutiveWorkspace />
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
