import { Check, ShieldAlert } from "lucide-react";

import { exampleEvidence } from "@/content/accelerator";
import { cn } from "@/lib/utils";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

const judges = [
  "Held-out tests the builder can't edit",
  "Business invariants, checked on every change",
  "Replay against historical behavior",
  "Synthetic users on a test database",
  "Preview telemetry before release",
  "People judge outcomes, not diffs",
];

export function EvidenceSection() {
  return (
    <section id="evidence" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
      <FadeUp className="grid items-center gap-12 lg:grid-cols-2">
        <FadeUpItem className="flex flex-col gap-5">
          <SectionEyebrow>Evidence, not code review</SectionEyebrow>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            The builder never grades its own work.
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-fog">
            An AI that writes both the code and its tests can confidently prove its own
            misunderstanding. So the Accelerator separates the <span className="text-white">actor</span> from
            the <span className="text-white">judge</span>. Every change arrives with an evidence
            package that answers one question: <em className="text-white">why is this safe?</em>
          </p>
          <ul className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {judges.map((j) => (
              <li key={j} className="flex items-start gap-2.5 text-sm text-fog">
                <Check className="mt-0.5 size-4 shrink-0 text-aurora-cyan" />
                <span>{j}</span>
              </li>
            ))}
          </ul>
        </FadeUpItem>

        <FadeUpItem>
          <div className="overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-2 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-obsidian-border px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-mist">Evidence package · example</span>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold-bright">
                {exampleEvidence.changeClass}
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-lg font-semibold text-white">{exampleEvidence.title}</p>
              <dl className="mt-5 flex flex-col divide-y divide-obsidian-border">
                {exampleEvidence.lines.map((line, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-mist">{line.label}</dt>
                    <dd
                      className={cn(
                        "flex items-center gap-2 text-right text-sm",
                        line.status === "pass" && "text-white",
                        line.status === "gate" && "text-gold-bright",
                        line.status === "info" && "text-fog",
                      )}
                    >
                      {line.value}
                      {line.status === "pass" && <Check className="size-3.5 shrink-0 text-signal" />}
                      {line.status === "gate" && <ShieldAlert className="size-3.5 shrink-0" />}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-mist">
            Modelled on a real Customer Zero fix: dashboard balances that disagreed with the ledger.
          </p>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
