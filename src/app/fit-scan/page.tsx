import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";
import { FitScanTool } from "@/components/marketing/fit-scan-tool";

export const metadata = buildMetadata({
  title: "Fit Scan",
  description:
    "Paste a URL and get a Lighthouse-style accelerator-fit report: stack fit, application depth, delivery pipeline, hygiene, and the backlog we'd start with.",
  path: "/fit-scan",
});

export default async function FitScanPage({ searchParams }: PageProps<"/fit-scan">) {
  const { url } = await searchParams;
  const initialUrl = typeof url === "string" ? url.slice(0, 2048) : "";

  return (
    <>
      <PageHero
        eyebrow="Fit Scan"
        title="Is your site ready for an accelerator?"
        description="An outside-in read of any public website: what it's built on, how much application lives behind it, how it ships, and what's already in its backlog."
      />
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <FitScanTool initialUrl={initialUrl} />
      </section>
    </>
  );
}
