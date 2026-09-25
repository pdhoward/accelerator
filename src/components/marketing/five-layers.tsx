import { fiveLayers } from "@/content/accelerator";
import { cn } from "@/lib/utils";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function FiveLayers() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <FadeUpItem>
          <SectionEyebrow className="mx-auto justify-center">Architecture</SectionEyebrow>
        </FadeUpItem>
        <FadeUpItem>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Five layers. The models are the replaceable part.
          </h2>
        </FadeUpItem>
      </FadeUp>

      <FadeUp className="flex flex-col gap-2">
        {fiveLayers.map((layer, i) => (
          <FadeUpItem key={layer.n}>
            <div
              className={cn(
                "grid gap-2 rounded-xl border p-5 sm:grid-cols-[4rem_12rem_1fr] sm:items-center",
                i === 0 ? "border-aurora-violet/40 bg-aurora-violet/10" : "border-obsidian-border bg-obsidian-2/50",
              )}
            >
              <span className="font-mono text-sm text-mist">{layer.n}</span>
              <span className="font-semibold text-white">{layer.name}</span>
              <span className="text-sm text-fog">{layer.holds}</span>
            </div>
          </FadeUpItem>
        ))}
      </FadeUp>
    </section>
  );
}
