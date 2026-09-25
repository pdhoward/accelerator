import { BookOpenCheck, GraduationCap, Handshake, Radar } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";

export const metadata = buildMetadata({
  title: "Partner Program",
  description:
    "For agencies and system integrators: get certified to commission and operate client applications on the Accelerator.",
  path: "/partners",
});

const pillars = [
  {
    icon: GraduationCap,
    title: "Commissioning certification",
    body: "Learn the six-week method: connect, survey, instrument, shadow, custody and raise energy. Practise it on a reference application before a client's.",
  },
  {
    icon: BookOpenCheck,
    title: "The Discipline Pack",
    body: "The rulebook, backlog, design-doc and incident-to-regression habits proven on Customer Zero, with templates and training.",
  },
  {
    icon: Radar,
    title: "Operator training",
    body: "Your people learn to run the Control Room: setting the mission, reading evidence, granting autonomy and handling incidents.",
  },
  {
    icon: Handshake,
    title: "A recurring business",
    body: "Move from billing hours for hand-written code to commissioning fees and ongoing operations revenue on every client app.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner Program"
        title="Run the machines that write the code"
        description="Hand-coding is being automated. The work that remains is commissioning and operating applications, and your clients will need someone they trust to do it."
      />
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <FadeUp className="grid gap-5 sm:grid-cols-2">
          {pillars.map((p) => {
            const Icon = p.icon;
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
        <p className="mt-10 text-center text-sm text-mist">
          We&apos;re selecting the first partner agencies now. Apply below and choose
          &ldquo;Agency / SI partner&rdquo; as your role.
        </p>
      </section>
      <WaitlistCta />
    </>
  );
}
