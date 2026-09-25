import { primaryFeatures, secondaryFeatures } from "@/content/features";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";
import { ShiftSection } from "@/components/marketing/shift-section";
import { FiveLayers } from "@/components/marketing/five-layers";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { EvidenceSection } from "@/components/marketing/evidence-section";
import { AutonomyLadder } from "@/components/marketing/autonomy-ladder";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";

export const metadata = buildMetadata({
  title: "The Accelerator",
  description:
    "Application Model, independent assurance, interlocks and a Control Room — the machine that takes custody of your web application.",
  path: "/platform",
});

export default function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="The Accelerator"
        title="Infrastructure for software that runs at AI speed"
        description="Model-agnostic generators do the building. Independent judges verify the work. Interlocks limit what can reach production. Your operators steer the whole thing."
      />
      <FiveLayers />
      <FeatureGrid primary={primaryFeatures} secondary={secondaryFeatures} />
      <EvidenceSection />
      <AutonomyLadder />
      <ShiftSection />
      <WaitlistCta />
    </>
  );
}
