"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Moves its children vertically at a fraction of scroll speed while the
 * wrapping element is in the viewport (design.md §2.4 "Parallax drift").
 * `speed` of 0.4 means the content drifts at 40% of normal scroll speed.
 */
export function Parallax({
  children,
  className,
  speed = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -60}px`, `${speed * 60}px`]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
