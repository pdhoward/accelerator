import { CircleCheck, Clapperboard } from "lucide-react";

import { demoRecord, demoVideo } from "@/content/work-packages";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

/** The demo: one sensitive change, from request to release, beside the record it left behind. */
export function SeeItWork() {
  return (
    <section id="see-it-work" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
          <FadeUpItem>
            <SectionEyebrow className="mx-auto justify-center">See it work · {demoVideo.durationLabel}</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Sally asks for checkout. Her crew delivers it, step by approved step.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-fog">
              Sally runs an online shop and doesn&apos;t write code. She asks for a Buy now button with Stripe. Her crew
              designs it, plans it, builds it and tests it. Because money moves, every decision comes back to her.
            </p>
          </FadeUpItem>
        </FadeUp>

        <FadeUp className="grid items-start gap-8 lg:grid-cols-[1.65fr_1fr]">
          <FadeUpItem>
            <div className="overflow-hidden rounded-2xl border border-obsidian-border bg-black shadow-2xl shadow-black/60">
              <video
                className="aspect-video w-full"
                controls
                playsInline
                preload="metadata"
                poster={demoVideo.poster}
                aria-label="Demo: Sally adds Buy now with Stripe to her shop with the Accelerator"
              >
                <source src={demoVideo.src} type="video/mp4" />
                <track kind="captions" src={demoVideo.captions} srcLang="en" label="English" default />
                Your browser can&apos;t play this video. <a href={demoVideo.src}>Download it</a>.
              </video>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-mist">
              <Clapperboard className="mt-0.5 size-3.5 shrink-0" />
              {demoVideo.note}
            </p>
          </FadeUpItem>

          <FadeUpItem>
            <div className="rounded-2xl border border-obsidian-border bg-obsidian-2 p-5 sm:p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-mist">What this one change left behind</p>
              <p className="mt-2 text-lg font-semibold text-white">{demoRecord.title}</p>
              <p className="text-sm text-fog">{demoRecord.site}</p>
              <dl className="mt-5 flex flex-col divide-y divide-obsidian-border">
                {demoRecord.facts.map((f) => (
                  <div key={f.label} className="grid gap-1 py-2.5 sm:grid-cols-[5.5rem_1fr]">
                    <dt className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-mist">
                      <CircleCheck className="size-3 text-signal" />
                      {f.label}
                    </dt>
                    <dd className="text-sm leading-snug text-white">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </FadeUpItem>
        </FadeUp>
      </div>
    </section>
  );
}
