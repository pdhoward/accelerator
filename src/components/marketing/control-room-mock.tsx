import { cn } from "@/lib/utils";

/**
 * Illustrative Control Room screen rendered inside <BrowserFrame> until a real
 * Control Room UI exists (accelerator.md §3.1 layer 5). Static content only.
 */
const surfaces = ["Mission", "Work", "Health", "Changes", "Confidence", "Controls"];

const work: { title: string; level: string; state: "shipped" | "verifying" | "running" | "gated" }[] = [
  { title: "Package stays — prepaid cancellation", level: "AC2", state: "gated" },
  { title: "Itemized card charges in Stripe", level: "AC2", state: "verifying" },
  { title: "Dashboard balance paging fix", level: "AC3", state: "shipped" },
  { title: "Dependency + flaky-test sweep", level: "AC1", state: "shipped" },
  { title: "Guest activity log", level: "AC2", state: "running" },
];

const stateStyle = {
  shipped: "border-signal/30 bg-signal/10 text-signal",
  verifying: "border-aurora-cyan/30 bg-aurora-cyan/10 text-aurora-cyan",
  running: "border-aurora-violet/30 bg-aurora-violet/10 text-aurora-violet",
  gated: "border-gold/40 bg-gold/10 text-gold-bright",
} as const;

export function ControlRoomMock({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex gap-3 overflow-hidden bg-obsidian p-3 sm:p-4", className)}>
      <div className="hidden w-32 shrink-0 flex-col gap-1.5 sm:flex">
        {surfaces.map((s, i) => (
          <div
            key={s}
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest",
              i === 1 ? "bg-aurora-gradient text-white" : "bg-white/[0.04] text-mist",
            )}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { k: "Autonomy", v: "AC2", c: "text-aurora-cyan" },
            { k: "Health", v: "Nominal", c: "text-signal" },
            { k: "Coverage", v: "71%", c: "text-gold-bright" },
          ].map((m) => (
            <div key={m.k} className="rounded-xl border border-obsidian-border bg-obsidian-2 px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-mist">{m.k}</p>
              <p className={cn("font-mono text-sm font-semibold sm:text-base", m.c)}>{m.v}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 rounded-xl border border-obsidian-border bg-obsidian-2 p-2.5 sm:p-3">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-mist">Work in the ring</p>
          {work.map((w) => (
            <div
              key={w.title}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5"
            >
              <span className="truncate text-[11px] text-fog sm:text-xs">{w.title}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="hidden font-mono text-[9px] text-mist sm:inline">{w.level}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                    stateStyle[w.state],
                  )}
                >
                  {w.state}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-obsidian-border bg-obsidian-2 p-2.5 sm:p-3">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-mist">
            Latest evidence · dashboard balance paging fix
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {["Suite passed", "Invariants held", "Replay clean", "Promoted"].map((e) => (
              <span
                key={e}
                className="flex items-center gap-1.5 rounded-md bg-signal/10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-signal"
              >
                <span className="size-1 rounded-full bg-signal" />
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
