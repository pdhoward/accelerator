import type { LucideIcon } from "lucide-react";
import { Activity, BookOpenCheck, Gauge, GitCompareArrows, Lock, Network, Scale, ShieldCheck, SlidersHorizontal, Target } from "lucide-react";
export type Feature = { icon: LucideIcon; title: string; description: string; tier: "primary" | "secondary" };
/** Product-design preview; the platform rollout is tracked in work/gen2-crew.md. */
export const features: Feature[] = [
  { icon: Network, title: "A clear picture of your website", description: "See the capabilities your business relies on, their condition, and improvements planned or underway. Technical assets remain traceable underneath.", tier: "primary" },
  { icon: Scale, title: "Proof against the agreement", description: "Realistic customer scenarios check the proposed change and help protect existing behavior. Findings show what was demonstrated and what remains uncertain.", tier: "primary" },
  { icon: Lock, title: "Delegate the work. Keep authority.", description: "Agree priorities, budget and boundaries. The crew coordinates execution and returns consequential decisions to the people authorized to make them.", tier: "primary" },
  { icon: BookOpenCheck, title: "A team that helps you think it through", description: "One accountable lead brings specialists into the conversation to explore options, challenge assumptions and refine the design before work is approved.", tier: "primary" },
  { icon: Target, title: "Your direction", description: "Set the business outcomes, priorities and rules that guide the crew.", tier: "secondary" },
  { icon: Activity, title: "Shared workspace", description: "Review recommendations, documents and previews in one lead-led conversation.", tier: "secondary" },
  { icon: Gauge, title: "Business vital signs", description: "See customer-journey health, commitments, budget and missing information.", tier: "secondary" },
  { icon: GitCompareArrows, title: "A lasting decision record", description: "Connect what you intended and approved with the work delivered.", tier: "secondary" },
  { icon: ShieldCheck, title: "Experience becomes better practice", description: "Evaluate proposed lessons before activation, then measure whether later work improves.", tier: "secondary" },
  { icon: SlidersHorizontal, title: "Ideas saved for later", description: "Park questions and options with their context, without approving or committing them.", tier: "secondary" },
];
export const primaryFeatures = features.filter((f) => f.tier === "primary");
export const secondaryFeatures = features.filter((f) => f.tier === "secondary");
