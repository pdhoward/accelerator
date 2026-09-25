import { cn } from "@/lib/utils";

/**
 * The recurring "innovation" motif (design.md §2.4): slow-drifting gradient
 * blobs, pure CSS so it never blocks LCP. Purely decorative — aria-hidden —
 * and the drift animation is disabled globally under prefers-reduced-motion
 * (see globals.css).
 */
export function AuroraMesh({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute left-1/4 top-0 size-[36rem] -translate-x-1/2 animate-aurora-drift rounded-full bg-aurora-violet/25 blur-[120px]" />
      <div
        className="absolute right-0 top-1/3 size-[32rem] translate-x-1/3 animate-aurora-drift rounded-full bg-aurora-cyan/20 blur-[120px]"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 size-[28rem] translate-y-1/3 animate-aurora-drift rounded-full bg-aurora-violet/15 blur-[120px]"
        style={{ animationDelay: "-14s" }}
      />
    </div>
  );
}
