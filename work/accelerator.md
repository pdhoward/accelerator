# The Accelerator — Product & Business Plan (v0.1)

*Strategic Machines · drafted 2026-09-25 · rev. 2026-09-25 (added §6 competitive reality, §7 moat builds, §7a website + Fit Scan status, §11 owner action list) · status: thesis + plan, pre-validation*

> **One sentence.** We commission an existing production web application into an AI-operated accelerator that owns implementation, regression, refactoring and bounded improvement — and the customer runs it from a **control room**, not an IDE.
>
> **Hands off the code. Hands on the controls.**

---

## 1. Where this came from — Customer Zero already exists

Cypress Resort's Gen-2 platform (`ts-platform`) has been built and operated by Claude, with the owner acting as the operator. Nobody hand-writes or line-reviews code. Measured from the repos on 2026-09-25:

| Evidence (ts-platform, since first commit 2026-07-06) | Value |
|---|---|
| Elapsed time | ~12 weeks, **live in production** (Day Zero cutover done; real guests, real money) |
| Commits · merged PRs | 287 · 60 (192 commits in the last 30 days) |
| Automated test cases | **615** across 57 test files, including live-DB RLS and payment suites |
| API surface | 111 routes · ~75k lines of TypeScript · 8 packages |
| Written knowledge | 30 design/operating docs (`cypress-actions`), a numbered backlog, a verified `CLAUDE.md` rulebook |
| Migration proof | Mews + Gen-1 history reconciled to the penny ($750,611.67 across 433 rows) |

What made it work was **not** that a model can write code. It was a set of **disciplines** that turned the application's knowledge into things a machine can read and check:

1. **An operating rulebook** (`CLAUDE.md`): the one architectural rule, the invariants (ledger sign convention, pinned rule sets, credit-first payments), an Always/Never list, and a *doc↔code drift* list checked against the code ("the code wins").
2. **Design before code**: every non-trivial change starts as an `impl-*.md` or `design-*.md` doc with owner decisions recorded.
3. **A permanent-number backlog** (`backlog.md`): items keep their numbers, carry dated status lines, and link to their design docs and PRs.
4. **Every production bug becomes a regression test.** Example: #53/#55, where the dashboard double-counted ledger rows past 1,000 rows. It got a root cause, a read-only investigation script, a shared ordered pager and a 1,280-row regression test.
5. **Pure engines behind one API**: business logic in one place, so an agent can change it without the logic drifting between copies.
6. **Tiered environments**: branch → Preview → `stage` (test DB, Stripe test) → `main` (live), plus data-fix scripts checked in as code.
7. **A production-data-issues log** that separates the owner's decisions from engineering fixes.

**The bet:** these disciplines, plus tooling and a repeatable onboarding program, can be installed on *someone else's* application. That onboarding program is the product.

---

## 2. Evaluation of the two inputs

**Grok. Best ideas: the architecture and the metaphor.**
- A factory is linear; software recirculates. An accelerator (many turns of the ring, fields not hands, measure the beam not the widget) is the right *design* metaphor.
- A usable parts list: **lattice** (versioned invariants and boundaries), **interlocks**, **flight recorder / replay**, a **control room**, a **fast judge** gating every change, and **shadow-replay** of past merged work as proof.
- A week-by-week **commissioning** sequence.
- *Weakness:* it is heavy on vocabulary, and it treats a specific classifier model ("Jev") as the key. It isn't. Any fast, typed, independent judge fills that slot, and the generator models are replaceable parts.

**ChatGPT. Best ideas: commercial discipline.**
- **Actor ≠ Judge** is *the* core principle. An agent that writes both the code and its tests can confidently prove its own misunderstanding. The judges are independent evals, invariants, replay, synthetic users, production telemetry, and humans judging *outcomes*, not diffs.
- **Autonomous Coverage (AC0–AC5)** is the unit of value, and **"Why is this safe?" evidence packages** replace code review.
- **Customer Zero first**, then commission **3 apps we didn't build** before generalizing.
- **Narrow beachhead** (TypeScript/Next.js/Vercel/Postgres), and don't lead with "autonomous innovation."
- Brand it as **autonomous application operations**, not "AI developer." The second phrase puts us in a per-seat price comparison with coding tools such as Cursor and Devin. Those tools are really our *suppliers* (see §6).

**What only first-hand operation adds (my contribution):**
- **The moat is the discipline pack, not the tests.** The tests came *out of* the rulebook, backlog, design docs and incident loop. Commissioning must install those habits, not just point an agent at a repo.
- **Invariants come from the business, not the code.** Cypress's most valuable rules (one ledger, pinned policies, credit before card) were learned from Gen-1 failures and owner decisions. So commissioning includes **operator interviews and incident history**, not just static analysis.
- **Honest gaps in Customer Zero** that the product must close:
  - Interlocks were *conventions*, not *enforcement*: `main` and `stage` have no branch protection and there is no CODEOWNERS file.
  - The generator session has production database keys.
  - Tests are mostly written by the same actor that writes the code.
  - Production bugs still escaped (#53). The loop caught and fixed them well, but an independent judge would have caught them earlier.
- **The operator is a real, skilled role.** The owner makes product and money decisions, runs staging walkthroughs and challenges results. Productizing means defining and training that role. That makes a **system-integrator channel** natural: agencies whose hand-coding business is being eroded become certified commissioning partners.

---

## 3. The product

### 3.1 Five layers (extracted from Customer Zero, not redesigned)

| Layer | What it holds | Cypress today → productized |
|---|---|---|
| **1. Adapters** | GitHub, Vercel, Supabase/Postgres, Stripe, CI, analytics, ticketing | Hand-wired → connector set for the beachhead stack |
| **2. Application Model** ("the lattice") | Architecture map, invariants, money/auth/PII surfaces, blast-radius classes, the definition of done per class | `CLAUDE.md` + docs → generated, versioned, machine-checked model |
| **3. Execution** (generators) | Claude / Codex / next model; sandboxes, branches, migrations, synthetic data | Claude Code in an IDE → orchestrated, model-agnostic runners |
| **4. Assurance** (judges) | Held-out tests the actor can't edit, invariant checks, replay, synthetic journeys, preview telemetry, promotion policy | Same-actor tests → **independent** judge layer with evidence packages |
| **5. Control Room** | Mission · Work · Health · Changes · Confidence · Controls | Chat + backlog.md → an operator console |

### 3.2 The signature artifacts

- **Evidence Package** (replaces the PR review): intent → plan → surfaces touched → tests added/run → invariants checked → replay → preview telemetry → judge confidence → promotion decision.
- **Readiness Report** (the output of commissioning): behaviors found, how many are independently testable, synthetic workflows, invariants, restricted change classes, human gates, and autonomous coverage %.
- **Discipline Pack**: rulebook, backlog conventions, design-doc templates, incident→regression loop, data-fix protocol, environment tiers. It is installed on every customer.

### 3.3 Autonomous Coverage levels

| Level | The accelerator may… | Typical gate |
|---|---|---|
| **AC0 Observe** | Map, test, report; no changes | — |
| **AC1 Repair** | Flaky tests, bugs, dependency bumps, copy | Auto-promote to stage |
| **AC2 Implement** | Well-specified backlog features | Operator OK on the evidence package |
| **AC3 Refactor** | Cross-module and architectural change | Replay + held-out suite + operator |
| **AC4 Operate** | Incidents, performance, data fixes | Interlocked; read-only production path |
| **AC5 Evolve** | Propose and run bounded experiments behind flags | Mission bounds set by the customer |

Headline metric: **% of the change surface owned at each level**. Example: "entered at 15% AC1, exited commissioning at 70% AC2."

### 3.4 Non-negotiable interlocks (sold as a feature)
- No production-write credentials in a generator session. Production access is read-replica only, or goes through a promotion service.
- Enforced branch protection and promotion rules. Money, auth and destructive-migration classes never auto-promote.
- Spend caps, loop limits and retry ceilings. Full provenance: model, lattice revision, evals passed.
- We do **not** sell "no humans." We sell **no hands on code; humans on mission, risk and outcomes.**

---

## 4. Commissioning — the repeatable onboarding program

A fixed-fee engagement of roughly **6 weeks** that ends in a Readiness Report and live AC1–AC2 operation.

| Week | Step | Output |
|---|---|---|
| 0 | **Connect**: repo, CI, hosting, test DB; production is read-only or excluded; secrets inventory | Access map, first interlock list |
| 1 | **Survey**: architecture graph; operator interviews; incident and backlog history | Application Model v1, invariant draft |
| 2 | **Instrument**: run the existing suite; find blind spots; build a synthetic/held-out suite on a test DB | Honest coverage map |
| 3 | **Install disciplines**: rulebook, numbered backlog, design-doc flow, environment tiers | Discipline Pack live |
| 4 | **Shadow**: replay the last N merged changes and current backlog items; compare with what humans did | Shadow report (the sales proof) |
| 5–6 | **Bounded custody**: AC1 live, AC2 on selected items; operator training | Readiness Report, first evidence packages |
| 7+ | **Raise energy**: open more change classes as loss rates stay low | Rising coverage % |

**Repeatability test:** every time a human has to step in during commissioning, that step becomes a candidate for tooling. Commissioning is proven repeatable when app #3 takes materially less human time than app #1.

---

## 5. Market

**Definition.** Businesses whose **revenue depends on a custom web application** that they maintain with a small in-house team or an agency. Today they pay people to touch code: product manager → ticket → developer → review → QA → deploy.

**Beachhead (Year 1–2).** Production apps on **TypeScript / Next.js / Postgres (Supabase) / Vercel / GitHub / Stripe**, run by **1–8 engineers or an agency**, with **$250K–$1.5M a year** of engineering spend. Examples: vertical SaaS, marketplaces, booking and commerce operators, and funded startups after product-market fit. They are close in shape to Customer Zero, cloud-native, and feel the cost of engineering headcount.

**Sizing. Scenario estimates for validation, not researched figures.**

| | Assumption | Estimate |
|---|---|---|
| **TAM** (context) | Global application development and maintenance services: the largest line in IT-services budgets | Hundreds of $B/yr (order of magnitude) |
| **SAM** (beachhead, US) | ~40,000 businesses fitting the profile above × ~$120K/yr steady-state spend with us | **≈ $5B/yr** |
| **SOM** (3-year) | 5 apps in Y1 (direct) → 25 in Y2 → ~100 in Y3 (direct + SI partners) × ~$120K | **≈ $12M ARR by Y3** |

The value proposition in one number: a 3-engineer team costs about **$600K+/yr** fully loaded. The accelerator targets **25–50% of that**, with faster throughput and an evidence trail the team never produced.

**Competition.** Every adjacent product still assumes an engineer holds the merge seat:
- **Ticket → PR agents** (Devin, Factory, Copilot agent, Cursor background agents, Codex) take work items but not custody.
- **Agent control planes** (Guild and others) orchestrate agents but hold no application model or commissioning method.
- **Managed AI dev pods and agencies** do the work, but people still own the outcome and no product is left behind.
- **Code graphs, reviewers, flags** (Graphify, Qodo, LaunchDarkly) are components we integrate, not competitors.

**Our position:** *custody plus evidence.* The categories we avoid being compared against are "AI developer" and "coding tool." See §6 for why Cursor and Devin are suppliers, not rivals, and what they could copy.

---

## 6. Cursor, Devin, and what they could copy

**Why they came up at all.** They aren't competitors in the business we're building. They're mentioned because a buyer who doesn't yet understand custody will compare prices: "Cursor is $40 a seat, why pay you $10K a month?" That comparison is the trap. We avoid it by never selling a coding tool.

**Can they replicate what we do today?** Honestly, **the coding loop, yes.** Customer Zero runs on Claude Code in VS Code plus:
- a rulebook file
- a docs repo
- a numbered backlog
- a disciplined operator

A capable operator could reproduce that in Cursor (rules files, background agents), Devin (knowledge, playbooks) or Codex. The raw code generation is a commodity, and it gets cheaper every quarter.

**What they can't replicate, because it isn't their business model:**

| They sell | We sell |
|---|---|
| A tool to an engineer, priced per seat | Custody of an application to its owner, priced per app and outcome |
| Speed of writing code | Proof that a change is safe (independent judge + evidence) |
| A harness that is the product | A harness that is a **swappable part** |
| Nothing left behind when you cancel | An Application Model, tests and evidence history that persist |
| Assume a skilled engineer at the wheel | Assume a **less-skilled operator** at the controls |

**The real risk:** they move up-stack into autonomous, custody-style offerings. The defense is not a better coding agent. It is to own the layers above and around the harness, so Cursor, Devin, Claude Code and Codex all become engines the Accelerator can drive. **Harness-agnostic is both the moat and the pitch to integrators:** they can install the Accelerator whatever tools the client already uses.

---

## 7. The moat: what we build and ship

The principle: **build everything the harness vendors won't, and make the harness replaceable.** Seven builds, ranked by how much moat each creates:

| # | Build | What it is | Why it's a moat | Lowers the skill bar? |
|---|---|---|---|---|
| 1 | **Accelerator Spec** (portable Application Model) | One versioned source of truth for architecture, invariants, change classes and definition of done. It compiles to `CLAUDE.md`, `AGENTS.md`, `.cursor/rules` and Devin knowledge | The customer's knowledge lives in *our* format, not a vendor's. Switching harness is a recompile | Yes: operators edit plain-language rules, not prompts |
| 2 | **Independent Judge** (CI service / GitHub App) | Held-out tests stored outside the repo the agent can edit, invariant checks, replay, and a second model from a different vendor reviewing the change. Emits the evidence package as a PR check | IDE vendors grade inside the same session; we grade outside it. This is what makes "no code review" defensible | Yes: the operator reads a verdict, not a diff |
| 3 | **Interlock App** | Installs branch protection, path-based change-class detection (money, auth, migrations), blocked auto-merge on restricted classes, spend and loop caps, and production-key isolation | Turns Customer Zero's conventions into enforcement, sellable as a safety guarantee | Yes: it's safe by default without expertise |
| 4 | **Backlog Burner** | Intake → triage → spec → parallel agents in isolated worktrees → judge → operator queue. It runs through the backlog in batches, with a **backlog half-life** metric | Compresses months of backlog into weeks, with measured throughput | Yes: the operator approves outcomes in a queue |
| 5 | **Upgrade Engine** | Framework, dependency and security upgrades (e.g. Next.js, React, SDK majors) run as campaigns with replay evidence. **Every website is behind**, and this catches it up and keeps it current | A recurring, easy-to-justify buy, and the best wedge offer ("Upgrade Sprint") | Yes: upgrades stop being expert projects |
| 6 | **Operator Console + certification** | The Control Room UI, plus operator playbooks, training and certification for SIs and client staff | People trained in our method are the channel. Integrators build businesses on it | This *is* the skill-bar reducer |
| 7 | **Evidence data flywheel + vertical invariant packs** | Anonymized, cross-customer patterns: common failure modes, invariant templates per vertical (booking/hospitality from Cypress, commerce, SaaS billing) | Every commissioning makes the next one faster. A new entrant starts from zero | Yes: commissioning starts from templates |
| + | **Fit Scan** (live on the website) | Paste a URL and get an accelerator-fit report from public signals | Top of funnel, and a dataset of which sites are behind and how | Qualifies leads without a call |

**Design rules that keep the moat:**
- **Nothing we build depends on one model or one IDE.** Every harness sits behind an adapter; the judge always uses a different vendor from the builder.
- **Customer knowledge is exported in open formats** (Markdown, YAML, tests). Lock-in comes from accumulated value, not hostage-taking, which is also what integrators need to sell it.
- **Measure what vendors don't:** autonomous coverage, backlog half-life, escaped-defect rate, time-to-current on upgrades, and operator hours per app.

**The three metrics we'll sell on:**
- **Backlog half-life:** how fast the open backlog shrinks by half.
- **Time-to-current:** how far behind the latest stable framework releases the app is.
- **Operator skill required:** hours of training before someone can run the Control Room.

**Main risks:** model vendors and hosting platforms moving up-stack; liability for escaped defects; buyer trust. **Mitigations:** being model-agnostic, keeping operating evidence as a data asset, defining liability in the contract (change classes and gates), and the SI network.

### 7a. Status: website + Fit Scan (as of 2026-09-25)

**Website (`ts-machineweb`), rebuilt around the Accelerator. It builds cleanly and nothing is committed yet.**
- **Pages:** Home, Fit Scan, The Accelerator (`/platform`), Customer Zero (`/customers/cypress-resort`), Pricing, Partners and Company. The Concierge, Radio and Integrations pages were removed; they're in git history.
- **Home page flow:** the factory-vs-accelerator shift, the Fit Scan, Customer Zero stats (615 tests, 287 commits, <12 weeks, 111 routes), the commissioning timeline with a Readiness Report, the evidence package, autonomy levels, pricing, partners, and the application form.
- **Placeholders labelled "example":** the Readiness Report numbers, the evidence package and the price ranges.

**Fit Scan (`/fit-scan`).** Paste a URL and get an outside-in report:
- **Accelerator fit score (0–100):** made up of stack fit (45%), application depth (35%) and delivery pipeline (20%).
- **Hygiene score:** each gap becomes a "day-one backlog" item.
- **Lighthouse scores**, via Google PageSpeed.
- **An optional Claude analyst:** a business summary, the first 3–6 backlog items and the open risks.
- **Verdicts:** Strong candidate, Candidate, Partial fit (CMS), Future candidate, Low value, Replatform first, or Not a fit. Sites locked inside hosted builders (Wix, Squarespace, Webflow, Framer, Shopify) are detected.
- **Protections:** SSRF-safe fetching (public addresses only, checked on every redirect) and a 10-minute cache per URL.
- **Spend guard:** the limits live in Postgres (`supabase/sm_fit_scan.sql`), shared by every server instance:
  - 5 scans per visitor per hour
  - 120 scans per hour site-wide
  - **at most 150 Claude calls per UTC day** (roughly $0.03–0.10 each, so worst case about $15/day)
  - It **fails closed**: if the counter can't be reached, scans still run, but Claude is never called.
  - No Claude call on "Not a fit" or "Low value" sites; output is capped at 8K tokens per call.
  - Only salted IP hashes are stored, never raw IPs.
  - The Anthropic Console spend limit is the final hard stop (see §11).
- **Design choices:** scores are deterministic and explainable; the LLM only adds narrative and never changes a number. The analyst sits behind a provider interface, applying design rule 1.
- **Tested live:** cypressresort.com, wordpress.org, example.com and httpbin.org, plus private-address and redirect attacks.
- **Tested end to end on 2026-09-26:** Supabase spend guard (the SQL has been run in "accelerator-test"), Lighthouse via `PAGESPEED_API_KEY`, and the Claude analyst. A live scan takes about 20 seconds.
- **Gotcha:** the site's Anthropic key is org-level, so every request must carry an `anthropic-workspace-id` header (the SDK only adds it for OAuth logins). The analyst sends it from `ANTHROPIC_WORKSPACE_ID` (alias `ANTHROPIC_WORKSPACE_KEY`). Without it, every call fails with a 400. Set the same variable in Vercel.

**What the Fit Scan taught us on day one:**
- **Customer Zero's own site has gaps.** cypressresort.com is missing four security headers (CSP, nosniff, clickjacking protection, Referrer-Policy). That's a real AC1 backlog item for `ts-platform`, and exactly the kind of "every website is behind" finding the product sells.
- **Outside-in scans under-read applications.** Cypress scores 72 ("Candidate") because accounts aren't visible from the public site. The scan qualifies leads; only commissioning week 1 (repository access) gives the real read. The report says this plainly.
- **Every scan is a dataset row** (stack, host, gaps, verdict). Stored over time, it becomes market intelligence on which sites are behind and how. Storing scans isn't built yet.

---

## 8. Business model

| SKU | What | Indicative price |
|---|---|---|
| **Commission** | Onboarding (§4) → Readiness Report + live AC1–AC2. **Highly complex sites:** also includes **training courses** so the customer's team can lead the migration to the platform, plus a **support contract**. | **$5K–$20K, custom-quoted by complexity and scope, invoiced** (owner decision 2026-09-29; was $30K–$120K) |
| **Operate** | Accelerator runtime: orchestration, judges, evidence store, control room, model spend | $6K–$20K/mo by change volume and assurance level |
| **Managed Operator** | Our operator runs the control room until the customer can | +$10K–$20K/mo, tapering |

**Path:** managed by us → co-operated → customer-operated. It is sticky because leaving means giving up the accumulated application model, the evidence history and the discipline, not just a tool.

**Channel (Phase 3): Accelerator Partner Program.** Train and certify system integrators and web agencies in the commissioning method and the Discipline Pack.
- The partner commissions and operates.
- We supply the platform and certification, and take the runtime revenue plus a certification fee.
- It turns a threatened hand-coding business into a partner channel.

**Unit-economics targets:** 65%+ gross margin after model and compute costs; one operator per 8–12 apps at steady state; commissioning human-hours falling with each app.

---

## 9. Roadmap — prove, extract, repeat

| Window | Goal | Exit criterion |
|---|---|---|
| **Days 1–30: Instrument Customer Zero** | Close the gaps: enforce branch protection, remove production write keys from the generator session, add a held-out judge suite; log every change as an evidence package; publish the coverage metric. **Ship:** Fit Scan v1 (done), Interlock App v0 (#3) on Cypress | 30 days of evidence packages; honest AC% for Cypress |
| **Days 31–60: Extract commissioning** | Turn the Discipline Pack into templates; build a `commission` routine that produces Application Model v1 and a Readiness Report on an unfamiliar repo (manual steps allowed). **Ship:** Accelerator Spec v0 (#1) compiling to `CLAUDE.md` + `AGENTS.md`, and a Cursor or Codex run on the same spec to prove swappability; Independent Judge v0 (#2) as a GitHub check | A Readiness Report generated on a repo we didn't build; the same backlog item completed by two different harnesses |
| **Days 61–90: Commission apps #2 and #3** | One clean SaaS and one messy live app with a real backlog. **Ship:** Backlog Burner v0 (#4) | Tracked: time to first useful change, human interventions per change, escaped defects, AC% at 30 days, cost per accepted change, backlog half-life |
| **Months 4–9** | Control Room v1 UI + operator certification (#6); Upgrade Engine (#5) sold as an "Upgrade Sprint" wedge; 5 paying customers; first 1–2 partner agencies trained | Commissioning repeatable, with human time falling per app; a non-engineer operator running an app |
| **Months 9–18** | Partner Program at scale; vertical invariant packs (#7); a second stack (e.g. Rails or Django) | 25 apps under operation |

**The 90-day demo:** "Here is an app we didn't build. What the accelerator knew on day 1, what it learned, the safeguards it set, the backlog it cleared, N autonomous changes with their evidence — and the owner running it without an IDE."

---

## 10. Open decisions (owner)

1. **Brand:** keep *Strategic Machines* as the company and call the product *The Accelerator*? (The website now does this.)
2. **Customer Zero disclosure:** which Cypress numbers can be published? (The site currently uses only the engineering counts above.)
3. **Hospitality platform:** does the Cypress guest platform stay a separate line of business, or become a vertical showcase for the Accelerator? (The site now treats Cypress as the case study only.)
4. **Candidates for apps #2 and #3:** who will let us commission their app in the next 60 days?
5. **Liability posture:** which change classes will we contractually own, and which does the customer's gate own?
6. **Pricing validation:** the SKU ranges in §8 are proposals. Test them with the first 3 prospects before publishing firm numbers.

---

## 11. Owner action list

**This week: take the website live**
- [ ] Review the site locally (`pnpm dev` in `ts-machineweb`), then commit and deploy.
- [x] **Before adding the Claude key:** run `supabase/sm_fit_scan.sql` in the site's Supabase project (the same project as `sm_waitlist`, never `ts-platform`). Until it's there, the analyst stays off (fail closed).
- [ ] **Set a monthly spend limit on the Anthropic workspace** whose key the site uses (Anthropic Console → Limits). Use a dedicated workspace and key for the website. This is the hard backstop that no code bug can bypass.
- [x] Add `ANTHROPIC_API_KEY` and a random `FIT_SCAN_IP_SALT` to the site's environment, then run one Fit Scan to confirm the analyst works. The analyst and the SQL function are the two untested paths.
- [ ] Optional: turn on Vercel's bot protection (BotID or the Firewall) for `/api/fit-scan`, so scripted traffic is stopped before it uses up the shared hourly limit.
- [x] Get a free `PAGESPEED_API_KEY` (Google Cloud → PageSpeed Insights API) and add it. Google's keyless quota is usually exhausted, so Lighthouse scores won't show without it.
- [ ] Confirm Cypress Resort is comfortable being named "Customer Zero," with the engineering stats shown (decision 2).
- [ ] Replace the placeholder social links (GitHub / LinkedIn / X) in the footer, and have the Privacy/Terms placeholders reviewed.
- [x] Fixed the lint crash (2026-09-28): `eslint-plugin-react` doesn't support ESLint 10, so the site is pinned to ESLint 9. `pnpm lint` is clean.

**Days 1–30: harden Customer Zero (roadmap row 1)**
- [ ] Add the four missing security headers to cypressresort.com. This is a Fit Scan finding and belongs in the `ts-platform` backlog.
- [ ] Turn on branch protection for `main` and `stage` in GitHub Settings → Branches, and add a CODEOWNERS file (CLAUDE.md drift item 5).
- [ ] Remove production write keys from the Claude session; route production changes through a promotion path.
- [ ] Start logging every change as an evidence package, and measure Cypress's honest autonomous coverage.

**Days 31–90: prove it's repeatable**
- [ ] Line up apps #2 and #3 (decision 4): one clean SaaS and one messy live app with a real backlog. Fit Scan the candidates first.
- [ ] Have one backlog item completed by two different tools (e.g. Claude Code and Cursor or Codex) from the same spec. This proves the swappability claim.
- [ ] Identify 1–2 friendly web agencies as the first partner candidates.

**Optional next builds (say the word)**
- [ ] Store Fit Scan results in Supabase, as a lead list and a dataset of sites that are behind.
- [ ] A shareable report link (`/fit-scan/r/<id>`) so prospects can forward their results.
- [ ] Unit tests for the Fit Scan's detection and scoring (both are I/O-free and ready to test).
