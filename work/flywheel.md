# The Flywheel — Design (v0.1, for approval)

*2026-09-30 · repo: `accelerator-platform` · refines [accelerator-control-room.md](accelerator-control-room.md) §4 (Loop), §5.14 (Consultations), §5.15 (Proof)*

**Goal.** Make the working rhythm of Customer Zero the product: **conversation → design → approval → plan → build → test → try → release → learn**, always visible, with a business person steering and an engine that proposes, asks, builds and proves. The Control Room pulls the person through it.

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
| F5 | **Panel of models for thinking, one builder for code.** Discuss and Design can ask the panel (Claude + others) in parallel; the Navigator pins ideas; Claude synthesizes. Only Claude edits code. A different model judges (held-out tests, review). |
| F6 | **The Protocol: standing orders, enforced by the runner** (not hoped for). See §4. |
| F7 | **Data Lab inside Prove.** The engine runs scripts and synthetic scenarios **only against the test database**, logs each run as evidence, and cleans up. Production data is read-only, through the Data Desk, with approval. |
| F8 | **Stack card.** Each site has a Stack card in the Library (framework, DB, payments, hosting, test tools, conventions) taken from its repo and `CLAUDE.md`. It is the given. Changing it is itself a Work item. |
| F9 | **The engine asks, visibly.** Checkpoints ("Step 3 of 7 done, tests green. Proceed to step 4?") appear as **Needs you** cards. The Navigator sets the cadence per item: *every step* · *only at risk* · *run to the end*. |
| F10 | **Everything compounds.** Each loop leaves: more tests, an updated Library (design doc, facts), better synthetic data. That is the flywheel. |

## 3. The Work item page (the heart of the product)

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

## 4. The Protocol (the engine's standing orders)

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

## 5. The runner (built first)

- **What:** `apps/runner`, a long-running Node process. Picks jobs from `acc_jobs`, runs them, streams events to `acc_job_events` (the Build log the Navigator watches live).
- **Engine:** the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`): the same agent loop as Claude Code (read, edit, run commands), with the site's `CLAUDE.md`, the Stack card and the Protocol as its instructions.
- **Workspace:** a git worktree per Work item on branch `work/<n>-<slug>`, cut from the site's base branch. Machine Shop: a local repo path until it has GitHub. Later: a GitHub App + a hosted sandbox.
- **Jobs:** `discuss` (reply in the thread) · `design` (write/revise design.md) · `plan` (write steps) · `build_step` (one step, then the Protocol checks) · `prove` (full suite + data scenarios + evidence).
- **Keys:** the site's **development** env only (envmachine for now, the vault later). Never production.
- **Limits:** per-job token and time caps, from the site's spend limits.

## 6. Data (migration `0004_flywheel.sql`)

| Table | Holds |
|---|---|
| `acc_work` | Work item: site, number, title, stage, cadence, risk, navigator, branch |
| `acc_work_messages` | The thread: author (person or model), body, stage |
| `acc_work_docs` | design.md versions: body, author, approved_by/at |
| `acc_work_steps` | Plan: order, title, detail, status (todo · running · done · blocked), evidence |
| `acc_jobs` / `acc_job_events` | Runner queue and live log |

Existing `acc_requests` rows become Work items at Discuss.

## 7. Build order (today)

1. Migration 0004 + domain types + API routes for Work items, thread, design, plan.
2. **Runner v0** on Machine Shop (local repo): `discuss` → `design` → `plan` → `build_step` with the Protocol checks (typecheck + tests + test-count), live events.
3. **Work item page**: rail, thread, markdown design editor (edit/preview/approve), plan checklist, live build log, evidence.
4. Bridge + nav: Work replaces Requests/Change Room; Needs-you cards for checkpoints.
5. Then: onboarding Machine Shop end to end (you, as a new customer), panel of models, Data Lab scenarios, preview deploys.

## 8. Open questions for the owner

1. **"Navigator"** as the UI name for the human steering a Work item: yes?
2. **Panel models:** Claude + GPT + Grok at launch, or Claude alone until the loop works (recommended: Claude alone first; panel in step 5)?
3. **Default cadence:** *every step* (recommended for new sites) or *only at risk*?
