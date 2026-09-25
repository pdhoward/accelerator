import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpenCheck,
  Gauge,
  GitCompareArrows,
  Lock,
  Network,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  tier: "primary" | "secondary";
};

/**
 * Primary = what makes handing over custody rational (accelerator.md §3).
 * Secondary = the six Control Room surfaces an operator actually works in.
 */
export const features: Feature[] = [
  {
    tier: "primary",
    icon: Network,
    title: "Application Model",
    description:
      "Your architecture, invariants, money and identity surfaces, and what “done” means — written down, versioned, and checked on every change. The machine reads it; so can you.",
  },
  {
    tier: "primary",
    icon: Scale,
    title: "Independent Assurance",
    description:
      "The model that writes the change never grades it. Held-out tests, invariant checks, historical replay, synthetic users, and preview telemetry judge every change independently.",
  },
  {
    tier: "primary",
    icon: Lock,
    title: "Interlocks",
    description:
      "No production write keys in an AI session. Money, auth, and destructive migrations never auto-promote. Spend caps, loop limits, and full provenance on every change.",
  },
  {
    tier: "primary",
    icon: BookOpenCheck,
    title: "The Discipline Pack",
    description:
      "The operating habits that made Customer Zero work — a rulebook, a numbered backlog, design-before-code, every incident becomes a regression test — installed on your app.",
  },
  {
    tier: "secondary",
    icon: Target,
    title: "Mission",
    description: "What the application should accomplish — and the bounds it may never cross.",
  },
  {
    tier: "secondary",
    icon: Activity,
    title: "Work",
    description: "What the Accelerator is doing right now, queued, held, or done.",
  },
  {
    tier: "secondary",
    icon: Gauge,
    title: "Health",
    description: "Is the application behaving correctly — tests, invariants, and live telemetry.",
  },
  {
    tier: "secondary",
    icon: GitCompareArrows,
    title: "Changes",
    description: "Every change, in plain language, with the intent that caused it.",
  },
  {
    tier: "secondary",
    icon: ShieldCheck,
    title: "Confidence",
    description: "Why the Accelerator believes each change is safe — the evidence package.",
  },
  {
    tier: "secondary",
    icon: SlidersHorizontal,
    title: "Controls",
    description: "Raise or lower autonomy, hold a change, roll one back, pin a model.",
  },
];

export const primaryFeatures = features.filter((f) => f.tier === "primary");
export const secondaryFeatures = features.filter((f) => f.tier === "secondary");
