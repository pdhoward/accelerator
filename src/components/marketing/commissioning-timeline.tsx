import { commissioningSteps, readinessReport } from "@/content/accelerator";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function CommissioningTimeline() {
  return (
    <section id="commissioning" className="relative scroll-mt-20 border-y border-obsidian-border bg-obsidian-2/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto mb-14 max-w-2xl text-center">
          <FadeUpItem>
            <SectionEyebrow className="mx-auto justify-center">Commissioning</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Six weeks from your repo to a running accelerator.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-fog">
              No rewrite. We attach to the application you already have, learn it, test it,
              and prove we could have shipped your recent work. Only then do we take custody.
            </p>
          </FadeUpItem>
        </FadeUp>

        <FadeUp className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {commissioningSteps.map((step, i) => (
            <FadeUpItem key={step.title}>
              <div className="group h-full rounded-2xl border border-obsidian-border bg-obsidian p-6 transition-colors hover:border-aurora-violet/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-mist">{step.week}</span>
                  <span className="font-mono text-2xl font-semibold text-white/10 transition-colors group-hover:text-aurora-cyan/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{step.description}</p>
              </div>
            </FadeUpItem>
          ))}
        </FadeUp>

        <FadeUp className="mt-10">
          <FadeUpItem>
            <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-lg font-semibold text-white">You leave with a Readiness Report</h3>
                <span className="font-mono text-[11px] uppercase tracking-widest text-mist">Example report</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
                {readinessReport.map((r) => (
                  <div key={r.label}>
                    <p className="font-mono text-2xl font-semibold text-gold-bright">{r.value}</p>
                    <p className="mt-1 text-xs text-fog">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUpItem>
        </FadeUp>
      </div>
    </section>
  );
}
