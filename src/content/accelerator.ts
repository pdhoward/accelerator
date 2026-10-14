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
    "week": "Assess",
    "title": "Check the fit",
    "description": "Review your existing site and identify the scope, dependencies and readiness gaps."
  },
  {
    "week": "Connect",
    "title": "Set the boundaries",
    "description": "Agree service connections, test environments and decision authority before execution."
  },
  {
    "week": "Understand",
    "title": "Talk through the business",
    "description": "Explain your priorities and rules. The crew challenges assumptions and surfaces open questions."
  },
  {
    "week": "Agree",
    "title": "Map the capabilities",
    "description": "Review what the site does, what must stay true and how proposed improvements will be checked."
  },
  {
    "week": "Verify",
    "title": "Establish the baseline",
    "description": "Run realistic scenarios, identify missing checks and confirm what is ready and what needs attention."
  },
  {
    "week": "Improve",
    "title": "Begin governed delivery",
    "description": "Approve a bounded first change, review its preview and evidence, then observe the result."
  }
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
  changeClass: "Money · Owner approval",
  lines: [
    { label: "Root cause", value: "Unordered paged read repeated/skipped rows", status: "info" },
    { label: "Surfaces touched", value: "Dashboard, integrity checks, directory", status: "info" },
    { label: "Regression test added", value: "1,280 ledger rows · concurrent reads", status: "pass" },
    { label: "Full suite", value: "All tests passed", status: "pass" },
    { label: "Invariant", value: "Balance = Σ posted ledger rows", status: "pass" },
    { label: "Invariant", value: "One pricing function, every surface", status: "pass" },
    { label: "Preview deploy", value: "Staging data reconciled to the penny", status: "pass" },
    { label: "Promotion", value: "Money class → client Owner approval", status: "gate" },
  ] satisfies EvidenceLine[],
};

export type Layer = {
  n: string;
  name: string;
  holds: string;
};

export const fiveLayers: Layer[] = [
  { n: "05", name: "Control Room", holds: "Overview · Work · Site · Crew & Knowledge" },
  { n: "04", name: "Assurance", holds: "Independent judges: held-out tests, invariants, replay, synthetic users, telemetry" },
  { n: "03", name: "Execution", holds: "Model-agnostic generators in sandboxes — Claude today, the next model tomorrow" },
  { n: "02", name: "Application Model", holds: "Architecture, invariants, change classes, definition of done — versioned" },
  { n: "01", name: "Adapters", holds: "GitHub · Vercel · Postgres/Supabase · Stripe · CI · analytics · ticketing" },
];

export const readinessReport = [
  {
    "label": "Capabilities",
    "value": "Mapped"
  },
  {
    "label": "Business rules",
    "value": "Agreed"
  },
  {
    "label": "Customer journeys",
    "value": "Checked"
  },
  {
    "label": "Unknowns",
    "value": "Visible"
  },
  {
    "label": "Decision authority",
    "value": "Explicit"
  },
  {
    "label": "First improvement",
    "value": "Scoped"
  }
];

/**
 * "Why not just use Claude?" — the Library pitch (work/gen2-crew.md §3.1).
 * One row per thing an LLM on its own lacks.
 */
export type ComparisonRow = { need: string; llm: string; accelerator: string };

export const llmComparison: ComparisonRow[] = [
  {
    "need": "Continuity",
    "llm": "Important context can remain scattered across threads.",
    "accelerator": "Planned Library connects business rules, decisions, work and evidence."
  },
  {
    "need": "Expert advice",
    "llm": "You may need to frame and coordinate each task.",
    "accelerator": "One accountable lead coordinates specialist recommendations."
  },
  {
    "need": "Authority",
    "llm": "Discussion alone does not define permission to act.",
    "accelerator": "Agreed boundaries and application-enforced gates govern execution."
  },
  {
    "need": "Proof",
    "llm": "A convincing explanation is not an acceptance check.",
    "accelerator": "Verification links the delivered behavior to the approved design."
  },
  {
    "need": "Open threads",
    "llm": "Unfinished questions can get buried in a long exchange.",
    "accelerator": "Save topics with their context and return without treating them as approved work."
  },
  {
    "need": "Learning",
    "llm": "Remembering more does not prove better outcomes.",
    "accelerator": "Evaluate lessons, approve activation and measure subsequent work."
  }
];

export type SkillTier = { name: string; scope: string; example: string };

/** The three tiers of crew know-how (gen2-crew.md §2.2). */
export const skillTiers: SkillTier[] = [
  { name: "Crew skills", scope: "Ours, shared by every crew", example: "Next.js upgrade playbook · database security rules" },
  { name: "Partner skills", scope: "Your delivery partner’s methods", example: "Accessibility standards · industry delivery practices" },
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
    what: "How the work happened: conversations, evidence, previews, the tool log and the release timeline. Open-format export is planned.",
  },
];

/** An illustrative Library view for the Machine Shop test site. Labelled "example" on the page. */
export const exampleLibrary = {
  site: "Machine Shop",
  knows: 47,
  entries: [
    { kind: "Decision", text: "The assistant only mentions products its search returned", ref: "from Work #4" },
    { kind: "Release", text: "Search by brand, live with before/after screenshots", ref: "Work #7 · release record" },
    { kind: "Site skill", text: "Catalog is read-only; every query is paginated", ref: "v2 · approved" },
    { kind: "Open question", text: "Should shoppers be able to share saved lists?", ref: "saved for later · not approved" },
    { kind: "Proposal", text: "Mobile search box too small; crew proposes a layout rule", ref: "awaiting you" },
  ],
};

/** The Toolbelt: how agents act without ever holding a client's credentials (gen2-crew.md §1). */
export const toolbeltPoints = [
  {
    title: "Agents never hold your keys",
    body: "Your credentials sit in an encrypted vault. Agents call named tools, and the Toolbelt attaches the credential on our server. The design keeps service credentials out of prompts, chats and logs.",
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
    body: "The builder can't see the release tool. The judge can't edit code. Tool invocation enforces the permission boundary; hiding a tool alone is insufficient.",
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
