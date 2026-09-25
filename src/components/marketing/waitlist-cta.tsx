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
            <SectionEyebrow className="justify-center">Commissioning cohort 01 · now forming</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Put your application under power.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="max-w-md text-fog">
              We&apos;re commissioning a small number of production web apps next. Tell us where
              yours lives. We&apos;ll reply with a scoping call and an honest read on fit.
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
