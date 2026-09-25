import { autonomyLevels } from "@/content/accelerator";
import { cn } from "@/lib/utils";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function AutonomyLadder() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <FadeUpItem>
          <SectionEyebrow className="mx-auto justify-center">Autonomous coverage</SectionEyebrow>
        </FadeUpItem>
        <FadeUpItem>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            You set the ceiling. The evidence raises it.
          </h2>
        </FadeUpItem>
        <FadeUpItem>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-fog">
            Autonomy is earned one class of change at a time. The measure is simple: what
            share of your application&apos;s changes can the Accelerator safely own?
          </p>
        </FadeUpItem>
      </FadeUp>

      <FadeUp className="flex flex-col gap-2.5">
        {autonomyLevels.map((lvl, i) => (
          <FadeUpItem key={lvl.code}>
            <div className="grid items-center gap-3 rounded-xl border border-obsidian-border bg-obsidian-2/50 p-4 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:px-6">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-9 w-14 items-center justify-center rounded-lg font-mono text-sm font-semibold",
                    i <= 2 ? "bg-aurora-gradient text-white" : "border border-obsidian-border text-fog",
                  )}
                >
                  {lvl.code}
                </span>
                <span className="w-24 font-semibold text-white">{lvl.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-obsidian lg:block">
                  <div
                    className="h-full rounded-full bg-aurora-gradient"
                    style={{ width: `${((i + 1) / autonomyLevels.length) * 100}%`, opacity: 0.35 + i * 0.13 }}
                  />
                </div>
                <span className="text-sm text-fog">{lvl.scope}</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-mist sm:text-right">
                {lvl.gate}
              </span>
            </div>
          </FadeUpItem>
        ))}
      </FadeUp>

      <p className="mt-6 text-center font-mono text-xs uppercase tracking-widest text-mist">
        Typical commissioning exit: AC1 live, AC2 on selected work
      </p>
    </section>
  );
}
