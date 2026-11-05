# Gen 3: The Cradle (Design v0.4)

*Strategic Machines · started 2026-10-28 · revised 2026-11-03 · **status: direction set by the Owner; design in progress; Pilot 1 (policy extraction from ts-platform, read-only) authorized; Pilot 2 (CardDemo, a public COBOL estate) approved 2026-11-02; Demo 1 (Machine Shop) anchored 2026-11-03, see §12** · builds on [gen2-crew.md](gen2-crew.md) §13.3 (business-rule register), §20 (domain packs), §21 (traceability store) and §9.2 (the Decide layer, Jev)*

**How to use this doc:**
- The Backlog comes first: a running list of updates and refactors we know we want, not yet scheduled.
- §0 says what Gen 3 is and what stays from Gen 2.
- §1 is the execution model:
  - "can agents run the transactions?" (§1.1);
  - criticality (§1.3);
  - the request path with Jev (§1.4);
  - generative surfaces (§1.5).
- §2 is the policy graph, the platform's proprietary core:
  - storage and indexes, and when a graph database would be needed (§2.5);
  - how kernels run against the graph (§2.7).
- §3 covers industry packs, roles (§3.1), the Policy Walk where a crew helps the steward tune the pack (§3.2), and Karpathy's ladder for the steward's understanding (§3.3).
- §4 covers test-driven policy.
- §5 is Pilot 1: extracting the policy book from ts-platform.
- §6 covers the advantage, honestly stated. §7 covers risks.
- §8 is the decisions log. §9 is the action list. §10 is the build log.
- §11 covers any technology: legacy estates (COBOL, JCL, CICS, IMS), technology adapters beside industry packs, the three kinds of kernel, and Pilot 2 on AWS CardDemo.
- §12 is the Demo 1 anchor: the original Machine Shop kept as a baseline, its addresses, and what Demo 1 proved before Demo 2 (CardDemo).

> **What Gen 3 is.** Every client app lives in its own **cradle**: an Accelerator that stays attached for the app's whole life. The app's source of truth is a **policy graph**: the client's policies, practices and regulations, linked to each other and to everything that carries them out. The graph starts from an **industry pack** and grows as the client describes their business. The crew turns each policy into running behavior, in the cheapest form that can be trusted. The app observes what it can't serve and proposes new work. It never makes its own rules. The owner, whom we call the **steward**, sets policy, and the app carries it out at machine speed. Every behavior traces back to a policy the steward approved.

---

## Backlog

A running list of updates and refactors we know we want. An item leaves the list when it is built (it then appears in the §10 build log) or dropped (with a line saying why). New items go at the bottom.

| # | Added | Item | Status |
|---|---|---|---|
| B1 | 2026-11-05 | **A cloud server for the runner.** Design, code and deploy a hosted runner so jobs run without the Owner's laptop. First target: a Render background worker with a persistent disk, cloning code from GitHub. | In progress (2026-11-05) |
| B2 | 2026-11-05 | **A concurrent crew for ingest.** Today one agent reads a system slice by slice, playing many personas in turn. Refactor so the platform runs many agents at once, in harmony: extractors working slices in parallel, then the Clerk and Gap Finder reconciling across them. The goal is to read estates of millions of lines in hours, not days. This needs a job fan-out and fan-in on the API, per-slice claims for several runners, a cost ceiling per ingest, and a merge step that stays deterministic. | Open |
| B3 | 2026-11-05 | **A data dictionary beside the policy book.** Extract the data elements a system uses (fields, records, columns, copybook items, API payloads) together with its policies and business rules. Then link the same element across programs and apps that call it by different names (for example `ACCT-CURR-BAL` in COBOL, `currentBalance` in the web app, `curr_bal` in the database). Open questions: how to find candidate matches (type and PIC, lineage through moves and assignments, shared copybooks, value ranges, the screens and reports that show it), and how the steward confirms them. Proposed: matches the crew isn't sure of go through the same review as apparent contradictions (a Policy Walk item: "same element?" with the evidence), and confirmed links become edges in the graph that policies and kernels can cite. This is critical when refactoring several apps that share data. | Open |

---

## 0. What carries over from Gen 2

Gen 3 is a new starting point for work, not a rewrite. These rules stay:
- Gen 2 §0, all of it: one implementation behind two doors; the tenant comes from the credential; keys stay on the server.
- **Cypress Resort (ts-platform) is live production and is never a test target.** Pilot 1 reads its source at a pinned commit and does nothing else (§5.1, G3-D2).
- Ratings, gates, mandates and the Judge stay. The complexity rating takes on a second job (§1.2).
- **Code confidence is not business approval** (§13.3). A rule read from code is a *candidate* until the steward confirms it.

What changes:

| Gen 2 | Gen 3 |
|---|---|
| A request becomes a work order | A **policy change** becomes an impact analysis, then work orders |
| The rule register sits beside the code | The **policy graph is the master**; code is one way to carry out a policy |
| Domain packs: skills, vocabulary, test libraries | **Industry packs** add starter policies, verified kernels and connectors, shipped as a versioned package |
| The Accelerator touches the repo | The cradle is also present at **runtime**: observing, applying guidance, filing work (introduced last, §9) |
| Boarding ends with a census | Boarding ends with a **policy book**: "Your app already implies these policies. Confirm, correct or retire them." |

### 0.1 Isn't this just prompts and tools? (2026-10-30)

**At the moment of execution, yes,** and deliberately so. A model reads instructions and calls tools. That part is a commodity, and we want it that way, so the cradle improves every time models do. The product is everything a prompt and a tool cannot do on their own:

| Prompts and tools | The cradle |
|---|---|
| A prompt is an **instruction**: text with no version, owner, effective date or approval | A policy is a **commitment**: versioned, dated, owned, rated for criticality, approved, and given a sunset date |
| The model decides whether to obey the prompt | **Critical policies are not enforced by the prompt at all.** They are compiled into kernel parameters and guards, so the model acts only in the space a policy leaves open, and it cannot talk its way past a guard |
| A tool does what it is told | A kernel does what the policy **allows**, and returns which rule fired |
| 300 prompts are 300 paragraphs. Nobody can tell whether two of them conflict, or what is missing | The graph makes contradictions a query, and holes computable (concept × lifecycle event) |
| Everything goes into the context, or retrieval hopes to find it | Only the triggered policies are loaded, at the version in force for this case |
| Change a prompt, and you can't tell what else changed | Change a policy: impact analysis, a shadow run over the standard cases, then steward approval |
| No trail | Every outcome cites the policy versions it applied; every policy lists what implements and states it |

**Questions a prompts-and-tools system cannot answer, and the cradle answers with a query:**
- Which refund policy applied to booking #4412, which version was it, and who approved it?
- What changes if the deposit goes from 50% to 30%?
- Do the website, the confirmation email and the concierge agent all state the same terms?
- Are any of our policies in conflict? Which ones expire this quarter? Which depend on this regulation?

The value is these answers, not the mechanism. They are what a board, an auditor or a regulator asks.

**Where prompts and tools are enough:** a business with few rules and little at stake. The cradle pays off where rules are dense, money moves and regulation applies (§6).

**The discipline that follows:** the crew builds and maintains the graph (extraction, the Policy Walk, generated examples). If stewards had to hand-build it, the cradle would become the old business-rules platform again.

---

## 1. The execution model

### 1.1 Can agents run the transactions, with no compiled code?

**Partly, and the part that matters can be very large.** The sound version of the idea:

> **Agents propose; kernels dispose.**

Agents plan from the policy graph, gather facts, choose the action and assemble its parameters. A small set of **verified kernels** checks those parameters and executes them. They also hold the arithmetic and the invariants. This applies wherever money, inventory, personal data or law is involved.

Why not let the agent compute a refund itself:
- **The same input must give the same answer every time.** A refund band, a tax line or a payment schedule can't vary with the model's mood. ts-platform's `computeCancellationRefund` is a good example: its evaluation order is no-show, then the policy gate, then the instant-cancel window, then the first matching band. An auditor or a court must be able to replay that exactly.
- **Cost and speed.** A model call per transaction costs cents and takes seconds. A kernel costs nothing and takes microseconds.
- **Proof.** A kernel can be tested exhaustively at its boundaries. An agent can only be sampled.

What the agent *does* own:
- **Orchestration:** which steps, in what order, given this guest and this situation.
- **The open edges:** exceptions, conversations, explanations ("why is my refund 50%?"), and messy input.
- **Parameter assembly:** reading the API signature of a connector and filling it from the graph and the context. This is your Stripe idea, and it's sound, *provided a guard validates the call before it runs*.

### 1.2 Three kinds of code, and none of it written per client

In steady state, a client's app needs **no client-specific compiled code**. All code falls into three kinds, all owned by packs and the platform:

1. **Kernels:** verified engines that interpret policy *as data*. Examples: rates, availability, cancellation, tax, ledger, payment schedule. A new policy usually means **new parameters on an existing kernel**: a new cancellation band or a new minimum stay. That is a graph change with tests, not a release.
2. **Connectors:** typed integrations (Stripe, Supabase, email, PMS, accounting). Agents call them through the Toolbelt. Every call passes a **guard** that checks the parameters against the governing policies before it runs, and records the result.
3. **Surfaces:** the screens, forms, emails and pages people see, generated from the graph where possible (FormSpec already points this way).

Code gets written only when a policy needs **a kernel or connector that doesn't exist yet**. When that happens, the new kernel goes into the *pack*, so the next client in that industry doesn't need code. Over time, the share of policies that need new code should fall toward zero, and that ratio is a key measure (§6).

ts-platform already shows the pattern. Its calendar rule set (`ts_calendar_rule_sets`, typed in `packages/domain/src/shared/calendar-rule-set.ts`) is policy as versioned data: blackouts, seasons, stay restrictions, lead time, cancellation bands, instant-cancel windows. Its engines are the kernels that interpret it. Gen 3 generalizes what the Cypress build arrived at by necessity.

### 1.3 Criticality, separate from complexity (2026-10-29)

Gen 2's single rating mixed two different questions. Gen 3 separates them:
- **Criticality** is a property of a **policy**: *what happens if we get this wrong?* It sets how closely we pay attention, how deep the proof must go, who must approve, and how the policy may run.
- **Complexity** is a property of a **work order**: *how hard is this change to build?* It keeps its Gen 2 job of planning effort and checkpoints.

A simple change to a critical policy is common. Lowering a deposit percentage is one line, and it is critical. The two axes must not be confused.

**How criticality is set:**
- the pack's default for that kind of policy, plus
- the policy's **reach**, computed from the graph: how many kernels, surfaces and transactions depend on it.

Either can raise criticality; nothing lowers it except a recorded steward decision, and never below the pack's floor. Money, personal data, sign-in, security, law and guest safety have a floor of Critical.

| Criticality | How the policy runs | Proof required | Human role |
|---|---|---|---|
| **Critical** | Kernel or guard only. Deterministic. | Boundary examples, 100% kernel pass, agent conformance on every run | The steward confirms the policy and every change |
| **Important** | Kernel where one exists; otherwise agent guidance, checked against the examples | Examples, sampled conformance | The steward confirms; the crew proposes the form |
| **Routine** | Agent guidance at runtime (tone, recommendations, service recovery inside limits) | Examples | The steward reviews outcomes, not each action |

**The app may propose but never legislate.** Observed needs (failed searches, unanswered questions, abandoned checkouts) become *proposed* policies or work orders. Nothing the app proposes takes effect for a Critical policy without the steward.

### 1.4 The request path: Route, Ground, Adjudicate, Execute, Record (2026-10-29)

Every request follows the same five steps, whether it comes from a guest message, a staff action, an API call or an event from a connector:

1. **Route (Jev, through `decide()`).** Fast typed decisions with probabilities:
   - What is this about? Which concepts and lifecycle events ("Reservation · cancel")?
   - Which policy nodes are probably triggered? Candidates come from the graph's search indexes (§2.5). Jev ranks and selects among them; it doesn't search the whole graph.
   - Which agent and which tools (connectors and kernels) are needed?
   - What is the highest criticality among the triggered policies?

   Thresholds live in `packages/domain`. High confidence routes directly. Low confidence escalates to a stronger model or asks a person.
2. **Ground.** Load only the triggered policies, at the version in force for this case (Decision 8 generalized). Include their parameters, precedents and examples. The agent's context stays small and exact.
3. **Adjudicate (the agent).** Reason over the grounded policies: which apply, in what order, and what the outcome should be. Then produce a **transaction plan**: the kernel and connector calls, with their parameters.
4. **Execute (kernels and guards).** Kernels compute. Guards check every connector call against the governing policies before it runs. A plan that a guard rejects goes back to the agent with the reason, or to a person.
5. **Record.** Store the request, the routing decisions with their probabilities, the policy versions applied, the plan, the results and the explanation, all linked in the graph.

**Rules carried from Gen 2 §9.2:**
- Jev classifies; policy decides. Jev never lowers criticality.
- A deterministic check runs alongside it: any request touching a money-bearing or personal-data concept is treated as Critical, whatever Jev's estimate.
- Jev remains a *proposed* provider behind the `decide()` adapter. Speed and cost are measured on our own workloads before we rely on them, and the fallback is a small model with structured output.

The Policy Walk (§3.2) uses Jev too: to choose the next most valuable question, and to screen cheaply for candidate contradictions before an agent confirms them.

### 1.5 Generative surfaces: agents compose, components render (2026-10-29)

Screens follow the same pattern as kernels. Each industry pack ships a **component registry**: pre-built, tested, accessible components such as an availability calendar, a refund quote, a payment schedule, a policy explainer or a waiver form. Each component declares:
- its props schema;
- which concepts and policies it **expresses**, so it is a Surface node in the graph.

At runtime an agent selects a component and fills its props from the grounded policies. The app renders it. Gen 2's FormSpec and FormRenderer are the first instance of this.

**Rules by criticality:**
- Anything that states a **Critical** policy to a person (prices, refunds, terms) renders only through a registry component bound to that policy's version. That way the screen can never disagree with the kernel.
- Free generation (wording, layout within the design system, follow-up suggestions) is allowed for **Routine** content.

Generative AI earns its keep across the cradle, not only in the UI:
- extracting policies from code and documents (Pilot 1);
- drafting pack policies from regulations;
- writing examples and explanations;
- producing the guest-facing text of a policy, which drift checks keep honest;
- running the Policy Walk conversation.

---

## 2. The policy graph

The graph is the proprietary element. Old business-rules engines stored rules as a flat list of if/then statements. We store *meaning and relationships*: why a rule exists, what it serves, what carries it out, what proves it, what it conflicts with and when it expires.

### 2.1 Node types

| Node | What it is | Example (hospitality) |
|---|---|---|
| **Concept** | A thing in the business | Reservation, Stay, Villa, Folio, Guest, Payment |
| **Policy** | A statement the business holds to, in plain language | "Guests may cancel for a full refund within 24 hours of booking, if arrival is more than 7 days away" |
| **Parameter** | A tunable value of a policy | `windowHours = 24`, `minDaysBeforeArrival = 7` |
| **Practice** | How the business habitually does something; softer than policy | "Offer to rebook before processing a late cancellation" |
| **Regulation** | An external rule, with a citation | A state lodging-tax rule; PCI DSS scope; a privacy law article |
| **Decision** | A recorded ruling, with who, when and why. Rulings act as precedent. | "Decision 8: a cancellation is evaluated against the rule set in force when the reservation was booked" |
| **Kernel / Connector** | Code that carries out policies | `cancellation-policy-engine`, the Stripe connector |
| **Surface** | Where a policy is *expressed* to people | The guest policies page, the confirmation email, the concierge agent's script |
| **Example** | A Given/When/Then case that proves a policy | "Given booked Oct 1, arriving Oct 20, cancelled Oct 1 at 10:00 → 100% cash refund" |
| **Role** | Who owns or may change something | Steward, revenue manager, front desk |
| **Source** | Where a node was found | file path and lines at a pinned commit, a document, an interview |

### 2.2 Edge types

`governs` (Policy → Concept) · `parameterizes` (Parameter → Policy) · `implements` (Kernel → Policy) · `expresses` (Surface → Policy) · `proves` (Example → Policy) · `derives_from` (Policy → Regulation or Decision) · `overrides` (client Policy → pack Policy, with a reason) · `conflicts_with` (Policy ↔ Policy, with the kind and its status) · `supersedes` (Policy → Policy) · `depends_on` · `owned_by` (→ Role) · `found_in` (→ Source).

Every node and edge carries an **effective period** (`effective_from`, `effective_to`) and a **version**. Every Policy carries a **criticality** (§1.3) and a **review-by or sunset date**; both are mandatory (G3-D5). Statuses follow Gen 2 §13.3 and stay separate:
- **extraction status:** candidate, source-verified or unsupported;
- **business status:** unreviewed, confirmed, disputed or superseded.

### 2.3 Layers: pack, then client

The graph is assembled in layers, like the skill tiers: **industry pack → partner → company → site.** A client policy can *bind to* a pack policy (adopt it, perhaps with its own parameters) or *override* it (with a recorded reason). A more specific layer can never remove a safety policy or a gate (Gen 2 rule). When the pack ships a new version, the platform shows the steward the changes that touch their bindings, and nothing changes silently.

### 2.4 Contradictions: three kinds, each named

1. **Policy against policy.** "Free shipping over $100" against "flat $9.95 always."
2. **Policy against regulation.** A new privacy rule against a policy that collects emails.
3. **Policy against practice or surface.** What the code, the guest page or the agent actually does has drifted from what the book says.

Estates with many implementations add a fourth kind, **implementation against implementation**: the same rule enforced differently in two places, such as an online screen and a nightly batch job (§11.2).

The third kind is where we're unique. Every surface and kernel links to its policy, so drift is a graph query, not an audit project. The platform states each contradiction with both sides, the evidence and a proposed resolution. It routes the contradiction to the **referee** (the policy's owner role). The ruling becomes a Decision node, so the same conflict never needs refereeing twice.

### 2.5 Storage and indexes

Start in Postgres (Supabase), with two tables scoped by tenant like everything else.

**`cradle_nodes`** has these columns:
- `id`, `tenant_id`, `layer` (pack, partner, company or site), `kind`;
- `key`: a stable name such as `P-CXL-3`, kept across versions;
- `version`, and `effective` as a `tstzrange`;
- `criticality`, `extraction_status`, `business_status`;
- `body` (`jsonb`), a full-text `search` column (`tsvector`) and an `embedding` (`vector`).

Pack rows are shared, read-only content.

**`cradle_edges`** has `id`, `tenant_id`, `src`, `dst`, `kind`, `effective` and `body`.

**Indexes:**

| Index | Serves |
|---|---|
| `edges (tenant_id, src, kind)` and `edges (tenant_id, dst, kind)` | Walking in both directions: "what implements this policy?" and "what does this kernel implement?" These two matter most. |
| Unique `nodes (tenant_id, key, version)` | Version lookup |
| GiST on `effective`, plus an **exclusion constraint** so two versions of the same key can never overlap in time (uses `btree_gist`) | "As of" queries, such as the policy in force at booking (Decision 8). The database guarantees there is exactly one answer. |
| Partial index `nodes (tenant_id, kind) WHERE upper_inf(effective)` | The current book, which is the hot path |
| GIN on `body` (`jsonb_path_ops`) | Parameter lookups ("every policy with `windowHours`") |
| GIN on `search`, and HNSW on `embedding` (pgvector) | Finding candidate policies for a request, by words and by meaning (§1.4) |
| Row-level security on `tenant_id` | Tenancy, as in Gen 2 |

Traversals use recursive CTEs with Postgres's `CYCLE` clause. If one traversal becomes hot (for example "policy → every surface that states it"), we keep a materialized closure table for it.

The graph is mirrored into the client's repository as readable files (`docs/policy/…`), the same pattern as the Gen 2 Library sync, so the client owns their policy book outright. Agents navigate it only through Toolbelt tools: `policy.find`, `policy.asOf`, `policy.impact`, `policy.explain`, `policy.conflicts`, `policy.gaps`. Because nothing queries the tables directly, the storage can be swapped later without changing an agent.

**When would we need a graph database?** Probably not for any single client. One client's graph is likely hundreds to tens of thousands of nodes. The ts-platform pilot should land in the hundreds. Postgres answers multi-hop queries at that size in milliseconds.

The likely trigger is **cross-client pack learning**: running graph algorithms (similarity, centrality, clustering of overrides) across every client in an industry. Even then, that could run as a separate analytics copy rather than replacing Postgres as the system of record.

Revisit when any of these is measured:
- p95 latency for impact or "as of" queries above about 200 ms;
- a tenant above about a million edges;
- graph algorithms needed inside a live request.

The `policy.*` tool interface is what keeps that move cheap.

### 2.6 Why this isn't the old business-rules platforms again

Those systems failed for five reasons. Each has an answer here:

| Why they failed | Gen 3's answer |
|---|---|
| Only specialists could write rules | Policies are written in plain language; the crew handles the formal form |
| Rules sprawled; no one could find conflicts | Contradictions are found by reasoning over the graph and routed to a referee |
| Rules never died | A sunset or review date is mandatory; retiring a policy retires its code and tests |
| Rules drifted from the real system | Every kernel and surface links to its policy; drift shows up as a query |
| They tried to run *everything* as rules | Kernels stay code; the graph governs them through parameters |

### 2.7 Kernels run against the graph through projections (2026-10-29)

ts-platform's kernels were written against a specific shape, the calendar rule set. In Gen 3, kernels must take their policy from the graph, but they should **not walk the graph themselves**. Walking the graph in the middle of a refund calculation would make the calculation slow, and harder to test and replay. Instead:

- **Each kernel declares a contract in its pack:**
  - the concepts and policy kinds it implements;
  - a typed **parameter schema** (its input shape);
  - its fixed evaluation order;
  - the explanation it returns.
- **A projection compiles the graph into that input.** It takes the relevant policies *as of* a date and produces the kernel's typed input, hashed and versioned. The kernel stays pure and fast. Evidence binds to the projection hash, so any result can be replayed exactly.
- **The calendar rule set *is* a projection.** ts-platform already has this split: the rule-set JSON is the compiled view, and the engines are the kernels. Gen 3 adds the graph *above* the rule set as the place where policies are authored, governed and explained. The rule-set shape can survive as the hospitality pack's parameter schema for those kernels.
- **Kernels return explanation traces.** Each trace names the rule that fired (for example the matched band's id), and the projection maps it back to policy node ids. That is how "why is my refund 50%?" gets answered.

**Policies come in two kinds**, and extraction must label them:
- **Parametric:** the kernel reads the policy as data, so changing it needs no code. Examples: band percentages, instant-cancel windows, minimum stays.
- **Structural:** the policy lives in the kernel's code. Examples: evaluation order (no-show, then gate, then instant cancel, then bands), "no schedule means full payment at booking", "the last instalment takes the rounding remainder". These are still Policy nodes, `implemented_by` the kernel, but changing one is a code change to the kernel, made by the pack and released as a new kernel version.

The parametric share is a headline measure (§6). Lifting a common structural policy into a parameter is how the pack gets better over time.

---

## 3. Industry packs

An **industry pack** is a versioned package, for example `@strategicmachines/pack-hospitality` on a private npm registry. It contains:
- **The ontology:** Concepts and their relationships for the industry.
- **Starter policies and practices,** with default parameters, each marked *recommended*, *common* or *required by regulation*.
- **Regulation nodes** with citations, by jurisdiction where it matters.
- **Kernels:** the verified engines (for hospitality: rates, availability, cancellation, tax, ledger, payment schedule).
- **Connectors** relevant to the industry, plus guard definitions.
- **Example libraries:** the Given/When/Then cases that prove the starter policies, plus boundary scenarios (dates, currency, time zones).
- **The Gen 2 domain-pack content:** vocabulary, skills, decision points, complexity hotspots, KPI templates.

Boarding selects the closest industry. Then the steward and the crew walk the starter book together: adopt, adjust a parameter, override with a reason, or add what's missing. The graph fills in from there.

Packs improve from clients' rulings and overrides, under the Gen 2 consent and anonymization rules. The tenth hotel boards onto a far better book than the first. That compounding is the moat.

**Open question (G3-D7):** ts-platform's engines are the natural seed kernels for the hospitality pack. As §2.7 explains, they would take their input through projections from the graph. Before any of that code goes into a pack sold to others, we must confirm the IP position under the Cypress Resort agreement and the ts-platform license. Until then, Pilot 1 extracts *policies* (knowledge), not code.

### 3.1 Roles (2026-10-29)

- **Pack curator** (Strategic Machines, with domain experts and partners): owns the industry pack itself (its ontology, starter policies, kernels and regulations) and releases versions of it.
- **Steward** (the client): the accountable business expert who tunes *their binding* of the pack. They adopt, adjust parameters, override with reasons and add what's missing. A steward never edits the pack directly. Their rulings and overrides flow back to the curators as anonymized, consented proposals (Gen 2 §2.2).
- **Area stewards:** in a real business, stewardship is split by area. The revenue manager owns rates, the general manager owns cancellation and guest experience, the controller owns tax and the ledger. Every Policy has an owner role, which is also its **referee** for contradictions. One person may hold every role in a small business.

### 3.2 The Policy Walk: a crew that tunes the pack with the steward (2026-10-29)

Tuning is not a form to fill in. A crew of specialists works through the graph with the steward, asks questions, finds holes and contradictions, builds tests as answers arrive, and keeps going until the book is complete. It is the /vision scene pointed at the policy book instead of the codebase.

**The crew:**

| Specialist | Job |
|---|---|
| **Team Lead** | Runs the session, one question at a time, in plain language; keeps the steward's time for what matters |
| **Cartographer** | Walks the graph in order: Critical first, then dependency order (policies others depend on before the policies that depend on them); tracks coverage |
| **Gap Finder** | Finds **holes**. The pack ontology lists each concept's lifecycle events (Reservation: create, modify, cancel, no-show, check-in, overbook, chargeback…). Any concept and event with no governing policy is a hole. Completeness becomes computable, not a matter of opinion. |
| **Referee's Clerk** | Finds contradictions (policy against policy, regulation or surface), prepares both sides and the evidence, and puts them to the steward |
| **Regulation Checker** | Binds the applicable regulations for the client's jurisdiction, and flags policies that need one |
| **Example Builder** | Turns each answer into Given/When/Then examples **right away**, runs them against the kernel, and shows the consequence as a story: "With this answer, a guest who cancels 10 days out on a $2,400 stay gets $1,200 back as a credit voucher valid 12 months." It also shows what changed: "This answer changes the outcome of 14 of 200 standard cases." |
| **Librarian** | Records every ruling as a Decision node, with who, when, why and the version |
| **Judge** | Checks independently that the book passes the graph checks (§4) before it is declared complete |

**When the walk is done** (stated as checks, not as a feeling):
- every Critical policy is confirmed, with boundary examples;
- no holes in Critical concepts and events;
- no open contradictions;
- every required regulation is bound;
- every Policy has an owner role and a sunset date.

The walk ends with a signed **policy book** and a compliance-suite report. It reopens whenever the pack releases a new version, a regulation changes, or the app proposes new work.

**The Policy Walk is also Boarding.** For a client with an existing app, the walk starts from the policies extracted from their code (Pilot 1's method), laid over the pack, rather than from the bare pack.

### 3.3 Understanding: Karpathy's ladder for the steward (2026-10-29)

Andrej Karpathy's observation (also in Gen 2 §9.3): as models do more of the legwork, *"a lot more of our work will rise up the abstractions into oversight and understanding."* That is exactly the steward's job in the cradle: they don't write code or read it; they govern policy. Karpathy's second point makes this practical. Code is now abundant, so we can produce *"large, custom, discardable software artifacts"* that would never have been worth building before.

His ladder ranks output formats, each better than the one before. In the cradle every rung has a defined use:

| Rung | In the cradle |
|---|---|
| **1. Controlled writing** (about 80% of the way to ASD-STE100, the aerospace maintenance language) | **Every policy statement is written in controlled English**: one idea per sentence, an approved vocabulary from the pack's ontology, active voice, no ambiguous words. This serves people *and* machines. A controlled statement is easier for a steward to read, and far easier for an agent to compare, so contradictions and holes are found more reliably. Guest-facing wording can be warmer; it is *generated from* the controlled statement and drift-checked against it. |
| **2. Diagrams** | Every policy can be drawn on demand: the evaluation order as a flowchart (no-show, then gate, then instant cancel, then bands), refund bands as a timeline counting back from arrival, a policy's neighbourhood in the graph (what implements it, what states it, what it conflicts with). |
| **3. Web pages** | **Interactive, discardable pages** for decisions. A refund simulator with a slider for days before arrival. A side-by-side of a proposed amendment against the current policy, over the 200 standard cases. The impact of a pack upgrade on this client's bindings. The Policy Walk's consequence previews (§3.2) are pages of this kind. |
| **4. Explainer videos** | Short narrated explainers, generated from the graph: the morning briefing as a 60-second video, a policy change explained for the staff who must apply it, a new steward's tour of their policy book. Our existing pipeline (scripted page, then Playwright capture, then text-to-speech narration, as used for the Machine Shop demo) already produces this. |

**Rules for these artifacts:**
- **Views, never the source.** Every artifact is generated from the graph and carries the versions (and projection hash) of the policies it shows. The graph stays the only truth.
- **Discardable and regenerated.** Nobody maintains them. When a policy they show changes, they are marked stale and regenerated on request. This is the same drift check that applies to surfaces (§2.4).
- **Chosen by criticality and audience.** A Critical change offered for approval comes with at least a controlled statement, a diagram and an interactive consequence page. Video is for briefings and training, not for approval itself.
- **Understanding is evidence.** Gen 2's behavioral monitoring applies: the record notes which artifacts the steward opened before deciding. Approvals of Critical changes made without opening the evidence get flagged.

---

## 4. Test-driven policy

Every policy is proven, not asserted. There are four levels:

1. **Policy examples.** Each Policy carries Given/When/Then Examples. No policy reaches "confirmed" without at least one, and High policies need their boundaries covered. These are the acceptance tests.
2. **Kernel tests.** The examples run against the kernel that implements the policy. ts-platform's existing tests (`*.test.ts` beside each engine) become Example nodes during extraction.
3. **Agent conformance tests.** Where an agent orchestrates, it is given scenarios and must reach the same *transaction plan* as the policy's examples: the same kernel calls with the same parameters. It runs repeatedly, because an agent is sampled, not proven. A High-rated scenario must pass every time.
4. **Graph checks**, run on every change:
   - every High policy is implemented by a kernel or guarded;
   - every policy has an example, an owner and a sunset date;
   - no unresolved `conflicts_with`;
   - no surface expresses a policy version that is no longer in force.

**The compliance suite** is all of the above for every policy in force. Its report is the Gen 3 version of "295/295 tests": *"112 policies in force · all proven · 0 open conflicts · 3 sunsetting this quarter."*

A policy change runs in **shadow first**. The new version evaluates alongside the old on synthetic and replayed (sanitized) cases. The differences are shown to the steward as "these 14 cases change outcome." Promotion follows the steward's approval. Gen 2 §13.4 (baseline against candidate, approved differences by rule ID) is the mechanism.

---

## 5. Pilot 1: the policy book of ts-platform

### 5.1 Boundaries

- **Read-only, at a pinned commit:** `becb8ae` (main, 2026-10-28). We read source files; we never run ts-platform, call its APIs, touch its database or write to its repo.
- **No production data.** Parameter *values* that live only in the live database (the actual bands and windows Cypress uses) are not read. The pilot records the *shape* and whatever defaults the code holds. The steward supplies or confirms live values in review.
- **The output is client material.** It stays out of any public repo. It lives in the Accelerator's Library for a Cypress tenant, or in a git-ignored pilot folder until that tenant exists (G3-D3).

### 5.2 Sources to read

| Source | What it yields |
|---|---|
| `packages/domain/src/*` engines (about 3,500 lines across 13 engines) | Policies, parameters, evaluation order, kernels |
| `shared/calendar-rule-set.ts` | The parameter schema: the shape of the policy book itself |
| `*.test.ts` beside each engine, plus `packages/qa` | Examples |
| Code comments citing "Decision 1, 2, 7, 8" | Decision nodes (the decision documents themselves aren't in the repo; ask the steward) |
| `apps/site-cypress-resort/app/cypress-policies/*` | Surfaces: the guest-facing statement of policy |
| `apps/api` routes and `lib` | Where policies are enforced, and guards |
| `packages/communications/src/templates` | Surfaces: what emails promise |
| `supabase/migrations` | Operational practices (e.g. the journey tick every 15 minutes; reserving without payment) |

### 5.3 Worked example: cancellation

Read from `cancellation-policy-engine/index.ts`:

- **Policy P-CXL-1 (No-show):** "A guest who doesn't arrive receives the no-show refund percentage, always as cash." Parameter `noShowRefundPercent` (default 0).
- **Policy P-CXL-2 (Cancellation allowed):** "Reservations under a non-cancellable policy receive no refund." Parameter `allowCancellation`.
- **Policy P-CXL-3 (Courtesy grace period):** "Within `windowHours` of booking, if arrival is more than `minDaysBeforeArrival` days away, a cancellation is refunded 100% in cash, regardless of bands."
- **Policy P-CXL-4 (Refund bands):** "Otherwise, the first band matching the days remaining sets the refund percentage, fee and form (cash or credit voucher with expiry)."
- **Policy P-CXL-0 (Precedence):** evaluation order P-CXL-1, then 2, then 3, then 4. *This is a policy too, and it is invisible in the guest copy.*
- **Decision D-8:** a cancellation is evaluated against the rule set in force **at booking**, not today's. This edge applies to every cancellation policy: the graph's effective dating encodes it directly.
- **Kernel:** `computeCancellationRefund`. **Examples:** the cases in `index.test.ts`. **Surfaces:** the policies page (dynamic bands from `GET /api/cancellation-policy`), and a static fallback section.
- **Questions for the steward, and candidate conflicts to check:**
  - Does the static fallback copy on the policies page match the live bands? That would be a surface-against-policy drift.
  - The page says "refunds and resort credits outside the terms above cannot be issued." Is that a policy, and who may grant an exception?
  - Is the no-show refund always cash even when bands give credit vouchers? If so, is that intended?

### 5.4 Deliverables

1. The **graph** (nodes and edges, with sources at file and line), loaded into the pilot store.
2. A readable **policy book**, grouped by Concept, each policy showing its status, examples, kernel and surfaces.
3. **The steward's question list** and the **candidate conflicts.**
4. **Pilot measures**:
   - precision: the share of extracted policies the steward confirms;
   - recall: what the steward adds that we missed;
   - conflicts found;
   - the share of policies with a kernel and an example;
   - the share that are pure parameters (no code needed to change them).
5. A **seed list for the hospitality pack**: which policies are Cypress-specific and which are industry-general.

---

## 6. The advantage, honestly

What this gives a client that conventional development doesn't:
1. **Change at the speed of policy.** Most business changes become parameter or graph changes, with tests, and no release. The measure: *the share of changes delivered without new code.*
2. **One truth across code, copy, staff and agents.** The guest page, the email, the concierge agent and the refund engine all say the same thing, because they all link to the same policy. When they don't, the platform says so.
3. **An app that can explain itself.** "Why is my refund 50%?" is answered from the policy, the band and the decision, with the version in force at booking.
4. **Compliance as a standing report**, not a project. "Show me every behavior that depends on this regulation" is a query.
5. **The app gets smaller as well as bigger.** Retired policies take their code and tests with them.
6. **The industry compounds.** Each client starts from everything the pack has learned.

Where it isn't worth it: a small brochure site with almost no policy. The cradle pays off where rules are dense, money moves, and regulation applies: hospitality, insurance, financial planning, healthcare-adjacent services, nonprofits with donor rules.

It pays off most of all in **legacy estates** (§11): banks, insurers and governments running COBOL whose rules nobody can state with confidence. There the book is the missing specification, and the legacy programs serve as kernels until verified native ones replace them, one at a time.

---

## 7. Risks

- **Rule sprawl** (the old failure). Mitigations: mandatory sunset dates, a referee for every conflict, precedent from rulings.
- **Agent non-determinism in money paths.** Mitigation: High stays with kernels and guards (§1.3), with no exceptions.
- **Liability for the app's judgment.** The rating boundary is the legal answer as well as the technical one.
- **Extraction confidence mistaken for approval.** Mitigation: the separate statuses (§2.2), and steward review before anything is "confirmed."
- **IP of seed kernels** (G3-D7).
- **Scope.** Each step in §9 must be sellable by itself.
- **Claims about legacy behavior we haven't verified.** A rule read from COBOL is a candidate until the steward confirms it, and until replay against the legacy system (§11.4) proves any kernel that takes it over. Numeric semantics (truncation against rounding) are the usual trap.
- **Live legacy systems.** Mode 2 writes to systems of record. Connectors to CICS, IMS or legacy tables need guards, shadow runs and the client's own change control. We never touch a client's mainframe before Observe has been proven on a public estate.
- **Model claims.** A vendor's "COBOL expert" is adopted only on its score against the CardDemo answer key (§11.5).

---

## 8. Decisions log

| ID | Date | Decision | Status |
|---|---|---|---|
| G3-D1 | 2026-10-28 | Gen 3 "The Cradle": the policy graph is the source of truth; the Accelerator stays attached to the app for life | Owner direction |
| G3-D2 | 2026-10-28 | Pilot 1 reverse-engineers ts-platform's policy book: read-only, at a pinned commit, no execution, no production data. This is consistent with the rule that Cypress is never a test target | Owner authorized |
| G3-D3 | 2026-10-28 | Pilot output is client material, kept out of public repositories | Owner direction |
| G3-D4 | 2026-10-28 | "Agents propose; kernels dispose": High-rated policies run only through kernels and guards | Owner direction |
| G3-D5 | 2026-10-28 | Every policy carries an owner role, at least one example, and a review-by or sunset date | Owner direction |
| G3-D6 | 2026-10-28 | Graph stored in Postgres (nodes/edges), mirrored to the client repo as files; no graph database yet | Owner direction |
| G3-D7 | 2026-10-28 | Confirm the IP position before any ts-platform code seeds a commercial pack; until then extract knowledge only | Owner direction |
| G3-D8 | 2026-10-28 | Industry packs ship as versioned private npm packages | Owner direction |
| G3-D9 | 2026-10-28 | The owner's role in Gen 3 is called the **steward** | Owner direction |
| G3-D10 | 2026-10-29 | **Criticality** (consequence of being wrong, per policy) is separate from **complexity** (build effort, per work order). Criticality = pack floor raised by graph reach; it is only lowered by a recorded steward decision, and never below the floor | Owner direction |
| G3-D11 | 2026-10-29 | Postgres stays the system of record. Revisit a graph database only on the measured triggers in §2.5; the likely first use is cross-client pack analytics. Agents reach the graph only through `policy.*` tools | Owner direction |
| G3-D12 | 2026-10-29 | Kernels never walk the graph. **Projections** compile policies as-of a date into each kernel's typed input; evidence binds to the projection hash; kernels return traces that map back to policy ids | Owner direction |
| G3-D13 | 2026-10-29 | Extraction labels every policy **parametric** or **structural**; the parametric share is a headline measure | Owner direction |
| G3-D14 | 2026-10-29 | **The Policy Walk** is the tuning and Boarding experience: a specialist crew, gaps computed from ontology lifecycles, live examples showing consequences, and completion defined by checks | Owner direction |
| G3-D15 | 2026-10-29 | The request path is **Route (Jev) → Ground → Adjudicate (agent) → Execute (kernels and guards) → Record**. Jev classifies and selects; it never lowers criticality; a deterministic check runs alongside it | Owner direction (Jev measured before relied on) |
| G3-D16 | 2026-10-29 | **Generative surfaces:** packs ship a component registry; agents compose, components render. Critical policies are shown to people only through registry components bound to the policy version | Owner direction |
| G3-D17 | 2026-10-29 | Roles: **pack curator** (Strategic Machines) owns the pack; **stewards** (the client, possibly one per area) own their binding; every policy's owner role is its referee | Owner direction |
| G3-D18 | 2026-10-29 | **Karpathy's ladder for the steward:** policy statements are written in controlled English (about 80% of ASD-STE100). Diagrams, interactive pages and explainer videos are generated from the graph as version-bound, discardable views. Critical approvals come with a statement, a diagram and a consequence page, and the record notes what the steward opened | Owner direction |
| G3-D19 | 2026-11-02 | **Technology adapters** (classifiers, parsers, citation scheme, census, slicing, model routing, data decoders) are a platform axis independent of industry packs. Every ingest is one pack × one or more adapters; the book never depends on the technology. TypeScript is the first adapter, Python the second | Owner direction |
| G3-D20 | 2026-11-02 | Large estates ingest in stages: **inventory → map → slice → extract (parallel) → reconcile → data model → gaps**. Parsers read structure; models read meaning. The six crew roles become separate agents | Owner direction |
| G3-D21 | 2026-11-02 | The **data model** (Record and Field nodes, with 88-level states as enumerations) and **Schedule** nodes are first-class graph outputs. Lifecycle events carry a trigger kind (request, schedule, file, message) | Owner direction |
| G3-D22 | 2026-11-02 | Three kinds of kernel: **native**, **legacy-backed** (an existing program behind a declared contract and a guarded connector), and **batch**. A native kernel replaces a legacy one only after matching it on replayed history, field by field | Owner direction |
| G3-D23 | 2026-11-02 | Legacy clients get three modes, each sold alone: **Observe → Wrap → Replace**. Parametric policies stored in legacy tables are governed by projecting them into those tables | Owner direction |
| G3-D24 | 2026-11-02 | Models are routed by artifact kind and adopted only on measured scores against a public answer key (CardDemo) | Owner direction |
| G3-D25 | 2026-11-02 | **Pilot 2 is AWS CardDemo** (public, Apache 2.0), pinned from the upstream repository, with a Cards pack. Its output may be published as a showcase | **Owner approved 2026-11-02** |
| G3-D26 | 2026-11-03 | **Every steward decision is aligned into the code by the crew.** A contradiction ruled, a policy changed or retired, or a hole filled opens a work item automatically; the steward never opens one by hand. Decisions touching a built integration (kernel or connector) are Owner-gated. The original Machine Shop is frozen on a `baseline` branch that is never released to (§12) | **Owner direction 2026-11-03** |

---

## 9. Action list

1. [ ] Owner: review this doc; settle G3-D3 to D18; answer G3-D7.
2. [ ] Define the graph schema as domain types in `packages/domain`, pure and with tests:
   - node and edge types, statuses, criticality, effective dating;
   - the hospitality ontology's lifecycle events, needed for gap finding;
   - the kernel contract and projection shape (§2.7).
3. [ ] **Pilot 1:** extract the ts-platform policy book (§5), labelling each policy parametric or structural. Start with cancellation and payment schedule, then rates, availability, tax, waivers and the ledger.
4. [ ] **Prototype the Policy Walk** as a scripted page, like /vision: the crew walks the extracted cancellation policies with a steward, finds a hole and a contradiction, and builds examples live. Prototype it before building it.
5. [ ] Steward review session on the pilot output, run as a real Policy Walk; record precision, recall and conflicts.
6. [ ] Migration for `cradle_nodes` and `cradle_edges`, with the §2.5 indexes. The Owner runs it on accelerator-test first.
7. [ ] Jev trial on routing: measure accuracy, speed and cost on Pilot 1 policies against a small-model fallback (Gen 2 §9.2 action).
8. [ ] Draft the `pack-hospitality` starter book from the industry-general part of the pilot.
9. [ ] Graph checks and the compliance-suite report (§4.4).
10. [ ] Policy-change flow: amend a policy → impact analysis → shadow run → steward approval → promotion. Prove it on Machine Shop.
11. [ ] App-originated work: Machine Shop files its own proposals (the next version of the /vision prototype).
12. [ ] Runtime presence (the agent at the edges, guards on connectors): last, after the above are proven.
13. [ ] Regulation feeds per industry.
14. [ ] Controlled-English style guide for policy statements: the pack vocabulary and the rules (about 80% of ASD-STE100). Rewrite Pilot 1's cancellation policies in it as the first test.
15. [ ] Generators for the §3.3 artifacts: a policy diagram, a consequence page and a briefing video, each stamped with the policy versions it shows.
16. [ ] **The adapter seam (G3-D19):** move the census and the live screen's file pattern behind a TypeScript adapter, then add the Python adapter (classifiers, census, Django and Flask routes). Test on a small sample Python app of our own.
17. [ ] **Staged ingest (G3-D20):** split the ingest job into stages, with parallel Extractor agents over slices, a Clerk merge, and budgets per slice. The live screen gets one lane per slice.
18. [ ] **COBOL family adapters:** parsers for COBOL (divisions, paragraphs, PERFORM, CALL, COPY), JCL, BMS and CSD; EBCDIC and COMP-3 decoders; citation by program and paragraph.
19. [ ] **Pilot 2 (G3-D25):** pin CardDemo upstream; draft the Cards pack (with Regulation Z and PCI DSS nodes); ingest; build the answer key; run a Policy Walk.
20. [ ] **Mode 3 proof:** a native interest kernel matching INTCALC on the sample data, field by field.
21. [ ] Model bake-off on the CardDemo answer key: general models against any COBOL specialist, per artifact kind (G3-D24).
22. [ ] Decide where the system graph lives once it passes about 100k nodes (§11.6), behind a `system.*` tool interface.

---

## 10. Build log

- **2026-10-30 · G3.1 foundation** (accelerator-platform `ce078e1`, local; push after the Owner runs migration 0014 on accelerator-test).
  - `packages/domain/src/cradle.ts`: graph types, criticality floors, assembling the book (pack plus site layer), findings (contradictions, holes from lifecycles, missing kernels, unreviewed, unproven), readiness, ingest merge, rulings, starter scaffold, dial readings.
  - `cradle-packs.ts`: the Commerce and Hospitality starter books. Hospitality kernels are "planned" pending G3-D7.
  - Migration 0014: tables, the §2.5 indexes and the exclusion constraint, and the `ingest` job kind.
  - Runner `ingest` job: the Policy Extractor, read-only.
  - API `/sites/:id/cradle`.
  - Console **Policy** screen: the workbench dial for the book, the create-cradle starter, a live ingest (the /vision scene with real job events and the site live in a phone), Policy Walk findings, and the book with rulings.
  - Keyless demo: simulates the ingest from a real reading of Machine Shop. Browser QA `qa/cradle.mjs` 13/13; workspace QA 72/72; unit tests 203 domain, 75 API, 11 runner.
  - **Not yet:**
    - kernels running against projections (§2.7);
    - shadow runs of policy changes (§4);
    - live examples during the walk;
    - Jev routing (§1.4);
    - generative surfaces and rendering the app from the book (§1.5);
    - decisions stored as Decision nodes (rulings are stored on the policy and the edge for now).
- **2026-10-30 · First real ingest** (accelerator-platform `16760d4`).
  - Machine Shop on accelerator-test: 130 seconds, 22 policies (9 matched to the pack, of which 1 is overridden: shipping at $9.95; 13 are the site's own), 3 contradictions.
  - **A real defect found:** the assistant tells shoppers the store takes no orders (`lib/assistant-skills.ts:52`, locked in by a test), while Buy now has been live since #9. This is surface-against-policy drift after a change, the case §2.4 exists for.
  - Follow-ups shipped:
    - criticality floors per lifecycle event;
    - the Policy Walk ordered so the steward's decisions come first;
    - a fix for duplicate live-log events;
    - the demo now mirrors the real ingest.
- **2026-11-02 · The live ingest in two halves** (accelerator-platform `79d8084`).
  - The Policy screen's live ingest now shows the crew working (the /vision scene) beside the book taking shape (the /studio scene): a ring with one segment per policy, lit as the crew names it, and contradictions in pink. When the run lands, the ring redraws from the stored book and hands over to the Policy Walk.
  - The extractor now narrates each policy as it finds it, in a fixed line format, so a real run fills the book live. `liveBook` in `packages/domain` binds the book from those lines (5 new tests).
  - Honest note: on a real run, one agent still narrates all six roles. §11.2 is where they become separate agents.
- **2026-11-03 · Demo 1: the first Policy Walk, and rulings that change the code** (accelerator-platform `b0e294f`, `5f50ca8`).
  - The Owner re-ingested Machine Shop with the live two-halves screen and walked the book: three contradictions ruled, most policies confirmed.
  - The crew is drawn as sober robot heads (one chassis, a sensor per role), on the live ingest and on /vision (`b0e294f`).
  - **Alignment (G3-D26, `5f50ca8`):** each decision becomes a crew work item carrying the steward's words, the policies and their places in the code. Decisions on the same policies join the open item. Built integrations make it Owner-gated. The Policy Walk gained Change and Retire beside Confirm, and a sentence box to fill each hole. Kernels moved off the steward's walk to "the crew's build list". An "Aligning the code" card tracks each decision to live. Rulings made earlier are sent with one click.
  - Decisions are now stored as Decision nodes (`acc_cradle_nodes`, kind `decision`), which closes one item on the G3.1 "not yet" list. No migration was needed.
  - QA: domain 215, API 75, browser `qa/cradle.mjs` 21/21.
  - Machine Shop's original site was frozen as the baseline (§12).
- **2026-11-03 · The Graph, with time travel** (accelerator-platform `8614ed0`).
  - A **Graph** screen (beside Policy) draws the policy graph with Cytoscape.js (open source, MIT): concepts, policies by criticality and status, kernels, holes, contradictions, and decisions on their way into the code.
  - **Time travel:** a timeline of stops (the start, each ingest, each ruling, each decision) redraws the graph exactly as it stood then. This reads the effective-dated versions; nothing is ever overwritten. Play, step, scrub and search are supported, and what changed at each stop is highlighted.
  - **Rollback:** select a policy to see every version it has had. Rolling back writes the old content as the next version, so history is never erased, and sends it to the crew to align the code, like any decision (G3-D26).
  - Not yet: vector (embedding) search over the graph. Today's search is text.

---

## 11. Any technology: legacy estates, COBOL, JCL, CICS and IMS (2026-11-02)

The objective doesn't change with the technology: **extract the business rules, then run the business on rules + model intelligence + kernels.** What changes is everything underneath the book: what we read, how we split the work, what counts as evidence, and what a kernel is. This section works that through, using AWS's **CardDemo** as the reference estate.

### 11.1 The reference estate: CardDemo

CardDemo is a mainframe credit-card application that AWS published as a test bed for modernization tools (Apache 2.0). The copy the Owner found is `github.com/altitude80ai/awscarddemo`, a fork of `aws-samples/aws-mainframe-modernization-carddemo` with a Next.js wrapper added. What it holds, from its README:

| Part | What's there |
|---|---|
| **Online (CICS)** | 17 transactions, one program each, with BMS screen maps: sign-on (CC00), menus, account view and update (CAVW, CAUP), card list, view and update (CCLI, CCDL, CCUP), transaction list, view and add (CT00 to CT02), reports (CR00), bill payment (CB00), and admin user maintenance (CU00 to CU03) |
| **Batch (JCL)** | 19 jobs: dataset setup and loads, **POSTTRAN** (posts the daily transactions, program CBTRN02C), **INTCALC** (interest, CBACT04C), **COMBTRAN** (a sort), **CREASTMT** (statements, CBSTM03A), an alternate index, and jobs that close and reopen the CICS files around batch |
| **Data** | About 12 VSAM datasets (users, accounts, cards, customers, the card-to-account cross reference, daily transactions, transactions, disclosure groups, transaction categories and types, category balances), with 11 copybooks as the record layouts. The sample data is EBCDIC |
| **Security** | RACF, and a user-security file with two roles (admin and regular user) |
| **Not in this copy** | DB2, IMS and MQ appear only on its roadmap. The upstream AWS repository is reported to add optional DB2, IMS and MQ modules. Check before choosing which copy to pin: we want IMS and MQ in the test |

The code style is deliberately uneven, to exercise analysis tools. The estate is public and licensed for this use, so it fits our rule: **test on our own or public estates, never on a client's production system.** It is the natural **Pilot 2**.

### 11.2 What changes, and what doesn't

**The book doesn't change.** Policies are still grouped by **Concept and lifecycle event**: Account (open, update, close), Card (issue, update, close), Transaction (add, validate, post, reject), Interest (calculate), Statement (produce), Payment (pay), User (sign on, add, remove). The steward walks the same book whether it came from TypeScript or COBOL. This invariant is what makes the platform worth having: **business meaning is the stable layer; technology is the variable one.**

**Five things do change:**

1. **We ingest an estate, not a repository.** A web app's rules sit mostly in its source code. A mainframe's rules are spread over many kinds of artifact, and each carries a different part of the policy:

   | Artifact | What it carries |
   |---|---|
   | COBOL programs (the PROCEDURE DIVISION) | Structural policy: validations, calculations, evaluation order |
   | Copybooks | The data model. 88-level condition names are named states, often in the rule's own vocabulary |
   | JCL and PROCs | Schedules and sequence: "post before interest", "close the files during batch" |
   | Scheduler definitions (CA-7, Control-M, TWS) | When things happen: daily, month-end, on file arrival |
   | BMS maps | Surfaces: what the screen shows and lets a clerk enter |
   | CICS definitions (CSD) | Transaction to program, files and security: the online entry points |
   | IMS DBD and PSB, DB2 DDL | The data model, and who may read or change what |
   | **Data tables** (VSAM, DB2, IMS) | **Parametric policy**: rates, limits and codes. CardDemo's disclosure groups hold the interest rates |
   | RACF and security files | Access policy |

   The ingest needs **data** (sample or sanitized) as well as code, because in legacy systems the parameters often live in tables, not constants.

2. **Extraction becomes a staged pipeline with truly separate agents.** Today's ingest is one agent narrating six roles; the live screen reflects the stages honestly. An estate of a million lines can't fit in one agent's context, so the roles become real:
   - **Inventory** (deterministic, no model): classify every file by kind. Seconds, and no cost.
   - **Map** (the Surveyor: parsers first, a model only as a fallback): build the **system graph**. It links transaction → program → map; program → CALL, LINK or XCTL → program; program → COPY → copybook; job → step → program → dataset; and dataset → record layout. Parsers read this exactly and citeably; a model shouldn't guess what a parser can read.
   - **Slice:** cut the system graph into units of work, each holding everything it needs. A slice is one **online transaction** (CT02: COTRN02C, its map, its files and copybooks) or one **batch flow** (POSTTRAN: the job, CBTRN02C, the daily file, the cross reference, accounts and category balances). Slices overlap where programs share copybooks; that's fine.
   - **Extract** (several Extractors in parallel, one slice each): each narrates policies, with citations, into the live book.
   - **Reconcile** (the Clerk): merge duplicates across slices. A fourth contradiction kind appears here, **implementation against implementation**: the same rule enforced differently in two places. For example, the online add-transaction screen might validate differently from the nightly posting job. In legacy estates this is common, and finding it is valuable.
   - **Data model** (a dedicated Modeler): copybooks and DDL become **Record** and **Field** nodes linked to Concepts, with 88-levels as enumerations and states. The data model is a first-class output, not a by-product; people evaluating these tools ask for it explicitly.
   - **Gaps and the Judge,** as today.

   The live screen scales with it. The crew half shows one lane per slice in flight. The book half adds a third view, **the system map**, lighting programs and jobs as their slices finish.

3. **Evidence is cited by structure, not only by line.** COBOL line numbers shift whenever anything above them changes. So a citation names the **program and paragraph** (`CBACT04C · 1300-COMPUTE-INTEREST`), the **job and step**, or the **record and field** (`CVACT01Y · ACCT-CREDIT-LIMIT`), with the line range as a hint. Re-ingest then compares paragraphs, not line numbers.

4. **Time becomes a trigger.** Web policies mostly fire on a request. Legacy policies often fire on a **schedule** ("interest is calculated monthly", "transactions post nightly") or when **a file arrives**. Lifecycle events gain a trigger kind: request, schedule, file or message. Policy nodes link to a **Schedule** node that cites the scheduler or the JCL. Gap finding learns new holes, such as a schedule with no owner, or a batch job whose rejects nobody reviews.

5. **Numeric semantics are policy.** COBOL computes in fixed-point decimal, and truncates unless a statement says ROUNDED. Whether interest truncates or rounds, and at which step, is a **structural policy** with money consequences. The extractor must report it, and any kernel that takes over must reproduce it exactly: decimal arithmetic only, never floating point.

**Worked example, to verify on ingest.** From the program names and the usual reading of CardDemo, INTCALC is expected to yield:
- **P-INT-1 (parametric):** the interest rate for a balance comes from the disclosure group for the account's group and the transaction category. The rates are **rows in the disclosure-group file**, so changing a rate is a data change, not a code change.
- **P-INT-2 (structural):** if the account's group has no rate for that category, use the DEFAULT group's rate.
- **P-INT-3 (structural):** monthly interest = category balance × annual rate ÷ 1200, truncated or rounded as the program does. That must be read from the code.
- **P-INT-0 (schedule):** interest runs as a batch job after posting. The order is a policy too.

POSTTRAN is expected to yield the posting validations, each rejecting with a reason code: an unknown card, an unknown account, a transaction over the credit limit, and a transaction after the account's expiry date. It should also yield the rule that rejects go to a separate file. The ingest will confirm or correct each of these, and that comparison is one of the pilot's measures.

### 11.3 Technology adapters: a second axis beside industry packs

Packs answer *what business is this?* A new unit, independent of packs, answers *what is it built with?* A **technology adapter** is owned by the platform, not by packs, and contains:
- **Classifiers:** which files are which kind of artifact.
- **Parsers** for structure: COBOL divisions, paragraphs, PERFORM, CALL and COPY; JCL steps and DD statements; BMS fields; CSD entries; DDL; DBD and PSB.
- **The citation scheme** for that technology (§11.2, point 3).
- **Census measures:** a web app counts routes and components; a COBOL estate counts programs, paragraphs, transactions, jobs and datasets.
- **Slicing rules:** what a unit of work is (a route, a transaction, a batch flow or a module).
- **Model routing:** which model extracts each kind of artifact (§11.5).
- **Decoders** for sample data: EBCDIC, packed decimal (COMP-3) and fixed-width records.

Every ingest is **one industry pack × one or more adapters**. CardDemo is a Cards (consumer credit) pack × the COBOL, JCL, CICS and VSAM adapters. A Django app is a Commerce pack × the Python adapter. The book, the walk, the findings and the rulings never know which adapters were used.

**This also answers Python.** Today's census and the live screen's file counter recognize only TypeScript and JavaScript (accelerator-platform `packages/domain/src/census.ts`, and the path pattern in `cradle-live.tsx`). They become the first adapter. Python is the second, and it is small: classifiers, a census, and Django and Flask route detection.

### 11.4 Kernels: yes, they change

The rule from §1.3 holds: **agents propose; kernels dispose.** Critical behavior never runs on an agent's judgment. What changes is **what a kernel can be.** A legacy estate already contains decades of proven kernels: its COBOL programs. So there are now three kinds:

| Kind | What it is | Example |
|---|---|---|
| **Native kernel** | A pack's own verified engine, run against projections (§2.7) | A Cards-pack interest kernel in TypeScript, with decimal arithmetic |
| **Legacy-backed kernel** | The existing program, wrapped with a **declared contract** (its inputs, its outputs, and the policies it implements, from extraction) and reached through a connector | CBACT04C; or a CICS transaction exposed as a service through CICS web services or z/OS Connect (IMS Connect for IMS, MQ for messaging) |
| **Batch kernel** | A kernel run by a schedule over a file or table, not by a request. It needs idempotency, checkpoint and restart, and a run window | POSTTRAN, INTCALC |

**A legacy client has three modes,** each sellable on its own (§7: "each step must be sellable by itself"):

1. **Observe.** Ingest only. The book is the documentation nobody has: contradictions, holes, the data model, impact analysis ("what changes if the disclosure-group rates change?") and the compliance mapping. Nothing changes at runtime. This is the first sale, and the CardDemo pilot proves it.
2. **Wrap: the strangler pattern, by policy.** New surfaces and agents sit in front. The legacy system stays the system of record and **becomes the first set of kernels**.
   - Agents reach CICS or IMS only through connectors, and every call passes a **guard** checked against the governing policies.
   - Parametric policies that live in legacy tables are governed by **projecting them into those tables**. The steward changes a rate in the book; after the usual shadow run and approval, the projection writes the disclosure-group row through a connector.
   - Structural policies stay in COBOL, marked `implemented_by` the program, and change only when the program changes.
3. **Replace, kernel by kernel.** A native kernel takes over from a legacy one only after it **matches the legacy kernel on real history**. Replay the same inputs (a day's transaction file, a month of balances) through both, and compare the outputs field by field.
   - Legacy is the **oracle**, and its runs harvest thousands of Examples (§4) for free.
   - Batch makes this unusually clean: the inputs are files, and so are the outputs.
   - Cut over one kernel at a time. The book, and the steward's experience, never change.

So the Owner's thought isn't crazy: **the cradle can run a legacy business before a line of COBOL is replaced,** because the legacy programs are kernels and the book governs them. Replacement then becomes a sequence of verified swaps instead of a big-bang rewrite. That is the modernization story the market has been missing: rules first, then runtime, kernel by kernel, each swap proven against the old system.

**Kernel contracts gain fields:**
- invocation: request, schedule, file or message;
- the unit of work: a CICS syncpoint or an IMS checkpoint;
- the data encoding: EBCDIC, packed decimal;
- numeric semantics (§11.2, point 5);
- for legacy-backed kernels, the connector, and the program version they wrap.

### 11.5 Models: route by artifact, adopt by measurement

Specialist models, a COBOL expert for example, will come; some vendors already claim them. The platform should welcome them **without trusting the claim**:
- **Route by artifact kind,** in the adapter: COBOL programs to the best COBOL extractor, JCL and scheduler files to whichever model reads them best, copybooks to the Modeler, and reconciliation to the strongest general model. Gen 2's choice of model by role extends naturally to this.
- **Adopt only on measurement.** Build an **answer key** for CardDemo once: the policies, the data model and the contradictions, agreed in a human review. Then score every candidate model on precision, recall and citation accuracy for each kind of artifact. A model wins a route by its score, not its marketing. The answer key is a product asset too: "your vendor claims X; here is X on the public benchmark."
- **Parsers before models.** Structure (call graphs, record layouts, job steps) is read by parsers: exact, cheap and citeable. Model spending goes on meaning: what rule this code enforces, and why.
- **Where the model runs matters more here.** Banks and insurers may require models inside their own boundary. For this market, the model proxy (on the Gen 2 go-live list) becomes a requirement, not an option.

### 11.6 Scale, storage and cost

- **Budgets per slice** replace one budget per ingest. The live screen shows spending per lane.
- **Incremental re-ingest:** a changed file maps, through the system graph, to the slices that contain it, and only those slices are extracted again. Citations by paragraph (§11.2) make the before-and-after comparison meaningful.
- **The system graph is big.** Programs, paragraphs, jobs, steps, datasets and fields for a real estate run to hundreds of thousands of nodes. That is the first realistic trigger in §2.5 for something beyond plain Postgres tables. The **policy graph** stays small and stays in Postgres. The **system graph** may need a closure table, a separate store or, eventually, a graph database. Keep it behind its own tool interface (`system.*`) from day one.

### 11.7 The Cards pack

Pilot 2 needs a **Cards (consumer credit) pack** containing:
- Concepts: Customer, Account, Card, Transaction, Category, Disclosure group, Statement, Payment, User;
- their lifecycle events, with trigger kinds;
- starter policies;
- **Regulation nodes.** US card issuers fall under the Truth in Lending Act (Regulation Z) for interest and disclosures, and under PCI DSS for card data.

CardDemo will show plenty of holes against those regulations, which makes a strong demonstration: "here is what this system enforces, here is what the law requires, and here is the gap."

### 11.8 Pilot 2 plan: CardDemo

1. Pin a commit of the upstream AWS repository, after checking its DB2, IMS and MQ modules. The estate is public, so unlike Pilot 1 the output can be public too, as a showcase.
2. Build the inventory and map stages, with parsers for COBOL, JCL, BMS and CSD. Show the system map.
3. Draft the Cards pack starter book.
4. Ingest by slices with parallel Extractors, plus the Modeler.
5. Build the answer key by human review. Record precision, recall, citation accuracy, contradictions found and the parametric share.
6. Run a Policy Walk on the result, with the Owner as steward.
7. Prove mode 3 on one kernel: a native interest kernel that matches INTCALC on the sample data, field by field.

**Measures for the showcase:**
- the share of rules found with correct citations;
- how much of the data model was found;
- implementation-against-implementation contradictions;
- holes against Regulation Z;
- one legacy kernel matched exactly by a native one.

---

## 12. Demo 1 anchor: Machine Shop before the Cradle (2026-11-03)

Demo 1 is Machine Shop: a TypeScript store, ingested, walked by the steward, and brought into line with the rulings by the crew. Before any ruling was released, the Owner asked to keep the original site as a fixed point to compare against. This section is that anchor. Demo 2 (CardDemo, §11.8) starts from here, and so does the rest of the Gen 3 build.

### 12.1 What is kept

| What | Where | Notes |
|---|---|---|
| **Baseline branch** | `baseline` on `pdhoward/machineshop` | At `3a87b9b`: an empty commit on top of `47e81ec`, added only so Vercel would build the branch. The crew never releases to it. |
| **Baseline tag** | `baseline-2026-11-03` → `47e81ec` | "Release #9: Stripe" plus the env example update: the live site on the morning of 2026-11-03. |
| **Original site (baseline)** | https://machineshop-git-baseline-strategicmachines.vercel.app | Follows the `baseline` branch, so it never changes. |
| **Backup snapshot** | https://machineshop-6lj64vnwc-strategicmachines.vercel.app | Vercel's own fixed copy of the production build of `47e81ec`. It survives even if the branch is deleted. |
| **Cradle-driven site** | Machine Shop's production address (`main`) | Changes with every Go live. |

Both baseline addresses sit behind Vercel's Deployment Protection, so open them signed in to Vercel. To show them to someone without a Vercel account, add a share link or turn protection off in the Vercel project's settings.

### 12.2 How releases relate to the baseline

- Go live (runner `release`, `apps/runner/src/jobs.ts`) merges the work branch into `stage`, moves `main` to it, and Vercel deploys `main` to production. It never touches `baseline`.
- **To compare:** open the baseline and the live site side by side. The first checks are to ask each assistant "can I buy this drill?", finish a Stripe test order, and read the order page.
- **To restore the original as the live site:** move `main` back to the `baseline-2026-11-03` tag. This is an Owner decision.

### 12.3 What Demo 1 proved, and what it didn't

**Proved:**
- A real ingest of a working store found 22 policies and 3 contradictions, including a real defect: the assistant denied that orders could be placed after Buy now went live.
- A non-technical steward can walk the book, rule in a sentence, and have the crew carry the ruling into the code (G3-D26), with Owner approval where an integration is involved.

**Not yet** (the remainder of the Gen 3 design):
- the app running *from* the book: kernels against projections (§2.7), the request path with Jev (§1.4), generative surfaces (§1.5);
- shadow runs of policy changes (§4);
- live examples during the walk;
- a directive typed in Work that changes policy being recognised and written back to the book (two-way sync);
- the six crew roles as separate agents (§11.2).

Today the "Cradle-driven" Machine Shop is the same Next.js app with targeted edits that match the steward's rulings. The baseline makes each later step measurable against where we started.

### 12.4 The Demo 1 rulings (the precedents)

1. **Order page vs test mode:** the order page describes what will happen in the current payment mode. In test mode it says nothing ships and no charge was made.
2. **Assistant vs Buy now:** shoppers can order through Buy now. The assistant directs them there and never takes payment or shipping details.
3. **Stock vs old data:** a product can be bought only when its stock status clearly says in stock. The 2021 crawl data is accepted for the test site only.

Each one goes to the crew through "Aligning the code", and is proven when the next ingest finds no contradiction.

