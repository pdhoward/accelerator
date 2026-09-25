import Link from "next/link";
import { Check } from "lucide-react";

import { pricingDifferentiators, pricingTiers } from "@/content/pricing";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function PricingTiers() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
      <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
        <FadeUpItem>
          <SectionEyebrow className="mx-auto justify-center">Pricing</SectionEyebrow>
        </FadeUpItem>
        <FadeUpItem>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Commission once. Operate continuously.
          </h2>
        </FadeUpItem>
        <FadeUpItem>
          <p className="mt-4 leading-relaxed text-fog">
            Priced per application, not per seat. The ranges below are indicative; every
            engagement is scoped and quoted after an assessment call.
          </p>
        </FadeUpItem>
      </FadeUp>

      <FadeUp className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <FadeUpItem key={tier.id}>
            <Card
              className={cn(
                "flex h-full flex-col",
                tier.highlighted && "border-gold/50 border-glow-aurora",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  {tier.highlighted && <Badge variant="gold">The core</Badge>}
                </div>
                <p className="text-sm text-fog">{tier.positioning}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6 pt-0">
                <div>
                  <p className="text-3xl font-semibold text-white">{tier.price}</p>
                  <p className="mt-1 text-sm text-mist">{tier.cadence}</p>
                </div>
                <ul className="flex flex-1 flex-col gap-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-fog">
                      <Check className="mt-0.5 size-4 shrink-0 text-aurora-cyan" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={tier.highlighted ? "gold" : "outline"} asChild>
                  <Link href={tier.ctaHref}>{tier.ctaLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          </FadeUpItem>
        ))}
      </FadeUp>

      <div className="mt-14 grid gap-6 border-t border-obsidian-border pt-10 sm:grid-cols-3">
        {pricingDifferentiators.map((d) => (
          <div key={d.title} className="text-center sm:text-left">
            <h4 className="font-semibold text-white">{d.title}</h4>
            <p className="mt-1 text-sm text-fog">{d.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
