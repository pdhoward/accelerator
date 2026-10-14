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
            Cypress Resort&apos;s live booking, payments and ledger platform shaped the
            delivery practices we are packaging into the Accelerator. The owner sets
            priorities, makes policy decisions and challenges results. The coming commercial
            platform brings that approach into a shared expert workspace.
          </p>
          <p className="leading-relaxed text-fog">
            For example, dashboard balances must agree with the financial ledger. A paging
            defect became a targeted regression scenario, alongside checks of pricing and
            financial integrity. The business rule becomes a lasting verification check.
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
          <p className="mt-3 text-center text-xs text-mist">Historical baseline: Customer Zero repository, September 25, 2026.</p>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
