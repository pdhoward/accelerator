import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";

export const metadata = buildMetadata({
  title: "Company",
  description:
    "Strategic Machines builds the Accelerator — autonomous operations for production web applications.",
  path: "/company",
});

export default function CompanyPage() {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="We stopped touching the code."
        description="Strategic Machines builds the Accelerator: infrastructure that lets AI operate a production application while people run the controls."
      />
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <FadeUp className="flex flex-col gap-6 text-fog">
          <FadeUpItem>
            <p className="leading-relaxed">
              The industry calls it a &ldquo;software factory,&rdquo; but software was never
              built on a line. It loops through design, build, test, refactor and ship, again
              and again. Now that AI can make each turn faster than anyone can read the code,
              the job changes. You stop inspecting the parts and start running the machine.
            </p>
          </FadeUpItem>
          <FadeUpItem>
            <p className="leading-relaxed">
              We learned this by doing it. A live resort platform with real guests, real
              payments and a real ledger was built and is operated by AI, with its owner in the
              control room. The code turned out to be the easy part. The hard part was the
              discipline: written invariants, independent tests, evidence for every change and
              hard limits on what can reach production.
            </p>
          </FadeUpItem>
          <FadeUpItem>
            <p className="leading-relaxed">
              The Accelerator packages that discipline so it can be commissioned onto your
              application too.
            </p>
          </FadeUpItem>
          <FadeUpItem>
            <p className="leading-relaxed">
              Commissioning inquiries, partnerships, or press:{" "}
              <a href="mailto:hello@strategicmachines.ai" className="text-aurora-cyan underline-offset-4 hover:underline">
                hello@strategicmachines.ai
              </a>
              .
            </p>
          </FadeUpItem>
        </FadeUp>
      </section>
      <WaitlistCta />
    </>
  );
}
