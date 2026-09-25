"use client";

import * as React from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

/**
 * Counts up from 0 to `value` once in view (design.md §2.4 "Live counters").
 * Renders "—" for a null value rather than a fabricated placeholder number
 * (see content/stats.ts) — the em dash is a static, screen-reader-friendly
 * final value on its own, no animation needed.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number | null;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.2, bounce: 0 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (inView && value !== null) motionValue.set(value);
  }, [inView, value, motionValue]);

  React.useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  if (value === null) {
    return (
      <span ref={ref} className={className}>
        —
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
