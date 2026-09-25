import Link from "next/link";

import { cypressResortStats } from "@/content/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";

export function CustomerSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <FadeUp className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <FadeUpItem className="flex flex-col gap-5">
          <Badge variant="gold" className="w-fit">
            Customer Zero
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Proven on a live resort, with real guests and real money.
          </h2>
          <p className="leading-relaxed text-fog">
            Cypress Resort&apos;s booking, payments and ledger platform was built and is operated
            by the Accelerator. It covers reservations, taxes, refunds and guest credit, and
            reconciled years of history to the penny at cutover. The owner runs it from the
            control room: setting priorities, making the money decisions and challenging
            results. Nobody hand-writes the code.
          </p>
          <p className="leading-relaxed text-fog">
            When a production bug escapes, it comes back as a root cause, a regression test and
            a fix, with the evidence attached.
          </p>
          <Button variant="outline" asChild className="w-fit">
            <Link href="/customers/cypress-resort">Read the Customer Zero story</Link>
          </Button>
        </FadeUpItem>

        <FadeUpItem>
          <div className="grid grid-cols-2 gap-4">
            {cypressResortStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-obsidian-border bg-obsidian-2/60 p-6"
              >
                <CountUp
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="font-mono text-3xl font-semibold text-gold-bright sm:text-4xl"
                />
                <p className="mt-2 text-sm text-fog">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-mist">Measured from the Customer Zero repository.</p>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
