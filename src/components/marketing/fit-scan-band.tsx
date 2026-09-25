"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ScanSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function FitScanBand() {
  const router = useRouter();
  const [url, setUrl] = React.useState("");

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <FadeUp>
        <FadeUpItem>
          <div className="relative overflow-hidden rounded-3xl border border-aurora-violet/30 bg-gradient-to-br from-aurora-violet/15 via-obsidian-2 to-aurora-cyan/10 p-8 text-center sm:p-12 border-glow-aurora">
            <SectionEyebrow className="justify-center">Fit Scan · free</SectionEyebrow>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Is your site ready for an accelerator?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-fog">
              Paste a URL. In under a minute you get a Lighthouse-style report on stack fit,
              application depth, delivery pipeline and hygiene, plus the backlog we&apos;d
              start with.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (url.trim()) router.push(`/fit-scan?url=${encodeURIComponent(url.trim())}`);
              }}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourapp.com"
                aria-label="Website address"
                className="h-13 flex-1 text-base"
              />
              <Button type="submit" variant="gold" size="lg" disabled={!url.trim()}>
                <ScanSearch className="size-4" />
                Scan my site
              </Button>
            </form>
          </div>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
