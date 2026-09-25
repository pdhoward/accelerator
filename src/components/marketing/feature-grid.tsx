import type { Feature } from "@/content/features";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

function FeatureCard({ feature, large = false }: { feature: Feature; large?: boolean }) {
  const Icon = feature.icon;
  return (
    <FadeUpItem>
      <Card className="group h-full transition-colors hover:border-aurora-violet/40">
        <CardContent className={large ? "flex h-full flex-col gap-4 p-7" : "flex h-full flex-col gap-3 p-6"}>
          <div className="flex size-10 items-center justify-center rounded-xl bg-aurora-gradient/15 text-aurora-cyan transition-colors group-hover:bg-aurora-gradient/25">
            <Icon className="size-5" />
          </div>
          <h3 className={large ? "text-xl font-semibold text-white" : "text-base font-semibold text-white"}>
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed text-fog">{feature.description}</p>
        </CardContent>
      </Card>
    </FadeUpItem>
  );
}

export function FeatureGrid({
  primary,
  secondary,
  eyebrow = "The Accelerator",
  title = "Everything it takes to hand over the keys",
  divider = "…and a Control Room for the people in charge",
}: {
  primary: Feature[];
  secondary: Feature[];
  eyebrow?: string;
  title?: string;
  divider?: string;
}) {
  return (
    <section id="platform" className="mx-auto max-w-7xl px-6 py-24">
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <FadeUpItem>
          <SectionEyebrow className="mx-auto justify-center">{eyebrow}</SectionEyebrow>
        </FadeUpItem>
        <FadeUpItem>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </FadeUpItem>
      </FadeUp>

      <FadeUp className="grid gap-5 sm:grid-cols-2">
        {primary.map((f) => (
          <FeatureCard key={f.title} feature={f} large />
        ))}
      </FadeUp>

      <div className="mx-auto my-12 flex max-w-lg items-center gap-4 text-mist">
        <span className="h-px flex-1 bg-obsidian-border" />
        <span className="text-center font-mono text-xs uppercase tracking-widest">{divider}</span>
        <span className="h-px flex-1 bg-obsidian-border" />
      </div>

      <FadeUp className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {secondary.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </FadeUp>
    </section>
  );
}
