import { BookOpen, Check, Minus } from "lucide-react";

import { exampleLibrary, libraryHomes, llmComparison, skillTiers } from "@/content/accelerator";
import { Button } from "@/components/ui/button";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

/** "Why not just use Claude?" answered by the Library: memory, hands, safety, a team, proof, learning. */
export function LibrarySection() {
  return (
    <section id="library" className="relative scroll-mt-20 border-y border-obsidian-border bg-obsidian-2/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
          <FadeUpItem>
            <SectionEyebrow className="mx-auto justify-center">Why not just use an AI model?</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Claude is a brilliant contractor. The Accelerator is the team that remembers.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-fog">
              On its own, a model has no memory of your business, no hands on your accounts and no
              safety rails. Every client site gets its own <span className="text-white">crew</span> of
              specialist agents and its own private <span className="text-white">Library</span>, which
              grows smarter with every change.
            </p>
          </FadeUpItem>
        </FadeUp>

        {/* The comparison: one row per thing an LLM alone lacks. */}
        <FadeUp className="overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-2">
          <div className="hidden grid-cols-[8rem_1fr_1fr] border-b border-obsidian-border px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-mist sm:grid">
            <span />
            <span>An AI model on its own</span>
            <span className="text-aurora-cyan">The Accelerator</span>
          </div>
          {llmComparison.map((row) => (
            <FadeUpItem
              key={row.need}
              className="grid gap-2 border-b border-obsidian-border px-5 py-4 last:border-b-0 sm:grid-cols-[8rem_1fr_1fr] sm:gap-6"
            >
              <span className="font-semibold text-white">{row.need}</span>
              <span className="flex items-start gap-2 text-sm text-mist">
                <Minus className="mt-0.5 size-4 shrink-0" />
                {row.llm}
              </span>
              <span className="flex items-start gap-2 text-sm text-fog">
                <Check className="mt-0.5 size-4 shrink-0 text-aurora-cyan" />
                {row.accelerator}
              </span>
            </FadeUpItem>
          ))}
        </FadeUp>

        <FadeUp className="mt-16 grid items-start gap-12 lg:grid-cols-2">
          <FadeUpItem className="flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">Your Library: the memory of your site</h3>
              <p className="mt-3 leading-relaxed text-fog">
                Every decision, design, conversation, change and lesson, organized by your site and
                private to you. Ask it why something works the way it does, and it answers with the
                decision and the conversation where it was made.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-mist">Three tiers of know-how</p>
              {skillTiers.map((tier) => (
                <div key={tier.name} className="rounded-xl border border-obsidian-border bg-obsidian-2/50 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-white">{tier.name}</span>
                    <span className="text-xs text-mist">{tier.scope}</span>
                  </div>
                  <p className="mt-1 text-sm text-fog">{tier.example}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {libraryHomes.map((home) => (
                <div key={home.where} className="rounded-xl border border-aurora-violet/30 bg-aurora-violet/5 p-4">
                  <p className="font-semibold text-white">{home.where}</p>
                  <p className="mt-1 text-sm leading-relaxed text-fog">{home.what}</p>
                </div>
              ))}
            </div>
          </FadeUpItem>

          <FadeUpItem>
            <div className="overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-2 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-obsidian-border px-5 py-3">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                  <BookOpen className="size-3.5" />
                  {exampleLibrary.site} · Library · example
                </span>
                <span className="rounded-full border border-signal/40 bg-signal/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal">
                  Export
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-lg font-semibold text-white">
                  Your crew knows {exampleLibrary.knows} things about {exampleLibrary.site}
                </p>
                <ul className="mt-5 flex flex-col divide-y divide-obsidian-border">
                  {exampleLibrary.entries.map((entry) => (
                    <li key={entry.text} className="grid gap-1 py-2.5 sm:grid-cols-[6.5rem_1fr]">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-mist">{entry.kind}</span>
                      <span className="text-sm text-white">
                        {entry.text} <span className="text-mist">· {entry.ref}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-mist">
              Machine Shop is our test site. See its real Library in a walkthrough, not on slides.
            </p>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" asChild>
                <a href="#waitlist">Ask for a Library walkthrough</a>
              </Button>
            </div>
          </FadeUpItem>
        </FadeUp>
      </div>
    </section>
  );
}
