"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MessageSquareText, Route, ShieldAlert, Target } from "lucide-react";

import { industries, STATUS_LABEL, type IndustryStatus } from "@/content/industries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

const BADGE: Record<IndustryStatus, "live" | "aurora" | "roadmap"> = { available: "live", early: "aurora", soon: "roadmap" };

/** Industry crews: choose yours and see what the crew already knows about it. */
export function IndustriesSection() {
  const [id, setId] = useState(industries[0]!.id);
  const pick = industries.find((x) => x.id === id) ?? industries[0]!;
  const soon = pick.status === "soon";

  return (
    <section id="industries" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto mb-10 max-w-3xl text-center">
          <FadeUpItem>
            <SectionEyebrow className="mx-auto justify-center">Industry crews</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              A crew that already speaks your business.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-fog">
              Each crew is trained for one industry: the words you use, the practices of the best firms in it, the places
              where a change needs extra care, and the customer journeys that must keep working. Choose yours.
            </p>
          </FadeUpItem>
        </FadeUp>

        <FadeUp className="mx-auto max-w-5xl">
          <FadeUpItem className="mx-auto mb-6 flex max-w-md flex-col gap-2">
            <label htmlFor="industry" className="font-mono text-[11px] uppercase tracking-widest text-mist">
              Your industry
            </label>
            <Select value={id} onValueChange={setId}>
              <SelectTrigger id="industry" aria-label="Choose your industry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {industries.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                    {x.status !== "available" && <span className="ml-2 text-xs text-mist">· {STATUS_LABEL[x.status]}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FadeUpItem>

          <FadeUpItem>
            <div key={pick.id} className="rounded-2xl border border-obsidian-border bg-obsidian-2 p-6 sm:p-8" aria-live="polite" data-industry={pick.id}>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-semibold tracking-tight text-white">{pick.name}</h3>
                <Badge variant={BADGE[pick.status]}>{STATUS_LABEL[pick.status]}</Badge>
              </div>
              <p className="mt-2 text-fog">{pick.forWhom}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                    <MessageSquareText className="size-3.5" /> {soon ? "Will speak your language" : "Speaks your language"}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {pick.speaks.map((w) => (
                      <li key={w} className="rounded-full border border-obsidian-border px-2.5 py-1 text-xs text-fog">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                    <ShieldAlert className="size-3.5" /> Takes extra care with
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {pick.care.map((c) => (
                      <li key={c.area} className="text-sm leading-snug text-white">
                        {c.area} <span className="text-mist">· {c.why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {pick.journey && (
                  <div>
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                      <Route className="size-3.5" /> Keeps this journey working
                    </p>
                    <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-white">
                      {pick.journey.map((step, i) => (
                        <li key={step} className="flex items-center gap-1.5">
                          <span className="rounded-lg border border-aurora-violet/30 bg-aurora-violet/5 px-2.5 py-1">{step}</span>
                          {i < pick.journey!.length - 1 && <ArrowRight className="size-3.5 text-mist" aria-hidden />}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {pick.measures && (
                  <div>
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                      <Target className="size-3.5" /> Reports against
                    </p>
                    <p className="mt-3 text-sm text-white">{pick.measures.join(" · ")}</p>
                  </div>
                )}
              </div>

              {pick.proof && <p className="mt-6 border-t border-obsidian-border pt-4 text-sm text-fog">{pick.proof}</p>}

              {soon && (
                <div className="mt-6 flex flex-col items-start gap-3 border-t border-obsidian-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-fog">This crew is planned. Tell us about your organization and we&apos;ll build it with firms like yours.</p>
                  <Button variant="outline" asChild>
                    <Link href="/#waitlist">Tell us you&apos;re interested</Link>
                  </Button>
                </div>
              )}
            </div>
          </FadeUpItem>
          <p className="mt-4 text-center text-xs text-mist">
            {industries.filter((x) => x.status === "soon").length} more industries are planned. A crew is offered when its practices are proven on a working site.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
