# The Accelerator — Control Room Product Design (v0.1)

*Strategic Machines · 2026-09-28 · companion to [accelerator.md](accelerator.md) · status: design for review*

> **The goal:** a person who knows their business but not git, SQL or DNS runs their own website and gets changes live in hours or days, not the weeks a consulting firm takes. They decide what should change and judge whether it came out right. The engine does everything in between, and shows its work.

---

## 1. One level of abstraction up

For a year, Customer Zero (cypressresort.com on `ts-platform`) has been run at **Level 1**: an AI builds, and an expert human operates the machinery around it. The product is **Level 2**: the machinery disappears behind a Control Room.

| | **Level 0: the agency** | **Level 1: how we work today** | **Level 2: the Control Room** |
|---|---|---|---|
| Who writes code | Contractors | Claude, in an IDE | The engine, in cloud sandboxes |
| How work is requested | Tickets, email, calls | Chat with Claude, with backlog.md edited by hand | **Requests**: captured anywhere, triaged by the engine |
| Who handles git, PRs, branches | Contractors | **The owner** | The engine (the owner never sees a branch) |
| Who runs SQL, migrations, data fixes | Contractors | **The owner**, pasting scripts into Supabase | The engine, behind a gate, with a before/after preview |
| Who configures keys, domains, DNS | Contractors | **The owner** (envmachine, Vercel, Namecheap) | A **Connections** panel with wizards and connection tests |
| How the human checks quality | Reading status reports | Reading diffs, PRs, test output | **Trying a preview** against a checklist written for their domain |
| Knowing where things stand | Weekly status call | Asking Claude, reading backlog.md | **The Bridge**: a live dashboard |
| Time from request to live | Weeks | Hours to days, *if the owner is technical* | Hours to days, **for anyone** |

**The core insight from Customer Zero:** the AI was never the bottleneck. The owner's time went mostly to *plumbing*. On a single day (2026-09-25/26) that meant env loading, a broken `node_modules`, the Anthropic workspace header, Supabase SQL, Vercel domains, DNS records and a wrong-branch push. Where the owner added real value was **judgement**: what to build, what's right for guests, what the numbers should say, and whether a change looks right. Level 2 gives the human only the judgement.

---

## 2. Design principles

1. **Speak outcomes, not artifacts.** The interface says *request, change, preview, live, undo*. Never *branch, PR, migration, commit*. An **Engineer view** toggle reveals the real artifacts (PR links, diffs, SQL) for technical users like the founder.
2. **Show, don't tell.** Every change arrives with before/after screenshots, the same visual diff that made the GitHub image compare so persuasive. For data changes, it's before/after rows.
3. **The human's attention is the scarcest resource.** One queue, **Needs you**, holds every decision, approval and test request, sorted by what unblocks the most work.
4. **Evidence over trust.** The builder never grades its own work (accelerator.md §3). Every change shows *why it's safe* in plain language.
5. **Nothing irreversible without a gate; everything has undo.** Money, data, auth and public copy wait for the human. Every release has one-click rollback.
6. **The docs are the memory.** Rulebook, decisions, designs and backlog live as Markdown in the repo (the Customer Zero discipline). The Control Room renders them beautifully and keeps them current, so the site's knowledge never lives only in someone's head or in a vendor's database.
7. **Model-agnostic.** Claude, GPT or the next model plug into roles (builder, judge, investigator). The customer's knowledge is never locked to one vendor.

---

## 3. The core objects (the vocabulary a functional user learns)

| Object | What it is | Under the hood |
|---|---|---|
| **Site** | The property being managed | A GitHub repo + a Vercel project + databases |
| **Request** | Anything someone wants changed or thinks is wrong: a blurry photo, a confusing checkout, a wrong revenue total, a new feature | A backlog item with a permanent number (the backlog.md convention) |
| **Change** | The engine's answer to one or more requests | Branch off `stage` → PR → preview deploy |
| **Preview** | A private link to try the change before anyone else sees it | A Vercel preview deployment |
| **Evidence** | The plain-language case that a change is safe | Tests, invariant checks, judge verdict, screenshots |
| **Gate** | A decision only a human can make | Branch protection + required approval |
| **Release** | A change going live, with undo | Merge `stage` → `main`; Vercel promote/rollback |
| **Knowledge** | Rulebook, decisions, designs, backlog, runbooks | `/docs/*.md` in the repo (or a docs repo like `cypress-actions`) |
| **Signal** | Anything the engine watches: uptime, errors, speed, SEO, security, data integrity | Monitors + the Fit Scan run continuously |

---

## 4. The Loop: the process that makes it fast

> **Refined by [flywheel.md](flywheel.md) (v0.1, for approval):** conversation-first Work items on one visible rail, with a design doc, a plan, and the Protocol enforced by the runner.

Every request moves through eight steps. The human owns three of them (**bold**).

```
Capture → Clarify → **Commit** → Build → Prove → **Try** → **Ship** → Watch
```

| Step | Who | What happens | Customer Zero equivalent |
|---|---|---|---|
| 1. Capture | Anyone | A request comes in from the Control Room, a screenshot, a forwarded email, voice, or **point-and-complain** on the live site (click the element, describe the problem) | The owner typing into chat |
| 2. Clarify | Engine | Restates the request in plain words, asks **at most three** questions, and shows a mockup if it's visual. Classifies it (content · design · workflow · data · bug · feature), removes duplicates, estimates size and risk | Claude asking questions; design docs |
| 3. **Commit** | **Human** | Now / Next / Later. One tap. | Owner picks backlog priorities |
| 4. Build | Engine | Writes the change in an isolated sandbox, following the site's rulebook | Claude in the IDE |
| 5. Prove | Engine (judge) | Tests, invariant checks, a second model's review, visual diff, generated evidence | `pnpm test`, the oracle QA |
| 6. **Try** | **Human** | Opens the preview with a **test checklist written in the domain's language** ("Book The Laurel for 2 nights with the VIP package; confirm the folio shows one line"). Approve, or send back with a note or screenshot | Staging walkthroughs by the owner |
| 7. **Ship** | **Human** (or automatic for low-risk classes) | "Go live." The engine merges, deploys, verifies the live URL | Owner merging and pushing |
| 8. Watch | Engine | Watches errors, speed and data integrity after release, and suggests rollback if something degrades | Owner noticing a number looks wrong |

**Why the domain expert makes it fast.** Step 6 is where a functional person beats a consultancy. They know in thirty seconds whether the booking flow is right for a guest; an agency needs a week to find out. The product's job is to get them to that thirty-second moment as fast as possible, and to make everything else invisible.

**Autonomy by risk class** (from accelerator.md §3.3). Copy fixes, image swaps and dependency updates can skip "Try" and ship on evidence (AC1). Features wait for "Try" (AC2). Anything touching money, data or auth always stops at a gate.

---

## 5. The interfaces

### 5.1 The Bridge (home)
What the human sees first. One screen answers: *Is my site OK? What's moving? What do you need from me?*

- **Five gauges:** Site health · Time to live · Open requests · Quality · Spend (§6).
- **Needs you:** decisions, approvals and "please try this" requests, each one tap away. This is the most important element in the product.
- **In flight:** every change as a card moving along the Loop, from Clarifying to Live.
- **Recently live:** what shipped, with before/after thumbnails and an Undo button.
- **Signals:** anything the engine noticed on its own ("Checkout got 40% slower after Tuesday's release", "3 pages are missing a meta description").

### 5.2 Requests (the backlog, humanised)
- **Capture from anywhere:** a box that takes text, a screenshot or voice, plus a browser **point-and-complain** overlay for the live site, and email forwarding.
- **Triage by the engine:** type, affected pages, suspected cause, size, risk class, duplicates merged.
- **Views:** Now / Next / Later, a board by Loop stage, or a list with permanent numbers (#57, as in backlog.md today).
- **Everything is two-way synced** with the backlog Markdown in the repo.

### 5.3 The Change Room (one per change)
Where a change is discussed, shown and approved. Three columns:
1. **Conversation:** the thread with the engine (the Claude/GPT intermediary), including clarifying questions and the human's decisions, recorded automatically.
2. **The change:** plain-language summary · before/after screenshots (side-by-side, swipe, onion skin) · for data changes, before/after rows · the linked design doc.
3. **Evidence and actions:** checks passed · the judge's verdict · risk class · the **domain test checklist** · buttons for **Open preview**, **Approve**, **Send back**, **Go live**, **Undo**.

The **Engineer view** toggle adds the PR, diff, SQL and logs.

### 5.4 The Data Desk
For complaints about data: "the July tax report shows $179 unattributed", "the dashboard says $700 pending but the folio says $350."
- The engine runs **read-only investigations first**, the Customer Zero `…_READONLY.sql` discipline. It explains the findings in plain words with the rows that matter.
- Proposes a fix as a **gated data change**: before/after rows, the count affected, and a rollback script prepared *before* running.
- **Standing integrity checks** (ledger balances, paging, orphans) run as monitors on the Bridge.

### 5.5 The Library (knowledge)
The site's Markdown docs, rendered like a wiki: Rulebook (the site's CLAUDE.md, in plain words) · Decisions · Designs · Backlog · Runbooks · Release notes.
- Every change links to its design and every decision links to its request.
- **Drift detection:** "The rulebook says catalog items need a refund policy; the code allows none." This is the *doc↔code drift* list from Customer Zero, automated.
- A **Facts registry** for public copy: "Waterfall height: 55 ft." The engine flags contradictions on the site. (Real case: the site says both 50-foot and 55-foot.)

### 5.6 Metrics
§6 below, with trends and drill-down.

### 5.7 Releases
A timeline of everything that went live, with one-click **Undo** (Vercel instant rollback) and auto-generated release notes in plain language.

### 5.8 Connections & Permissions
Everything the engine needs to reach, set up once, tested continuously.
- **Connections:** GitHub · Vercel · databases (test and production) · Stripe · image/CDN (Cloudinary) · DNS/domain · email · analytics · LLM providers.
- **Wizards with live connection tests,** so problems surface at setup, not at 11pm. They would have caught the Anthropic "workspace header required" error and walked through the Namecheap records.
- **A secrets vault per environment** (development · preview · production). This replaces the hand-built `envmachine` folders. Secrets never enter the repo and never enter an AI prompt.
- **Engine permissions by role:**
  - the **builder** writes only to branches and never touches production data
  - the **judge** is read-only
  - the **data investigator** is read-only on production
  - the **release manager** alone can merge, and only through gates
- **Human roles:**
  - **Owner:** everything, including money gates
  - **Operator:** runs the loop
  - **Tester:** tries previews
  - **Viewer:** read-only
- **Spend limits** per model provider, plus a daily cap (the Fit Scan spend-guard pattern, generalised).
- **Model routing:** which model plays builder, judge or investigator, and a fallback for each.

### 5.9 Onboarding (commissioning, productised)
Connect a GitHub repo (public or private) → **Fit Scan** + repo scan → the engine drafts the **Rulebook** (architecture, invariants, don't-touch zones) → a **15-minute owner interview** captures the business rules → the engine installs guardrails (branch protection, a `stage` branch, preview deploys, CI) → **baseline health** → the first 10 requests seeded from the scan. This is accelerator.md §4's six-week commissioning, compressed for simple sites and assisted for complex ones. The one-time **installation fee** covers it.

### 5.10 Configuration: the env manifest
A technical page, filled in during onboarding, that answers one question: **does every environment have every key this site needs?**
- **One row per key:**
  - its name (e.g. `STRIPE_WEBHOOK_SIGNING_SECRET`)
  - the service (Supabase, Stripe, Cloudinary…)
  - what it's for, in plain words
  - which parts of the site use it
  - whether it's a secret
  - **where to find it** ("Stripe → Developers → Webhooks → endpoint → Signing secret")
  - a status per environment: **Set · Missing · Rotate · not needed**
  - when it was last verified
- **Built at onboarding:** the engine reads the repo's `.env.example` and the code, drafts the manifest, then the owner or their developer pastes values into the vault.
- **Values are never shown or stored in the manifest.** They live in the encrypted vault and are injected only into sandboxes and deploy targets.
- **A "to fix" banner** calls out missing and stale keys. A missing preview key is the classic reason "it works in preview but not production", or the reverse.
- **"Test everything"** re-tests every key and connection. It would have caught the Anthropic workspace-header 400 on day one.
- The same page carries **Connections** (§5.8), **what each AI role may do**, and **People**.

### 5.11 Skills registry
What the agents know how to do, as named, versioned skills that can be switched on or off per site. **Ours come preconfigured** for engineering and design management of a site:
- Next.js, Supabase RLS, Stripe, ledger and money rules
- Lighthouse remediation, SEO and social previews
- synthetic data and journey tests
- requirements from conversations, design docs, architecture triage

The site's **own skills** capture how its business works (e.g. "Hospitality booking rules"). They're written with the customer and compound in value over time. Skills are the reusable know-how that makes one site's lessons apply to the next.

**No vector embeddings.** Context comes from the Library and the site's skills, assembled per task for long-context models. That's simpler and more predictable than retrieval, and there's no index to go stale.

### 5.12 Account & usage
- **Subscription:** the plan (Commission / Operate / Managed), a monthly fee, and the **one-time installation fee**.
- **Payment card:** handled in Stripe's secure form; we never see the full number.
- **Invoices.**
- **Usage meters** by model and role: tokens in/out, cost, and percentage of limit (Builder, Judge, Voice consultations, Routing).
- **Limits:** a monthly limit per model plus a daily cap. The engine **pauses and asks** before crossing any of them. This is the Fit Scan spend guard, productised.

### 5.13 Health: Lighthouse built in, plus architecture triage
- **Lighthouse on demand:** "Run Lighthouse" on any page (a real audit via Google PageSpeed), plus nightly runs on key pages. The owner sees performance, accessibility, best practices and SEO without leaving the Control Room.
- **Architecture triage.** Some sites arrive **critically ill**: tangled, untested, risky to touch. The Health page places a site on a four-stage scale and shows a **treatment plan** that moves it along:
  1. **Critical:** fragile; changes break things.
  2. **Stabilizing:** safety nets first. Backups, error alerts, branch protection, tests around money and checkout. No new features until they pass.
  3. **Recovering:** repair one area at a time, each step shipped and tested (logic into one place, dead code out).
  4. **Healthy:** small, tested, reversible changes, kept current.
- **Vital signs,** each with a 0–100 score, a plain reading and a trend:
  - Stability (rollbacks, escaped defects)
  - Test protection (money paths vs pages)
  - Structure (logic in one place, circular dependencies)
  - Type safety
  - Freshness (framework versions)
  - Rulebook fit (doc↔code drift)
- **Hotspots:** files that change often *and* carry risk, where every edit gets the full test suite.
- **Why it's the hardest and most valuable part:** taking in a mess and making it maintainable is exactly what agencies bill the most for and deliver the least on.

### 5.14 Consultations: conversation → requirements → design → build
A **consulting agent** holds the conversation, by chat, in a meeting, or by **realtime voice** (OpenAI's realtime voice models are remarkably good at this). The pipeline is shown as a progress strip:
1. **Conversation:** the transcript is captured.
2. **Requirements:** extracted from the transcript, each one confirmed or queried.
3. **Owner approves.**
4. **Design doc:** written into the Library, with every open question resolved.
5. **Build + test:** the engine refactors, adds tests and retests.
6. **Preview → live.**

Nothing gets built on an unconfirmed requirement.

### 5.15 Proof: the testing flywheel
Customer Zero's biggest confidence win, made a first-class page. The loop runs the same way for every change: **resolve → add tests → retest → confirm → deploy**.
- **A readiness verdict:** **Ready to ship** or **Needs work**, with a plain reason.
- **Eight layers:**
  1. types
  2. lint
  3. unit
  4. **money rules (oracle)**
  5. **guest journeys**
  6. visual before/after
  7. speed, SEO and sharing
  8. data integrity

  Each layer shows pass/fail, count, duration and who wrote it. **Held-out** suites are written by the judge, so the builder can't weaken them.
- **Synthetic data that mirrors production:** real shapes and volumes, no real people (guests and stays, ledger entries, card-payment patterns). New changes are tested against it before anyone tries them, so **one-shot deployments become the norm**. It's TDD made real for business rules.
- **Recent verdicts,** including honest "needs work" results ("Money rules: 2 totals off by $5.00. Sent back to build.").

### 5.16 Code (Engineer view)
With Engineer view on, a **Code** page appears: the repository's file tree with an **embedded editor** (Monaco, the VS Code editor). It's read-only in v1; edits still go through the loop, so every change is tested and gated. Elsewhere, Engineer view reveals the PR, branch, files, SQL and model details behind each screen.

---

## 6. Why buy this instead of setting it up yourself

A capable team could wire Claude Code, GitHub and Vercel together. What they can't easily build is the system around it:

1. **The testing flywheel with a trustworthy verdict** (§5.15): layered, held-out, run the same way every time, on production-shaped synthetic data. This is what made Customer Zero's owner comfortable shipping without reading code.
2. **Consultations that end in approved requirements and designs** (§5.14): conversation (including voice) → requirements → owner approval → design → build. Consultancies charge the most for this part.
3. **The Change Room** (§5.3): conversation, visual before/after, evidence and a domain-language checklist in one screen.
4. **The Data Desk** (§5.4): read-only investigations, row-level previews of fixes, and **standing data checks** every morning.
5. **The Library** (§5.5): the site's knowledge organized for immediate inspection, with drift detection and a Facts registry. It's how the owner controls the architecture without reading code.
6. **A preconfigured skills registry** (§5.11): the engineering and design know-how comes installed on day one.
7. **Health with triage** (§5.13): Lighthouse built in, plus a real plan for sites that arrive critically ill.

More differentiators worth building:

8. **Replay proof in business terms:** "Totals identical on all 214 past package stays." Evidence the owner understands without a single technical word.
9. **An impact map for large sites:** for sites with thousands of pages, show exactly which pages a change touches, and screenshot only those, plus a rotating sample.
10. **A weekly audio briefing:** a spoken, two-minute summary of what shipped, what's waiting on you, and how the site is doing. It uses the same voice capability as consultations, and it's the habit that keeps an owner engaged.
11. **Portable by design:** everything is stored in open formats (Markdown docs, test files, the repo). Customers and system integrators trust a product they could leave, and the accumulated value is why they don't.
12. **Cost per change against the agency:** "$6.10 per change vs. $1,140." It's on the Metrics page, and it's the renewal argument.

---

## 7. Metrics: how the human knows where they are

Five headline gauges on the Bridge, each with a plain-language sentence under it.

| Gauge | Measures | Example sentence |
|---|---|---|
| **Site health** | Uptime, errors, speed (Lighthouse), SEO, security headers, data-integrity checks | "Healthy. One warning: 4 security headers missing." |
| **Time to live** | Median hours from request to live, by class | "Content changes: 3 hours. Features: 2.5 days." |
| **Open requests** | Count by Now/Next/Later, plus **backlog half-life** | "12 open; half of today's backlog will be done in 9 days." |
| **Quality** | First-pass approval rate (approved without send-back), escaped defects, rollbacks | "92% approved first time. 0 rollbacks this month." |
| **Spend** | AI + hosting spend against budget; cost per change | "$214 of $500 this month; $6 per change." |

Second-level metrics: autonomous coverage (the share of changes shipped on evidence alone), human minutes per change, time waiting on the human vs. on the engine, and requests by source.

**The number to sell on:** time to live, compared with the agency baseline the customer had before ("Your agency averaged 11 days. The Control Room: 1.4 days.").

---

## 8. Lessons from Customer Zero → product requirements

Each row is something that actually happened, and what the product does so a functional user never meets it.

| What happened with Customer Zero | What the Control Room does |
|---|---|
| The env-loading "magic spell" (`dotenv -e …`) was forgotten | Environments and secrets are managed; there's no terminal |
| Pushed `main` from the wrong branch; a new branch silently tracked `stage` | The release manager owns git; branch protection is installed at onboarding |
| Moving the folder broke `node_modules` | The engine builds in cloud sandboxes; nothing is installed locally |
| SQL files pasted into Supabase by hand | Migrations apply through a gate, with a preview and prepared rollback |
| The Anthropic key needed a workspace header (a 400 on every call) | Connection tests at setup show the exact fix |
| Vercel domains, `www` redirects and Namecheap DNS records | A domain wizard: detect the DNS provider, give exact records, verify, flag canonical mismatches |
| "Why isn't the fix live?" (it was never pushed) | Every change shows its true state (built · preview · staging · live), verified against the live URL |
| CRLF warnings, a lint crash, a transient tool outage | Engine hygiene; invisible to the human |
| Owner decisions scattered across chat and `production-data-issues.md` | A Decisions log, captured automatically from conversations |
| A dashboard double-count found by the owner eyeballing numbers | Standing data-integrity monitors on the Bridge |
| 50-foot vs 55-foot waterfall on different pages | The Facts registry and consistency checks |
| Social previews broken for months, found only by running a tool | Continuous Fit Scan / Lighthouse / OG checks as Signals |

---

## 9. Under the hood (architecture)

**Repository:** `accelerator-platform`, a Turborepo + pnpm monorepo (the product; the marketing site stays separate):

| Path | Status | What it is |
|---|---|---|
| `apps/api` | **Built (v0)** | The API server: all logic and the only data access (ts-platform's "one rule"). Resolves caller and tenant from the credential. |
| `apps/console` | **Built (v0)** | The Control Room, Next.js 16 + Tailwind 4. One Control Room per site. |
| `packages/domain` | **Built, tested** | Types, **gate policy** (deterministic: models classify, policy decides), loop state machine, metrics. |
| `packages/api-client` | **Built** | The one typed client every app uses. |
| `apps/runner` | Next | The agent runtime: job queue, per-job sandboxes, git / Vercel / database / browser tools. Long-running, so not Vercel functions. |
| `apps/ops` | Later | Internal mission control across tenants (Managed Operator service). |

A prospect **demo** is a tenant (seeded, reset nightly), not a separate app.

**Tenancy and data:**
- **Structure:** organization → sites → members (Owner, Operator, Tester, Viewer).
- **Database:** Supabase Postgres with `org_id` on every row and RLS (`supabase/migrations/0001_init.sql`).
- **Documents and conversations:** `jsonb` columns.
- **Files** (screenshots, attachments): Supabase Storage.
- **Search:** no vector embeddings.
- **Customer assets stay in the customer's accounts** (GitHub, Vercel, database). The platform stores the management layer.

- **Control Room app:** Next.js on Vercel, with Supabase for auth, requests, events, evidence and metrics. It dogfoods the same stack it manages.
- **Repo access:** a GitHub App with fine-grained permissions. The repo stays the source of truth for code **and** docs.
- **Deployment:** the Vercel API for previews, promote/rollback, domains and environment variables.
- **Engine roles** (model-agnostic, per accelerator.md §7):
  - **Intake:** triage and clarification
  - **Builder:** coding in a sandbox, e.g. Claude Agent SDK or Anthropic Managed Agents
  - **Judge:** a different model plus tests
  - **Data investigator:** read-only SQL
  - **Release manager:** git, deploys, rollback
  - **Librarian:** docs, backlog numbering, drift
  - **Watcher:** monitors
- **Visual evidence:** headless browser screenshots of affected pages on `main` and on the preview, diffed.
- **Secrets:** an encrypted vault per environment. Injected only into the sandbox and the deploy target, never into prompts or the repo.
- **Guardrails:** the interlocks from accelerator.md §3.4, enforced (not conventions). No production write keys in the builder, spend caps, loop limits, full provenance.

---

## 10. MVP and phases

**Built so far (2026-09-29):**
- **The Control Room and API run end to end** against a seeded demo tenant (Cypress Resort). All 15 pages work: Bridge, Requests, Change Room, Consultations, Proof, Data Desk, Library, Health, Releases, Metrics, Configuration, Skills, Account & usage, Code, Onboarding.
- **Real behaviour:**
  - request capture with triage
  - approve-after-try, enforced by the gate policy (16 tests)
  - tenant isolation
  - a live Lighthouse run
  - skill toggles and spend limits
- **Connected to Supabase (accelerator-test):**
  - migrations 0001 + 0002 applied
  - the demo tenant loaded by `pnpm seed:demo`
  - end-to-end test 20/20 against the real database, and data survives a server restart

  The API uses Supabase whenever the startup script injects keys, and the in-memory demo otherwise.
- **Built (2026-09-29): accounts, sign-in and Platform Admin** → [accounts-auth-admin.md](accounts-auth-admin.md).
  - One-step sign-in: email link or texted code (emulated outside production).
  - Role maps in one file: platform Owner · Admin · Staff; site Owner · Operator · Tester · Viewer. The API enforces; the console only hides.
  - Platform Admin: overview (revenue, AI spend, texts), accounts, new account + owner invite, suspend/resume, audit log, team.
  - Pending: migration 0003 on accelerator-test and a live sign-in test.
- **Then:** the **runner spike** (an agent taking a real Cypress request through build → tests → preview → evidence, unattended).

| Phase | Scope | Proves |
|---|---|---|
| **v0.1 (≈6 weeks)** | Connect GitHub + Vercel · Requests inbox (text + screenshot) · Change Room with conversation, preview link, before/after screenshots, Approve / Send back / Go live · Library (render `/docs`, sync backlog.md) · Claude as builder, a second model as judge · Bridge with Needs you, In flight and the time-to-live gauge | A non-engineer can take a request to live without touching git |
| **v0.2** | Data Desk (read-only investigation + gated fixes) · Connections vault with connection tests · roles and permissions · point-and-complain overlay · Facts registry | Data and configuration work without the terminal |
| **v0.3** | Signals (continuous Fit Scan, Lighthouse, uptime, integrity monitors) · Releases timeline with Undo · onboarding wizard · spend limits and model routing | Self-serve onboarding; the Bridge becomes the daily habit |

**Dogfood order:** run cypressresort.com through v0.1 first (Customer Zero again, now at Level 2), then strategicmachines.ai, then the first external customer.

---

## 11. Open questions

1. **Who is the first functional user?** A Cypress staff member (Tanner or Chris) running content and catalog changes would be the ideal first test of the thesis.
2. **Pricing unit:** per site, with change volume tiers (accelerator.md §8)?

*Deferred by the owner (2026-09-28), to address later:*
- **Docs home:** a `/docs` folder in each site's repo, or a paired docs repo (the `cypress-actions` model)?
- **How much Engineer view to expose by default** for each role.

*Clickable prototype of the Control Room (example data, private link): https://claude.ai/artifact/WTwT2jboK9yemMfgnCJcdd*
