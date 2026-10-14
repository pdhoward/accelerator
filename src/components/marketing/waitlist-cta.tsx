import { AuroraMesh } from "@/components/motion/aurora-mesh";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export function WaitlistCta() {
  return (
    <section id="waitlist" className="relative overflow-hidden border-y border-obsidian-border py-24">
      <AuroraMesh />
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center">
        <FadeUp className="flex flex-col items-center gap-6">
          <FadeUpItem>
            <SectionEyebrow className="justify-center">Founding clients and partners</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              See how your expert crew would work.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="max-w-md text-fog">
              Request a walkthrough of the coming platform. Tell us about your site and
              priorities; we&apos;ll arrange a conversation and give you an honest assessment of fit.
            </p>
          </FadeUpItem>
          <FadeUpItem className="flex w-full justify-center">
            <WaitlistForm />
          </FadeUpItem>
        </FadeUp>
      </div>
    </section>
  );
}
