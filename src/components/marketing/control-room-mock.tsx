import { cn } from "@/lib/utils";
/** Illustrative product concept, never a live status feed. */
export function ControlRoomMock({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex flex-col gap-3 overflow-hidden bg-obsidian p-4 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-obsidian-border pb-3">
        <span className="text-xs font-semibold text-white sm:text-sm">Your executive workspace</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-gold-bright">Product preview</span>
      </div>
      <div className="hidden grid-cols-3 gap-2 text-xs sm:grid">
        {[["Site condition", "Evidence visible"], ["Commitments", "Scope agreed"], ["Your attention", "Key decisions"]].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-obsidian-border bg-obsidian-2 p-3">
            <p className="text-mist">{label}</p><p className="mt-1 font-medium text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-[1fr_1.1fr]">
        <div className="rounded-xl border border-aurora-violet/30 bg-aurora-violet/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-aurora-cyan">Team Lead · recommendation</p>
          <p className="mt-2 text-xs leading-relaxed text-white sm:mt-3 sm:text-sm">Simplify the mobile quote journey. The designer has two options; I recommend the shorter flow.</p>
          <p className="mt-3 hidden text-xs leading-relaxed text-fog sm:block">Your decision: agree the design before building.</p>
        </div>
        <div className="hidden rounded-xl border border-obsidian-border bg-obsidian-2 p-4 sm:block">
          <p className="font-mono text-[10px] uppercase tracking-wider text-mist">Shared presentation</p>
          <p className="mt-3 text-sm font-semibold text-white">A clearer path to a quote</p>
          <ol className="mt-3 space-y-2 text-xs text-fog"><li>1. Choose products</li><li>2. Confirm requirements</li><li>3. Submit and receive confirmation</li></ol>
          <p className="mt-3 border-t border-obsidian-border pt-3 text-xs text-gold-bright">Checks follow the agreed journey.</p>
        </div>
      </div>
    </div>
  );
}
