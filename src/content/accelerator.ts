/**
 * Core Accelerator story content — mirrors cypress-actions/accelerator.md.
 * Keep the two in step: the plan is the source, this is its marketing voice.
 */

export const oldLoop = ["Ticket", "Developer", "Pull request", "Code review", "QA", "Deploy"];

export const newLoop = ["Intent", "Build", "Verify", "Release", "Observe"];

export type CommissioningStep = {
  week: string;
  title: string;
  description: string;
};

export const commissioningSteps: CommissioningStep[] = [
  {
    week: "Week 0",
    title: "Connect",
    description:
      "Repo, CI, hosting, and a test database. Production stays read-only. The first interlocks are set before anything moves.",
  },
  {
    week: "Week 1",
    title: "Survey",
    description:
      "Map the architecture, interview your operators, read your incident and backlog history. Out comes the Application Model.",
  },
  {
    week: "Week 2–3",
    title: "Instrument",
    description:
      "Find what your tests can't see. Build a held-out suite on a test database and install the Discipline Pack.",
  },
  {
    week: "Week 4",
    title: "Shadow",
    description:
      "Replay your recent changes and current backlog through the Accelerator, and compare the results with what your team shipped.",
  },
  {
    week: "Week 5–6",
    title: "Custody",
    description:
      "Bounded autonomy goes live. Your operators are trained in the Control Room. You receive a Readiness Report.",
  },
  {
    week: "Week 7+",
    title: "Raise energy",
    description:
      "More classes of change open up as the evidence stays clean. Autonomous coverage climbs week over week.",
  },
];

export type AutonomyLevel = {
  code: string;
  name: string;
  scope: string;
  gate: string;
};

export const autonomyLevels: AutonomyLevel[] = [
  { code: "AC0", name: "Observe", scope: "Map, test and report. No changes.", gate: "—" },
  { code: "AC1", name: "Repair", scope: "Bugs, flaky tests, dependencies, copy", gate: "Auto to staging" },
  { code: "AC2", name: "Implement", scope: "Well-specified backlog features", gate: "Operator OKs the evidence" },
  { code: "AC3", name: "Refactor", scope: "Changes across modules and architecture", gate: "Replay + held-out suite" },
  { code: "AC4", name: "Operate", scope: "Incidents, performance, data fixes", gate: "Interlocked prod path" },
  { code: "AC5", name: "Evolve", scope: "Bounded experiments behind flags", gate: "Your mission bounds" },
];

export type EvidenceLine = {
  label: string;
  value: string;
  status: "pass" | "gate" | "info";
};

/**
 * An illustrative evidence package, modelled on a real Customer Zero fix
 * (ts-platform backlog #53: dashboard balances double-counting ledger rows
 * past 1,000). Labelled "example" on the page — not a live feed.
 */
export const exampleEvidence = {
  title: "Dashboard balances must match every folio",
  changeClass: "Money · AC3",
  lines: [
    { label: "Root cause", value: "Unordered paged read repeated/skipped rows", status: "info" },
    { label: "Surfaces touched", value: "Dashboard, integrity checks, directory", status: "info" },
    { label: "Regression test added", value: "1,280 ledger rows · concurrent reads", status: "pass" },
    { label: "Full suite", value: "All tests passed", status: "pass" },
    { label: "Invariant", value: "Balance = Σ posted ledger rows", status: "pass" },
    { label: "Invariant", value: "One pricing function, every surface", status: "pass" },
    { label: "Preview deploy", value: "Staging data reconciled to the penny", status: "pass" },
    { label: "Promotion", value: "Money class → operator approval", status: "gate" },
  ] satisfies EvidenceLine[],
};

export type Layer = {
  n: string;
  name: string;
  holds: string;
};

export const fiveLayers: Layer[] = [
  { n: "05", name: "Control Room", holds: "Mission · Work · Health · Changes · Confidence · Controls" },
  { n: "04", name: "Assurance", holds: "Independent judges: held-out tests, invariants, replay, synthetic users, telemetry" },
  { n: "03", name: "Execution", holds: "Model-agnostic generators in sandboxes — Claude today, the next model tomorrow" },
  { n: "02", name: "Application Model", holds: "Architecture, invariants, change classes, definition of done — versioned" },
  { n: "01", name: "Adapters", holds: "GitHub · Vercel · Postgres/Supabase · Stripe · CI · analytics · ticketing" },
];

export const readinessReport = [
  { label: "Behaviors mapped", value: "1,842" },
  { label: "Independently testable", value: "1,216" },
  { label: "Production invariants", value: "94" },
  { label: "Restricted change classes", value: "14" },
  { label: "Human authorization gates", value: "6" },
  { label: "Autonomous coverage", value: "71%" },
];
