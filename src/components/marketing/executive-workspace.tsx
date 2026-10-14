"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const scenes = [
  { label: "Explore", speaker: "Team Lead", role: "Clarifying the outcome", text: "You want a simpler mobile quote journey. Do we know where customers stop, or should we establish that baseline first?", title: "Start with the business question", points: ["Outcome: make quote requests easier", "Open question: where do visitors stop?", "Boundary: preserve catalog and pricing rules"], decision: "Agree the outcome and missing information" },
  { label: "Agree", speaker: "Designer", role: "Invited by the Team Lead", text: "A shorter form reduces the information requested upfront. I recommend keeping product selection visible and asking only for details needed to prepare the quote.", title: "Compare the proposed journey", points: ["Choose products → confirm requirements → submit", "Tradeoff: additional details may need a follow-up", "Team Lead records the agreed design and scope"], decision: "Choose a direction or request a refinement" },
  { label: "Verify", speaker: "Quality reviewer", role: "Independent acceptance findings", text: "The review checks the agreed journey, invalid submissions and confirmation behavior. Release should wait if any required integration remains unverified.", title: "See the evidence before deciding", points: ["Customer scenarios tied to the approved design", "Regression checks protect existing behavior", "Failed, missing and stale checks remain visible"], decision: "Try the preview and review any release blockers" },
  { label: "Learn", speaker: "Team Lead", role: "Reviewing outcomes and open threads", text: "Record what happened after delivery. We can evaluate a lesson about mobile layouts while keeping the saved-list idea parked for later.", title: "Keep the context for the next improvement", points: ["Delivery record links intent, approval and proof", "Lessons are evaluated before activation", "Saved idea: shared product lists · not approved"], decision: "Review a proposed lesson or return to a saved topic" },
];

export function ExecutiveWorkspace() {
  const [index, setIndex] = useState(0);
  const scene = scenes[index];
  return (
    <section id="workspace" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-aurora-cyan">Product preview · illustrative walkthrough</p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">A team that helps you think it through.</h2>
        <p className="mt-5 text-lg leading-relaxed text-fog">One accountable lead brings specialists into a shared workspace. Explore options, challenge assumptions and agree the work. Your crew handles the coordination.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-aurora-violet/30 bg-obsidian-2/60">
        <div className="flex flex-wrap gap-2 border-b border-obsidian-border p-4" aria-label="Walkthrough steps">
          {scenes.map((step, i) => <button key={step.label} type="button" aria-pressed={index === i} onClick={() => setIndex(i)} className={cn("rounded-lg px-4 py-2 text-sm transition-colors", index === i ? "bg-aurora-violet/20 text-white" : "text-fog hover:bg-white/5")}>{i + 1}. {step.label}</button>)}
        </div>
        <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[11rem_1fr_1fr]">
          <aside aria-label="Illustrative crew roster" className="flex flex-wrap gap-3 lg:flex-col">
            {["Team Lead", "Designer", "Data specialist", "Quality reviewer"].map((name) => <div key={name} className={cn("rounded-xl border p-3 text-sm", name === scene.speaker ? "border-aurora-cyan/50 bg-aurora-cyan/5 text-white" : "border-obsidian-border text-mist")}><span className="font-semibold">{name}</span><p className="mt-1 text-xs">{name === scene.speaker ? "Contributing in this scene" : "Specialist role"}</p></div>)}
          </aside>
          <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-4">
            <div><p className="text-lg font-semibold text-white">{scene.speaker}</p><p className="text-xs text-aurora-cyan">{scene.role}</p></div>
            <p className="text-base leading-relaxed text-fog">{scene.text}</p>
            <div className="mt-auto rounded-xl border border-gold/30 bg-gold/5 p-4"><p className="text-xs uppercase tracking-wider text-gold-bright">Executive decision</p><p className="mt-2 text-sm text-white">{scene.decision}</p></div>
          </div>
          <div className="rounded-2xl border border-obsidian-border bg-obsidian p-5"><p className="text-xs uppercase tracking-wider text-mist">Shared presentation</p><h3 className="mt-3 text-xl font-semibold text-white">{scene.title}</h3><ul className="mt-5 space-y-4 text-sm leading-relaxed text-fog">{scene.points.map((point) => <li key={point} className="border-l-2 border-aurora-violet/40 pl-3">{point}</li>)}</ul></div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-obsidian-border p-4"><Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft className="size-4" /> Previous</Button><span className="text-xs text-mist">{index + 1} of {scenes.length} · example, not a live session</span><Button variant="outline" disabled={index === scenes.length - 1} onClick={() => setIndex(index + 1)}>Next <ArrowRight className="size-4" /></Button></div>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div><h3 className="text-2xl font-semibold text-white">A clear picture of your software assets.</h3><p className="mt-3 leading-relaxed text-fog">See what your business relies on, its current condition and the improvements underway. A live capability can stay healthy while its next enhancement is in design.</p><div className="mt-5 overflow-x-auto rounded-xl border border-obsidian-border"><table className="w-full text-left text-sm"><caption className="bg-obsidian-2 p-3 text-left text-xs text-mist">Illustrative inventory · no live measurements</caption><thead className="text-white"><tr>{["Capability", "Current condition", "Planned change"].map((h) => <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead><tbody className="text-fog">{[["Catalog", "Verification evidence linked", "Specifications review"], ["Search", "Condition tracked separately", "Brand filters in design"], ["Quote requests", "Proposed capability", "Scope awaiting agreement"]].map((row) => <tr key={row[0]} className="border-t border-obsidian-border">{row.map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody></table></div></div>
        <div><h3 className="text-2xl font-semibold text-white">Know what needs your attention.</h3><p className="mt-3 leading-relaxed text-fog">The planned executive view connects business outcomes, customer journeys, delivery and budget. Every vital sign needs a source and a date; missing information stays visible.</p><dl className="mt-5 divide-y divide-obsidian-border">{[["Business outcomes", "Your chosen measures, baseline and targets"], ["Customer journeys", "What was verified, when and against which version"], ["Commitments and budget", "Agreed scope, exposure and blocked decisions"], ["Risk and complexity", "Fragile dependencies and unresolved tradeoffs"]].map(([term, detail]) => <div key={term} className="py-3"><dt className="font-medium text-white">{term}</dt><dd className="mt-1 text-sm text-fog">{detail}</dd></div>)}</dl></div>
      </div>
    </section>
  );
}
