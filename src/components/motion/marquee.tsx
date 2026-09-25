"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal scroll, pause-on-hover (design.md §2.4). Renders the
 * children twice back to back so the loop is seamless, then animates the
 * whole track left by exactly one copy's width via the `marquee` keyframes
 * defined in globals.css.
 */
export function Marquee({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div className="flex w-max animate-marquee items-center gap-16 group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center gap-16 pr-16">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-16 pr-16">
          {children}
        </div>
      </div>
    </div>
  );
}
