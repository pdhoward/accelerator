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

/**
 * "Why not just use Claude?" — the Library pitch (work/gen2-crew.md §3.1).
 * One row per thing an LLM on its own lacks.
 */
export type ComparisonRow = { need: string; llm: string; accelerator: string };

export const llmComparison: ComparisonRow[] = [
  {
    need: "Memory",
    llm: "Forgets between sessions. You re-explain your business every time.",
    accelerator: "Your Library: every decision, design, conversation and change, kept and organized.",
  },
  {
    need: "Hands",
    llm: "You copy code, paste keys, run commands and deploy.",
    accelerator: "Connected to GitHub, Vercel and your database through a secured Toolbelt.",
  },
  {
    need: "Safety",
    llm: "Edits whatever it's pointed at, and grades its own work.",
    accelerator: "Test data only, an independent judge, human gates, a preview before live, one-click undo.",
  },
  {
    need: "Team",
    llm: "One generalist.",
    accelerator: "A crew of specialists tuned to your site: design, build, data, test, release.",
  },
  {
    need: "Proof",
    llm: "“Trust me, it works.”",
    accelerator: "Evidence on every change: tests, screenshots and a full audit trail.",
  },
  {
    need: "Learning",
    llm: "The same tomorrow as today.",
    accelerator: "Every job teaches your crew something, with your approval.",
  },
];

export type SkillTier = { name: string; scope: string; example: string };

/** The three tiers of crew know-how (gen2-crew.md §2.2). */
export const skillTiers: SkillTier[] = [
  { name: "Crew skills", scope: "Ours, shared by every crew", example: "Next.js upgrade playbook · database security rules" },
  { name: "Your company", scope: "Shared by all your sites", example: "Brand voice · pricing rules · tone with customers" },
  { name: "Your site", scope: "One site, private to you", example: "Catalog rules · checkout quirks · what must never break" },
];

/** Where Library content lives (gen2-crew.md §3.2): open files in your repo, history with us, export any time. */
export const libraryHomes = [
  {
    where: "In your own repository",
    what: "Everything needed to understand your site without us: the handbook, decisions, approved designs, site skills and tests, as plain Markdown and code.",
  },
  {
    where: "In your private Library with us",
    what: "How the work happened: conversations, evidence, previews, the tool log and the release timeline. Exportable in one click, any time.",
  },
];

/** An illustrative Library view for the Machine Shop test site. Labelled "example" on the page. */
export const exampleLibrary = {
  site: "Machine Shop",
  knows: 47,
  entries: [
    { kind: "Decision", text: "The assistant only mentions products its search returned", ref: "from Work #4" },
    { kind: "Release", text: "Search by brand, live with before/after screenshots", ref: "Work #7 · undo" },
    { kind: "Site skill", text: "Catalog is read-only; every query is paginated", ref: "v2 · approved" },
    { kind: "Design", text: "Saved lists for shoppers", ref: "approved · in build" },
    { kind: "Learned", text: "Mobile search box too small; crew proposes a layout rule", ref: "awaiting you" },
  ],
};

/** The Toolbelt: how agents act without ever holding a client's credentials (gen2-crew.md §1). */
export const toolbeltPoints = [
  {
    title: "Agents never hold your keys",
    body: "Your credentials sit in an encrypted vault. Agents call named tools, and the Toolbelt attaches the credential on our server. No key ever appears in a prompt, a chat or a log.",
  },
  {
    title: "Connect, don't paste",
    body: "GitHub, Vercel and your database connect with sign-in buttons. Each connection is tested at setup, so problems surface on day one, not at 11pm.",
  },
  {
    title: "Short-lived, single-job passes",
    body: "Every job gets a pass that works for one site, one task and one specialist, then expires. Your tenant comes from the pass, never from anything an agent types.",
  },
  {
    title: "Each specialist sees only its tools",
    body: "The builder can't see the release tool. The judge can't edit code. Least privilege is enforced by what exists in the agent's world, not by asking it nicely.",
  },
  {
    title: "Gates live inside the tool",
    body: "Going live, data changes and anything touching money or sign-in check the gate policy at the moment of the call. An agent can't talk its way past a gate.",
  },
  {
    title: "Every action on the record",
    body: "Each call is logged with who, what, when and what it cost. That record becomes the evidence on every change and the timeline in your Library.",
  },
];
