# Gen 3: The Cradle (Design v0.2)

*Strategic Machines · started 2026-10-28 · revised 2026-10-29 · **status: direction set by the Owner; design in progress; Pilot 1 (policy extraction from ts-platform, read-only) authorized** · builds on [gen2-crew.md](gen2-crew.md) §13.3 (business-rule register), §20 (domain packs), §21 (traceability store) and §9.2 (the Decide layer, Jev)*

**How to use this doc:**
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
- §8 is the decisions log. §9 is the action list.

> **What Gen 3 is.** Every client app lives in its own **cradle**: an Accelerator that stays attached for the app's whole life. The app's source of truth is a **policy graph**: the client's policies, practices and regulations, linked to each other and to everything that carries them out. The graph starts from an **industry pack** and grows as the client describes their business. The crew turns each policy into running behavior, in the cheapest form that can be trusted. The app observes what it can't serve and proposes new work. It never makes its own rules. The owner, whom we call the **steward**, sets policy, and the app carries it out at machine speed. Every behavior traces back to a policy the steward approved.

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

---

## 7. Risks

- **Rule sprawl** (the old failure). Mitigations: mandatory sunset dates, a referee for every conflict, precedent from rulings.
- **Agent non-determinism in money paths.** Mitigation: High stays with kernels and guards (§1.3), with no exceptions.
- **Liability for the app's judgment.** The rating boundary is the legal answer as well as the technical one.
- **Extraction confidence mistaken for approval.** Mitigation: the separate statuses (§2.2), and steward review before anything is "confirmed."
- **IP of seed kernels** (G3-D7).
- **Scope.** Each step in §9 must be sellable by itself.

---

## 8. Decisions log

| ID | Date | Decision | Status |
|---|---|---|---|
| G3-D1 | 2026-10-28 | Gen 3 "The Cradle": the policy graph is the source of truth; the Accelerator stays attached to the app for life | Owner direction |
| G3-D2 | 2026-10-28 | Pilot 1 reverse-engineers ts-platform's policy book: read-only, at a pinned commit, no execution, no production data. This is consistent with the rule that Cypress is never a test target | Owner authorized |
| G3-D3 | 2026-10-28 | Pilot output is client material, kept out of public repositories | Proposed |
| G3-D4 | 2026-10-28 | "Agents propose; kernels dispose": High-rated policies run only through kernels and guards | Proposed |
| G3-D5 | 2026-10-28 | Every policy carries an owner role, at least one example, and a review-by or sunset date | Proposed |
| G3-D6 | 2026-10-28 | Graph stored in Postgres (nodes/edges), mirrored to the client repo as files; no graph database yet | Proposed |
| G3-D7 | 2026-10-28 | Confirm the IP position before any ts-platform code seeds a commercial pack; until then extract knowledge only | Open: Owner |
| G3-D8 | 2026-10-28 | Industry packs ship as versioned private npm packages | Proposed |
| G3-D9 | 2026-10-28 | The owner's role in Gen 3 is called the **steward** | Proposed |
| G3-D10 | 2026-10-29 | **Criticality** (consequence of being wrong, per policy) is separate from **complexity** (build effort, per work order). Criticality = pack floor raised by graph reach; it is only lowered by a recorded steward decision, and never below the floor | Owner direction |
| G3-D11 | 2026-10-29 | Postgres stays the system of record. Revisit a graph database only on the measured triggers in §2.5; the likely first use is cross-client pack analytics. Agents reach the graph only through `policy.*` tools | Proposed |
| G3-D12 | 2026-10-29 | Kernels never walk the graph. **Projections** compile policies as-of a date into each kernel's typed input; evidence binds to the projection hash; kernels return traces that map back to policy ids | Proposed |
| G3-D13 | 2026-10-29 | Extraction labels every policy **parametric** or **structural**; the parametric share is a headline measure | Proposed |
| G3-D14 | 2026-10-29 | **The Policy Walk** is the tuning and Boarding experience: a specialist crew, gaps computed from ontology lifecycles, live examples showing consequences, and completion defined by checks | Owner direction |
| G3-D15 | 2026-10-29 | The request path is **Route (Jev) → Ground → Adjudicate (agent) → Execute (kernels and guards) → Record**. Jev classifies and selects; it never lowers criticality; a deterministic check runs alongside it | Owner direction (Jev measured before relied on) |
| G3-D16 | 2026-10-29 | **Generative surfaces:** packs ship a component registry; agents compose, components render. Critical policies are shown to people only through registry components bound to the policy version | Proposed |
| G3-D17 | 2026-10-29 | Roles: **pack curator** (Strategic Machines) owns the pack; **stewards** (the client, possibly one per area) own their binding; every policy's owner role is its referee | Proposed |
| G3-D18 | 2026-10-29 | **Karpathy's ladder for the steward:** policy statements are written in controlled English (about 80% of ASD-STE100). Diagrams, interactive pages and explainer videos are generated from the graph as version-bound, discardable views. Critical approvals come with a statement, a diagram and a consequence page, and the record notes what the steward opened | Owner direction |

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
