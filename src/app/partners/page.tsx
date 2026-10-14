import { BadgeCheck, Building2, Handshake, PlayCircle, Sparkles } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { partnerPillars, partnerTierRows, partnerTiers, playgroundSteps } from "@/content/partners";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";

export const metadata = buildMetadata({
  title: "Partner Program",
  description:
    "For agencies and system integrators: board and run your clients' sites on the Accelerator, with a crew of AI specialists branded to your firm.",
  path: "/partners",
});

const pillarIcons = [Handshake, Building2, Sparkles, BadgeCheck];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner Program · coming soon"
        title="Your firm. Your clients. Your crew."
        description="Board and run your clients' websites on the Accelerator, with a crew of specialist AI agents branded to your firm. Lead client conversations with shared recommendations, visible progress and evidence behind each proposed release. You keep the relationship; your client keeps decision authority."
      />

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <FadeUp className="grid gap-5 sm:grid-cols-2">
          {partnerPillars.map((p, i) => {
            const Icon = pillarIcons[i] ?? Handshake;
            return (
              <FadeUpItem key={p.title}>
                <div className="h-full rounded-2xl border border-obsidian-border bg-obsidian-2/50 p-7">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-aurora-gradient/15 text-aurora-cyan">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fog">{p.body}</p>
                </div>
              </FadeUpItem>
            );
          })}
        </FadeUp>
      </section>

      {/* Partner levels: one table, the same rows for every tier. */}
      <section id="tiers" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-20">
        <FadeUp className="mx-auto mb-10 max-w-2xl text-center">
          <FadeUpItem>
            <SectionEyebrow className="mx-auto justify-center">Partner levels</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Silver, Gold and Platinum
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mt-4 text-fog">
              Every level runs on our hosted platform, and at every level you are your clients&apos;
              point of contact.
            </p>
            <Badge variant="roadmap" className="mt-4">
              Coming soon · terms finalized with founding partners
            </Badge>
          </FadeUpItem>
        </FadeUp>

        <FadeUp>
          <FadeUpItem>
            <div className="overflow-x-auto rounded-2xl border border-obsidian-border bg-obsidian-2">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-obsidian-border">
                    <th className="w-40 px-5 py-4" />
                    {partnerTiers.map((tier) => (
                      <th key={tier} className="px-5 py-4">
                        <span
                          className={
                            tier === "Platinum"
                              ? "font-semibold text-white"
                              : tier === "Gold"
                                ? "font-semibold text-gold-bright"
                                : "font-semibold text-fog"
                          }
                        >
                          {tier}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partnerTierRows.map((row) => (
                    <tr key={row.label} className="border-b border-obsidian-border last:border-b-0 align-top">
                      <th scope="row" className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-wider text-mist">
                        {row.label}
                      </th>
                      {partnerTiers.map((tier) => (
                        <td key={tier} className="px-5 py-4 leading-relaxed text-fog">
                          {row[tier]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeUpItem>
        </FadeUp>
      </section>

      {/* The Partner Playground: a scripted walkthrough, announced as an idea. */}
      <section id="playground" className="mx-auto max-w-5xl scroll-mt-20 px-6 pb-24">
        <FadeUp>
          <FadeUpItem>
            <div className="grid gap-8 rounded-3xl border border-obsidian-border bg-gradient-to-br from-aurora-violet/10 via-obsidian-2 to-aurora-cyan/5 p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <Badge variant="roadmap">Coming soon</Badge>
                <h2 className="mt-4 flex items-center gap-3 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  <PlayCircle className="size-7 shrink-0 text-aurora-cyan" />
                  The Partner Playground
                </h2>
                <p className="mt-3 leading-relaxed text-fog">
                  Try it before you commit. A guided, scripted playbook walks your team through a full
                  client engagement on a sample site, start to finish, in under an hour.
                </p>
              </div>
              <ol className="flex flex-col gap-3">
                {playgroundSteps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-aurora-cyan/40 font-mono text-[11px] text-aurora-cyan">
                      {i + 1}
                    </span>
                    <span className="text-sm text-fog">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </FadeUpItem>
        </FadeUp>
        <p className="mt-10 text-center text-sm text-mist">
          We&apos;re selecting founding partners now. Apply below and choose &ldquo;Agency / SI
          partner&rdquo; as your role.
        </p>
      </section>

      <WaitlistCta />
    </>
  );
}
