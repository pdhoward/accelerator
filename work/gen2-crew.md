# Gen 2 — Executive Governance, Expert Crew, Capability Inventory (Design v0.13)

*Strategic Machines · foundation 2026-10-10 · revised 2026-10-17 · **status: Owner authorized staged platform construction on 2026-10-15, beginning with Executive Briefing, Delivery Studio, expandable Mission Control/Proof Lab and recorded replay. Existing gates and production-action boundaries remain.** · repo: `accelerator-platform`*
*Implements the decisions in [newvision.md](newvision.md) §9–10. Refines [flywheel.md](flywheel.md) (the rail stays) and replaces [accelerator-control-room.md](accelerator-control-room.md) §5 (the 15 pages). Extends [accounts-auth-admin.md](accounts-auth-admin.md) with the partner layer (§5).*

**How to use this doc:**
- §0 holds the rules no change may break.
- §1–5 are the design.
- §4.5 is the build order.
- §7 is the decisions log.
- §8 is the action list. Tick items there as they're done.
- §9 covers agent interfaces: APIs-first MCP (WebMCP optional), Stripe, the Decide layer (Jev), understanding artifacts (Karpathy's ladder), live voice agents and generative forms.
- §17–§20 (2026-10-17) define the workbench fast path (complexity tiers and the TDD plane), the Change Ledger, the Cockpit and domain packs.
- §14 defines approved staged execution/recovery protocols; §15 records UX alternatives for review, not a selected interface.
- §13 defines continuous change assurance, source-linked business rules and migration-grade safeguards for everyday improvements.
- §12 defines the upgraded public starting-point assessment and the boundary between public technical evidence and business intent.
- §11 records the 2026-10-14 decisions: collaborative requirements and TDD, synthetic QA, context selection, event-driven crews, saved threads and executive marketing.
- §10 defines executive governance, the shared meeting workspace, the capability inventory, vital signs, engineering assurance and product validation. It governs the human experience across §1–9.
- Code is the evidence of what is implemented; this document defines the target. Record gaps explicitly rather than treating planned behavior as shipped. Reconcile implementation and completion records in each change.

> **What Gen 2 is.** An expert team that knows the client's digital business, improves it safely, and shows the evidence. The client **governs like an executive**, using business vital signs, priorities, budgets and consequential decisions. One accountable **Team Lead** coordinates the specialist crew in a shared meeting workspace. A durable **capability inventory** makes the site understandable in business terms and traceable to engineering assets. The crew works through the governed **Toolbelt**, retains knowledge in the **Library**, and improves through evaluated **Skillsmith** proposals. Four client screens: **Overview · Work · Site · Crew & Knowledge**. Operators also have the **Crew Lab**.
>
> **Test site: Machine Shop** (`machine/machineshop`, github.com/pdhoward/machineshop). Every Gen 2 capability is proven there first. **Cypress Resort (`ts-platform`) is a live production platform serving real guests. It is never a test target** and stays our *Customer Zero story*, not our sandbox.

---

## 0. Foundation rules (no change may break these)
1. **The one rule:** all logic and data access live in `apps/api` + `packages/domain`. Clients use `packages/api-client` (REST); agents use the Toolbelt (MCP). Two doors, one implementation.
2. **The tenant comes from the credential, never from input**, through every door: member session, job token or partner session. No tool or route takes a tenant id it then trusts.
3. **Tenancy has four levels:** Platform → Partner → Company → Site (§5). Every company has exactly one partner. Strategic Machines' direct clients belong to the **house partner**, which has no special code path.
4. **Agents never hold credentials.** Credentials live in the vault and are attached by the Toolbelt on the server. A sandbox holds only test-environment values.
5. **A specialist is a configuration** (skills + tools + permissions + model), never a separate program. Least privilege comes from what tools a specialist can see.
6. **Discovery ≠ exposure.** Anything generated or discovered (tools, skills, specialists, manifest rows) arrives **disabled**, as a diff a human approves, with versions and rollback.
7. **Gates are deterministic policy** (`packages/domain/src/gates.ts`), enforced inside the tool call. Models classify; policy decides. Money, data, auth and security always need the client's Owner. Partner and platform staff never hold a client's gates.
8. **The client owns its knowledge.** Site and company skills, decisions, designs and the Library go with the client, in open formats, exportable any time. Partner skills belong to the partner. Crew skills belong to Strategic Machines.
9. **Hosted only. No open source,** and no self-hosted licenses. Still, keep the seams clean: the Toolbelt, Library format and runner adapters are packages behind interfaces, and the proprietary parts (crew catalog, Skillsmith, test bench, Boarding automation) plug into them.
10. **Platform ≠ house partner.** Platform powers are infrastructure only. Access to any partner's clients needs an explicit, time-boxed, audited support grant.
11. **Test on Machine Shop; never on Cypress.** Every phase ships green: run `pnpm typecheck && pnpm test` locally before every push. *For our own repos* (two developers: the owner and Claude) we work on `main` and push to production. No `stage` branch and no CI until a second contributor or the first paying client (decision D15). **Client sites** still get the `work/<n>` → preview → `stage` → `main` path from Boarding.
12. **Break-glass:** the platform repo must always be workable directly, without the platform (§4.7).
13. **The client governs; the crew coordinates.** The Team Lead owns specialist handoffs, execution and synthesis. The executive sets outcomes, approves authority and resolves consequential exceptions; routine internal steps stay within the approved mandate (§10.1).
14. **Visible state must be true.** Vital signs, specialist presence, action results and progress come from server records, with source and freshness. Missing, stale or insufficient evidence is explicit. Demonstration data is labelled and separated from live records.
15. **Capabilities persist; work changes them.** Business capabilities have stable identities and traceable requirements, technical assets and evidence. Current operational condition and change progress are separate dimensions (§10.3).
16. **Engineering proof underpins business assurance.** Typed contracts, deterministic policy, meaningful Vitest tests, integration checks and browser QA establish acceptance. A model report, passing test count or successful HTTP response alone is not proof of the business promise (§10.5).

---

## 1. What an MCP server practically changes

### 1.1 Today (Gen 1)
- The **runner** builds a site's environment from `envmachine` files plus the vault (`devEnv()` in `apps/runner/src/jobs.ts`) and hands it to the Claude Agent SDK. **The agent's shell holds the keys.**
- Every capability (GitHub, Vercel, Lighthouse, the database) is reached either by the agent running commands with those keys, or by a hand-written route in `apps/api`.
- The runner's instructions are hard-coded system prompts (`apps/runner/src/prompts.ts`), with one set per job kind.
- Model-agnosticism stops at the build step: only Claude has a harness wired in.

### 1.2 Gen 2: the Toolbelt is an MCP server inside `apps/api`

```
 Claude Agent SDK ─┐                                      ┌─ GitHub (official MCP / REST)
 OpenAI / Codex ───┼─ MCP over HTTP ─▶  apps/api /mcp  ───┼─ Vercel (official MCP / REST)
 client's own      │  Bearer <job or     THE TOOLBELT     ├─ Supabase · MongoDB (read-only)
 Claude (later) ───┘  member token>      ─────────────    ├─ Lighthouse · screenshots
                                         1 resolve tenant ├─ Library (read / propose)
                                         2 filter tools   └─ Rail (post, ask, report)
                                         3 check gate
                                         4 attach credential (vault)
                                         5 call · redact · meter · audit
```

**Seven practical changes:**

1. **Agents never hold keys.** A job gets a **short-lived job token**, minted by the API for one job and bound to `partner · org · site · work item · specialist · expiry`. The agent calls `vercel.deploy_preview` or `mongo.find_readonly`, and the Toolbelt attaches the credential from the vault on the server side. The only secrets left in a sandbox are the **test-environment values** the app needs to boot and run its tests (e.g. a read-only test `MONGODB_URI`). Those are low-value by design. **`envmachine` retires.**
2. **A specialist *is* its tool list.** The MCP `tools/list` response is filtered by the specialist's allowlist. The Builder never sees `release.promote`; the Judge never sees `repo.write`. Least privilege is enforced by what exists in the agent's world, not by a prompt asking it to behave.
3. **Gates move into the tool call.** `release.promote` checks the gate policy (`packages/domain/src/gates.ts`) *inside* the Toolbelt. Without an approved release on the rail it returns "needs the Owner's approval" and posts a Needs-you card. An agent can't talk its way past a gate.
4. **One audit trail for every action.** Each call writes a row: who (specialist + model), which job, which tool, input summary, result, cost and time. That row is the **evidence**, and it feeds the Library's history (§3). Uber's "built-in observability", for free.
5. **Model-agnostic for real.** The Claude Agent SDK, OpenAI's agent tooling and most harnesses speak MCP. Point any of them at the same Toolbelt and they get the same tools, gates and audit. Swapping the builder model becomes a setting, not a port.
6. **Don't write connectors; front them.** GitHub, Vercel, Supabase, Stripe and MongoDB publish official MCP servers or clean REST APIs. Uber's third-party pattern applies: the Toolbelt **proxies** them, holding the credential and filtering, gating, redacting and auditing each call. We write adapters only where no good server exists, or where we want a safer, smaller tool (e.g. `mongo.find_readonly` with a forced `limit`).
7. **Tools are thin wrappers over the same `lib/` functions the REST routes use.** The console keeps calling REST through `packages/api-client`, and agents call MCP. The **one rule** holds: a single implementation of every rule in `apps/api` + `packages/domain`, with two doors in front of it.

### 1.3 Multi-tenancy through the Toolbelt
The MCP door follows the same tenancy rule as REST: **the tenant comes from the credential, never from input.**

| Concern | How Gen 2 handles it |
|---|---|
| **Which tenant?** | The token (job or member) resolves `org_id` and `site_id`. **No tool takes a site id as a parameter**, so a confused or malicious agent can't name another tenant. |
| **Which tools?** | `acc_site_tools`: per-site enablement, *disabled by default* (Uber's "discovery ≠ exposure"). The Owner or operator enables tools during Boarding. |
| **Whose credentials?** | Each site's connections (OAuth tokens or keys) live in the vault under that site. The Toolbelt only reads the current tenant's row. |
| **Limits** | Spend caps, rate limits and per-job token or time caps per tenant, enforced at one choke point. A noisy client can't starve the others. |
| **Isolation in data** | RLS stays on every table as the second line. The Toolbelt uses the API's one service-role client, scoped by the resolved tenant. |
| **Audit** | `acc_tool_calls` per tenant. The client sees their own history, and their partner sees its clients'. The platform sees aggregates (volume, cost, errors) and individual records only under a support grant (§5.1). |

### 1.4 The bonus: "Use Claude, connected to your Accelerator"
Each site also gets a **member-facing MCP endpoint**: read the Library, ask about status, file a request and approve a card. A client can connect their *own* Claude (claude.ai, Claude Desktop) or ChatGPT to their Accelerator and say "what did the crew ship this week?" or "add a request: the search box is too small on phones". **This turns the "why not just use Claude?" objection into a feature:** use Claude, and connect it to the memory, hands and safety it doesn't have (§3.1). The tools are restricted to requests and reads, and every gate still needs the Control Room.

### 1.5 Three onboarding paths for connected systems (D40)

*Owner-approved design, 2026-10-15. MCP is an extensibility option, not a requirement clients must implement before onboarding. This is target design; the governed MCP Toolbelt remains implementation backlog.*

| Path | Client provides | Accelerator/partner provides |
|---|---|---|
| Supported integration | Approved account connection and scoped authorization | Reviewed connector configuration and approved tool enablement |
| Existing internal API | API contract, authenticated connectivity, system owner and sandbox/test access | A governed adapter exposing the required operations through the Toolbelt |
| Proprietary system via MCP | A client- or partner-built MCP server with documented, bounded business operations | Server/tool review, governed connection, validation and approved enablement |

Prefer an existing supported connector or internal API before asking a client to build anything. Client ownership/hosting of an internal connector does not change Accelerator's hosted-only commercial model. Reachability and authentication for private networks must be established during Boarding; an MCP endpoint is not automatically reachable or trusted.

**Two distinct directions:** outbound crew access is **agent → Accelerator Toolbelt → approved connector/API/MCP server → connected system**. Later inbound access is **client's own agent → Accelerator member-facing MCP endpoint → permitted platform capabilities** (§1.4). Connecting an external server does not grant its agents access to Accelerator. Neither direction changes client gates; member-facing scope starts with permitted knowledge/status reads and proposed work, with approvals remaining in the Control Room under the existing design.

**Review and enablement contract:** identify the owning tenant/site, system owner, approved purpose, environment, data scope and permitted read/write operations. Review tool input/output schemas, side effects, source provenance, timeout/rate/spend limits, failure behavior, operation identifiers and uncertain-outcome reconciliation (§14). Authenticate both the connection and its intended service; enforce resolved tenant scope and invocation-time permissions in the Toolbelt. An external server's discovery responses or annotations do not establish authority. Discovered tools arrive disabled; changed tool contracts require review before activation. Preserve sanitized audit/evidence receipts, explicit revocation and a tested outage/recovery path. Start read-only where sufficient; protected writes require existing Owner gates.

Prefer narrow business operations such as `inventory.check_availability` and `reservations.get_policy` over unrestricted SQL, shell or environment access. Database adapters use environment-specific, least-privilege connections, bounded queries and approved data access; database connectivity alone does not authorize production writes. Treat returned text/content as untrusted evidence, never instructions or an expansion of authority.

**Environment and secret boundary:** agents may inspect variable names, requirements and configured/missing status. Secret values stay in the vault and are attached server-side for an authorized operation, without returning them to the model. Do not provide a general `get_all_env` or secret-reading tool. An isolated application sandbox may require limited test-environment credentials to boot and run checks; these must not become production credentials or appear in prompts, logs, replay or exports. The current runner's vault/envmachine transition is incomplete; this section does not claim it has shipped.

**Boarding acceptance:** the Connector records the selected path, owner and reviewed contract, proves authenticated connectivity and tenant isolation, runs synthetic sandbox success/denial/timeout/duplicate-outcome cases as applicable, and presents the enablement diff to the authorized approver. Record unsupported capabilities and missing prerequisites rather than implying a connection is ready. Apply the same controls to internal platform tools and external services such as Stripe; payment exercises use approved test mode, not real transactions.

Client-facing description: **“Connect the systems you already use. For proprietary systems, bring an API or MCP server—we'll connect it to your crew under your permissions and approval rules.”**

---

## 2. The Skillsmith and the Crew Lab

### 2.1 Who creates the agents?
**Yes: the Skillsmith is the agent that creates the agents for a new client, and then keeps improving them.** Because a specialist is a configuration, "creating an agent" means writing a definition, not writing a program:

```
Specialist  =  Skills (versioned Markdown know-how)
            +  Tools (allowlist from the Toolbelt)
            +  Permissions (gates it must stop at)
            +  Model (per role, chosen per site)
```

The Skillsmith has **two modes**:

| Mode | When | What it produces |
|---|---|---|
| **Assemble** | Boarding a new site | Starting from the **crew catalog** (our standard specialists for the stack) and the Survey of the client's repo and accounts, it drafts *this site's* crew: which specialists, which tools each gets, the first **site skills** (e.g. "Machine Shop catalog rules: read-only MongoDB, always paginate, the assistant only mentions products its tools returned"), and the model per role. |
| **Improve** | After every Work item (the rail's **Learn** stop) and on a weekly sweep | **Proposals**: a new skill, an edit to one, a tool to add or remove, a model change. Each is evidenced ("3 of the last 12 send-backs were missing RLS tests"). |

**Rule (Uber's pattern):** every Skillsmith output is a **proposal**. It arrives disabled, as a diff, is replayed against past work, and is approved by a human, with one-click rollback. The Skillsmith never edits a live crew directly.

### 2.2 Four tiers of skills

| Tier (`scope`) | Owner | Example | Who approves changes |
|---|---|---|---|
| **Crew skills** (`platform`) | Strategic Machines | "Next.js 16 upgrade playbook", "Supabase RLS: every table, plus a test" | Strategic Machines operator in the Crew Lab |
| **Partner skills** (`partner`) | The partner firm (the house partner too) | "Our accessibility standard", "How we build storefronts" | Partner admin |
| **Company skills** (`org`) | The client account | "Our brand voice", "Never discount below 10%" | Client Owner |
| **Site skills** (`site`) | One site | "Machine Shop catalog rules" | Client Owner (operator may draft) |

When a specialist runs, its skills are assembled from all four tiers. A more specific tier can add to a more general one, but never remove a crew safety skill or a gate.

**Promotion:** a lesson learned on one site can be **promoted** a tier.
- To partner tier: the Skillsmith drafts a generalized version, and the partner admin approves it.
- To crew tier: the Skillsmith drafts an anonymized version, and a Strategic Machines operator approves it. That is the cross-client flywheel.

Promotion needs the **skills-sharing clause** in the client Agreement, and for partner clients also the partner agreement (§8).

### 2.3 The Crew Lab ("Frankenstein's laboratory")
The Crew Lab is the **operator's** workshop:
- **Strategic Machines staff** use it to maintain the crew catalog, and for house-partner Boarding.
- **Certified Platinum partners** use it for their own clients and partner skills.

Clients get a simplified **Crew** screen (§2.4); they approve, they don't assemble.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ CREW LAB · Machine Shop                                  Catalog v14 · Site crew v3  │
├───────────────┬─────────────────────────────────────────────┬────────────────────────┤
│ ROSTER        │ SPECIALIST: Data                    v3 ▾    │ SKILLSMITH             │
│ ● Consultant  │ ┌ SKILLS ─────────────────────────────────┐ │ "Survey done. Machine  │
│ ● Designer    │ │ ▣ Postgres + Supabase RLS   crew v7     │ │ Shop uses MongoDB, not │
│ ● Builder     │ │ ▣ MongoDB read-only patterns crew v2    │ │ Postgres. I swapped the│
│ ◉ Data        │ │ ▣ Machine Shop catalog rules site v1 ✎  │ │ Data specialist's tools│
│ ● Judge       │ │ + add skill                             │ │ and drafted a site     │
│ ● Librarian   │ ├ TOOLS (from Toolbelt) ──────────────────┤ │ skill."                │
│ ● Release     │ │ ☑ mongo.find_readonly      risk: low    │ │                        │
│ ● Upkeep      │ │ ☑ mongo.count              risk: low    │ │ PROPOSALS (2)          │
│ + new         │ │ ☐ supabase.migrate_test    risk: data🔒 │ │ ▸ Add "paginate every  │
│               │ ├ PERMISSIONS ────────────────────────────┤ │   query" check   [diff]│
│ BOARDING      │ │ 🔒 production data: never               │ │ ▸ Judge model →        │
│ ✓ Survey      │ │ 🔒 data changes: Owner gate              │ │   different vendor     │
│ ✓ Connect     │ ├ MODEL ──────────────────────────────────┤ │                        │
│ ◉ Assemble    │ │ Claude Sonnet ▾   ~$0.40 / job          │ │ [ Ask the Skillsmith… ]│
│ ○ Stabilize   │ └─────────────────────────────────────────┘ │                        │
│ ○ Agreement   ├─────────────────────────────────────────────┴────────────────────────┤
│               │ TEST BENCH   Scenario: replay Work #7 "search by brand" ▾            │
│               │ v2 (live): ✗ unbounded query · 3 send-backs · $1.10                  │
│               │ v3 (draft): ✓ all checks · 0 send-backs · $0.85    [ Promote to crew ]│
└───────────────┴──────────────────────────────────────────────────────────────────────┘
```

**The four parts of the Lab:**
1. **Roster:** the site's specialists, with the Boarding progress beneath them.
2. **Anatomy:** one specialist laid open in its four slots. Skills are cards with tier badges and versions; tools are toggles carrying risk badges from the Toolbelt; permissions are locks (gate policy, which can't be removed here); model is a dropdown showing typical cost per job.
3. **Skillsmith:** a conversation ("make the Designer stricter about mobile layouts") plus the proposals queue, each proposal shown as a diff.
4. **Test bench:** run live and draft configurations against replayed work and separate holdout scenarios in the test environment. Define thresholds before evaluation; compare acceptance checks, safety, send-backs, cost and time with sample sizes. Promotion needs the tier owner's approval and no invariant regression. Activation is versioned, reversible and followed by later measurement (§10.6).

### 2.4 What the client sees: Crew & Knowledge and the shared meeting
- **Branding:** the crew carries the partner's brand (§5): the partner is named at Silver, co-branded at Gold, fully white-labelled at Platinum. The house partner's crews carry the Strategic Machines brand.
- **Your Team Lead:** the Consultant role becomes the accountable client-facing lead, coordinating the existing specialists rather than introducing a separate generalist application. It owns recommendations, handoffs, commitments and exception reporting (§10.1).
- **Your crew:** specialist cards show business remit, permission boundaries and actual activity. Model details and per-specialist spend remain available in Engineer/operator view; the executive sees total budget and material exceptions.
- **Shared meeting workspace:** one conversation and shared artifacts; the lead invites relevant specialists to contribute in business-advisor language. Avatars identify roles; presence derives from actual jobs/session state (§10.2).
- **Learning proposals:** show the observed problem, proposed lesson, evaluation and decision. Proposed, evaluated, activated and measured improvements have distinct labels (§10.6).
- **What the crew knows:** a readable handbook of site/org rules with sources, versions and unresolved assumptions. A knowledge count is an inventory, not evidence of improvement.
- **Library and export:** decisions, designs, capability records, evidence and learning history are accessible here and contextually from Site and Work.

### 2.5 Boarding: the $2,500 fixed-price onboarding, run by a Boarding crew
Boarding replaces the $5–20K custom installation (except for the premium managed tier). It runs on the Setup page as one checklist; flywheel.md §3 (Install → Checkout → Agreement) becomes its later steps. **The client's partner runs Boarding** (the house partner for direct clients). Gold and Platinum partners buy it at wholesale and set their own price.

| Step | Boarding specialist | What happens | Client does |
|---|---|---|---|
| 0. **Checkup** (free, before purchase) | Surveyor | URL scan plus a read-only repo scan: security, freshness, tests, stack fit | Pastes URL, connects GitHub |
| 1. **Connect** | Connector | Connect buttons (GitHub App, Vercel, Supabase or the site's database, Stripe test). It creates the `stage` branch, previews and the test database. Remaining keys go through the connection catalog | Clicks Connect; pastes any leftover keys |
| 2. **Survey** | Surveyor | Stack card, env manifest, route/schema/test maps, invariant draft and proposed capability inventory with confidence and evidence. Findings are proposals for review | — |
| 3. **Interview** | Team Lead (Consultant) | Conversation on business outcomes, critical journeys, brand, invariants, KPI definitions, budget and decision authority; confirms the inventory | Sets direction and confirms facts |
| 4. **Assemble** | Skillsmith | Drafts the site's crew and first site skills; the operator reviews them in the Crew Lab | — |
| 5. **Stabilize** | Builder + Judge + Upkeep | Fixes the Checkup's critical findings, adds a baseline test suite and branch protection, and proves rollback, all through the normal rail | Approves on the rail |
| 6. **Agreement** | Librarian | The one-page Agreement (flywheel.md §3) plus the skills-sharing clause | Signs |

**Connection selection:** Connect/Survey explicitly chooses among the three paths in §1.5; no client is required to build an MCP server when a supported integration or suitable API exists. Connector readiness and enablement need the recorded acceptance evidence in that section.

**Machine Shop is the first site through Boarding.** We board it as if it were a paying client and log every point where a human had to step in. Each of those points becomes a backlog item for the Boarding crew.

---

## 3. The Library: why a client needs us, not just an LLM

### 3.1 The honest answer to "why not just use Claude?"
Claude is a brilliant contractor with no memory of your business, no hands on your accounts, and no safety rails. Every session starts from zero, and anything it does is unguarded. The Accelerator is what turns that contractor into a **team that runs your site**:

| | Claude (or any LLM) on its own | The Accelerator |
|---|---|---|
| **Memory** | Forgets between sessions; you re-explain your business every time | The **Library**: every decision, design, dialogue, diff and lesson, organized and searchable, growing with each job |
| **Hands** | You copy code, paste keys, run commands, deploy | The **Toolbelt**: connected to GitHub, Vercel and your database, with no keys ever in a chat |
| **Safety** | Edits whatever it's pointed at; grades its own work | Test-only data, an **independent Judge**, gates on money/data/auth, preview before live, one-click Undo |
| **Team** | One generalist | A **crew** of specialists with their own skills and limits, tuned to your site |
| **Proof** | "Trust me, it works" | **Evidence** on every change: tests, screenshots, the audit trail |
| **Gets better** | Same tomorrow as today | The **Skillsmith** turns every job into crew know-how |
| **Ownership** | Chats scattered across accounts | **Your Library, exportable any time** as Markdown, tests and history in open formats |

And per §1.4: *"Keep using Claude. Connect it to your Accelerator."*

### 3.2 What the Library holds, and where each thing lives

| Section | What it is | Where it lives |
|---|---|---|
| **Handbook** | The rulebook (`CLAUDE.md`) in plain words, plus the Stack card and Facts registry | The client's repo (`/docs`), rendered and synced |
| **Decisions** | Every owner decision, each linked to the conversation where it was made | Platform; mirrored to `/docs/decisions.md` |
| **Designs** | design.md versions with approvals | Platform; the approved version is committed to `/docs/designs/` |
| **Work history** | Every Work item: dialogue, plan, diffs, evidence, preview screenshots, release, Undo | Platform (diffs reference git commits) |
| **Crew & skills** | Specialists and site/org skills with versions, proposals and test-bench results | Platform; site skills are exported to the repo as Markdown |
| **Toolbelt log** | Every tool call by every specialist | Platform (`acc_tool_calls`) |
| **Releases** | A changelog in plain words, with before/after and Undo | Platform plus git tags |
| **Health timeline** | Checkup scores over time | Platform |
| **Capability inventory** | Business areas/capabilities, requirements, technical links, dependencies, scope history and verification evidence (§10.3) | Platform; open-format export and agreed repo documentation |
| **Governance** | Mandate versions, decision authority, KPI definitions and approved commitments (§10.1, §10.4) | Platform; decisions and architecture records mirrored to `/docs` |

**Rule of thumb:** *what the site needs in order to be understood without us* (handbook, decisions, designs, skills, tests) goes into the client's repo as open files. *What records how the work happened* (dialogues, evidence, tool logs, metrics) lives in the platform and can always be **exported**.

**Segregation is by tenant, then by tier:**
- **Platform tier:** crew catalog, crew skills, stack packs, the Protocol.
- **Partner tier:** partner skills, partner brand and partner staff. Shared across that partner's clients, and invisible to everyone else.
- **Company tier:** company skills and brand; shared by all of a client's sites.
- **Site tier:** everything above, per site.

Every row carries `org_id` (and `site_id` where it applies). Partner-tier rows carry `partner_id`. RLS applies throughout, and Toolbelt reads resolve the tenant from the token.

### 3.3 Where it is physically stored
Each client's Library is **one logical thing in five physical places**. Every place is keyed by `org_id` and `site_id`.

| Store | Holds | Owned by | Tenant separation |
|---|---|---|---|
| **1. The client's GitHub repo** | Code, tests, and `/docs`: handbook (`CLAUDE.md`), Stack card, `decisions.md`, approved `designs/`, site `skills/`. **Git history is the record of every diff and refactor**; the Library links to commits by SHA rather than copying them | **The client** | It's their repo; our GitHub App writes only through pull requests |
| **2. Platform Postgres** (our Supabase project) | The **Site Timeline** and everything that isn't a file: Work items, conversation threads, design and plan versions, evidence, job logs, the tool-call audit, specialists and skill versions, proposals, bench runs, releases, health snapshots, usage | Strategic Machines, on the client's behalf | `org_id`/`site_id` on every row, plus RLS; the API and Toolbelt resolve the tenant from the credential |
| **3. Object storage** (Supabase Storage) | Screenshots, before/after images, attachments, voice recordings and transcripts, export bundles | Strategic Machines | One bucket path per tenant: `org/<org>/site/<site>/…`, with storage policies. Deliberately **not** prefixed by partner, because a client can switch partners (§5.4) without its files moving |
| **4. The vault** (`acc_secrets`, AES-256-GCM) | Credentials and OAuth tokens, per site and environment | Strategic Machines | Read only by the Toolbelt, only for the resolved tenant; never returned to a browser or a prompt |
| **5. The crew catalog** (our repo) | Crew skills, specialist templates, stack packs, the Protocol: the *platform tier*, versioned in git and loaded into Postgres | Strategic Machines | Shared by all clients; holds no client data, only anonymized lessons that were approved for promotion |

**Not stored anywhere durable:** runner sandboxes and worktrees are deleted after each job. Prompts sent to model providers go under API terms (no training on customer data; confirm each provider's retention settings before launch).

**The Site Timeline is the spine.** Add one append-only table, `acc_site_events`: `at`, `kind` (decision · design approved · plan approved · release · rollback · refactor · incident · skill learned · connection changed), `summary`, links (Work item, commit SHA, doc version, evidence). Every Library page is a view over this spine plus the rows and files it points to. This is the "metadata that instruments a site's timeline".

**Tenancy model:** start **pooled**: one database, row-level separation, which is right for dozens to hundreds of sites. Offer a **dedicated database per client** later as a premium-tier option (same schema, same code; the store picks the connection by tenant).

**Export and exit:** one click produces a bundle: Markdown for decisions, designs, skills and the timeline; JSON for threads, evidence and the tool log; the files from object storage. The repo already holds the rest. On cancellation: export, then delete after a stated retention window.

### 3.4 Making it pronounced for a prospect
The Library is the **showroom**. Sell it with Machine Shop's live Library, not with slides:
- **Ask the Library:** "Why does the assistant refuse to mention products it didn't find?" The answer cites the site skill, the decision and the conversation where it was made.
- **The Timeline:** scroll back through every change, each with a before/after and who approved it.
- **"Your crew knows 47 things about Machine Shop":** the handbook view, growing week by week.
- **Export button, front and centre:** "Download your Library." Trust comes from knowing you can leave.

**The demo line:** *"Here's Machine Shop's Library after 30 days. Here's what yours will look like after Boarding."*

---

## 4. What happens to the code (Gen 1 → Gen 2)

**This is an evolution, not a rewrite.** Roughly **70% of today's ~11K lines stay**: the foundation (one API, a pure domain, one client, auth, the rail, the runner) is exactly what Gen 2 needs. What changes is mostly *at the edges*: how agents reach the world, what the console shows, and how prompts are assembled.

### 4.1 Keep (as is, or extend)
| Code | Why it stays |
|---|---|
| `packages/domain` (gates, permissions, flywheel rail, types) | Gen 2 *is* this policy. Extend it with specialist, skill, proposal and tool types and their rules, with tests |
| `packages/api-client` | Still the console's one door |
| `apps/api/lib` (auth, identity, codes, sms, http wrappers, admin, accounts, audit) | Sign-in is unchanged. Tenancy gains the partner level (§5.3): `store.access()` is rewritten, and `partnerRoute()` is added |
| `apps/api/lib/vault.ts` | Becomes the Toolbelt's credential store (adds OAuth tokens) |
| `apps/api/lib/work.ts` and the `/work` routes | The rail is the heart of Gen 2 |
| `apps/runner` core (queue, worktrees, `repo.ts`, `sh.ts`, Protocol checks) | Still runs jobs; it changes how they're equipped (§4.2) |
| Console shell: login, sidebar, admin, `/s/[site]/work/**`, setup | Reused in the four-screen layout |
| Migrations 0001–0005 | Kept; Gen 2 adds 0006+ |

### 4.2 Change
| Code | Change |
|---|---|
| `apps/runner/src/jobs.ts` `devEnv()` | Drop the `envmachine` fallback. The sandbox gets only the site's test env from the vault; everything else goes through the Toolbelt |
| `apps/runner/src/models.ts` `agent()` | Pass the Toolbelt as an MCP server (HTTP + job token) and restrict built-in tools per specialist |
| `apps/runner/src/prompts.ts` | Fixed system prompts give way to **assembled instructions**: Protocol + site rulebook + the specialist's skills (loaded on demand through `find_skill`) |
| `apps/api/lib/store-types.ts` | Remove Gen 1 Control Room methods (requests, changes, approveChange, consultations, dataDesk, proof). Add crew, skills (versioned, tiered), proposals, tools, connections and library methods, in **both** stores |
| `apps/api/lib/fixtures.ts` | The demo tenant changes from **Cypress Resort to Machine Shop**. Cypress is live production and shouldn't be demo data |
| `apps/api/lib/lighthouse.ts`, `github.ts` | Become Toolbelt tools (they keep their REST routes for the console) |

### 4.3 Add
| New | What |
|---|---|
| Migration 0006 (partners) | `acc_partners` (seed the house partner), `acc_orgs.partner_id`, `acc_partner_members`, `acc_support_grants`, `partner_id` on audit and usage (§5.3) |
| Migration 0007 (prove · try · release) | Built in G2.1: preview, proof, Try approval and release on `acc_work`; `prove` and `release` jobs |
| `packages/domain` partner rules | `Partner`/`PartnerRole` types, `PARTNER_PERMISSIONS`, `canPartner()`, skill-tier assembly rules, all with tests |
| `apps/api/app/mcp` + `apps/api/lib/toolbelt/` | The MCP endpoint, tool registry, connectors/proxies, gate checks, redaction, metering, audit |
| Job tokens | Minted per job, bound to org, site, work item, specialist and expiry; verified by the Toolbelt |
| Migration 0008 (crew) | `acc_specialists`, `acc_specialist_versions`, `acc_skills` reworked with `scope` (platform · partner · org · site) and versions, `acc_skill_versions`, `acc_proposals`, `acc_bench_runs` |
| Migration 0009 (toolbelt) | `acc_tools`, `acc_site_tools` (disabled by default), `acc_connections` (OAuth), `acc_tool_calls` (audit) |
| Console: Overview, Work, Site, Crew & Knowledge; Crew Lab, Boarding | Four client screens, shared meeting, plus operator Lab and guided Boarding (§10) |
| Capability and governance schema (numbers assigned after reconciliation) | Stable capability/requirement/asset/dependency/evidence links, mandate versions, KPI definitions and meeting/decision events; extend existing records rather than creating parallel Work state |
| Migration 0010 (library) | `acc_site_events` (the append-only Site Timeline, §3.3) and tenant-prefixed storage buckets |
| Library export | A zip download, and a sync of handbook, decisions, designs and skills to the site repo's `/docs` |
| Website (`accelerator` repo) | **Done 2026-10-10 (uncommitted):** `LibrarySection` and `ToolbeltSection` on Home and `/platform`; three FAQ entries; the Partners page rebuilt (Silver/Gold/Platinum table, pillars, Partner Playground, all "coming soon"); the home page's partner band updated |

### 4.4 Retire
| Code | Fate |
|---|---|
| Console pages `requests`, `change`, `change/[id]`, `consult` | Deleted. The rail replaces them (flywheel F1, never finished) |
| `proof`, `data`, `releases`, `health`, `library`, `config`, `skills`, `metrics`, `account`, `code` | Folded into tabs on **Site** or **Crew**, or kept behind Engineer view (`code`) |
| Tables `acc_requests`, `acc_changes`, `acc_approvals`, `acc_consultations` | Data migrated into `acc_work*`, then dropped in a later migration |
| `envmachine` for the runner | Retired once the vault and Toolbelt cover Machine Shop |

### 4.5 Order of work (each phase ships green: `pnpm typecheck && pnpm test`)

| Phase | What | Proves |
|---|---|---|
| **G2.0** Setup | ~~`stage` + CI~~ deferred (D15). Machine Shop's Vercel project is linked and configured; migrations 0004/0005 are run | The house rules can be followed |
| **G2.0b** Partner seam | Migration `0006_partners`, the house partner, `PARTNER_PERMISSIONS`, `store.access()` rewritten without the staff bypass, support grants (§5.3). No partner UI yet | Strategic Machines is "just another partner" in the data |
| **G2.1** One loop live | Finish Claude's current work; reconcile code, migrations and completion records. Run 10 Machine Shop Work items through preview and release; record failures, send-backs, human intervention and time-to-live | The core promise works; baseline evidence exists |
| **G2.1a** Trustworthy operational state | Connect Overview to `acc_work` and its proof/release records. Replace toast-only operational controls and fixed trends with real actions/data, or explicit unavailable states; separate demo data | Every executive signal and action reflects the same engine as Work |
| **G2.2** Toolbelt v0 | `/mcp`, job tokens, 6–8 tools (repo, preview, Lighthouse, screenshot, mongo read-only, library read, rail post), audit; drop `envmachine` | Agents work with no keys in their shell |
| **G2.3** Crew and authority | Specialists as data; assembled skills/tools; Consultant as Team Lead; versioned mandate, specialist handoffs and deterministic escalation rules. Preserve client gates | The client can steer one lead without managing agents |
| **G2.3a** Capability inventory | Proposed inventory for Machine Shop catalog/search/quotes; stable identities, requirements, technical links, evidence and many-to-many Work links; review before acceptance | The business and engineering views describe the same site |
| **G2.4** Executive experience | Overview · Work · Site · Crew & Knowledge; shared meeting built from Work Room; truthful roster, contextual artifacts/actions, separate condition and progress, source-backed vital signs. Migrate legacy records before retiring pages/tables | A business user governs a change without coordinating specialists |
| **G2.5** Library + measured learning | Site Timeline/export includes capability/mandate/decision evidence; Skillsmith proposals; replay and holdout bench; approved activation and later measurement | At least one improvement is demonstrated rather than asserted |
| **G2.6** Boarding | Checkup → Connect → Survey → Interview → Assemble → Stabilize → Agreement, run on Machine Shop as client #1 | $2,500 Boarding is repeatable |

**Phase acceptance:** §13 applies continuous change assurance across these phases: readiness and baseline in G2.1; typed contracts and review roles in G2.3; rule/capability links in G2.3a; assurance presentation in G2.4; validated playbook learning in G2.5. These are acceptance refinements, not an additional orchestration engine. §10.5 defines engineering assurance and §10.7 defines product acceptance. Retain existing phase numbers and completed history; suffix phases are new design work, not claims of implementation. Migration numbers 0008–0010 above are reservations: inspect Claude's final state before assigning additional capability, mandate, KPI or meeting schema migrations. No destructive legacy-table removal until references, data migration and rollback are verified.

**Priority:** text, artifacts, real decisions and inventory precede rich avatars/voice. Voice is optional after the same experience works in text. Commerce packs, advanced model routing, narrated videos and extensive white-label customization do not gate the core release. Preserve their research notes in §9; verify vendor capabilities, pricing and links before implementation.

### 4.6 Machine Shop specifics
- **Its database is MongoDB (read-only catalog), not Postgres.** That's a good test: the Data specialist needs `mongo.*` tools, and the crew catalog must not assume Supabase.
- **Its first new functions** (the "crazy fun workflow" demos) can be ones that *need* a write store: saved lists, accounts, a cart or quote request. The crew would add Supabase for these, following the beachhead stack, and the catalog stays read-only in MongoDB. Every feature is a Work item on the rail, with evidence in the Library.
- Its `package.json` `dev` script loads `envmachine`. In G2.2 that changes to the vault.

### 4.7 Running on our own product (decision 2026-10-10)
We board our own properties through the Accelerator in increasing order of risk:
1. **Machine Shop:** the test site, and the public showcase (with video) of the crew working with the business expert.
2. **The Accelerator website** (`accelerator` repo): simple, public and low-risk. Every new piece of marketing copy becomes a Work item with a preview.
3. **The Accelerator platform itself**, last, with three safeguards:
   - **A break-glass path.** If the platform is down, it can't fix itself. The repo must always be workable directly (Claude Code in an IDE, `pnpm typecheck && pnpm test`), with no step that only the platform can perform.
   - **The crew never changes what's running it.** The crew works on a `work/<n>` branch and preview, like any site. Releasing to the platform's production goes through the Owner gate, and the runner deploys separately from the API, so a bad release can't take down the job that would roll it back.
   - **Toolbelt and auth changes are always Owner-gated:** security class, no autonomy.

---

## 5. Partners: multi-tenant *and* multi-vendor (decision 2026-10-10)

### 5.1 The model: three levels, two hats
```
Platform (Strategic Machines runs the infrastructure, crew catalog, partner billing)
  └─ Partner  (a vendor: Strategic Machines Direct is partner #1, "the house partner")
       └─ Company (the client account, today's acc_orgs)
            └─ Site → its crew, Library, Toolbelt connections
```
- **Every company belongs to exactly one partner.** Strategic Machines' own direct clients belong to the **house partner**, which works through the same partner console, permissions and limits as Silver, Gold and Platinum partners. No special code path.
- **Strategic Machines wears two hats, kept apart in code.**
  - *Platform* powers cover infrastructure only: partners, the crew catalog, billing, platform health.
  - *House partner* powers cover operating its own clients.

  Platform staff **don't** get standing access to other partners' clients. Support access is explicit, time-boxed, audited and visible to the partner. A partner will only trust a platform whose owner also competes with it if that is guaranteed.
- **Gates stay with the client.** Partner staff operate client sites (Operator rights), but approvals that need an Owner (money, data, auth, security, Go live where the client keeps it) remain the client's. This is today's "staff never hold the gates" rule, generalized.

### 5.2 What this changes today
Today's code hard-wires the two-level version:
- `store.access()` (`apps/api/lib/store-supabase.ts`) gives **any platform staff Operator rights on every account**. That is a global bypass that must become "partner staff on *their* partner's companies".
- `acc_skills.org_id = null` means "Strategic Machines library". That has to become an explicit scope (platform · partner · company · site).
- `acc_orgs` has no owner above it.

### 5.3 The seam to build now (migration `0006_partners`, ahead of the crew tables)
| Change | Detail |
|---|---|
| `acc_partners` | `id, slug, name, kind (house · partner), tier (silver · gold · platinum), status, brand jsonb (crew name, logo, colors, custom domain), created_at`. Seed the **house partner** |
| `acc_orgs.partner_id` | `not null`, references `acc_partners`; backfill every existing company to the house partner |
| `acc_partner_members` | `partner_id, user_id, role (owner · admin · operator)` |
| `acc_support_grants` | `partner_id or org_id, granted_to (platform user), reason, expires_at, granted_by`. Replaces the blanket staff bypass |
| Scoped know-how | Skills and specialists carry `scope (platform · partner · org · site)` plus the matching id, with a check constraint that exactly the right id is set |
| `partner_id` on audit, usage, job tokens | Rolls up metering, limits and the audit trail per partner. *Built: audit (trigger-filled). Usage rolls up through the company for now; job tokens arrive with G2.2* |

**Domain and API:**
- `packages/domain`: `Partner` and `PartnerRole` types, and a third permission map, `PARTNER_PERMISSIONS` (`partner.view`, `clients.create`, `clients.operate`, `skills.manage`, `brand.manage`, `billing.view`, `team.manage`), with `canPartner()` and tests.
- `store.access()` resolves in a fixed order:
  1. company member, with their role
  2. a member of the company's partner (Operator; never the gates)
  3. a valid support grant (audited)
  4. otherwise 404
- `partnerRoute()` joins the `http.ts` wrappers.
- Branding resolves site → company → partner (`brand`); the console and crew names read it.

**Deliberately later:** the partner console UI, white-label custom domains, wholesale price lists, paying out partners (e.g. Stripe Connect), and the Partner Playground. All of them sit on the seam above without schema changes.

### 5.4 Edge cases decided now
- **A client switches partners:** `partner_id` changes. The client's site and company skills and its Library go with it (they're the client's). Partner skills stay behind (they're the partner's IP). The crew is re-branded.
- **A partner leaves the program:** their clients move to the house partner (or another partner of the client's choice) under the partner agreement.
- **Why now:** with no live external tenants, this is one backfilled column and one access rewrite. Once partners and clients are live, it touches every authorization path and every row.

### 5.5 The Partner Program the seam serves (on the website as "coming soon")
| | Silver | Gold | Platinum |
|---|---|---|---|
| Role | Owns the client relationship; our operators run the crew behind them | Boards and operates its clients' sites | Boards, operates and designs crews |
| Point of contact | The partner, at every level | ← | ← |
| Crew branding | Partner named | Co-branded (partner name on crew and client screens) | Fully white-labelled (name, colors, domain) |
| Partner skills | — | Yes | Yes, plus the Crew Lab |
| Economics | Revenue share | Wholesale Boarding and Crew plans; partner sets retail | Volume wholesale, custom terms |
| Certification | Orientation | Boarding and operator | Gold plus Crew Lab |

Hosted only, with no upfront license fee, plus a certification fee. Founding partners can double as design partners. The **Partner Playground** (an idea, not committed) is a scripted playbook on a sample site, most likely Machine Shop, that walks an SI through a full engagement in under an hour.

**Brand fields the seam must carry** (in `acc_partners.brand`): crew display name, logo, colors, and (Platinum) a custom domain. A Silver partner's crew shows the partner name; it doesn't change the theme.

---

## 6. Open questions
1. **Toolbelt hosting:** inside `apps/api` on Vercel (simplest), or as its own long-running service once tool calls stream? *Start inside `apps/api`.*
2. **MCP for clients' own LLMs (§1.4):** in the first paid release, or after? *Recommended: after G2.5, as a headline feature.*
3. **Voice for the Interview step:** which realtime model? It's a per-role setting, like the others.
4. **The crew catalog's first version:** eight specialists (newvision.md §2), plus three Boarding specialists (Surveyor, Connector and the Skillsmith in Assemble mode).

---

## 7. Decisions log
| # | Date | Decision | Where |
|---|---|---|---|
| D1 | 2026-10-08 | Beachhead: AI-built apps that are live and fragile; Customer Zero-type businesses are the premium managed tier | newvision.md §4 |
| D2 | 2026-10-10 | The product stays **The Accelerator**; every client site gets **a crew specialized for it** ("crew" is the market word) | newvision.md §9 |
| D3 | 2026-10-10 | Onboarding is **Boarding, $2,500 fixed**, run by a Boarding crew; custom quotes only for the premium tier | §2.5 |
| D4 | 2026-10-10 | Four client screens (originally Inbox · Work · Site · Crew), plus operator Crew Lab. Refined by D23–D25 to Overview · Work · Site · Crew & Knowledge | §4.4, §10 |
| D5 | 2026-10-10 | The Toolbelt is an **MCP server inside `apps/api`**; Connect buttons replace pasted keys; `envmachine` retires | §1 |
| D6 | 2026-10-10 | The **Skillsmith** assembles each site's crew and improves it through human-approved proposals; the Crew Lab is its operator UI | §2 |
| D7 | 2026-10-10 | **Machine Shop is the test site** and client #1 through Boarding; Cypress is never a test target | §0, §4.6 |
| D8 | 2026-10-10 | The Library lives in five places (client repo, platform Postgres, object storage, vault, crew catalog); the Site Timeline (`acc_site_events`) is its spine; pooled tenancy first | §3.3 |
| D9 | 2026-10-10 | **No open source**; hosted only; keep the seams clean anyway | §0 rule 9 |
| D10 | 2026-10-10 | **Partner Program: Silver · Gold · Platinum.** Partners are the point of contact, and crews are branded to the partner's firm | §5.5 |
| D11 | 2026-10-10 | **Multi-vendor tenancy:** Platform → Partner → Company → Site. Strategic Machines Direct is the house partner; platform and house partner are separate hats; support grants replace the staff bypass | §5 |
| D12 | 2026-10-10 | **Four skill tiers:** crew → partner → company → site | §2.2 |
| D13 | 2026-10-10 | **We run on our own product:** Machine Shop → the website → the platform, with a break-glass path. Machine Shop is a public showcase, with video | §4.7 |
| D14 | 2026-10-10 | Website value proposition: the Library ("why not just use an AI model?") and the Toolbelt ("your keys never enter a prompt") | §4.3 |
| D15 | 2026-10-12 | **Our own repos: work on `main` and push to production**; no `stage` branch and no CI until a second contributor or the first paying client. A local `pnpm typecheck && pnpm test` gates every push. Client sites keep the full branch path | §0 rule 11 |
| D16 | 2026-10-12 | **Agent-first interfaces:** our Toolbelt (MCP) for our crews; server-side MCP over APIs first (WebMCP optional, client sites only: D21); Stripe as a fronted connector (test mode); "Agent-ready site" becomes a client service line | §9.1 |
| D17 | 2026-10-12 | **A Decide layer**, `decide()`, behind an adapter (Jev on AI Gateway first) for triage, rail routing, tool and skill pre-selection, model routing, pre-Judge screening and Inbox ranking. Thresholds live in the domain; it never lowers a risk class | §9.2 |
| D18 | 2026-10-12 | **Crew writing standard:** "80% of the way to ASD-STE100" for everything written to the business expert, and for skills (rung 1 of D22) | §9.3 |
| D19 | 2026-10-12 | **Live Agent Template:** a short live prompt; a backend crew specialist on the Toolbelt; non-blocking tools; server-captured facts; the voice model is a per-role setting. First uses: Boarding Interview, Discuss, the weekly briefing, Machine Shop's voice assistant | §9.4 |
| D20 | 2026-10-12 | **Generative forms from a FormSpec:** the server decides the fields, the agent arranges and prefills, one renderer (shadcn + zod), secret fields bypass the agent | §9.5 |
| D21 | 2026-10-12 | **Server-side MCP over real APIs is primary.** WebMCP is not relied on: there's none in our console, and it's only an optional extra on client sites. Agent-ready sites get an MCP endpoint over their API | §9.1 |
| D22 | 2026-10-12 | **Understanding artifacts (Karpathy's ladder):** controlled-English writing → diagrams → a discardable HTML explainer page per Work item → narrated release and briefing videos, all generated from the record | §9.3 |
| D23 | 2026-10-12 | **Executive governance:** client sets outcomes, budgets and decision authority; Consultant becomes accountable Team Lead. Crew coordinates execution within a versioned mandate; material exceptions and protected actions return to authorized client decision-makers | §10.1 |
| D24 | 2026-10-12 | **Shared meeting workspace:** one lead-led conversation, visible specialist roster, shared artifacts and contextual server-authorized decisions. Specialist contributions are business advice; avatars and optional voice reflect actual activity | §10.2 |
| D25 | 2026-10-12 | **Business capability inventory:** durable capabilities map business purposes to requirements, architecture, assets and evidence. Condition and change progress are separate. Four screens: Overview · Work · Site · Crew & Knowledge | §10.3–10.4 |
| D26 | 2026-10-12 | **Trustworthy vital signs:** business outcomes, journey health, delivery, budget, risk and complexity have explicit definitions, sources, freshness and uncertainty. No invented composite score or unlabelled demo metrics | §10.4 |
| D27 | 2026-10-12 | **Engineering assurance:** retain current stack and boundaries; strengthen contracts, architecture decisions, Vitest, lint/typecheck, integration and browser QA, independent review, commit-bound approvals and verified recovery | §10.5 |
| D28 | 2026-10-12 | **Measured flywheel and sequencing:** replay plus holdout evaluation, human-approved versioned activation and later outcomes. Reconcile Claude's current work; operational truth and inventory precede rich presentation. Documentation authorization does not authorize code refactoring | §4.5, §10.6–10.7 |

| D29 | 2026-10-14 | **Collaborative requirements and TDD:** the functional expert and crew jointly refine intended behavior; versioned agreement supplies independent expected outcomes. Red → green → refactor and regression/synthetic QA are workbench concerns, expressed as business assurance in marketing | §11.1–11.2 |
| D30 | 2026-10-14 | **Jev context selection:** separate typed routing from experimental retain/truncate/drop decisions; preserve durable records and pinned authority, evaluate fidelity and costs, with safe fallback | §11.3 |
| D31 | 2026-10-14 | **Event-driven crew:** signed provider notifications/webhooks become durable scoped signals; deterministic dispatch starts bounded jobs. An event grants no permission; presence reflects execution | §11.4 |
| D32 | 2026-10-14 | **Saved threads:** questions, options and unresolved topics retain source context, lifecycle and revisit triggers; saving is not approval or a delivery commitment | §11.5 |
| D33 | 2026-10-14 | **Positioning:** human-governed, agent-executed delivery. Headline “What you intended. What you approved. Delivered.”; executable record subtext without an unsubstantiated world-first claim. Marketing updates authorized; platform code remains separately gated | §11.6 |

| D34 | 2026-10-14 | **Discover your starting point:** retain deterministic technical scores and proportionate content-site findings; combine optional browser-local business perspective with a source-labelled draft record, unknowns and proposed proof. No implied approval, automatic onboarding or unsubstantiated ROI | §12 |

| D35 | 2026-10-14 | **Two-step review and explicit persistence:** hide perspective inputs until the public scan completes; separate submission applies the draft without a rescan. Store scan summaries/cache hits and explicitly submitted comments in private marketing Supabase history; surface failures and preserve drafts. Database table setup required before live persistence; saved via direct API update under D36 | §12.1–12.2 |

| D36 | 2026-10-14 | **Website-owned data APIs:** save perspective by a direct server-side table update, with no Supabase save procedure. Add first-party page views, source/landing-page reporting and approximate tab sessions, distinct from shared scan-spend limits and Search Console metrics | §12.2 |

| D37 | 2026-10-14 | **Report-first follow-up:** full public report before blank Step 2, with optional name/company/phone. Reuse a persisted public site report for seven days with original date; each visitor gets a separate private review. Store request IP with page visits as explicitly requested; update privacy disclosure | §12.3 |
| D38 | 2026-10-14 | **Continuous change assurance:** every Work item records preserved behavior, approved changes, unknowns and proportionate evidence for the transition. Source-linked rules, characterization, independent critique, evidence freshness, bounded execution and release/recovery checks extend the existing rail; no extra executive coordination or permission by implication | §13 |
| D39 | 2026-10-15 | **Reliable execution protocols:** adopt all six harness refinements: recoverable checkpoints, uncertain-outcome reconciliation, typed recovery, versioned execution maps, evidence-derived change receipts and evaluation/simplification of the harness itself. Implement in stages within the existing architecture | §14 |
| D40 | 2026-10-15 | **Three connection paths:** supported integration, governed adapter for an existing internal API, or reviewed client/partner MCP server. MCP server development is not an onboarding prerequisite. Outbound/inbound directions remain distinct; Toolbelt policy, secret isolation, scoped enablement and existing gates apply to every path | §1.5 |
| D41 | 2026-10-17 | **Complexity tiers replace the one-size rail:** Low, Medium and High, recommended by the platform against expert-agent capability and run length and confirmed or changed by the person. Low ships with no client decision; Medium needs the Brief and Ship it; High keeps the full gates. Protected risk sets a High floor; escalation only goes up. Cadence retired | §17.2 |
| D42 | 2026-10-17 | **The TDD plane:** every shipment, every tier, passes tests-first step checks, Prove on the exact candidate and the release verdict, enforced by the API. Stale proof never ships | §17.3 |
| D43 | 2026-10-17 | **Chat is the control surface:** the lead acts within the tier's authority; decisions are cards in the conversation; typed approval is a version-bound typed server action when exactly one eligible decision is pending; Owner-gated decisions need the button plus confirm; pause from chat. Medium's plan is crew-internal (one Brief approval) | §17.4 |
| D44 | 2026-10-17 | **Standing approval for Medium:** optional "ship automatically when proof is green", off by default, never on High, cleared by escalation | §17.5 |
| D45 | 2026-10-17 | **Change Ledger, GitHub stays:** adopt Scion/gitai patterns (ordered change log, land lock with compare-and-swap, API-first code reads, per-agent repo policies, conflict resolution) over git and the client's GitHub. Revisit a server-side VCS only on measured triggers | §18 |
| D46 | 2026-10-17 | **The Cockpit:** a central conversation widget with OpenAI live voice and text borrowed from Machine Shop, a larger docked viewport, streaming everywhere, summaries first, and an instrument panel whose every reading is sourced and opens its evidence | §19 |
| D47 | 2026-10-17 | **Domain packs:** the client picks a domain at subscription; packs carry vocabulary, skills, decision points, complexity hotspots, capability/journey/KPI templates and test scenarios. Skill tiers become crew → domain → partner → company → site. First domains: Commerce (Machine Shop) and Hospitality (Cypress knowledge, never a test target) | §20 |

---

## 8. Action list (work from the top; tick as done)

### 8.1 Housekeeping (before any Gen 2 code)
- [x] Commit the doc and website changes in the `accelerator` repo. *(Done: `0e2b5a4`.)*
- [ ] Commit the last `CLAUDE.md` edit in `accelerator-platform`, plus the D15 branching change.
- [x] ~~G2.0: `stage` branch and CI~~. **Deferred by D15:** for our own repos, work on `main` and gate pushes with a local `pnpm typecheck && pnpm test`.
- [x] Machine Shop: Vercel project created (owner, 2026-10-12).
- [x] Machine Shop: Vercel project linked to GitHub and live at https://strategic-machineshop.vercel.app/ (verified 2026-10-12: 10,836 products, the shop assistant, no errors).
- [x] Migrations 0004 and 0005 run on accelerator-test (owner, 2026-10-12). accelerator-test is the platform's only database for now.
- [ ] Live sign-in test against accelerator-test (accounts-auth-admin.md).

### 8.2 Platform build (gen2 phases, §4.5)
- [x] **G2.0b** Partner seam *(built 2026-10-12; typecheck and all 56 tests green)*:
  - `supabase/migrations/0006_partners.sql`: `acc_partners` with the house partner seeded; `acc_orgs.partner_id` (required, backfilled); `acc_partner_members`, seeded from platform staff; `acc_support_grants`; `acc_admin_audit.partner_id`, filled by a trigger.
  - `packages/domain`: `tenancy.ts` (`resolveSiteAccess`, `holdsGates`, support-grant window and liveness), `PARTNER_PERMISSIONS` / `canPartner`, `support.grant` platform action; 12 new tests.
  - `apps/api`:
    - `lib/partners.ts`: house partner, partner seats, support grants.
    - Identity carries `partnerSeats`.
    - `store.access()` resolves member → partner → support grant, **with no staff bypass**.
    - `/me` lists partner clients.
    - `caller.staff` replaced by `caller.via` + `holdsGates()`.
    - Accounts created in Platform Admin belong to the house partner.
    - New `/api/admin/support` (GET, POST) and `/api/admin/support/[id]` (DELETE).
  - Console: `siteAccess` reads `via`; the sidebar labels partner and support access.
  - **Deferred:** `partnerRoute()` (with the partner console, when partner routes exist); `partner_id` on usage (rolls up through the company for now; add when wholesale billing needs history at the time of use); skill and specialist `scope` (migration 0008, renumbered).
- [x] Run `0006_partners.sql` on accelerator-test *(owner, 2026-10-12; G2.0b pushed as `035c20e`; your partner seat verified in the database)*.
- [x] Machine Shop prepared for G2.1 *(2026-10-12)*: `stage` branch created and pushed (from `main`); site record fixed (name, stack; base branch `stage`).
- [x] **G2.1 code: Prove · Try · Release** *(built 2026-10-12; typecheck, 66 tests and the console and API builds green; not yet run live)*:
  - `supabase/migrations/0007_prove_try_release.sql`: preview, proof, Try approval and release columns on `acc_work`; `prove` and `release` job kinds.
  - `packages/domain/src/flywheel.ts`: the rail runs through `try → release → learn`; new actions `prove`, `approveTry`, `release` and `close`; `proveVerdict` and `releaseVerdict` (the API judges, the runner only reports); 11 new tests.
  - `apps/runner`:
    - `deploys.ts` reads Vercel's preview and production deployments from GitHub's records, so no Vercel key is needed.
    - The `prove` job runs typecheck, tests and build, then pushes `work/<n>` and waits for its preview. It doesn't push code that fails.
    - The `release` job: stage ← main ← `work/<n>`, re-check, push `stage`, fast-forward `main`, wait for production, probe the live URL. It stops before `main` on any conflict or failed check.
    - Checkout's C2 now really pushes a branch and checks its preview.
  - `apps/api`: `proveWork`, `approveTry` (gate 3; risky changes need the Owner), `releaseWork` (needs `release.ship`), `closeWork`, one route `work/[number]/ship`. New or rebuilt steps clear a stale Prove and Try. Cadence "run" goes on to Prove automatically, but never past a gate.
  - Console: the "Needs you" bar covers Prove, Try (Open preview · Approve for release), Go live and Close, plus a new **Prove & release** tab.
- [ ] **Run `0007_prove_try_release.sql` on accelerator-test before deploying the G2.1 code.**
- [ ] **G2.1 live run on Machine Shop:** run Checkout first, then 10 real Work items, measuring send-back rate and time-to-live.
- [ ] Console sign-in hiccup (2026-10-12): a menu link sent a signed-in owner to `/login` once; the retry worked. Likely cause: Next.js pre-loading the link while the session was expiring, and caching the proxy's sign-in redirect. Fix: don't redirect pre-load requests in `apps/console/proxy.ts`. Note the page if it happens again.
- [ ] **G2.2** Toolbelt v0: `/mcp`, job tokens, 6–8 tools, `acc_tool_calls`; drop `envmachine` from the runner and from Machine Shop's `dev` script.
- [ ] **G2.1a** Overview reads the real Work/proof/release records; actual actions, accurate unavailable states, measured trends and labelled demo data (§10.4).
- [ ] **G2.3** Crew v0 plus Team Lead, versioned mandate and audited specialist handoffs; migration reservations reconciled with Claude's work (§10.1).
- [ ] **G2.3a** Reviewed Machine Shop capability inventory, requirements/technical/evidence links and independent condition/progress views (§10.3).
- [ ] **G2.4** Overview · Work · Site · Crew & Knowledge; shared meeting, real roster states, accessible artifacts and server-authorized decisions. Migrate legacy records before retirement; demo tenant → Machine Shop (§10.2–10.4).
- [ ] **G2.5** Library/Timeline/export, Skillsmith and Crew Lab; replay plus holdout bench; one approved lesson with later measurement (§10.6).
- [ ] **G2.6** Boarding end to end on Machine Shop as client #1, logging every human step.
- [ ] Later: partner console UI, white-label domains, wholesale price lists, partner payouts, the Partner Playground, member-facing MCP (§1.4), a dedicated database option.

### 8.3 Website (`accelerator` repo)
- [x] Executive marketing revision implemented locally (2026-10-14): Owner headline, crew workspace walkthrough, capability/vital-sign examples, business-language assurance, saved threads, revised FAQ/CTA/pricing/onboarding/company/social copy. Historical marketing design marked superseded.
- [ ] Owner visual/commercial review of the local marketing revision, then commit/publish as separately authorized. Existing launch availability remains subject to platform verification.
- [x] Library and Toolbelt sections, three FAQ entries, the Partners page with tiers and Playground, the partner band. *(Done 2026-10-10, uncommitted; typecheck, lint and build pass.)*
- [ ] Review locally, then commit and deploy.
- [ ] Bring the older copy in line with Gen 2: the commissioning timeline (6 weeks → Boarding), AC levels (internal now), pricing (Checkup free · Boarding $2,500 · Crew plans), crew language across Home and `/platform`.
- [ ] Once G2.1 runs: a public Machine Shop showcase page with video of the crew working with the business expert.

### 8.4 Business and legal
- [ ] Client Agreement: add the **skills-sharing clause** (anonymized lessons may be promoted to crew skills) and the export and retention terms.
- [ ] Partner agreement: tiers, wholesale terms, branding guide, certification, IP (partner skills are the partner's), what happens to clients when a partner leaves, data-processing chain.
- [ ] Confirm each model provider's **data-retention and no-training settings** before launch.
- [ ] Find design partners. Founding agency partners can double as design partners. Fit-scan candidates first.
- [ ] Validate pricing with the first prospects: Crew plan tiers and partner wholesale levels.

### 8.5 From §9 (agent interfaces)
- [ ] **G2.2 (Toolbelt):** progressive tool disclosure by stage and gate state; Stripe connector (test mode, restricted key).
- [ ] **Later optimization:** `decide()` adapter with a verified provider trial. Measure speed, cost and agreement on our workload; advanced routing is not a dependency for Crew v0.
- [ ] **G2.3:** add the ASD-STE100 writing standard to the Protocol skill, and a pre-Judge style check on Inbox cards and reports.
- [ ] **G2.4 (Screens):** a `FormRenderer` plus the FormSpec catalog; start with profile and settings, then Boarding Connect (`secret` fields).
- [ ] **After text-workspace validation:** optional Live Agent Template for Interview/meeting; verify provider capabilities, terms and pricing before choosing the voice adapter. Boarding works without voice.
- [ ] **Later showcase:** Machine Shop MCP endpoint and optional voice shop assistant, built through the rail after the executive experience is validated; not a core-release dependency.
- [ ] Checkup: add an agent-readiness score (API or MCP endpoint, structured data, `llms.txt`, checkout path; WebMCP as a bonus).
- [ ] **G2.5:** understanding artifacts. A "what changed" diagram per design and release; an HTML explainer page per Work item at the Try stop. Narrated release videos come later, behind a spend cap.
- [ ] Verify Stripe's ACP, Shared Payment Token and MCP server details on docs.stripe.com before designing the commerce pack.

### 8.6 Open design questions (see §6)
- [ ] Toolbelt hosting (start inside `apps/api`).
- [ ] When to ship member-facing MCP.
- [ ] Voice model for the Interview step.
- [ ] Crew catalog v1: 8 specialists plus 3 Boarding specialists.

### 8.7 Executive experience and engineering acceptance
- [ ] Reconcile this target with Claude's completed work before implementation; obtain separate Owner approval for code changes.
- [ ] Define the mandate schema and explicit relationship to cadence, AC levels and existing design/plan/release gates; no implicit gate relaxation.
- [ ] Confirm Machine Shop's critical journeys, capability boundaries, business outcomes and KPI sources; missing instrumentation remains visible.
- [ ] Define typed capability, evidence, meeting-event and decision contracts plus scoped access and idempotency rules.
- [ ] Establish relevant lint/typecheck/Vitest/integration/browser-QA checks and independent acceptance review; record a baseline.
- [ ] Verify release approvals apply to the exact candidate; invalidation, concurrency and recovery behavior are explicit.
- [ ] Implement §1.5 connection onboarding: three paths, reviewed contracts, credential/connectivity boundaries, disabled-by-default tools and sandbox acceptance evidence.
- [ ] Stage §14 protocols across G2.1/G2.2/G2.3/G2.4/G2.5; demonstrate interrupted execution, ambiguous external outcomes and bounded typed recovery before expanding autonomous execution.
- [ ] Review §15 UX alternatives with the Owner before selecting or implementing new presentation modes.
- [ ] Define §13 change contracts, rule-review states, dependency impact and evidence invalidation; prove missing/stale checks block promotion.
- [ ] Demonstrate characterization versus approved changes, independent architecture/security review, bounded pilot execution and tested recovery on Machine Shop.
- [ ] Conduct the §10.7 business-user walkthrough and partner review before expanding presentation or adjacent service lines.


### 8.8 Workbench fast path, Change Ledger, Cockpit and domains (§17–§20)
- [ ] **F1** complexity tiers in the domain (floors, escalation, rubric, structured assessment, next automatic action); Low ships with no decision through the TDD plane; Medium Brief + Ship it + optional standing approval; High keeps the gates; cadence retired; migration `0008_complexity_tiers.sql` (also records the site's domain).
- [ ] Run `0008_complexity_tiers.sql` on accelerator-test before pushing F1.
- [ ] F1 live run on Machine Shop: one Low and one Medium item end to end; record decisions, presses, time to preview and time to live.
- [ ] **F2** decision cards in the conversation, typed approval with version binding, pause from chat; remove the "Needs you" bar and per-step buttons.
- [ ] **F3** the Cockpit layout: central conversation, summary cards, side bar, artifact drawer, instrument panel (§19.4), starting with the instruments whose data already exists (test health, Work in flight, Lighthouse, delivery flow).
- [ ] **F4** streaming lead turns from the API, pushed events, one agent session per Work item.
- [ ] **F5** live voice in the cockpit widget (OpenAI realtime over WebRTC, member session instead of an access code), global composer, slash commands.
- [ ] Change Ledger: ledger entries in the Site Timeline, per-site land lock with compare-and-swap, API-first code reads (with G2.2/G2.5).
- [ ] Domain packs: registry, Commerce and Hospitality packs, domain-tier skills and complexity hotspots (with G2.3); domain picker in Configuration.
- [ ] Planned migration numbers move up by one: crew 0009, toolbelt 0010, library 0011.
---

## 9. Agent interfaces, decisions, live agents and generative forms (added 2026-10-12)

The design is agent-first: **every capability is a tool, and every screen a human uses is one an agent could use too.** **Server-side MCP over real APIs is the primary interface** for everything we control (D21). WebMCP (tools a web page exposes to browser agents) is an early browser proposal: we use it only as an optional extra on client sites, never as a dependency. Five additions follow.

### 9.1 Agent commerce (Stripe) and agent-ready sites: APIs first, WebMCP optional
**Position (D21, 2026-10-12): server-side MCP over APIs first; WebMCP only as an optional extra.**
- An agent calling an MCP server backed by a real API works with any agent framework today, runs on the server, and uses our credentials and gates.
- WebMCP needs the agent to be in a browser that supports an early, still-changing proposal. It's useful for browser agents, but not something to build on yet.

Stripe's post is still worth learning from for its *patterns*, which apply equally to server-side MCP.

**What Stripe showed** ([How Stripe is designing checkout for AI agents](https://stripe.dev/blog/how-stripe-is-designing-checkout-for-ai-agents)):
- Stripe Checkout exposes **WebMCP** tools, so a visiting agent calls `get_order_summary` or `fill_payment_form` instead of reading pixels and HTML.
- Stripe reports 42% fewer tokens, 38% fewer tool calls and 39% faster checkout than browser-only agents.

Three patterns we adopt:
- **Progressive disclosure.** A tool appears only when it's valid. `submit_payment` is hidden until the form is complete; a field disappears when it no longer applies. Our Toolbelt does the same: a specialist's `tools/list` depends on the Work item's stage and gate state, not just its role.
- **Declarative forms.** The tool schema is *derived from the visible form*, so there's no second schema to maintain (see §9.5).
- **No forked logic.** Agent tools call the same state and validation that humans use. This is our one rule (§0.1) again.

Stripe's wider agent-commerce stack (verify against docs.stripe.com before building):
- The **Agentic Commerce Protocol** (with OpenAI)
- **Shared Payment Tokens** (scoped to a merchant and cart total; the agent never sees card details)
- An official **Stripe MCP server / agent toolkit** with restricted keys

**For the platform:**
- Stripe joins the Toolbelt as a fronted connector (§1.2.6), **test mode only for builders**, with restricted keys.
- A client's own agent reaches the Control Room through the member-facing MCP endpoint (§1.4), server-side, not by browsing the console. **No WebMCP in the console.**

**For clients (a new service line):** "**Agent-ready site.**" Agents are becoming customers.
- The Checkup scores agent-readiness: an API or MCP endpoint for key actions, structured data, `llms.txt`, a clean checkout path. WebMCP counts as a bonus, not a requirement.
- A crew skill pack gives a client's key actions (search, quote, checkout) a **server-side MCP endpoint over the site's existing API**, plus ACP/SPT support for commerce sites. WebMCP on the same forms is optional and cheap, because it reuses the same schema.

  It's an easy upgrade to justify ("agents can buy from you"), and it fits the Upkeep specialist.
- **Machine Shop is the first showcase:** an agent searches, reads product details and asks for a quote through Machine Shop's own MCP endpoint.

### 9.2 The Decide layer: fast typed decisions (Jev)
**What Jev is** ([Vercel AI Gateway: Jev launch](https://vercel.com/blog/ai-gateway-jev-model-launch), 2026-09-15, by TypeSafe AI): a probabilistic decision model.
- It receives context plus a set of questions, and returns **typed choices, scores or true/false answers, each with a probability**.
- TypeSafe AI reports it as up to 194× faster and 445× cheaper than LLMs for these decisions (vendor figures; to be measured on our own workloads).
- Its intended uses are tool and subagent selection, workflow routing (continue · retry · ask · stop), risk scoring, and guardrail checks.

**Where it fits:** it is exactly the slot "models classify; policy decides" (§0.7) needs. accelerator.md §2 already said that any fast, typed, independent judge fills that slot. Jev is now a real candidate.

**Design: one `decide()` interface, model-agnostic.** Jev is a proposed provider, not a deployed dependency. Historical speed/cost claims below are vendor claims, not measured Accelerator performance. Context-history pruning is a separate adapter and evaluation (§11.3). It runs behind an adapter (Jev on AI Gateway first; fallback is a small LLM with structured output), so it's swappable like every other role (F15).

```
decide(context, questions[]) → { answer, probability }[]     // typed, logged, cheap
```

| Use | Question asked | Who acts on the answer |
|---|---|---|
| **Intake triage** | kind (content · design · bug · feature · data), size, risk class, duplicate of #n? | Gate policy maps risk class → gates. **Low probability → ask the human** |
| **Next step on the rail** | continue · retry · ask the Navigator · stop? | The runner, within the item's cadence (F9) |
| **Tool and skill pre-selection** | which 5–8 tools and which skills does *this step* need? | The Toolbelt lists only those, and only those skills are loaded: progressive context selection; distinct from history compaction (§11.3) |
| **Model routing** | how hard is this step (score)? | Picks the cheap or strong model for the role, within spend caps |
| **Pre-Judge screen** | does the diff touch money, auth or data paths? does the step report meet the Protocol? | Flags for the full Judge; **never replaces it** |
| **Inbox ranking** | urgency, and how much work does this card unblock? | Sorts "Needs you" |

**Rules:**
- Probabilities feed **thresholds that live in `packages/domain`** (deterministic, tested).
- Every decision is logged as evidence (inputs summary, answer, probability, model).
- Money, auth and security classification are also checked **deterministically** (file paths, schema changes), and either check can raise the class. Neither can lower it.

### 9.3 Output a human can understand: Karpathy's ladder
**The post** (full text supplied by the owner, 2026-10-12): as LLMs do more of the legwork, *"a lot more of our work will rise up the abstractions into oversight and understanding."* He ranks output formats, each "even better" than the one before:
1. **Writing in controlled English:** ASD-STE100, the Simplified Technical English of aerospace maintenance manuals. LLMs know it well, and its strict rules make text much more readable. Softened as "80% of the way to ASD-STE100", because the full spec is strict.
2. **Diagrams:** easier to take in than prose.
3. **Web pages:** ask for the output "in HTML" to get an interactive page.
4. **Explainer videos:** bespoke and narrated (e.g. "3b1b style", with narration from a voice API). "This is actually starting to work."

Because code is now abundant, he says to ask for **"large, custom, discardable software artifacts"** that never made sense to build before.

**Why this is central to our product, not just a writing tip:** the Navigator's whole job *is* oversight and understanding. The crew must hand over understanding, not just diffs and test counts.

| Rung | What the crew produces | Where it appears |
|---|---|---|
| **1. Writing** | Inbox cards, plans, step reports, evidence summaries and release notes in "80% of the way to ASD-STE100". Skills and specialist instructions are written the same way, so they read as a clean handbook | Everywhere; it makes the Protocol's "Report plainly" checkable |
| **2. Diagrams** | A "what changed" diagram for each design and each release: affected pages, data flow, before and after | The Design stop, the evidence, the Library |
| **3. Web pages** | A **discardable interactive explainer page per Work item**: what was asked, the design, before/after, the evidence, links to try it | The Try stop; saved in the Library |
| **4. Videos** | A short narrated explainer for each release and for the weekly briefing. For prospects: the Machine Shop showcase | Releases, the weekly briefing, the website |

**Rules:**
- **Artifacts are built only from the record** (the Work item, its evidence, the Site Timeline). They never state a fact the record doesn't hold, and they're labelled as generated.
- **They're discardable:** regenerate any time; the record is what's kept.
- **Clear isn't the same as correct.** Controlled language and polished pages don't make a claim true; the Judge's evidence still decides.
- **Cost:** pages and diagrams are cheap. Narrated video is a per-role model setting, using the client's or our voice-API key from the vault, behind a spend cap.

Related agent-design practice we follow:
- Keep the generate → verify loop short, with the human verifying fast; rungs 2–4 exist to speed up that verification.
- Use an autonomy slider (our cadence and AC levels).
- Engineer the context per step (§9.2, tool pre-selection).

### 9.4 Live agents: a template for voice and real-time work
**Sources:**
- OpenAI **GPT-Live-1** (API since 2026-09-10; $0.05/min for the voice layer, plus backend usage) and its [Live guide](https://developers.openai.com/api/docs/guides/live)
- The [insurance-claim live agent team](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/voice_ai_agents/insurance_claim_live_agent_team) (Gemini Live plus a background agent graph)

Both describe the same architecture, and it becomes our **Live Agent Template**:

```
 Human ⇄ LIVE LAYER (voice/video, full duplex; short prompt: style + when to delegate)
            │ delegates (client delegation → our own backend)
            ▼
        BACKEND = a crew specialist on the Toolbelt (rules, tools, validation, gates)
            │ non-blocking tools; urgent results may interrupt, others wait for a pause
            ▼
        STATE PANEL the human watches: checklist · captured facts · live form (§9.5) · evidence
```

**Template rules** (from both sources, matching §0):
1. **The live prompt is short:** tone and when to delegate. Business rules, tools and workflows live in the backend specialist's skills.
2. **Permissions and confirmations are enforced in the application, never only in the prompt.** Gates still apply.
3. **Tools don't block the conversation.** Results arrive asynchronously, ranked by urgency, and the human can interrupt at any time.
4. **Facts count only when the server captures them** (evidence integrity). The transcript is not the record; the Work item is.
5. **Human-in-the-loop routing for edge cases**, and graceful degradation (voice → text; video → voice).
6. **Keys stay on our server.** The browser gets a short-lived session (as with job tokens).
7. **The voice model is a per-role setting** (GPT-Live, Gemini Live, or the next one) behind an adapter, like every other model.

**Where we use it:**
- **Boarding step 3, the Interview**, and the rail's **Discuss** stop. The Consultant talks with the business expert while requirements, decisions and a form fill in on screen. Every captured fact is confirmed and saved to the Work item.
- **The weekly audio briefing** (accelerator-control-room.md §6.10).
- **For clients (a service line):** the crew can add a live agent to a client's site from the template. **Machine Shop's shop assistant goes live (voice) as the showcase.**

**Browsing agents** (the owner's resort-booking experience with the live demo) are the visitor side of §9.1. They work today by reading the page, which is slower and less reliable. A site's own MCP endpoint is the dependable path for them; WebMCP may help browser agents later.

### 9.5 Generative forms (GenUI): yes, if the agent fills a spec rather than writing code
**The example is practical with today's models:** "I want to update my profile" → the agent reads the profile schema → builds the fields and validation → shows a form the human completes while the conversation continues. The part to avoid is an LLM *writing UI code* at runtime. The part that works is an LLM **filling in a declarative form spec** that we render with our own components.

```
1 intent        decide(): "update profile"                         (§9.2)
2 schema        Toolbelt form.for("profile") → fields the CALLER may edit, from the zod/DB
                schema plus permissions. The server decides the fields, never the model
3 spec          the specialist writes a FormSpec (JSON): order, labels, help text, prefill
                from the dialogue. Only component types in our catalog are allowed
4 render        one <FormRenderer> (shadcn + react-hook-form + the same zod schema)
5 fill live     the agent calls Toolbelt tools (form.fill_field, form.focus); the server pushes
                each value to the open form, and the human sees and corrects each one
6 submit        API re-validates with the same zod schema → gates (e.g. a new mobile number
                must be verified) → audit → Site Timeline
```

**Rules:**
- **Secret fields never pass through the agent.** A `secret` field type posts straight to the vault; the agent sees only "set" or "missing". That is how the Connect step's leftover keys (§2.5) get entered. It's consistent with the earlier decision against AI-generated key forms: the catalog decides the fields, the agent only arranges them.
- **The component catalog is small and ours:** text, email, phone, number, money, date, select, multi-select, toggle, textarea, file, address, secret, plus read-only cards, tables and before/after rows.
- **Validation lives in one zod schema**, used by the renderer, the API and the agent's tool schema. This is Stripe's "declarative form" pattern from §9.1, so there's nothing to keep in sync.

**Libraries:**
- **shadcn/ui** is the foundation: we already use it, own the code, and it has form and validation patterns.
- **Opensource UI** (opensourceui.in, MIT) is a copy-paste catalog of Tailwind/React components with no runtime engine. It's good for picking or adapting catalog pieces and marketing sections, not as a GenUI engine.
- Emerging standards for agent-to-UI specs (declarative UI-spec protocols, and UI resources over MCP) are worth tracking. Our FormSpec stays internal, behind an adapter, until one of them clearly wins.

**Where it appears first:**
1. Boarding Connect: leftover keys via `secret` fields.
2. Profile and settings in the console.
3. Requirements capture during Discuss and Interview (a live checklist plus a form).
4. Data Desk fixes (before/after rows, approve).
5. **For clients:** a crew skill pack for conversational forms on their sites (Machine Shop: a quote request filled by voice).

**Verdict: not hoping for too much.** Generating forms, cards and tables from a fixed catalog is reliable now. Generating whole, free-form pages at runtime is not, so we don't.

---

## 10. Executive governance, expert meetings and engineering assurance

*Owner-directed design revision, 2026-10-12. Target behavior, not a shipped-feature declaration. This section refines D4 and applies across the existing Toolbelt, rail, Library, Crew Lab and partner design.*

### 10.1 The executive and the accountable Team Lead

The business leader is the **Navigator**: a wave runner who senses the site's vital signs, chooses direction and governs consequential decisions. The crew handles project coordination. The client must not assign eight agents, sequence their tasks, interpret raw logs or chase their handoffs.

The Consultant configuration becomes the **Team Lead**. It understands the business, owns the recommendation and delivery commitment, delegates to specialists, reconciles findings and escalates uncertainty. It never manufactures certainty or overrides the Judge or domain policy. Specialists retain their roles, tool boundaries and evidence responsibilities.

| Responsibility | Accountable party |
|---|---|
| Outcomes, priorities, acceptable tradeoffs and budget | Authorized client decision-maker |
| Recommendation, coordination, updates and exception synthesis | Team Lead |
| Architecture, design, implementation and operational findings | Relevant specialists |
| Independent acceptance review | Judge/QA, with permissions separate from Builder |
| Authorization, budgets, state transitions and gate enforcement | API and deterministic domain policy |

**Versioned mandate:** record the approved outcome, scope, acceptance criteria, budget/time limits, protected invariants, permitted actions, decision owners and expiry/review point. Every run references the applicable mandate version. A client can pause or revise it; revisions are audited and invalidate affected pending actions where necessary.

Gate frequency follows the complexity tiers of §17 (D41, Owner-approved 2026-10-17): Low ships through the TDD plane with no client decision; Medium needs the Brief and Ship it; High keeps design, plan, Try and release gates. Cadence is retired. Protected risk classes always set the High floor and keep the Owner's gates. The mandate clarifies authority; it does not introduce permission to skip a gate the tier requires. The executive sees the business decision at each gate; internal specialist handoffs need no additional approval when already authorized.

Escalate for changed scope, budget exposure, missing strategic information, contradictory requirements, blocked dependencies, material architecture tradeoffs or protected money/data/auth/security actions. Each decision card states: recommendation, alternatives, business effect, cost/risk, evidence, who can decide and what that decision authorizes. Deferring has an explicit consequence. Partners can prepare decisions but cannot acquire client gates through the Team Lead.

### 10.2 A shared meeting workspace

**Presentation review (2026-10-15):** retain the lead-led interaction and shared artifacts. The Zoom-like meeting layout is one candidate lens, not a required default for every role. §15 proposes alternate views over the same records; final selection remains open.

Evolve the existing Work Room: keep the persistent conversation and artifacts, then add lead-led specialist contributions and a shared presentation surface. This is a meeting metaphor over real asynchronous jobs, not a requirement to run all specialists continuously.

```text
Machine Shop       Site condition · Budget · Decisions needing you
Crew roster        Shared conversation       Shared presentation
Team Lead          Recommendation            Customer journey / design
Designer           Invited contribution      Before / after / preview
Data specialist    Findings and tradeoffs    Architecture / dependencies
Judge / QA         Acceptance findings       Checks / evidence / risks
                   [Choose] [Revise] [Try] [Approve authorized action]
```

**Interaction contract:**
- One lead addresses the client by default. The client can request a specialist; the lead invites one when its expertise changes a decision. Show who contributed and which artifact/evidence supports the contribution.
- Every specialist speaks as a business advisor: what this means, its recommendation, remaining uncertainty and the required decision. Engineering detail is inspectable through progressive disclosure.
- Presence states come from jobs/session records: available, queued, working on a named task, awaiting input, completed, blocked or unavailable. An avatar is a role identifier; “online” never implies an agent is continuously thinking.
- Shared artifacts include requirements, option comparisons, customer journeys, diagrams, dependency maps, before/after views, previews and proof. Small catalog-rendered forms/cards are the default; free-form generated explainers remain derived artifacts under §9.3.
- Decisions are typed server actions, not interpretations of conversational enthusiasm. The server checks caller, site, mandate, stage, artifact version and approval eligibility; it records the actual result. Pending is distinct from succeeded. Failed actions show a recoverable reason.
- Contributions and actions have ordered, durable events. Refresh/reconnect restores the same meeting state; repeated submissions do not duplicate jobs or approvals. Polling is acceptable initially; streaming is an adapter choice, not a prerequisite.
- Work/site/mandate context is explicit. Switching sites cannot carry a draft action or privileged context into another tenant. Keyboard access, readable transcripts, mobile use and text-only operation are supported.

**Representative meeting:** the client says “Mobile visitors aren't completing quote requests.” The lead checks whether analytics substantiate that observation; missing analytics is reported. The designer presents two flows, the data specialist explains submission/storage implications, and the lead recommends one with scope and acceptance criteria. The client approves the design and plan at existing gates. The crew handles execution and QA. At Try, the shared surface shows the exact preview and customer checklist; release remains separately authorized. Learn produces an evidenced proposal after the outcome, not a celebratory assertion.

Optional voice follows the same records, permissions and decisions. Rich avatars, multiple speakers and narration follow successful text-and-artifact validation. No simulated cross-talk or synthetic presence is needed to demonstrate expertise.

### 10.3 The site capability inventory

The executive's “component” means a **business capability**, not a React component, file or job. The durable hierarchy is **Site → business area → capability → linked technical assets**. Start with Machine Shop catalog, search and quotes. Survey proposes boundaries; the client/operator reviews them before the accepted inventory changes.

| Record | Required meaning |
|---|---|
| Capability | Stable ID, site, business area, name, purpose, lifecycle, importance and accountable role |
| Requirements | Versioned behaviors, constraints and independently verifiable acceptance criteria |
| Technical links | Routes/UI modules, API contracts, schemas, services/integrations, tests and architecture decisions |
| Dependencies | Capability/asset links, failure impact and known unknowns |
| Evidence | Check result, source, environment, candidate commit/version, timestamp and freshness policy |
| Work links | Many-to-many links: one change may affect several capabilities; one capability has many changes |
| Scope history | Proposed/confirmed boundaries, estimate range, basis, confidence and reviewed revisions |

Technical assets can be shared across capabilities without inflating capability counts. Rename preserves identity; split/merge/retirement records lineage and changes the versioned scope. Tenant scope, permissions, audit and export apply to all records. The Team Lead proposes inventory updates; generated discoveries do not silently become accepted assets or enable tools.

**Separate dimensions:**
- Lifecycle: proposed, accepted, retired.
- Operational condition: verified, needs attention, unverified; show evidence age and critical failures.
- Change progress: backlog, discovery/design, building, testing, awaiting decision, released; show each active Work item rather than collapsing overlapping changes into one misleading status.

Search can be verified and live while an enhancement is in design. New planned capabilities have no operational verification until they exist. Work completion does not automatically make a capability healthy: acceptance evidence must support it.

**Inventory scorecard:** show confirmed versus proposed capabilities; verified/attention/unverified counts for the defined accepted population; a separately labelled Work pipeline; and scope delivery against an approved baseline. Counts across different views do not add together. Size/effort ranges are reviewed estimates, with assumptions; no file-count completion percentage. Any weighted score must expose its formula and criticality weights, and cannot hide a critical journey failure. Start with transparent counts.

### 10.4 Executive vital signs and the four screens

The Overview answers: **Are we achieving the business purpose? Is the site working? Are commitments controlled? What needs my decision?** It should also reveal missing instrumentation and increasing complexity before they become surprises.

| Vital sign | Definition and evidence |
|---|---|
| Business outcomes | Client-selected KPIs such as qualified quote requests and completion rate; explicit numerator/denominator, source, period, baseline and target |
| Customer-journey condition | Critical acceptance scenarios, production-safe monitoring where authorized, incidents and last verification |
| Delivery | Approved scope accepted, blockers, commitments and forecast ranges; scope changes visible |
| Budget | Recorded spend, remaining authorized budget and estimated exposure; distinguish model costs from other delivery/service costs |
| Risk and complexity | Protected changes, failing/stale checks, fragile dependencies, unresolved architecture decisions and growing maintenance burden |
| Crew effectiveness | Comparable work's send-backs, first-pass acceptance, time-to-live, intervention and cost, with sample size |

Every vital sign carries a definition, source, timestamp, observation window and sufficient-data rule. Zero is different from missing; small samples and stale data are explicit. Model-derived interpretations are labelled and link to underlying measurements. Goals are not measured results, and “release succeeded” is not “business KPI improved.” Report correlation without claiming causal improvement that the evidence cannot establish.

| Screen | Purpose |
|---|---|
| **Overview** | Business vital signs, exceptions, recent outcomes and decisions needing attention; lead's concise briefing |
| **Work** | Priorities/commitments and the shared meeting for each governed change; rail remains available as execution detail |
| **Site** | Capability inventory, condition, dependencies and customer journeys; technical maps behind Engineer view |
| **Crew & Knowledge** | Team remit, handbook, decisions, Library/export and evaluated learning; Crew Lab remains operator-only |

Replace references to the old four-screen names in this document with this target. Existing pages may remain during migration. Setup is a guided entry flow, not permanent navigation the executive must manage. Library information also appears contextually in Site and Work. Configuration and model controls remain operator/Engineer concerns.

**Operational truth first:** the source review on 2026-10-12 found the Bridge still using older request/release records, non-demo decision/signals arrays empty, some toast-only operational actions and a fixed trend array. Treat these as a dated review baseline, to reconcile with Claude's current changes. Overview and Work must read the same operational records. No approval, deployment or undo is represented as completed without its recorded result; unavailable recovery is stated honestly.

**Partner portfolio:** prioritize client exceptions, blocked commitments, health, budgets and decisions; open a site meeting to prepare a client review with recommendations and proof. Client authority remains intact. Partner portfolio UI follows validated site behavior rather than delaying it.

### 10.5 Engineering architecture and assurance

Retain the current Next.js/React/TypeScript stack, separate API, pure domain package, typed API client and Tailwind/component foundation. Adapt shadcn patterns where appropriate; do not assume a new UI library or framework migration is required.

Architecture work is explicit: module responsibilities and dependency direction, API/event contracts, state machines, tenant/credential boundaries, schema constraints, failure handling and architectural decisions. The engineering view links each business capability to these assets. Add an Architecture remit to the crew configuration (initially assigned to a qualified existing specialist); it does not require another runtime or another client-facing coordinator.

**Boundaries:** console renders and requests actions; API authorizes, persists and orchestrates; domain owns pure rules; runner executes bounded jobs; Toolbelt wraps integrations; Library retains versioned decisions/evidence. Agents cannot bypass those boundaries through a generated UI. Keep release tools separate from Builder permissions; an allowlist must be enforced on invocation, not only through discovery.

**Proof chain:** business requirement → approved design/architecture → typed contract/implementation → acceptance scenario → evidence at an exact candidate → authorized release → live verification and outcome observation.

| Assurance layer | Required proof |
|---|---|
| Static checks | TypeScript, configured lint and applicable production builds; document missing scripts before establishing required checks |
| Vitest | Meaningful domain, state-transition, authorization and behavior tests; failure cases and invariants rather than implementation mirrors |
| API/integration | Validation, cross-tenant denial, gate enforcement, stale approval rejection, retries/idempotency and connector failures |
| Browser QA | Critical journeys on representative desktop/mobile layouts, negative scenarios and relevant accessibility checks using a selected browser harness |
| Independent review | Judge/QA reviews acceptance and architecture/security implications separately from Builder; missing review is visible |
| Release/recovery | Exact candidate/preview identity, merge validation, live journey checks and a documented, exercised recovery path |

Keep the established `pnpm typecheck && pnpm test` baseline. Add relevant lint/build/integration/browser checks to the release checklist as configured; no claim that those scripts or suites already exist. A test count must not stand in for coverage of a requirement. Small changes need proportionate meaningful checks, not redundant tests for their own sake.

Approvals reference the actual artifact and candidate version. Rebuilds, changed requirements or changes to the release candidate invalidate affected proof/approvals. Release concurrency is controlled per site; merged changes are revalidated and materially changed candidates return for required review. Deterministic policy decides readiness; the lead summarizes it.

Example assurance: “The mobile quote journey passes QA; catalog writes remain prohibited; one integration is unverified, so release is held.” Keep raw results inspectable. An HTTP probe alone cannot verify that the quote workflow works. Rollback must account for data/schema compatibility and report its actual execution; no universal 30-second undo promise.

### 10.6 Measured improvement, not accumulated memories

The flywheel is **observed result → proposed lesson → evaluation → authorized activation → later measurement**. Learn records failure/correction categories, acceptance results and costs; it can produce no proposal when the evidence does not justify one. Closing a Work item is not itself learning.

Each proposal identifies the source cases, hypothesis, affected skill/specialist and capability, expected benefit, regression risks and evaluation plan. Compare the live and draft configurations on both replayed work and **holdout scenarios not used to draft the lesson**. Report evaluation conditions, versions, sample size, checks, interventions, cost and time; preserve non-negotiable invariants. Define promotion thresholds before evaluating. No safety regression is acceptable in exchange for cheaper output.

Activation uses the existing tier approval owner (§2.2), versions and rollback. Measure later comparable jobs, report uncertainty and retire ineffective lessons. Cross-client promotion follows existing consent and anonymization requirements.

Example: “Proposed: test narrow mobile quote layouts. Two recent changes hid a control. Draft caught both replay failures and passed the holdout set. Awaiting approval.” After activation, report observed results separately. “47 things known” remains a knowledge inventory; it is not a performance claim.

### 10.7 Product acceptance and implementation boundary

Before refactoring, reconcile Claude's current commits, migration execution and live-work status. This documentation change authorizes the target design only. The Owner separately authorizes the next code round. Preserve historical checked items; new targets remain unchecked until their evidence exists.

Run a walkthrough with a business user who did not design the product: inspect vital signs, choose a priority, discuss an improvement with the lead, understand a specialist recommendation, review scope/budget, try the preview, approve an authorized release and explain the learning evidence. Record where the user needs help, the decisions they understand and any manual specialist coordination. Repeat after fixing material comprehension gaps. Run a partner/client review with distinct permissions as a separate scenario.

**Core release acceptance:**
1. The client can govern the walkthrough without assigning or sequencing agents.
2. Every displayed status/metric/action is sourced or explicitly unavailable/demo; reconnect preserves meeting state.
3. Accepted capabilities link to requirements, engineering assets and evidence; condition and change progress remain distinct.
4. The critical Machine Shop journeys have meaningful automated and browser evidence, with independent acceptance review.
5. Gates, tenant boundaries, spend limits, stale approvals and failure/recovery behavior are verified.
6. At least one approved lesson has replay/holdout evidence and a subsequent measurement, without overstating the result.

Success is executive understanding and controlled outcomes, supported by engineering precision. Presentation, model choice and skill counts serve that result.


---

## 11. Collaborative intent, executable proof and continuity (2026-10-14)

### 11.1 Requirements are a dynamic expert interchange

The functional expert explains the business process, calculations, exceptions and desired outcome. The crew reflects that understanding, challenges assumptions, offers alternatives, identifies gaps and works through examples. The Team Lead synthesizes the agreement. This continues as observations reveal new information; requirements are never frozen merely because the first interview ended.

Independently defined expected results originate in that agreed business meaning, not in a separate party guessing what the client meant. Independence means the implementation cannot redefine the expected result to justify itself. Version requirements, examples, open assumptions, approvals and acceptance criteria together. A material change returns the affected design, tests, evidence and approvals for review; retain the previous agreement and rationale.

### 11.2 TDD and synthetic QA are first-class workbench capabilities

Cypress reference: `ts-platform/packages/domain/src/availability-engine/index.test.ts`, `packages/qa`, and the portal admin QA page. Read-only examples, never an Accelerator test target. The Owner reports 600+ unit tests and 100+ QA checks before commits/PRs; those are reported reference counts, not a new execution result or an Accelerator minimum.

**Delivery contract:** agreed behavior → independently reviewed acceptance scenarios → meaningful failing behavioral test → minimal implementation → green checks → refactoring → regression and synthetic QA → independent acceptance review → exact-candidate release approval.

Record red and green outcomes against code/test versions. A red test must fail for the expected missing behavior, not merely a broken fixture, import or unavailable service. Test expectations cannot be silently weakened to get green. A proposed change to approved acceptance rules needs rationale and review; the Judge has no implementation-write authority. Tests can be co-authored by agents, but use reviewed business examples, invariants and holdouts to counter shared misunderstanding.

Package-local Vitest suites protect domain rules. Shared QA exercises cross-package behavior through the same production API/domain functions. Prefer one scenario definition usable from automation and the workbench UI, with server-controlled execution and scope. Add a dedicated QA package only if that boundary warrants it; do not duplicate business calculations in a test dashboard.

| Check mode | Evidence and boundaries |
|---|---|
| Deterministic fixtures | Schema-valid inputs plus independently defined expected values, frozen/controlled clocks and repeatable seeds |
| Generated scenarios | Valid relationships and lifecycle transitions, boundaries and negative cases; invalid-input tests are explicitly designated; seed and fixture version retained |
| Invariant/property checks | Domain guarantees such as rate precedence, reconciliation, tenant separation and idempotency; schema validity alone is insufficient |
| Journey/integration QA | Multi-step customer behavior through real application boundaries; distinguish mocked, database-backed, browser and external sandbox checks |
| Payment sandbox | Verify provider/account test mode before execution; scoped credentials, unique run IDs, idempotency keys, synthetic entities and recorded cleanup; no live charges |
| Regression | Every confirmed defect becomes a reproducible case; baseline suites remain protected and failures block the relevant promotion |

Each run records scenario/version, seed, candidate, environment, expected/actual result, runner/tool version, start/end, failures, skips and cleanup status. Cleanup failures remain actionable records and use only the run's owned entities. Never let an agent re-run a side-effecting transaction as if it were a harmless read. Synthetic transactions stay in approved test environments; copying customer/production data is not an automatic fixture strategy.

The engineering workbench shows coverage of agreed behavior, red/green history, synthetic journeys, sandbox receipts and regression findings. The executive sees “checked against your agreement,” what remains unverified and the release consequence. TDD, Vitest, schemas and test counts are supporting detail, not homepage vocabulary.

Preserve the existing pre-push checks and add configured lint/build/QA gates. Run the full required regression suite before commits/PRs, with sandbox QA in its configured environment; focused local TDD runs do not replace those gates. Document unavailable suites as blockers where required, never as passes. Evaluation must protect meaningful behavior rather than reward growing test counts.

### 11.3 Jev: typed decisions and experimental context-history selection

The §9.2 `decide()` adapter proposes typed routing, triage and relevance judgments. History compaction is a distinct adapter: for eligible older tool-call/result pairs, score whether the call matters and whether the result must remain verbatim, then deterministically retain, truncate or omit it from working context. Surviving dialogue is not rewritten by that operation. Preserve valid call/result pairing and mark truncation; pin recent turns and authoritative requirements, active mandates, approvals, protected invariants, unresolved dependencies and critical action receipts.

The Library/event history remains intact. Context pruning removes nothing from the durable record. Store selection decisions, scores, thresholds, model/version and references to recoverable evidence. Reconstruct context from current approved records and source-linked saved threads. Do not depend on Claude-specific plugin hooks: verify runner/harness support and implement behind an adapter. Never expose additional third-party context without the site's approved provider/data policy.

Evaluate retention fidelity against questions about long-running work, unresolved decisions and earlier failures, as well as latency, reduction, cost and downstream errors. Confidence is a model signal, not guaranteed correctness. Low confidence or adapter failure uses a tested fallback that retains mandatory context; insufficient budget/context capacity must surface rather than silently dropping authority. A read may be refreshable; payments, deploys and historical receipts are not safely regenerated by blindly repeating a tool.

Reference implementation description: https://typesafeai.app/use-cases/replace-compaction-summaries-with-jev-decisions/ . Treat speed and cost as workload-specific measurements, not promises. Trial remains optional after core delivery and evidence are working.

### 11.4 Events can activate a crew within existing authority

Add a provider-independent signal intake: **MCP Events/webhook/schedule → verify origin and resolve tenant → persist → deduplicate → classify relevance → enforce mandate/budget → queue bounded specialist job → brief Team Lead → investigate or request a decision**.

MCP request/response tools, resource/session notifications and durable external event webhooks are distinct capabilities. Negotiate and verify each provider/client/transport; MCP alone does not guarantee background wake-up. Cloudflare's October 13 Workers Issues announcement is an adapter example, not a reason to move hosting or a promise that every connector supports events: https://developers.cloudflare.com/changelog/product/agents/ . Ordinary signed webhooks and scheduled reconciliation remain supported alternatives.

Persist provider event ID, site/connection, type, signature-verification result, occurred/received timestamps, correlation/dedupe key and processing state. Resolve site from the trusted connection/subscription, never an untrusted payload tenant ID. Add replay protection, retries, dead-letter visibility, ordering policy, rate/debounce controls and storm/spend limits. Treat event text as untrusted evidence, not agent instructions. A queue/outbox or equivalent durable dispatch prevents lost work after acknowledgement; subscriptions and cursors survive reconnect where supported.

Example: an error signal wakes Upkeep for a read-only investigation, QA reproduces in the sandbox, and the Team Lead explains the business impact. A repair follows normal governed Work. Events never bypass client gates or silently expand permissions. Avatar activity begins when a real job runs, not merely when a notification arrives. Test duplicate, delayed, out-of-order, forged and cross-tenant events plus budget exhaustion and recovery.

**Concrete adapter candidate — Vercel MCP Events (reviewed 2026-10-16):** Vercel announced Connect MCP Events public beta on October 15. Compatible MCP servers can supply subscribed events; Connect manages upstream subscriptions/renewals and verifies/forwards deliveries. AI SDK supplies experimental discovery/subscription interfaces. This is a practical adapter option for this section, not a new architecture requirement or an already-installed integration. Sources: [Vercel announcement](https://vercel.com/changelog/mcp-events-support-in-vercel-connect-is-now-in-public-beta), [AI SDK event reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/mcp-events).

Keep the provider-independent intake contract. A managed subscription service does not replace our durable event receipt, tenant resolution, deduplication, authorized dispatch, budgets or client gates. Bind subscription identity, endpoint and destination from trusted connection records, never model arguments. Persist monitoring intent and stable creation keys; distinguish pending/active/needs-auth/expired/stopped/failed subscriptions, detect renewal/delivery gaps and reconcile uncertain creation or cancellation outcomes. Unsubscribe/revocation must disable new dispatch even while upstream cleanup is pending. Server compatibility and beta support must be verified before adoption. Ordinary signed webhooks and scheduled reconciliation remain alternatives.

Acceptance should show an authenticated event arriving while no conversation is open, producing one permitted bounded investigation and a visible Team Lead update. Exercise duplicate/forged/cross-tenant delivery, interrupted dispatch, renewal failure, subscription revocation and event storms. Animation follows a recorded running job, not mere event arrival. This candidate adds no SDK dependency or live subscription now.

### 11.5 Save unfinished thinking without committing work

Add a first-class saved thread for an idea, question, option, unresolved decision or proposed work. Retain exact source passage/message links, author, site, related capability/outcome/work, status, owner, timestamps and optional revisit date or event trigger. Agent extraction is a proposal the human can inspect; pinning an item is explicit and reversible.

Lifecycle: open/parked → exploring → resolved, superseded or dismissed; conversion to proposed Work creates a link rather than discarding context. “Approved” belongs to a separate explicit decision action. Saving never implies approval, enabling a tool, changing a mandate or accepting backlog scope.

Meeting actions: Save for later, Explore now, Request recommendation, Propose work, Resolve. When an exchange raises seven points and explores two, the lead offers the five remaining topics as visible proposed threads. Preserve relationships and source evidence when deduplicating; ambiguous duplicates stay separate. A lead briefing can resurface threads by relevance, urgency or revisit trigger without interrupting every conversation.

The client and agents can search/retrieve permitted threads. Respect tenant access, retention, correction and export. Superseded material remains distinguishable from the current agreement. The Library is a record of unfinished intent as well as settled knowledge; context compaction cannot erase that continuity.

### 11.6 Executive marketing and commercial decisions

**Headline (Owner-approved): “What you intended. What you approved. Delivered.”**

**Subtext:** “An executable record of business intent and proof for your software assets, delivered by your specialized crew of agents.” The suggested “world's first” is omitted pending substantiation; it is not an established market claim.

Positioning: **human-governed, agent-executed delivery**. One accountable Team Lead and specialist advisors help the client think through the business, then coordinate within explicit authority. The selling story is continuity, executive decisions, visible capabilities/vital signs, realistic verification, saved threads and measured improvement. Keep technical mechanisms in the engineering explanation.

Marketing implementation authorized in `accelerator` only: update Home/platform/partners/FAQ/pricing/onboarding/company/social metadata; add an illustrative interactive executive meeting walkthrough, capability table and vital-sign explanation. Preserve visual branding. Mock decisions do not execute approvals; examples are visibly labelled, with no invented live metrics or guaranteed business gains.

Cypress demonstrates the delivery practices and real business context. Machine Shop proves the coming commercial interface. Do not claim Cypress already runs every commercial feature. Historical figures retain source date; verify before updating. Avoid categorical claims that other AI products lack all memory, tools or governance. Competitor comparison is context, not unsupported exclusivity.

Commercial presentation: planned $2,500 Boarding target subject to fit/scope, crew subscription pricing to be confirmed, separately quoted managed engagements. No invented subscription rate, outcome-based billing, guaranteed six-week onboarding or team-replacement savings. Final inclusions/usage limits/availability are confirmed in writing. Primary CTA: Request a walkthrough; secondary: site fit assessment. Partner message retains “Your firm. Your clients. Your crew.” and adds shared recommendations, progress and client decision authority.

**Implementation boundary:** this approval covers marketing code and these design records. It does not authorize platform/runner refactoring, production deployment, database changes or actions on Cypress. Record validation results after the local marketing checks.

### 11.7 Additional acceptance backlog

- [ ] Package-local TDD evidence, protected expectations and shared QA execution/records, including synthetic fixture and payment-sandbox boundaries.
- [ ] Requirements versioning and approved expected outcomes linked to capability/Work evidence.
- [ ] Optional Jev adapter trial with pinned context, fidelity evaluation, audited selection and safe fallback.
- [ ] Durable event intake/dispatch with security, deduplication, retry, spend limits and gate-preserving activation.
- [ ] Source-linked saved threads, explicit lifecycle, reviewable extraction and export; no approval by implication.
- [ ] Reconcile marketing claims against platform availability before publication; retain illustrative labels for planned experiences.

**Local marketing validation (2026-10-14):** TypeScript (`pnpm exec tsc --noEmit`), ESLint and production build passed. Headless browser exercised all four meeting scenes, checked desktop/mobile layouts and horizontal overflow, and verified Home/platform/pricing/partners/company/Cypress story and social-card responses. Illustrative controls do not execute platform actions. No waitlist submission or external payment transaction was sent. Local implementation only; no commit, deployment or platform migration performed.


---

## 12. Discover your starting point — business insight and technical evidence

*Owner-approved marketing assessment upgrade, 2026-10-14. Preserve the existing `/fit-scan` page and `/api/fit-scan` contract for compatibility; visitor-facing labels become “Discover your starting point.”*

The first interaction should deliver a useful draft of the product's operating record. Step 1 reviews the URL. Once complete, Step 2 invites the desired outcome, what must never break and how often meaningful changes occur, with its own explicit submission. Public observations and deterministic technical scores remain useful; the business layer adds context rather than replacing or inflating them.

**Mix of value and technical fit:** preserve stack fit, visible application depth, delivery signals, site-care findings and available mobile Lighthouse measures. A content-only site with occasional edits may benefit from focused maintenance rather than an ongoing crew. A highly compatible stack does not establish commercial value. If the visitor submits recurring work behind a seemingly simple public site, flag that discrepancy for review rather than silently overturning the public verdict. CMS, locked and roadmap stacks need compatibility assessment, not a migration promise.

**Starting record:** distinguish visitor-provided priorities and rules, proposed capability signals, deterministic technical findings, optional AI interpretation, unverified business questions and a suggested first acceptance check. All business inputs are draft, not approved requirements. The public page cannot prove internal test coverage, approval controls, conversion outcomes or return on investment. A detected hosting service is a clue, not evidence that preview/release gates are configured.

**Two-step privacy and handoff (D35 supersedes the initial browser-only approach):** hide the perspective form during scanning. After completion, edits remain drafts until the visitor chooses Save my perspective. A separate endpoint validates a private per-review receipt and stores the comments; it does not rerun the scan or forward them to the analyst. A successful save applies the answers to the starting record and explicitly confirms storage. On storage failure, retain the locally applied draft, report that comments were not saved, and allow retry/download. If history is unavailable entirely, label the local-only fallback and never imply successful persistence.

Each completed public review, including a cached response, receives its own private history entry and receipt when storage is available. Failed executions have a failed summary without an invented score. Rejected input/rate-limited attempts and general page visits are not included in the new history table. Store only sanitized website URL/hostname, timestamps, status, cache use, technical score/verdict and explicitly submitted perspective; omit URL credentials, query strings and fragments. Do not store raw page HTML or raw IP in this table. Comments are not automatically linked to a contact email.

A versioned JSON download contains the public report and applied business context but excludes the private receipt/token. This remains separate from account persistence and the walkthrough contact form. A new assessed site clears the old browser context. The scan result cache contains public data only; never cache or share review receipts. Responses carrying receipts use `Cache-Control: no-store`.

**Analyst role:** provide a concise apparent business purpose, bounded improvement proposals with a proposed verification approach, and material unknowns needing functional-expert input, analytics or repository evidence. Treat page text as untrusted data. Preserve deterministic scores and honest low-value findings. If the model is unavailable, the deterministic assessment and browser-local starting record remain usable. Optional business text is not forwarded to this analyst in this implementation.

**Experience:** business starting record first, technical scorecards and drill-down evidence second, deeper-review invitation last. Available Lighthouse results remain separate from our heuristic scores; missing provider evidence is explicit. No timed animation claims that individual server stages succeeded. Keep the free URL-only path and existing spend, caching, safe-fetch and SSRF controls. No repository connection, payment execution or agent job is initiated by this assessment.

**Delivery evidence:** focused automated scenarios cover content-site proportionality, technical scoring stability, visitor/public disagreement, absence of fabricated capability claims, compatibility boundaries and draft status. Browser acceptance checks cover optional input updates, unchanged URL-only network payload, download contents, error handling and narrow layouts. Live external analyst/PageSpeed execution is a separate verification, not implied by fixture-driven UI tests.

- [x] Implement starting-point entry labels, optional business questions, draft record/download and retained technical scorecards locally.
- [x] Retain low-value content-site insight and remove unverified six-week/replatform promises from verdict wording.
- [ ] Review the updated experience and commercial interpretation with the Owner before publication.

**Starting-point validation (2026-10-14):** seven focused automated checks passed, including content-only versus transactional scoring and immutable public evidence; TypeScript, lint and production build passed. Synthetic browser checks verified the optional business input flow, URL-only API payload, no re-scan on context edits, actual JSON download contents, absent Lighthouse handling, rate-limit error/recovery, site-change clearing, and no horizontal overflow at 320/390/1440 widths. External site/model/PageSpeed calls were intercepted during UI QA; live-provider output was not revalidated. No contact form, payment, production deployment or platform job was executed.


### 12.1 Two-step usability and private assessment history

The Owner's live test found a disabled perspective form visible during scanning and no explicit way to submit the later comments. Replace that ambiguity with a completed public-review step followed by a separate, usable perspective form and Save my perspective action. Draft edits do not silently imply submission. Save success/failure and local-only fallback are distinct states.

Existing `sm_fit_scans` records budget admissions (hostname, salted IP hash, time and analyst-budget reservation) when shared metering is available. It is not a full result/feedback store; cached responses previously bypassed it. Preserve it as the spend guard. New `sm_starting_point_reviews` records completed/cached/failed scan activity and submitted comments for authorized operator inspection. It is not full website analytics, verified unique-visitor attribution, a platform audit trail or evidence of business gains.

**Persistence boundary:** `supabase/sm_starting_point_reviews.sql` is an additive migration for the dedicated marketing project only. Server-only `SUPABASE_SERVICE_ROLE_KEY` writes history and updates the perspective row directly; anonymous/authenticated public roles cannot read or write the table or write these records directly. The API requires the UUID and random per-review 256-bit token, stores only its SHA-256 hash and limits updates to the matching completed review within 24 hours. Strict input lengths, enumerated frequency, origin checks and expiry prevent arbitrary record updates. Tokens are not saved in shared cache, download bundles or application logs.

The migration includes dashboard queries for reviewing assessments and counting cache hits/comment submissions. Operator setup and API verification steps are in `supabase/starting-point-history.md`. A 90-day retention cleanup is an operational setup item, not a scheduled feature already implemented. Privacy notices describe actual collection, storage and contact-request separation.

- [x] Local two-step UI, save API, server-only history adapter, privacy copy and additive SQL prepared.
- [x] Fourteen focused checks, TypeScript, lint and production build passed; browser/API tests with synthetic database responses verified hidden-during-scan behavior, separate save without a rescan, wrong-token/origin/input rejection, outage draft preservation, download token exclusion and 320/390/1440 layouts.
- [ ] Apply `supabase/sm_starting_point_reviews.sql` and `supabase/sm_page_visits.sql` in the marketing Supabase project; verify private-table permissions and direct API writes. No save function is required. No DDL or real visitor record was written by this change.
- [ ] Schedule private history retention and review operator reporting requirements. Publish only after database setup and local-change review.


### 12.2 Page visits, SEO signals and direct website save APIs

The Owner requests general page visits as well as scan activity, and explicitly prefers website API saves over a Supabase save function. The website now owns `POST /api/page-visits` (direct private-table insert/upsert) and `POST /api/fit-scan/perspective` (direct private-table update). Keep credential, validation, review-token and expiry checks on our server. No stored procedure is required for either save path. The separately existing `sm_fit_scan_admit` remains an atomic rate/spend-limit check: “shared budget” means all server instances consult the same counter to bound paid scan analysis, not a mechanism for saving comments.

`sm_page_visits` records browser page views, page path, timestamp, referrer hostname, a tab-scoped session ID, first-landing flag, rough source classification and obvious-bot flag. Initial hydration, refresh and client navigation count; link prefetches do not. Event UUIDs prevent duplicate retry rows. Respect browser DNT/GPC preferences; no cookies, cross-site identifiers, query strings, referrer paths or raw user-agent strings are retained in this table. D37 adds the request IP for marketing analysis, with disclosure. Use a bounded instance-local abuse guard; analytics failures never interrupt navigation. This guard is not a distributed traffic-security system.

Operators can query daily views/tab sessions, popular paths and search-origin landings in Supabase. Session IDs approximate browser-tab activity, not verified unique people. Referrer loss, blockers, privacy preferences and missed/undetected bots limit these counts. Preserve the distinction between page views, scan executions, submitted perspectives and separately provided walkthrough contacts; precise conversion attribution is not implemented by these tables.

For SEO, track search referrals and landing-page trends here. Search Console is separately needed for Google impressions, clicks, click-through rate and average position; no rankings or keywords are inferred from a referrer. General page-view collection is disclosed in the privacy page.

Database prerequisites are private tables/indexes/grants from the two SQL files, plus the server-only marketing service key. The current migration draft no longer creates `sm_starting_point_save_perspective`. If an older migration was applied, that unused function can be retired after confirming no earlier deployment depends on it. Do not alter the independent shared-budget function as part of this preference change.

**D36 local validation (2026-10-14):** 16 focused automated checks, TypeScript, lint and production build passed. Browser/API tests against a synthetic local database verified initial views, no prefetch inflation, client navigation, refreshes, session continuity, query/fragment exclusion, DNT behavior, direct perspective PATCH with token/status/expiry filters and rejection of wrong tokens/unsafe paths. An injected search referrer tested attribution; a browser-omitted referrer remained direct/unknown. Live Supabase table setup and production collection remain pending.


### 12.3 Report-first follow-up, seven-day reuse and requested IP capture

The Owner requests the full starting record and technical evidence before the perspective form. Render the entire report first, then blank Step 2, then the separate walkthrough request. Add optional name (120 characters), company (200) and phone (50); validate/store them through the existing private perspective API with comments. They are personal follow-up input, not publicly shared capability evidence. Save remains a distinct action and does not repeat the scan.

Persist full public reports in `sm_fit_scan_reports`, keyed by normalized hostname (www/non-www combined). Reuse the original snapshot for seven days from its original scan time; repeated views do not extend that window. Preserve the original page URL/date and label reuse. Look up the shared report before invoking scan budget, external fetch/analyst or PageSpeed. A new successful scan replaces an expired report. Bounded process memory is a fallback, not the durable store. If shared cache storage is unavailable, disclose that reuse may be lost after restart. Existing summary-only history cannot reconstruct past full reports.

Never put perspective/contact input or private review receipts in the shared cache. Each cached response receives a new private review receipt and blank browser form so colleagues never see each other's submissions. Downloads continue to exclude receipt secrets. Normalize/redact public report URL credentials/query/fragment before caching.

At the Owner's request, store page-visit `ip_address` using the validated IPv4/IPv6 address from the hosting-provided forwarding header, not client JSON. Hosting must overwrite proxy headers; unknown/invalid values store null. IPs can represent shared networks, VPNs or proxies and are not verified person/company identity. Preserve DNT/GPC handling, private-table access and privacy disclosure. This decision supersedes D36's no-stored-IP choice for page visits only.

Apply `supabase/sm_marketing_followup.sql` after the two earlier private-table scripts. It adds contact columns, the IP column and the public-report cache; no stored save function is needed. Production schema application and deployment remain separate from the local implementation.

**Local validation:** 20 focused checks cover week-window expiry, normalized site keys, cache receipt/URL-secret exclusion, bounded contact fields and existing invariants. Synthetic database/browser checks verified cross-request reuse without scan admission, new receipts, full-report-before-form ordering, contact persistence, blank form on revisit, no contact disclosure, proxy-IP capture and 320/390/1440 layouts. Live data was not used or modified.


---

## 13. Continuous change assurance — migration-grade care for everyday improvements

*Design refinement D38, 2026-10-14. Informed by review of Anthropic's official code-modernization plugin. This section is a target design, not an implementation claim or approval to install the plugin or refactor the platform.*

### 13.1 The product promise: improve the site while protecting the business

A refactor is not necessarily a migration, but every improvement moves a working business system from one state to another. The crew must explain the intended gain, protect critical behavior and demonstrate the transition. This applies to a calculation correction, framework upgrade, new booking feature and major replacement alike. Use **continuous change assurance** internally; business language is **“Improve what comes next. Protect what already works.”** This supplements the approved hero, not a request to change marketing copy now.

The executive governs outcomes, protected rules, material tradeoffs and release authority through the Team Lead. Specialists do the investigation and verification. Review depth follows business risk and dependency impact: a text correction should not trigger the same ceremony as a payment change. Standing mandates still govern routine actions; consequential approvals remain explicit. No testing system guarantees zero failures. Our commitment is specific evidence, visible uncertainty, controlled release and prepared recovery.

### 13.2 A change contract attached to existing Work

Extend the existing Work and approval records rather than inventing another project type or parallel rail. Each contract links:

- Baseline source revision, environment and affected capabilities, data and external dependencies.
- Intended outcome; behavior that must stay true; explicitly approved behavior changes; unresolved questions and assumptions.
- Affected customer/staff journeys, including dependents outside the edited package or repository.
- Risk class, required checks, measurable acceptance criteria, permitted actions, release strategy and recovery constraints.
- Exact candidate revision, evidence bundle and decisions authorizing promotion.

Use a targeted readiness check: can the relevant build/tests actually run, are fixtures and sandbox integrations available, what is out of scope, and what failed in prior attempts? Reuse current Boarding evidence; investigate changed facts rather than repeat an interview for every task. Missing critical dependencies, ambiguous protected rules or unavailable required proof block the affected scope, not unrelated work. Select the simplest adequate method: in-place correction/refactor, version upgrade, module replacement or broader migration. Avoid incidental cleanup that expands the approved change.

Inspiration: [preflight](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/commands/modernize-preflight.md) and [approval brief](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/commands/modernize-brief.md). Accelerator adds a reusable contract for incremental Work, not only migration projects.

### 13.3 A living business-rule register, reviewed with the functional expert

Add rule records to the existing capability/Library model with stable IDs, plain-language intent, concrete Given/When/Then examples, parameters, rounding/time-zone rules where relevant, and links to source revision/path/lines, requirements and tests. Preserve two distinct facts: **what the code currently does** and **what the business has approved it should do**. Confidence in reading code is not business approval.

The Business Rule Extractor is a specialist skill/remit within the crew catalog. It proposes rules and exact questions for the functional expert; it cannot approve them. Separate extraction status (candidate, source-verified, unsupported) from business review (unreviewed, confirmed, disputed, superseded). Record suspected defects without silently enshrining or repairing them. A disputed critical rule remains unresolved until the authorized functional expert decides; capture rationale and invalidate affected design/test approvals when the answer changes. Reviewed rules become acceptance examples; later evidence can reopen them through a versioned decision.

Example: existing code charges a cancellation fee inside 48 hours. The expert explains the cutoff uses property-local time and waives fees for an approved category. The crew challenges missing daylight-saving and refund cases, agrees examples, then tests that agreement. Neither the old calculation nor an agent's proposed improvement becomes authority by itself.

Inspiration: [business-rules-extractor](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/business-rules-extractor.md) and [extraction workflow](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/workflows/extract-rules.js). Source verification and business confirmation remain separate in Accelerator.

### 13.4 Preserve behavior, prove approved differences

Strengthen §11's TDD approach with characterization tests that capture observable baseline behavior before risky changes. Approved acceptance tests express desired behavior independently. Where practical, compare the same synthetic inputs against baseline and candidate; record expected differences by approved rule ID. Do not preserve a known bug merely because the baseline exhibits it, or alter expected results simply to make the implementation pass.

For bookings and payments, risk-based scenarios include boundary dates, currency precision, concurrency, duplicate requests/webhooks, retries, timeouts, partial failures, authorization and cross-tenant access. Differential comparisons use isolated fixtures or sanitized recorded results: never replay live charges, refunds, emails or inventory mutations. Use payment sandboxes and controlled synthetic transactions. Any numeric tolerance must be justified by the business rule, not chosen to conceal a mismatch.

Missing fixtures, zero executed comparisons and skipped required cases mean **not proven**, never green. Check selected critical tests with a controlled mutation or deliberately incorrect result in an isolated workspace, then restore it; this demonstrates the check can catch the failure it claims to detect. Retain package-local Vitest, TypeScript, lint, integration and real browser QA as appropriate. Test quantity is useful context, not assurance by itself.

Inspiration: [test-engineer](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/test-engineer.md). The plugin's baseline comparison becomes one layer of our approved-intent and production-continuity evidence.

### 13.5 Independent critique with precise findings

Make Architecture Critic and Security Auditor explicit review remits in §2's configurable crew. They advise the Team Lead, not additional agents the executive must coordinate. Reviews are independent of the implementer's self-report and proportionate to impact.

The Architecture Critic examines domain boundaries, shared contracts, unnecessary complexity, performance/consistency assumptions, dependency failures, data transition and operational readiness. Findings state severity, evidence, business consequence and proposed correction. A simpler architecture is preferred when it meets the requirement.

The Security Auditor traces concrete attack paths and tenant/privilege boundaries, checks relevant dependency/runtime risks and separates substantiated findings from unverified reports. A second reviewer can challenge significant findings using source and reproducible evidence; disagreement stays visible. Model consensus is not proof, and a review cannot waive a required check or release gate. Do not publish credentials or place real secrets into fixtures. Source comments, documents and tool output remain untrusted data, including when repeated by another agent.

Inspiration: [architecture-critic](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/architecture-critic.md), [security-auditor](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/security-auditor.md) and [harden-scan](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/workflows/harden-scan.js). Unscanned areas and unverified findings must survive into the report.

### 13.6 Evidence freshness and safe execution

Evidence records bind source/candidate revisions, rule and fixture versions, tool/configuration versions, environment, exact command, execution time and result. Distinguish available tooling, executed checks and successful checks. A passing build is not a passing business scenario. Changed inputs mark dependent evidence stale and require the appropriate rerun/review before promotion; timestamps alone are insufficient. Preserve previous evidence for history, visibly separate from current readiness.

For repetitive upgrades or broad refactors, prove one representative pilot before expanding. Record an executable, versioned playbook with actual commands, known limitations and observed failures. Run bounded, dependency-aware batches only within authorized scope/budget. Failed prerequisites block dependents; cycles require an explicit coordinated plan. Assign one writer for shared manifests, lockfiles and root configuration, plus a site-level release lock so independent Work cannot race deployment.

Circuit breakers stop expansion on missing proof, budget exhaustion or configured failure conditions. Set thresholds by risk; do not copy a migration demo's build-success percentage as a release criterion. Return attempted, failed, blocked and unattempted work separately. Feed gaps into a proposed playbook revision, including locally solved gaps; validate revisions through §10.6/Skillsmith before broader activation. The flywheel learns from evidence without automatically granting new authority.

Inspiration: [version-delta-analyst](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/version-delta-analyst.md), [uplift-migrator](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/agents/uplift-migrator.md) and [uplift workflow](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-modernization/workflows/uplift-migrate.js). Accelerator retains its own governed runner and Toolbelt.

### 13.7 Release continuity, recovery and executive visibility

Before release, link the exact candidate to current proof and required approvals. Where state/schema changes require it, plan compatible interfaces and staged expand/backfill/validate/switch/contract steps. Verify restore or roll-forward procedures in a safe environment. A code rollback does not undo a payment, refund or incompatible data write; record reconciliation and recovery ownership explicitly.

After promotion, use authorized health checks and business-journey signals over a risk-appropriate stabilization window. Critical synthetic monitoring must avoid real customer side effects. Predetermine stop, rollback and escalation conditions, with mandate-bound automatic recovery only where explicitly authorized. Record deployed revision, observations and unresolved exceptions before declaring Work successfully stabilized; release and stabilization are distinct facts in the same rail.

The executive sees a compact assurance card: intended improvement, protected journeys, approved differences, proof completed/missing/stale, unresolved decisions, release readiness and recovery readiness. Expand to rule cards, findings and check results when needed. Keep progress, live operational health and confidence in the next release separate. Never turn an attractive aggregate score into permission to ignore a failed critical check.

### 13.8 Adopt the pattern, not the whole plugin

The plugin's agent Markdown defines specialist remits; commands are entry points; JavaScript workflows coordinate agent calls, structured results, dependencies and budgets. Actual tools perform bounded operations. These are useful separations, not a reason to install another orchestration engine. Model corresponding roles, action contracts and durable workflows inside the existing platform/API/MCP design. Server code must enforce permissions, schema validation, execution limits and gates independently of prompts.

Do not import the plugin's directory layout, migration-only terminology, broad parallelism defaults, effort estimates or full rewrite assumptions into every client task. No agent-generated confidence score substitutes for business agreement or executed proof. No new framework, vendor dependency, extra executive screens or platform implementation is approved by this review.

**Acceptance backlog:**

- [ ] Demonstrate a protected-rule refactor and an intentional rule change on Machine Shop, with distinct baseline and approved expected results.
- [ ] Demonstrate independent critique, unresolved-rule escalation and missing/stale evidence blocking promotion.
- [ ] Demonstrate bounded pilot execution, shared-file ownership and dependency failure handling without bypassing existing gates.
- [ ] Demonstrate release/recovery rehearsal and post-release stabilization evidence; show the executive assurance card through the Team Lead.

**Research scope:** official repository `main` reviewed 2026-10-14; links are moving upstream references, not pinned implementation dependencies. This document adopts design patterns, not plugin code. Recheck source/version/license if implementation reuse is later proposed.

**Marketing database status (Owner report, 2026-10-14):** the Owner reports the SQL update ran successfully. This updates the earlier pending-application notes in §12; live permissions, API writes and production end-to-end collection were not independently verified in this review. Historical local test results remain unchanged.


### 13.9 Starting-point contact requirement correction

Owner direction: Step 2 requires name, company and email; phone remains optional. Enforce trimmed nonempty name/company and bounded, syntactically valid email in the save API as well as the form. Add private `contact_email` via `supabase/sm_perspective_email.sql`; retain nullable historical/URL-only scan rows. This supersedes optional-name/company wording in D37/§12.3. Business-email/domain and ownership verification remain future work. No contact information enters the shared report cache.


---

## 14. Reliable execution protocols — approved, staged implementation

*D39, Owner-approved design refinement, 2026-10-15. All six harness-review recommendations are incorporated. This authorizes design changes, not platform coding or deployment. Existing gates and implementation approval boundaries remain.*

### 14.1 Recoverable checkpoints and explicit execution state

Persist a run's Work/site/mandate identity, workflow version, active step, completed action receipts, artifact revisions, pending operations, remaining budget and next permitted transitions. Keep checkpoint state separate from conversational summaries. A checkpoint is an authoritative execution record, not an agent's recollection.

Use durable step transitions and a single active worker claim with expiry/renewal and an execution generation that prevents an expired worker from committing further actions. Restart must revalidate current permissions, mandate, candidate, prerequisites and budgets. Resume from a verified checkpoint; do not replay completed side effects to reconstruct context. Pause/cancellation stops new dispatch; in-flight operations require reconciliation and explicit status rather than an instant “cancelled” claim. Authority changes must affect subsequent tool invocations even if the worker retains old context.

### 14.2 Unknown outcomes are not failed actions

External operations carry stable operation identifiers/idempotency keys where the provider supports them. Record intent before dispatch and retain provider request/operation IDs and sanitized receipts. Distinguish pending, confirmed successful, confirmed failed and outcome unknown. A timeout after dispatch does not prove failure.

Before retrying an uncertain write/deployment, query provider state or reconcile by a reliable correlation mechanism. If no safe determination is possible, block dependent effects and escalate. Do not promise exactly-once delivery across arbitrary connectors; local deduplication cannot guarantee remote behavior. A recovery attempt retains the original operation identity when appropriate, rather than creating a second independent action.

### 14.3 Failure classes choose bounded recovery

| Failure class | Permitted response |
|---|---|
| Temporary transport/provider failure | Bounded backoff with jitter, honoring provider limits; reconcile first if a side effect may have occurred |
| Invalid arguments or schema mismatch | Return structured field errors; correct within scope, then revalidate |
| Missing/stale context or prerequisites | Retrieve the named source or refresh readiness; invalidate affected assumptions/proof |
| Failed acceptance check | Inspect the actual failure and propose a scoped repair; never change expectations merely to pass |
| Permission/gate denial | Stop the protected action; surface the required authorized decision or valid alternative; never retry to bypass policy |
| Conflicting requirements | Request the designated decision owner's resolution |
| Repeated unchanged failure, exhausted budget or lost execution claim | Stop dispatch and return checkpoint, evidence and escalation reason |

Enforce attempt, elapsed-time and spend limits in the server/runner, including across restarts and child jobs. Record failure class, selected recovery and relevant changed condition. Transient retries can be justified by elapsed backoff; deterministic repeated failures need changed inputs or a new approach. Recovery cannot widen the mandate.

### 14.4 A versioned site execution map

Boarding maintains a concise map of authoritative business rules, architecture/module boundaries, relevant paths, validated build/test commands, environment prerequisites, dependencies, prohibited targets and release policy. Bind it to source/configuration versions and record known gaps. Resolve precedence explicitly when instructions conflict; unresolved authority cannot be repaired by choosing the most convenient document.

Jobs receive the relevant map slice first and retrieve detailed sources progressively. Pin current mandate, protected rules and action receipts; source-linked context remains recoverable. Revalidate stale commands and environment assumptions rather than trusting an old successful session. Never include production secrets. This extends §11.3 context handling and §13.2 readiness, not another memory database.

### 14.5 Evidence-derived change receipts

Compile one standard receipt from durable records: objective and scope; changed artifact/candidate references; checks actually executed and their outcomes; unverified/stale areas; decisions and authority; residual risks; external operation outcomes; and the next permitted action. Include run, Work and evidence links plus schema version. Preserve earlier receipts; new evidence creates a new version.

A model may explain the receipt but cannot manufacture passing statuses. Mask sensitive data and apply tenant permissions. Reuse the same receipt for executive assurance cards, specialist handoffs, exports and restart context. A failed or interrupted run also produces a receipt; a receipt is not synonymous with successful completion.

### 14.6 Evaluate and simplify the harness

Extend Crew Lab evaluation beyond skill wording to routing, context selection, tool contracts, recovery, checkpoints and policy enforcement. Exercise synthetic interruptions before/after dispatch, duplicate delivery, expired mandates/tokens, concurrent claims, unavailable tools/providers, lost responses and budget exhaustion. Use isolated environments; do not inject failures into live client transactions.

Measure first-pass acceptance, recovery success, repeat failures, unsupported completion claims, human review/intervention minutes, total run cost/latency and overhead by component, for comparable work with sample sizes. Report money and human time separately rather than adding incompatible units into a misleading ratio. Test candidate changes on replay and holdout cases; non-negotiable safety invariants remain release conditions.

Each significant failure receives diagnosis; not every failure warrants permanent infrastructure. Associate added controls with the failure they prevent, maintenance owner and evidence of benefit. Periodically propose retirement or simplification of obsolete workarounds. Changes follow existing evaluation, tier approval and rollback; safety gates cannot be removed as a routine optimization.

### 14.7 Graphs and implementation stages

Maintain distinct typed relationships: **execution graph** (steps, dependencies, handoffs, approval waits and bounded repair loops) and **knowledge/impact graph** (capabilities, rules, assets, tests, evidence and decisions). References connect them. The existing rail remains the governing lifecycle. Deterministic state transitions authorize actions; graph edges or natural-language messages do not grant permissions. Version workflows for running jobs; migrate/checkpoint them explicitly rather than silently changing their meaning. A graph database or new orchestration framework is not required by this design.

| Stage | Additions within existing phases | Acceptance evidence |
|---|---|---|
| A — G2.1 baseline and G2.2 runner/Toolbelt | Checkpoints, claim ownership, operation identity/outcome states, typed failure handling and budgets | Terminate/restart a worker; lose an external response; deliver a job twice. No duplicate confirmed effect, stale worker action or false completion; unknowns remain visible |
| B — G2.2/G2.3 and capability links in G2.3a | Versioned execution maps, graph/state contracts, trace correlation and receipt schema | Restore correct context after interruption; changed mandate/source blocks stale action; trace and receipt reconstruct the run without secrets |
| C — G2.4 executive presentation | Receipt/assurance cards, pause/recovery states and role-appropriate drill-down | User understands what happened, what remains unproven and what decision is needed without coordinating agents |
| D — G2.5 evaluated learning | Harness fault scenarios, overhead measurement and reviewed simplification | A proposed harness improvement passes replay/holdout and later measurement without weakening invariants |

Keep scope bounded: implement the smallest reliable path first, then extend it as capabilities come online. Do not delay core safety protocols until visual polish or advanced learning features.

---

## 15. UX exploration — several lenses, one governed workspace

*Owner-requested exploration, 2026-10-15. These are proposals for review, not approval of a new UI architecture or implementation. Preserve the four-screen information architecture and lead-led governance. The earlier shared-meeting concept remains available for comparison.*

**Hypothesis:** make the work and proof the main stage, with the crew visibly contributing around them. A meeting is valuable for discussion and decisions, but an always-visible grid of talking agents may obscure the actual result. Specialists run when needed; none must continuously listen or consume model tokens merely to appear present.

| Candidate lens | Primary audience and task | Main surface | Crew visibility |
|---|---|---|---|
| Executive Briefing | Executive/partner governs outcomes | Business vital signs, Team Lead briefing, decisions and latest assurance receipt | Compact roster with real task/blocker states; expand relevant specialist contribution |
| Delivery Studio | Cross-functional review of one improvement | Large artifact/preview canvas, before/after, acceptance criteria and decision controls | Lead conversation beside the artifact; specialist findings attached to the work |
| Mission Control | Operator/developer supervises execution | Dependency graph, active step, queue, budgets, failures and recovery controls | Event-backed handoffs and named jobs, expandable execution trace |
| Design Studio | Designer/functional expert resolves experience | Journey map, alternatives, responsive previews and annotated feedback | Designer leads the artifact discussion while Team Lead retains coordination |
| Proof Lab | Tester/reviewer evaluates readiness | Requirement-to-test matrix, synthetic scenarios, differences and evidence gaps | QA findings linked to exact candidate and specialist responses |
| Crew Meeting | Collaborative planning or a consequential decision | Shared stage, readable transcript and optional participant tiles/voice | Invited contributions, with accurate presence and no fabricated cross-talk |

A possible **presentation registry** stores lens ID/version, supported tasks and artifact types, suggested audience, required data, accessibility/fallback behavior and allowed action bindings. Roles suggest defaults; users with access can choose appropriate lenses. A lens never grants a role or permission. Start with one common workspace and a few layouts; do not build six separate products. Context, drafts, artifact identity and pending decisions survive lens changes; site changes remain isolated.

**Live execution as a useful visual:** optionally show a compact crew activity ribbon and an expandable graph where real dispatch, tool completion, handoff, test and approval events animate. Each event links to evidence, has time/sequence and supports reconnect/deduplication. Distinguish queued, running, waiting for provider, blocked, failed and complete. Quiet periods remain quiet; no artificial lightning, speaking avatars or claimed speed. A selectable recorded replay can compress time, clearly labelled as replay rather than live activity. Reduced motion, pause, keyboard use and text equivalents are required.

**Model visibility:** an Engineer/Crew Lab inspector can show actual provider/model version by job, configured selection reason, measured latency and recorded token/cost information, with explicit unavailable/estimated labels. Show a real handoff when configuration routes a later job to a different model. Model changes are versioned configuration proposals, subject to approved providers/data policy, budget, evaluation and role authority; no arbitrary mid-operation toggle or submission of client data to an unapproved provider. Executives see outcome, spend and readiness by default, not a token-burning contest. Throughput, agent chatter and animation are not proof of quality.

**Recommended prototype order, pending Owner choice:** compare Executive Briefing plus Delivery Studio against the meeting-first layout using the same Machine Shop scenario and data. Add Mission Control/Proof Lab drill-down when real execution/evidence exists; defer rich avatars and optional voice. Evaluate decision comprehension, artifact discovery, approval mistakes, time to find a blocker and whether the user feels compelled to manage agents. Visual engagement is welcome when it makes the real work legible.


## 16. First platform construction slice — 2026-10-15

The Owner selects Executive Briefing plus Delivery Studio, expandable Mission Control/Proof Lab, event-backed visual activity and clearly labelled replay. This resolves the initial presentation choice in §15 and authorizes staged platform construction. Earlier statements requiring separate approval to begin platform coding are historical and superseded by this authorization; client gates and authorization for live consequential actions remain unchanged.

Implemented locally: typed pure-domain briefing/studio projections; tenant-authorized private GET APIs; typed API client; Executive Briefing replacing the legacy Bridge dashboard; Delivery Studio retaining existing action controls and conversation/artifacts; role-mapped job activity; expandable trace and proof receipt; frozen read-only replay with playback controls and reduced-motion support. Keyless demo fixtures are explicitly synthetic, with mutation controls disabled; database-backed reads use real Work records. Tests cover projection invariants and endpoint permissions; retained browser QA exercises the synthetic local experience.

This is partial G2.1a/G2.4 presentation work, not completion of either phase. Configurable specialists, full capability inventory, mandates, scoped Toolbelt, complete historical event persistence, provider usage receipts and §14 durable execution/recovery protocols remain backlog. Existing job model metadata does not prove a provider invocation. See `accelerator-platform/docs/workspace-first-slice.md` for architecture, evidence limits and reviewer commands. No platform migration, production deployment or real agent job was executed as part of this slice. Machine Shop's live delivery-loop verification remains the next operational reminder.

Owner reports the required-email marketing follow-up setup/test complete (2026-10-15); item 1 from the morning checklist is closed by Owner report, without implying independent live verification here.


**Contextual decision-access requirement (2026-10-15):** when a current gate cannot be acted on, explain why at that decision point and identify the resolved access route/account role and authorized next actor. Do not silently hide approval controls or suggest that platform admin status confers client authority. Apply distinct explanations to partner/support access, read-only roles, protected preview approval and release permission limits. The Studio implements this notice across its lenses; other permission-dependent surfaces should adopt the same pattern as they are migrated. No automatic membership elevation or gate bypass.


**Work closure and new-scope correction (2026-10-16):** a bounded Work item must not trap the client into a production release just to end tracking or start another design. The Studio offers Start another improvement independently; idle pre-release items can Close without platform release, preserving history/code/branches/proof and retaining the existing internal cancelled disposition. Recorded released work can Close completed work. Neither path invents delivery proof or undoes externally delivered code. Terminal records stay inspectable; new scope starts fresh requirements/design/plan approvals. Active execution must settle before closure. Consultant guidance must distinguish chat claims, preview publication and actual recorded production release. Manual release reconciliation is a separate future capability.


---

## 17. The workbench fast path: complexity tiers and the TDD plane (2026-10-17)

*Owner-approved, 2026-10-17 (D41–D44). Source proposal and code review: [workbench-fast-path.md](workbench-fast-path.md). This section supersedes the fixed eight-stop ceremony for every change. The rail's stops remain the record of what happened; the tier decides which stops the client sees and which need a decision.*

### 17.1 Why

The Gen 1/G2.1 rail made every change, however small, follow design → approve → plan → approve → each build step → prove → approve Try → release → close: about ten presses and six or more cold agent runs for a one-line fix. The domain already held a proportionate policy (`requiredGates()` in `gates.ts`), but the rail never used it. The client was asked to approve the crew's internal steps, which §10.1 says the executive should never have to do. The process should fit the work; the work should not be forced to fit the process.

### 17.2 Three complexity tiers, rated for an expert agent

A Work item carries a **complexity tier: Low, Medium or High.** The platform recommends it; the human sees the recommendation with its reason and can change it.

Complexity is measured **against what an expert agent can do, not against how hard the task would feel to a person.** Something a person would find daunting may be routine for the crew, and the reverse. The rating must be consistent across sites and sessions, so it uses a fixed rubric based on agent capability and expected run length:

| Tier | Rubric (expert-agent terms) | Client decisions | What runs on its own |
|---|---|---|---|
| **Low** | One builder run (roughly 15 minutes of agent time or less), a few files, one capability, behavior clearly specified, no new data model, no protected area | **None.** It simply ships, through the TDD plane (§17.3) | Understand → build with tests → prove → release → live check |
| **Medium** | Several builder runs (up to about two hours of agent time), new behavior in one or two capabilities, assumptions worth confirming | **Two:** approve the **Brief** (the design and plan in one short document), then **Ship it** on the preview. Optional standing approval: *ship automatically when proof is green* (§17.5) | Brief draft, internal plan, every build step, prove and preview |
| **High** | Any protected risk class (money, data, auth, security), schema or migration changes, cross-capability or architecture changes, external integrations, unclear requirements, or more than about eight runs | The full rail: approve design, approve plan, approve Try (the Owner for protected risk), then Go live | Design draft, plan draft, build steps after plan approval, prove |

**Policy floors (deterministic, in `packages/domain`):**
- Protected risk classes (`OWNER_GATED`: money, data, auth, security) set a **High floor**. Nobody can lower an item below its floor, and the Owner's gates (§0 rule 7) apply unchanged.
- A person may choose any tier at or above the floor, including below the platform's recommendation; the recommendation and the person's choice are both recorded.
- **Automatic escalation only goes up.** If a build touches a protected area the plan didn't anticipate (migrations, auth, payments, secrets, middleware), the crew stops automatic progress, raises the item to High and explains why. Escalation never relaxes a gate.
- Domain packs (§20) add domain-specific complexity hotspots (e.g. availability and rate rules in Hospitality, checkout and inventory in Commerce).

The Team Lead assesses complexity in the conversation and states it plainly ("Low: one file, clearly specified. I'll fix it and ship it."). The assessment travels as a structured record, not prose: tier, readiness and reason.

### 17.3 The TDD plane: every shipment passes through it

Fewer decisions do not mean less proof. **Every tier, including Low, ships only through the TDD plane**, a fixed sequence of deterministic checks enforced by the API (not by the model):

1. **Tests first.** A behavior change adds or updates tests that express the expected behavior; a step with no test change must state an accepted reason (`protocolVerdict`). The suite never shrinks or drops below the site baseline.
2. **Every step green.** Typecheck and the full suite pass after each build step, or the step is blocked.
3. **Prove.** Typecheck, full suite and production build on the exact candidate; the branch is pushed and its preview must deploy (`proveVerdict`).
4. **Release.** Merge to stage then main only after the above; production must deploy and the live site must answer (`releaseVerdict`).
5. **Stale proof never ships.** New code clears earlier proof and Try approval; the plane runs again.

For Low, the plane is the only gate. For Medium and High it sits beneath the human decisions. §11.2 and §13 extend the plane over time (characterization tests, synthetic QA, browser checks); they do not create a parallel pipeline.

### 17.4 Chat as the control surface

- The Team Lead acts on the conversation: it starts the brief, plan, build and prove itself within the tier's authority. People don't hunt for "Draft the design", "Write the plan" or "Build step N".
- Each pending decision appears **in the conversation as one card**: what it is, the recommendation, evidence, who can decide, a button, and "or type *approve*".
- **Typed approval is a typed server action** (§10.2). "Approve", "ship it" or "go" resolves only when exactly one decision is pending and the person is eligible; it binds to that decision's artifact or candidate version and rejects a stale one; ambiguity gets a one-line question. **Owner-gated decisions require the card's button plus a confirm naming the risk.**
- "Stop", "wait" or "pause" halts new dispatch immediately.
- On a Medium item the plan is the crew's: it is generated, checkpointed and shown, never approved step by step. High keeps separate design and plan approvals.

### 17.5 Standing approval for Medium

On a Medium Brief, the client may tick **ship automatically when proof is green**. It is recorded, bound to that item, off by default, never available on High, and never overrides an Owner gate. Escalation to High clears it.

### 17.6 Implementation (phases F1–F5)

| Phase | Scope | Acceptance |
|---|---|---|
| **F1** | Complexity tier, floors and escalation in the domain; the lead's structured assessment; a pure *next automatic action* function; Low runs end to end with no decision; Medium needs Brief + Ship it; High keeps the gates; steps run automatically after the governing approval; cadence retired | Domain tests for every tier, floor and escalation; typecheck, tests and builds green; one Low and one Medium item through Machine Shop |
| **F2** | Decision cards in the conversation, typed approval with version binding, pause from chat; "Needs you" bar and per-step buttons removed | API tests for eligibility, stale-version rejection and Owner-gate refusal |
| **F3** | The Cockpit layout (§19): central chat, summaries first, side bar, artifact drawer, instrument panel | Browser QA desktop and mobile |
| **F4** | Streaming everywhere; API-streamed lead turns; one agent session per item; pushed events | Time to first token; time to first preview |
| **F5** | Global composer, slash commands, live voice in the cockpit widget | Voice and text share one record and one authority model |

Measure per tier: client decisions, presses, time to first preview, time to live and send-backs. Claim the speed-up only from these counters.

---

## 18. The Change Ledger: Scion's ideas on top of git and the client's GitHub (2026-10-17)

*Owner-approved, 2026-10-17 (D45). Inspired by Anthropic's internal Scion source-control system (reported publicly; not a released product) and the independent MIT `feder-cr/git-ai` reimplementation (v0.1.0). We adopt the patterns, not the software.*

**GitHub stays.** The client owns its repository (§3.3, rule 8); Vercel previews and production, the GitHub App and the stage → main path depend on it, and rule 12 (break-glass) forbids a platform-only path to our own code. Scion solves tens of thousands of merges a day in one monorepo; each client site has a handful of changes in flight. Our bottleneck is ceremony and latency, which §17 addresses.

The **Change Ledger** is the crew's working view of a site's code, kept by the platform over git:

| Pattern (from Scion / gitai) | Accelerator form |
|---|---|
| Ordered, append-only changeset log | Every landed change gets a ledger entry (Work item, candidate commit, evidence, decision, deployed revision) in the Site Timeline (`acc_site_events`, §3.3); the change receipt (§14.5) is keyed by it |
| Server-side land with compare-and-swap on the branch reference, batching concurrent lands | A per-site **land lock**: release checks that `main` is still at the expected commit, otherwise rebases and re-proves; two Work items never race to production (§13.6) |
| History, blame and code search through an API instead of a full clone | Lead answers read a cached site map plus GitHub's API; only build jobs clone (feeds §17 F4) |
| Per-agent tokens, call allowlists, branch policies | `repo.*` Toolbelt tools under job tokens (§1.2): builders write only `work/<n>`; only the release tool lands |
| Review rules weighted by change type | The complexity tiers (§17) |
| Pluggable conflict resolver | The crew rebases and resolves conflicts between Work items, re-proves, and escalates when uncertain |
| Test after landing with automatic bisect and revert | Our own repos only (rule 11). Client sites keep proof before release |
| Agents following the change stream | Event-driven Upkeep (§11.4) watching each landed change |

**Revisit a server-side VCS** (Scion, if released, or a matured gitai) only when measured triggers appear: sustained release races or conflicts across sites, clone/checkout time dominating job time, or GitHub API limits. An optional, sandboxed trial of gitai against a copy of Machine Shop is permitted for learning; it never touches the real repo or deployments.

---

## 19. The Cockpit: one central conversation, streaming, summaries first, instruments (2026-10-17)

*Owner-approved, 2026-10-17 (D46). Applies to everyone who runs a workbench: a functional manager, a systems integrator running it for a client, a developer, or a business owner running their website alongside their business. Refines §15/§16: the default Delivery Studio view becomes the Cockpit; the existing lenses move under Details.*

### 19.1 The central conversation widget, with live voice

- One **central chat widget** is the primary way to work: ask, decide, steer. It borrows directly from Machine Shop's shop assistant (`machineshop/components/assistant.tsx` and `voice-call.tsx`): a single launcher that opens **Talk** (live voice) or **Text**, the same transcript for both, product-style cards for artifacts, and a transcript download.
- **Live voice uses OpenAI's realtime API over WebRTC**, as Machine Shop does: the API mints a one-call pass server-side (the key never reaches the browser), the browser connects directly, and the model's tool calls run through the API under the caller's session. The access code in Machine Shop is replaced by the member's signed-in session and permissions.
- The workbench widget needs a **bigger viewport** than a shop assistant: it docks as a full-height panel beside the cockpit and expands to full screen. Artifacts it mentions (brief, diff, preview, evidence) open beside it.
- Voice and text share one record, one authority model and the decision rules of §17.4. Voice can't approve an Owner-gated decision; it opens the card for a confirmed tap.

### 19.2 Everything streams

All model text streams to the screen as it is produced: lead replies, briefs, summaries, progress. The console receives pushed events (server-sent events) rather than polling; polling remains a fallback. Stream state is durable: reconnecting restores the same conversation and decision state (§10.2).

### 19.3 Summaries first, the full story on request

Dense design documents and plans are not the default view. Each artifact gets a **summary card**: what it is, what it changes, what it protects, risk, and the decision needed, in a few lines. Selecting it opens the full document, diff or evidence. The Team Lead writes summaries in business language (§10.2); engineering detail is one click deeper.

### 19.4 The instrument panel: a cockpit, useful not gimmicky

Every instrument shows its **source, freshness and an explicit "not connected" or "insufficient data" state** (rule 14), and every reading opens its evidence. No decorative motion, no numbers without definitions.

| Instrument | What it reads | Why it matters |
|---|---|---|
| **State integrity** (old state + changes = new state) | Required checks executed vs. required, protected rules verified, stale or missing proof, unverified areas for the current candidate | The one-glance answer to "is the new version of the app trustworthy?" |
| **Test health** | Tests run and passing, suite size vs. baseline, trend, newly added tests, flaky or skipped tests | Proof that the TDD plane is doing real work |
| **Uptime and response** | Live probe success rate, response time (p50/p95), last incident, from scheduled checks | Is the site up and fast for customers right now? |
| **Delivery flow** (the DORA four keys) | Lead time from request to live, deployment frequency, change-failure rate, time to restore | The industry-standard measure of delivery speed and safety |
| **Code complexity and hotspots** | Cyclomatic complexity trend, largest and most-changed files (churn × complexity), dependency freshness and known vulnerabilities | Where the next change gets risky or slow |
| **Experience quality** | Lighthouse performance, accessibility, SEO and Core Web Vitals over time (`lighthouse.ts`) | What customers and search engines experience |
| **Work in flight** | Items by tier and stage, decisions waiting on you, age of the oldest decision, items blocked | What needs attention now |
| **Crew effectiveness** | First-pass acceptance, send-backs, escalations, share of Low items shipped with no intervention | Is the crew getting better (§10.6)? |
| **Budget** | Spend vs. authorized budget, cost per change by tier | Control of money spent |
| **Errors in production** | Error rate from the hosting platform's logs, where connected | Catches what tests missed |

The Overview shows the site-level instruments; each Work item shows its own integrity, test and flow readings. Partners see the same instruments across their clients.

---

## 20. Domain packs: crews that speak the client's business (2026-10-17)

*Owner-approved, 2026-10-17 (D47).*

A **domain pack** is a versioned configuration bundle that equips the crew for an industry. When a client subscribes, they **pick their domain** in Configuration (during Boarding); Strategic Machines adds domains over time.

**What a domain pack contains:**
- **Vocabulary and business model:** the terms, entities and processes of the industry (Hospitality: rooms, rates, availability, reservations, folios, guests; Commerce: catalog, pricing, cart, checkout, inventory, orders, promotions).
- **Skills and prompts:** domain best practices loaded into specialists through the skill tiers (§2.2).
- **Decision points:** where the domain needs a human, and who (e.g. rate and cancellation policy changes, refund rules, price changes).
- **Complexity calibration:** domain hotspots that raise the tier (§17.2), because the domain crew is best placed to judge complexity: payments and reservations in Hospitality; checkout, pricing and inventory in Commerce.
- **Capability templates and critical journeys** for the capability inventory (§10.3) (Hospitality: search availability → book → pay → confirm; Commerce: find product → compare → quote or cart → checkout).
- **KPI templates** for vital signs (§10.4): occupancy, RevPAR and booking conversion; conversion rate, average order value and quote completion.
- **Test-scenario libraries** for the TDD plane and synthetic QA (§11.2): synthetic guests and stays, synthetic orders, boundary dates and currency cases.
- **Compliance notes** (e.g. PCI scope for payments, guest personal data).

**Tiering:** skills now assemble from five tiers: **crew → domain → partner → company → site.** The domain tier belongs to Strategic Machines; the Skillsmith proposes improvements from evidence across clients in the same domain, under the existing consent and anonymization rules (§2.2). A more specific tier can add to a domain pack but cannot remove a crew safety skill or a gate.

**First two domains:**
- **Commerce** (proven on Machine Shop, the DIY commerce test site).
- **Hospitality** (modelled on Cypress Resort's business knowledge). **Cypress remains live production and is never a test target** (rule 11); the pack is exercised on synthetic data and Machine Shop-style test sites.

**Implementation:** a `domain` on each company (or site), a domain-pack registry in the crew catalog (§3.3 store 5), and domain-tier skills loaded in G2.3. F1 records the selected domain as configuration only; packs ship with the crew (G2.3).
