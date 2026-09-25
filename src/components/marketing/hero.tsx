import Link from "next/link";
import { ScanSearch } from "lucide-react";

import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuroraMesh } from "@/components/motion/aurora-mesh";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Parallax } from "@/components/motion/parallax";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { BrowserFrame } from "@/components/marketing/browser-frame";
import { ControlRoomMock } from "@/components/marketing/control-room-mock";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
      <AuroraMesh />

      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <FadeUpItem>
            <Badge variant="live">
              <span className="size-1.5 animate-pulse-slow rounded-full bg-signal" />
              Customer Zero: live in production
            </Badge>
          </FadeUpItem>

          <FadeUpItem>
            <h1
              className="text-balance font-semibold tracking-tight text-white"
              style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: 1.02 }}
            >
              Hands off the code.{" "}
              <span className="text-aurora-gradient">Hands on the controls.</span>
            </h1>
          </FadeUpItem>

          <FadeUpItem>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-fog sm:text-xl">
              {site.product} takes custody of your existing web application. It builds,
              tests, ships and improves your software with AI, and proves every change is
              safe. You run it from a control room, not an IDE.
            </p>
          </FadeUpItem>

          <FadeUpItem>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <MagneticButton>
                <Button variant="gold" size="lg" asChild>
                  <Link href="/#waitlist">{site.waitlistCtaLabel}</Link>
                </Button>
              </MagneticButton>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/fit-scan">
                  <ScanSearch className="size-4" />
                  Scan your site for fit
                </Link>
              </Button>
            </div>
          </FadeUpItem>

          <FadeUpItem>
            <p className="font-mono text-[11px] uppercase tracking-widest text-mist">
              Not a coding assistant · Custody of your app, with evidence for every change
            </p>
          </FadeUpItem>
        </FadeUp>

        <Parallax speed={0.3} className="mx-auto mt-16 max-w-4xl">
          <div className="rotate-[-1.5deg]">
            <BrowserFrame url="control.strategicmachines.ai">
              <ControlRoomMock />
            </BrowserFrame>
          </div>
        </Parallax>
      </div>
    </section>
  );
}
