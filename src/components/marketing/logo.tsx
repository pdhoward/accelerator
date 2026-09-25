import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Placeholder wordmark — no licensed logo file exists yet (design.md §9).
 * The mark is a simple angular bracket built from two gradient strokes,
 * standing in for "compiled precision" until a real asset is supplied.
 */
export function Logo({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 text-white transition-opacity hover:opacity-80",
        className,
      )}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="sm-logo-grad" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0" stopColor="var(--sm-aurora-violet)" />
            <stop offset="1" stopColor="var(--sm-aurora-cyan)" />
          </linearGradient>
        </defs>
        <path
          d="M9 2 3 12l6 10"
          stroke="url(#sm-logo-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 2 21 12l-6 10"
          stroke="url(#sm-logo-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
      </svg>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          mono && "font-mono text-xs font-medium uppercase tracking-widest",
        )}
      >
        Strategic Machines
      </span>
    </Link>
  );
}
