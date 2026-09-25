import { cypressResortStats } from "@/content/stats";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/motion/count-up";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { PageHero } from "@/components/marketing/page-hero";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";

export const metadata = buildMetadata({
  title: "Customer Zero — Cypress Resort",
  description:
    "A live resort booking, payments and ledger platform, built and operated by the Accelerator: real guests, real money, no hand-written code.",
  path: "/customers/cypress-resort",
});

const disciplines = [
  {
    title: "An operating rulebook",
    body: "The architecture's one rule, the money invariants, and an Always/Never list. It is checked against the code, and where they disagree the code wins.",
  },
  {
    title: "Design before code",
    body: "Every significant change starts as a written design, with the owner's decisions recorded before anything is built.",
  },
  {
    title: "A permanent-number backlog",
    body: "Items never get renumbered. Each carries a dated status and links to its design, pull request and fix.",
  },
  {
    title: "Every incident becomes a test",
    body: "A production bug returns as a root cause, a read-only investigation, a fix and a regression test that keeps it fixed.",
  },
  {
    title: "Logic in one place",
    body: "Pricing, tax, refunds and the ledger live in pure engines behind one API, so the machine can change them without the copies drifting apart.",
  },
  {
    title: "Tiered environments",
    body: "Branch, then preview, then staging on a test database with test payments, then production. Data fixes are checked in as code.",
  },
];

export default function CustomerZeroPage() {
  return (
    <>
      <PageHero
        eyebrow="Customer Zero"
        title="Cypress Resort"
        description="Where the Accelerator was built by running a real business on it."
      />

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <FadeUp className="flex flex-col gap-6">
          <FadeUpItem>
            <Badge variant="live" className="w-fit">
              <span className="size-1.5 animate-pulse-slow rounded-full bg-signal" />
              Live in production
            </Badge>
          </FadeUpItem>
          <FadeUpItem>
            <p className="leading-relaxed text-fog">
              Cypress Resort needed to replace a fragmented first-generation system with a
              modern platform covering booking, payments, taxes, refunds, guest credit and a
              single financial ledger. Its history was migrated and reconciled to the penny at
              cutover.
            </p>
          </FadeUpItem>
          <FadeUpItem>
            <p className="leading-relaxed text-fog">
              Nobody on the team hand-writes or line-reviews the code. The AI builds, tests and
              ships. The owner works as the operator: setting priorities, making the money and
              policy decisions, walking through staging and challenging results. That operating
              model, and the disciplines that make it safe, is what we are productizing.
            </p>
          </FadeUpItem>
        </FadeUp>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <FadeUp className="grid grid-cols-2 gap-4">
          {cypressResortStats.map((stat) => (
            <FadeUpItem key={stat.label}>
              <div className="rounded-2xl border border-obsidian-border bg-obsidian-2/60 p-6">
                <CountUp
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="font-mono text-3xl font-semibold text-gold-bright"
                />
                <p className="mt-2 text-sm text-fog">{stat.label}</p>
              </div>
            </FadeUpItem>
          ))}
        </FadeUp>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <FadeUp className="mb-8 text-center">
          <FadeUpItem>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              The disciplines that made it work
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mx-auto mt-3 max-w-2xl text-fog">
              Code generation was the easy part. These habits turned the application&apos;s
              knowledge into something a machine can read and check. Commissioning installs
              them on your application.
            </p>
          </FadeUpItem>
        </FadeUp>
        <FadeUp className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((d) => (
            <FadeUpItem key={d.title}>
              <div className="h-full rounded-2xl border border-obsidian-border bg-obsidian-2/50 p-6">
                <h3 className="font-semibold text-white">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{d.body}</p>
              </div>
            </FadeUpItem>
          ))}
        </FadeUp>
      </section>

      <WaitlistCta />
    </>
  );
}
