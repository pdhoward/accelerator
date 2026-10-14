export type Stat = {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
};

/**
 * Customer Zero engineering figures, measured from the ts-platform repo on
 * 2026-09-25 (see cypress-actions/accelerator.md §1). Re-measure before
 * updating — never round up or invent. `value: null` renders as "—".
 */
export const cypressResortStats: Stat[] = [
  { label: "Automated tests guarding every change", value: 615 },
  { label: "AI-assisted delivery commits", value: 287 },
  { label: "Weeks from first commit to live production", value: 12, prefix: "<" },
  { label: "API routes in the platform", value: 111 },
];
