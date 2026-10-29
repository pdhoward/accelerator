# Gen 3: The Cradle (Design v0.1)

*Strategic Machines · started 2026-10-28 · **status: direction set by the Owner; design in progress; Pilot 1 (policy extraction from ts-platform, read-only) authorized** · builds on [gen2-crew.md](gen2-crew.md) §13.3 (business-rule register), §20 (domain packs) and §21 (traceability store)*

**How to use this doc:**
- §0 says what Gen 3 is and what stays from Gen 2.
- §1 is the execution model, including the question "can agents run the transactions?"
- §2 is the policy graph, the platform's proprietary core.
- §3 covers industry packs.
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

### 1.3 The complexity rating gains a second job

The rating already decides how a change gets *built*. Now it also decides how a policy gets *carried out*:

| Rating | How the policy runs | Human role |
|---|---|---|
| **High** (money, personal data, sign-in, security, law) | Kernel or guard only. Deterministic and fully tested. | The steward approves the policy and every change to it |
| **Medium** | Kernel where one exists; otherwise agent guidance, with the result checked against the policy's examples | The steward approves the policy; the crew proposes the form |
| **Low / judgment** (tone, recommendations, service recovery inside limits) | Agent guidance at runtime | The steward reviews outcomes, not each action |

**The app may propose but never legislate.** Observed needs (failed searches, unanswered questions, abandoned checkouts) become *proposed* policies or work orders. Nothing the app proposes takes effect in a High area without the steward.

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

Every node and edge carries an **effective period** (`effective_from`, `effective_to`) and a **version**. Every Policy carries a **review-by or sunset date**; this is mandatory (G3-D5). Statuses follow Gen 2 §13.3 and stay separate:
- **extraction status:** candidate, source-verified or unsupported;
- **business status:** unreviewed, confirmed, disputed or superseded.

### 2.3 Layers: pack, then client

The graph is assembled in layers, like the skill tiers: **industry pack → partner → company → site.** A client policy can *bind to* a pack policy (adopt it, perhaps with its own parameters) or *override* it (with a recorded reason). A more specific layer can never remove a safety policy or a gate (Gen 2 rule). When the pack ships a new version, the platform shows the steward the changes that touch their bindings, and nothing changes silently.

### 2.4 Contradictions: three kinds, each named

1. **Policy against policy.** "Free shipping over $100" against "flat $9.95 always."
2. **Policy against regulation.** A new privacy rule against a policy that collects emails.
3. **Policy against practice or surface.** What the code, the guest page or the agent actually does has drifted from what the book says.

The third kind is where we're unique. Every surface and kernel links to its policy, so drift is a graph query, not an audit project. The platform states each contradiction with both sides, the evidence and a proposed resolution. It routes the contradiction to the **referee** (the policy's owner role). The ruling becomes a Decision node, so the same conflict never needs refereeing twice.

### 2.5 Storage

Start in Postgres (Supabase): `cradle_nodes` and `cradle_edges`, with typed `jsonb` bodies, effective periods and versions, scoped by tenant like everything else. No graph database until we need one. The graph is mirrored into the client's repository as readable files (`docs/policy/…`), the same pattern as the Gen 2 Library sync, so the client owns their policy book outright. Agents navigate the graph through Toolbelt tools: `policy.find`, `policy.impact`, `policy.explain`, `policy.conflicts`.

### 2.6 Why this isn't the old business-rules platforms again

Those systems failed for five reasons. Each has an answer here:

| Why they failed | Gen 3's answer |
|---|---|
| Only specialists could write rules | Policies are written in plain language; the crew handles the formal form |
| Rules sprawled; no one could find conflicts | Contradictions are found by reasoning over the graph and routed to a referee |
| Rules never died | A sunset or review date is mandatory; retiring a policy retires its code and tests |
| Rules drifted from the real system | Every kernel and surface links to its policy; drift shows up as a query |
| They tried to run *everything* as rules | Kernels stay code; the graph governs them through parameters |

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

**Open question (G3-D7):** ts-platform's engines are the natural seed kernels for the hospitality pack. Before any of that code goes into a pack sold to others, we must confirm the IP position under the Cypress Resort agreement and the ts-platform license. Until then, Pilot 1 extracts *policies* (knowledge), not code.

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

---

## 9. Action list

1. [ ] Owner: review this doc; settle G3-D3 to D9; answer G3-D7.
2. [ ] Define the graph schema: node and edge types, statuses and effective dating, as domain types in `packages/domain`. Pure, with tests.
3. [ ] **Pilot 1:** extract the ts-platform policy book (§5). Start with cancellation and payment schedule, then rates, availability, tax, waivers and the ledger.
4. [ ] Steward review session on the pilot output; record precision, recall and conflicts.
5. [ ] Draft the `pack-hospitality` starter book from the industry-general part of the pilot.
6. [ ] Graph checks and the compliance-suite report (§4.4).
7. [ ] Policy-change flow: amend a policy → impact analysis → shadow run → steward approval → promotion. Prove it on Machine Shop.
8. [ ] App-originated work: Machine Shop files its own proposals (the next version of the /vision prototype).
9. [ ] Runtime presence (the agent at the edges, guards on connectors): last, after the above are proven.
10. [ ] Regulation feeds per industry.
