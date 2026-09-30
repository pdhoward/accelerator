# The Flywheel — Design (v0.3, approved)

*2026-09-30 · repo: `accelerator-platform` · refines [accelerator-control-room.md](accelerator-control-room.md) §4 (Loop), §5.14 (Consultations), §5.15 (Proof), §5.9 (Onboarding)*
*v0.3 (**approved by owner 2026-09-30**): the customer picks the model for each job (§2 F15, §7).*
*v0.2: the flywheel starts with **Install → Checkout → Agreement**; one prescribed stack (GitHub + Vercel + separate test database); the branch and URL path from preview to production.*

**Goal.** Make the working rhythm of Customer Zero the product, starting from a correctly installed site: **install → checkout → agreement**, then, for every body of work, **conversation → design → approval → plan → build → test → try → release → learn**, always visible, with a business person steering and an engine that proposes, asks, builds and proves. The Control Room pulls the person through it.

**Status (2026-09-30): steps 1–5 built, not yet run live.**
- Migration `0004_flywheel.sql` is written and waiting to be run on accelerator-test.
- Domain rules in `packages/domain/src/flywheel.ts`: rail, gates, Protocol verdict, models, Setup template (10 tests).
- API in `apps/api/lib/work.ts` plus `/api/sites/:site/{work,models,setup}` and `/api/runner/*`.
- Runner in `apps/runner`: Agent SDK builder, thinking jobs on any provider, the runner's own checks, the builder guard (7 tests).
- Console pages: Work, the Work item page, Setup, Models.
- Added (migration `0005_separation_vault.sql`):
  - **Separation:** only demo sites show sample data; site slugs are unique across the platform.
  - **Keys vault v0:** AES-256-GCM under `VAULT_KEY`, values never returned to a browser. Holds Development, Preview and Engine keys; the runner reads Development keys from it.
  - **Code browser:** the real GitHub repository at full depth, using the site's `GITHUB_TOKEN`.
  - **Staff access:** platform staff get Operator rights on any account, but never its gates (approvals, agreement).
  - **Installation conversation:** the engine sees Setup, the checkout log and which keys are set.
- Not yet: GitHub App, preview deploys, Try/Release automation, the Judge pass, customer-owned model keys (the runner uses ours).

---

## 1. What Customer Zero taught us (the seven ingredients)

1. **It starts with a discussion.** An observation, a complaint, an idea. Not a ticket.
2. **Many voices can advise.** Claude, GPT, Grok: the human picks or mixes the best ideas.
3. **Design first, in a document the human can read and edit.** Markdown, versioned, approved.
4. **A visible plan.** Numbered steps, open steps, done steps. The engine always knows what's next and **asks before proceeding**.
5. **Tests on every change.** New tests prove the new thing works; the whole suite guards against regression. Every time.
6. **Data work is part of the loop.** Scripts against the test database, synthetic transactions (bookings, ledgers, Stripe test payments), invariants checked to the penny.
7. **Technology is a given.** The stack is settled; the engine is the expert. Asked "A or B?", it answers with a recommendation, then moves on.

## 2. Decisions

| # | Decision |
|---|---|
| F1 | **One object: a Work item.** Every body of work, from a typo to a feature, is a Work item moving along one visible **rail**. It replaces the split between Requests, Consultations and the Change Room: requests become Work items at "Discuss"; the Change Room becomes the Work item's page. |
| F2 | **The human is the Navigator.** Any Owner or Operator steering a Work item. They read, distil, constrain, approve. (A UI name, not a new role.) |
| F3 | **The rail has eight stops**, each with an artifact on screen: **Discuss** (thread) → **Design** (design.md) → **Plan** (steps) → **Build** (live log) → **Prove** (tests + data + evidence) → **Try** (preview + checklist) → **Release** (live, verified) → **Learn** (observations back into Discuss). |
| F4 | **Three human gates, always:** approve the **design**, approve the **plan**, approve the **release**. Small, low-risk items can collapse Design+Plan into one approval (AC1 in accelerator.md). Money/data/auth never skip a gate. |
| F5 | **Panel of models for thinking, one builder for code.** Discuss and Design can ask the panel in parallel; the Navigator pins ideas; the Consult model synthesizes. Only the Build model edits code. A different model judges (held-out tests, review). |
| F6 | **The Protocol: standing orders, enforced by the runner** (not hoped for). See §6. |
| F7 | **Data Lab inside Prove.** The engine runs scripts and synthetic scenarios **only against the test database**, logs each run as evidence, and cleans up. Production data is read-only, through the Data Desk, with approval. |
| F8 | **Stack card.** Each site has a Stack card in the Library (framework, DB, payments, hosting, test tools, conventions) taken from its repo and `CLAUDE.md`. It is the given. Changing it is itself a Work item. |
| F9 | **The engine asks, visibly.** Checkpoints ("Step 3 of 7 done, tests green. Proceed to step 4?") appear as **Needs you** cards. The Navigator sets the cadence per item: *every step* · *only at risk* · *run to the end*. |
| F10 | **Everything compounds.** Each loop leaves: more tests, an updated Library (design doc, facts), better synthetic data. That is the flywheel. |
| F11 | **One prescribed stack at launch:** GitHub · Vercel · a separate **test** database (and test payment keys). Other hosts and git providers come later. |
| F12 | **The flywheel starts once per site with Install → Checkout → Agreement** (§3). No Work item starts until all three are green. |
| F13 | **Every checklist item has one owner, shown on screen:** *Strategic Machines* (human setup), *Engine* (Claude does it and proves it), or *Client* (the business person). |
| F15 | **The customer picks the model for each job.** Per site, one setting per role: **Consult** (thread, synthesis), **Design**, **Plan**, **Build**, **Judge**, plus an optional **Panel** list. Providers: Anthropic, OpenAI, xAI, Google. Keys: the customer's own contract (in the vault) or ours (metered to their account). Rules: *Build* must be a model with a supported agent harness (launch: Claude via the Agent SDK; next: OpenAI via Codex, same adapter); *Judge* should differ from *Build*; the Protocol checks are the same whatever the model. Every run records which model did what. |
| F14 | **Fixed path to production:** `work/<n>` branch → its own preview URL (Try) → merge to `stage` → the stable staging URL → **Go live** → the engine merges `stage` into `main` → verifies the live site (§4). |

## 3. Before the first Work item: Install → Checkout → Agreement

The site's **Setup** page is one checklist in three phases. Each row: owner, status, evidence.

**Install** (Strategic Machines, human; part of the installation fee)

| # | Item | Owner |
|---|---|---|
| I1 | GitHub repo in the client's organisation; our **GitHub App** installed (code read/write on non-`main` branches, pull requests, checks) | Strategic Machines |
| I2 | Branches: `main` = production, `stage` = staging. `main` protected: changes only by pull request with our checks green | Strategic Machines (the Engine can apply it once the App is in) |
| I3 | Vercel project linked to the repo: production branch `main`; `stage` on a fixed domain (e.g. `stage.<domain>`); previews on for every branch | Strategic Machines |
| I4 | Vercel **protection bypass** for the engine (so it can screenshot and test previews) + a read-only Vercel token | Strategic Machines |
| I5 | **Two databases:** production, and a test copy (same schema, synthetic data, no real people). Test payment keys (Stripe test mode) | Strategic Machines |
| I6 | Keys per environment in the vault: *Development* and *Preview* get test keys; *Production* keys live only in Vercel | Strategic Machines + Client (pastes values) |
| I7 | Domains and DNS pointed at Vercel | Strategic Machines + Client (registrar access) |
| I8 | People invited with roles; the **Navigator** named | Client |

**Checkout** (Engine; each item is run, not claimed, and leaves evidence)

| # | The engine proves | Evidence |
|---|---|---|
| C1 | It can clone, install, build, typecheck and run the tests | Command output; **baseline test count** |
| C2 | It can push a branch, and a Vercel preview appears and loads | Preview URL + screenshot; branch deleted after |
| C3 | The test database is reachable **and is not production** (host and a marker row differ) | Query results |
| C4 | Every key in the manifest is present for Development and Preview; each connection test passes | Connection-test results |
| C5 | It **cannot** reach production data or push to `main` directly | Refused attempts, logged |
| C6 | Rulebook: `CLAUDE.md` exists (or the engine drafts one for approval); **Stack card** drafted | Documents in the Library |
| C7 | Baselines: Lighthouse, test suite, data invariants | Health + Proof pages |

Anything the engine can fix itself (missing `stage` branch, missing `.env.example`, no test script) becomes its own small Work item.

**Agreement** (one page, signed by the Navigator, versioned in the Library)

| The engine will | The Navigator will |
|---|---|
| Design, plan, build, test and document every change | Start the conversation: observations, complaints, ideas |
| Keep the plan visible and ask before proceeding (at the chosen cadence) | Review and approve designs, plans and releases |
| Add tests with every change, never weaken the suite | Try every change on its preview, using the checklist |
| Work only in test; never touch production data | Give feedback, and say "stop" when something is off |
| Explain plainly; recommend one option when asked "A or B?" | **Tell the engine what it can't see** (below) |

**What the engine can't see** (listed on the Agreement; grows over time): customers' calls and emails, the business's plans and constraints, legal and brand rules, dashboards it has no key for (live Stripe, the registrar), and how the site *feels* to a real customer. The Navigator brings these into the conversation.

## 4. From preview to production (who gets which URL)

| Where | Branch | Data | Who looks | How they get there |
|---|---|---|---|---|
| Preview | `work/<n>` | test DB, test payments | Navigator, testers | **Open preview** on the Work item (the Control Room adds the bypass, so no Vercel login) |
| Staging | `stage` | test DB, test payments | Navigator, team | Fixed URL on the Setup page and in each release note |
| Production | `main` | live | Everyone | The site's domain |

1. **Try:** the Navigator tests the change on its preview with the checklist, then approves.
2. The engine merges `work/<n>` into `stage`; staging now holds every approved change.
3. **Go live** (Release gate, role-gated): the engine opens a `stage` → `main` pull request, merges it when checks are green, waits for Vercel's production deploy, then **smoke-tests the live site** and posts the evidence.
4. If the live check fails, the engine proposes a rollback (Vercel instant rollback); the Navigator confirms.

## 5. The Work item page (the heart of the product)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ #14 Shop assistant should remember the shopper's budget      Navigator: P │
│ ● Discuss ─ ● Design ─ ◉ Plan ─ ○ Build ─ ○ Prove ─ ○ Try ─ ○ Release ─ ○ Learn │
├──────────────────────────────┬────────────────────────────────────────────┤
│ Thread (all stages)          │ The current stop's artifact                │
│ · You: shoppers keep…        │   Design:  markdown editor + preview,      │
│ · Claude: three options…     │            versions, "Approve design"      │
│ · GPT (panel): consider…     │   Plan:    steps ☐/☑, reorder, constrain,  │
│ · You: go with option 2, but │            "Approve plan"                  │
│   no cookies                 │   Build:   live log, step status, commits  │
│ · Claude: design ready ↗     │   Prove:   tests (new + regression), data  │
│                              │            runs, verdict                   │
│ [ Ask… ] [ Ask the panel ]   │   Try:     preview link + checklist        │
└──────────────────────────────┴────────────────────────────────────────────┘
```

Left is the conversation that never goes away. Right is whatever the current stop produces. Top is where we are. That is exactly the shape of a Customer Zero session.

## 6. The Protocol (the engine's standing orders)

Written once as a Strategic Machines skill (versioned), injected into every run, and **checked by the runner**:

| Order | Runner check (blocks the step if it fails) |
|---|---|
| Design before code, unless the item is AC1 | Build can't start without an approved design (or AC1) |
| Work in small numbered steps from the approved plan | Each run executes exactly one step; plan changes need re-approval |
| Every step adds or updates tests | Step diff must touch test files, or carry a stated reason the judge accepts |
| Never weaken the suite | Test count can't drop; held-out suites untouched |
| Typecheck, lint, tests green before "done" | Commands run by the runner, results stored as evidence |
| Data only in test | Runner holds only test keys; production has none |
| Ask before proceeding (per cadence) | Next step waits for the Navigator unless cadence says run |
| Report plainly | Each step ends with: what changed, what's proven, what's next |

This is why it felt like magic with Customer Zero: good habits from the model, reinforced by ts-platform's `CLAUDE.md` and by you saying "go" at the right moments. Here the habits are written down and enforced.

## 7. The runner (built first)

- **What:** `apps/runner`, a long-running Node process. Picks jobs from `acc_jobs`, runs them, streams events to `acc_job_events` (the Build log the Navigator watches live).
- **Engine:** two small adapters behind one interface, chosen by the site's model settings (F15):
  - **Thinking jobs** (discuss, design, plan, judge): one `complete(model, messages)` call per provider (Anthropic, OpenAI, xAI, Google).
  - **Build jobs:** an agent harness that reads, edits and runs commands. Launch: the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`), the same loop as Claude Code. Next: OpenAI Codex behind the same `build(step)` interface.
  - Instructions for every run: the site's `CLAUDE.md`, the Stack card and the Protocol.
- **Workspace:** a git worktree per Work item on branch `work/<n>-<slug>`, cut from the site's base branch. Machine Shop: a local repo path until it has GitHub. Later: a GitHub App + a hosted sandbox.
- **Jobs:** `discuss` (reply in the thread) · `design` (write/revise design.md) · `plan` (write steps) · `build_step` (one step, then the Protocol checks) · `prove` (full suite + data scenarios + evidence).
- **Keys:** the site's **development** env only (envmachine for now, the vault later). Never production.
- **Limits:** per-job token and time caps, from the site's spend limits.

## 8. Data (migration `0004_flywheel.sql`)

| Table | Holds |
|---|---|
| `acc_work` | Work item: site, number, title, stage, cadence, risk, navigator, branch |
| `acc_work_messages` | The thread: author (person or model), body, stage |
| `acc_work_docs` | design.md versions: body, author, approved_by/at |
| `acc_work_steps` | Plan: order, title, detail, status (todo · running · done · blocked), evidence |
| `acc_jobs` / `acc_job_events` | Runner queue and live log |
| `acc_setup_items` | The Setup checklist: phase (install · checkout · agreement), item, owner, status, evidence |
| `acc_agreements` | Signed Agreement versions: body, signed_by, signed_at |
| `acc_site_models` | Model per role per site: role (consult · design · plan · build · judge · panel), provider, model, key source (customer · ours) |

Existing `acc_requests` rows become Work items at Discuss.

## 9. Build order (today)

1. Migration 0004 + domain types + API routes for Work items, thread, design, plan.
2. **Runner v0** on Machine Shop (local repo): `discuss` → `design` → `plan` → `build_step` with the Protocol checks (typecheck + tests + test-count), live events.
3. **Work item page**: rail, thread (with the model shown on every reply), markdown design editor (edit/preview/approve), plan checklist, live build log, evidence. **Models** settings per site (F15).
4. Bridge + nav: Work replaces Requests/Change Room; Needs-you cards for checkpoints.
5. **Setup page** (Install · Checkout · Agreement) with checkout jobs C1–C7; you board Machine Shop through it as a new customer.
6. Then: GitHub App + Vercel previews for Machine Shop (once its accounts exist), panel of models, Data Lab scenarios.

## 10. Owner decisions (2026-09-30)

- ✅ **"Navigator"** is the name for the person steering a Work item.
- ✅ **Models:** the customer picks per role (F15). Default for new sites: Claude for every role, Judge on a different Claude model; the Panel is added after the loop works.
- ✅ **Default cadence:** *every step* for new sites.
- ✅ **Staging on its own domain** (`stage.<domain>`) for every client.
