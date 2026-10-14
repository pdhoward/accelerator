import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";
import { FitScanTool } from "@/components/marketing/fit-scan-tool";

export const metadata = buildMetadata({
  title: "Discover your starting point",
  description:
    "Combine your business priorities with public-site insights and technical scores. Get a draft capability record, evidence gaps and a proportionate first step.",
  path: "/fit-scan",
});

export default async function FitScanPage({ searchParams }: PageProps<"/fit-scan">) {
  const { url } = await searchParams;
  const initialUrl = typeof url === "string" ? url.slice(0, 2048) : "";

  return (
    <>
      <PageHero
        eyebrow="Your starting point · free assessment"
        title="Discover your starting point."
        description="See what your site reveals, add what matters to your business, and discover where improvement should begin. Keep the technical scores, surface the unknowns, and take away a draft record of intent and proposed proof."
      />
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <FitScanTool initialUrl={initialUrl} />
      </section>
    </>
  );
}
