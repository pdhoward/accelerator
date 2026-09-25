import { ArrowDown, Hand } from "lucide-react";

import { newLoop, oldLoop } from "@/content/accelerator";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

// Five nodes on a ring of r=120 centred at (210,160), starting at 12 o'clock.
const nodes = [
  { x: 210, y: 40, lx: 210, ly: 22, anchor: "middle" },
  { x: 324.1, y: 122.9, lx: 340, ly: 127, anchor: "start" },
  { x: 280.5, y: 257.1, lx: 294, ly: 282, anchor: "start" },
  { x: 139.5, y: 257.1, lx: 126, ly: 282, anchor: "end" },
  { x: 95.9, y: 122.9, lx: 80, ly: 127, anchor: "end" },
] as const;

function AcceleratorRing() {
  return (
    <svg viewBox="0 0 420 310" className="h-auto w-full" role="img" aria-label="The accelerator loop: intent, build, verify, release, observe — and around again">
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--sm-aurora-violet)" />
          <stop offset="1" stopColor="var(--sm-aurora-cyan)" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="160" r="120" fill="none" stroke="var(--sm-obsidian-border)" strokeWidth="10" />
      <circle cx="210" cy="160" r="120" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" opacity="0.8" />
      <g className="animate-orbit" style={{ transformOrigin: "210px 160px" }}>
        <circle cx="210" cy="40" r="5" fill="var(--sm-aurora-cyan)" />
        <circle cx="210" cy="40" r="12" fill="var(--sm-aurora-cyan)" opacity="0.2" />
      </g>
      {nodes.map((n, i) => (
        <g key={newLoop[i]}>
          <circle cx={n.x} cy={n.y} r="7" fill="var(--sm-obsidian)" stroke="url(#ring-grad)" strokeWidth="2" />
          <text
            x={n.lx}
            y={n.ly}
            textAnchor={n.anchor}
            className="fill-white font-mono"
            style={{ fontSize: 13, letterSpacing: "0.08em" }}
          >
            {newLoop[i].toUpperCase()}
          </text>
        </g>
      ))}
      <text x="210" y="155" textAnchor="middle" className="fill-white" style={{ fontSize: 18, fontWeight: 600 }}>
        The Accelerator
      </text>
      <text x="210" y="177" textAnchor="middle" className="fill-[var(--sm-fog)]" style={{ fontSize: 11.5 }}>
        every turn adds velocity
      </text>
    </svg>
  );
}

export function ShiftSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <FadeUp className="mx-auto mb-14 max-w-2xl text-center">
        <FadeUpItem>
          <SectionEyebrow className="mx-auto justify-center">The shift</SectionEyebrow>
        </FadeUpItem>
        <FadeUpItem>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Software was never a factory.
          </h2>
        </FadeUpItem>
        <FadeUpItem>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-fog">
            A factory moves a part down a line, with hands at every station. Software never
            worked that way: it circles through build, test, refactor and ship. AI makes each
            turn faster than people can inspect. So stop inspecting parts and run the machine.
          </p>
        </FadeUpItem>
      </FadeUp>

      <FadeUp className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <FadeUpItem className="h-full">
          <div className="flex h-full flex-col rounded-2xl border border-obsidian-border bg-obsidian-2/50 p-7">
            <p className="font-mono text-xs uppercase tracking-widest text-mist">The software factory</p>
            <p className="mt-2 text-sm text-fog">Linear. Human hands at every station. Throughput limited by review.</p>
            <ol className="mt-6 flex flex-1 flex-col items-stretch">
              {oldLoop.map((step, i) => (
                <li key={step} className="flex flex-col items-center">
                  <div className="flex w-full items-center justify-between rounded-lg border border-obsidian-border bg-obsidian px-4 py-2.5">
                    <span className="text-sm text-fog">{step}</span>
                    <Hand className="size-3.5 text-mist" aria-label="human step" />
                  </div>
                  {i < oldLoop.length - 1 && <ArrowDown className="my-1 size-3.5 text-obsidian-border" />}
                </li>
              ))}
            </ol>
          </div>
        </FadeUpItem>

        <FadeUpItem className="h-full">
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-aurora-violet/30 bg-obsidian-2/70 p-7 border-glow-aurora">
            <p className="font-mono text-xs uppercase tracking-widest text-aurora-cyan">The accelerator</p>
            <p className="mt-2 text-sm text-fog">
              A loop that gets faster each turn. Machines build, independent judges verify,
              and people steer from the control room.
            </p>
            <div className="mx-auto mt-4 w-full max-w-lg flex-1">
              <AcceleratorRing />
            </div>
          </div>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
