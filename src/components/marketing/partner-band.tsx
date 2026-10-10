import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function PartnerBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <FadeUp>
        <FadeUpItem>
          <div className="flex flex-col gap-6 rounded-3xl border border-obsidian-border bg-gradient-to-br from-aurora-violet/10 via-obsidian-2 to-aurora-cyan/5 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow>For agencies &amp; system integrators</SectionEyebrow>
              <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your firm. Your clients. Your crew.
              </h2>
              <p className="mt-3 text-fog">
                Board and run your clients&apos; sites on the Accelerator with a crew of AI specialists
                branded to your firm. Silver, Gold and Platinum levels, coming soon.
              </p>
            </div>
            <Button variant="outline" size="lg" asChild className="w-fit shrink-0">
              <Link href="/partners">
                Partner Program
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
