# Gen 2 — Crew, Toolbelt, Library, Partners (Design v0.2)

*Strategic Machines · 2026-10-10 · **status: approved design foundation. Code refactoring and database changes are executed from this document.** · repo: `accelerator-platform`*
*Implements the decisions in [newvision.md](newvision.md) §9–10. Refines [flywheel.md](flywheel.md) (the rail stays) and replaces [accelerator-control-room.md](accelerator-control-room.md) §5 (the 15 pages). Extends [accounts-auth-admin.md](accounts-auth-admin.md) with the partner layer (§5).*

**How to use this doc:**
- §0 holds the rules no change may break.
- §1–5 are the design.
- §4.5 is the build order.
- §7 is the decisions log.
- §8 is the action list. Tick items there as they're done.
- When the code and this doc disagree, the code wins. Fix this doc in the same change.

> **What Gen 2 is.** The Accelerator stops being a 24-page console wrapped around one runner. It becomes a **crew of specialist agents per client site**. The crew works through one governed **Toolbelt** (an MCP server inside our API), remembers everything in the site's **Library**, and improves itself through the **Skillsmith**. The client sees four screens. Strategic Machines operators also get the **Crew Lab**.
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
11. **Test on Machine Shop; never on Cypress.** Every phase ships green: `pnpm typecheck && pnpm test`, on a branch off `stage`.
12. **Break-glass:** the platform repo must always be workable directly, without the platform (§4.7).

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
4. **Test bench:** the proof. Run a draft specialist against a **replayed past Work item** or a scripted scenario in a sandbox on the test environment. Compare it with the live version on checks, send-backs, cost and time. Only a draft that does at least as well can be **promoted**. Every promotion is versioned, with rollback.

### 2.4 What the client sees: the Crew screen
- **Branding:** the crew carries the partner's brand (§5): the partner is named at Silver, co-branded at Gold, fully white-labelled at Platinum. The house partner's crews carry the Strategic Machines brand.
- **Your crew:** one card per specialist, with what it does in plain words, what it may touch and the model it uses.
- **"Your crew learned 2 things this week":** Skillsmith proposals in plain language, each with **Approve** / **Not now**, and a link to the evidence.
- **"What your crew knows about Machine Shop":** the site and org skills, readable as a short handbook, with a count that grows over time.
- **Spend and limits** per specialist.

### 2.5 Boarding: the $2,500 fixed-price onboarding, run by a Boarding crew
Boarding replaces the $5–20K custom installation (except for the premium managed tier). It runs on the Setup page as one checklist; flywheel.md §3 (Install → Checkout → Agreement) becomes its later steps. **The client's partner runs Boarding** (the house partner for direct clients). Gold and Platinum partners buy it at wholesale and set their own price.

| Step | Boarding specialist | What happens | Client does |
|---|---|---|---|
| 0. **Checkup** (free, before purchase) | Surveyor | URL scan plus a read-only repo scan: security, freshness, tests, stack fit | Pastes URL, connects GitHub |
| 1. **Connect** | Connector | Connect buttons (GitHub App, Vercel, Supabase or the site's database, Stripe test). It creates the `stage` branch, previews and the test database. Remaining keys go through the connection catalog | Clicks Connect; pastes any leftover keys |
| 2. **Survey** | Surveyor | Stack card, env manifest, route map, schema/RLS map, test map, invariant draft. All arrive disabled for review | — |
| 3. **Interview** | Consultant | A 15-minute conversation (chat or voice) on business rules, brand, what must never break | Talks |
| 4. **Assemble** | Skillsmith | Drafts the site's crew and first site skills; the operator reviews them in the Crew Lab | — |
| 5. **Stabilize** | Builder + Judge + Upkeep | Fixes the Checkup's critical findings, adds a baseline test suite and branch protection, and proves rollback, all through the normal rail | Approves on the rail |
| 6. **Agreement** | Librarian | The one-page Agreement (flywheel.md §3) plus the skills-sharing clause | Signs |

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
| `packages/domain` partner rules | `Partner`/`PartnerRole` types, `PARTNER_PERMISSIONS`, `canPartner()`, skill-tier assembly rules, all with tests |
| `apps/api/app/mcp` + `apps/api/lib/toolbelt/` | The MCP endpoint, tool registry, connectors/proxies, gate checks, redaction, metering, audit |
| Job tokens | Minted per job, bound to org, site, work item, specialist and expiry; verified by the Toolbelt |
| Migration 0007 (crew) | `acc_specialists`, `acc_specialist_versions`, `acc_skills` reworked with `scope` (platform · partner · org · site) and versions, `acc_skill_versions`, `acc_proposals`, `acc_bench_runs` |
| Migration 0008 (toolbelt) | `acc_tools`, `acc_site_tools` (disabled by default), `acc_connections` (OAuth), `acc_tool_calls` (audit) |
| Console: Inbox, Site, Crew, Crew Lab, Boarding | The four client screens, plus the operator's Lab and Boarding |
| Migration 0009 (library) | `acc_site_events` (the append-only Site Timeline, §3.3) and tenant-prefixed storage buckets |
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
| **G2.0** Setup | Create `stage` in accelerator-platform; add CI; Machine Shop gets a Vercel project, a `stage` branch and a test database config | The house rules can be followed |
| **G2.0b** Partner seam | Migration `0006_partners`, the house partner, `PARTNER_PERMISSIONS`, `store.access()` rewritten without the staff bypass, support grants (§5.3). No partner UI yet | Strategic Machines is "just another partner" in the data |
| **G2.1** One loop live | Runner on Machine Shop: request → design → plan → build → tests → preview → approve → live. *Gen 1 runner, as is* | The core promise works (newvision.md §7, weeks 1–3) |
| **G2.2** Toolbelt v0 | `/mcp`, job tokens, 6–8 tools (repo, preview, Lighthouse, screenshot, mongo read-only, library read, rail post), audit; drop `envmachine` | Agents work with no keys in their shell |
| **G2.3** Crew v0 | Specialists as data; runner assembles instructions and tools per specialist; Machine Shop gets its crew | "Crew per site" is real |
| **G2.4** Four screens | Inbox · Work · Site · Crew; retire Gen 1 pages and tables | A client can understand it in 5 minutes |
| **G2.5** Library + Skillsmith | Library sections and export; Skillsmith proposals from Learn; Crew Lab with test bench | The "why not Claude" answer is visible |
| **G2.6** Boarding | Checkup → Connect → Survey → Interview → Assemble → Stabilize → Agreement, run on Machine Shop as client #1 | $2,500 Boarding is repeatable |

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
| `partner_id` on audit, usage, job tokens | Rolls up metering, limits and the audit trail per partner |

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
| D4 | 2026-10-10 | Four client screens (Inbox · Work · Site · Crew) plus the operator's Crew Lab; the other Gen 1 pages fold in or retire | §4.4 |
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

---

## 8. Action list (work from the top; tick as done)

### 8.1 Housekeeping (before any Gen 2 code)
- [ ] Commit today's doc changes in the `accelerator` repo (`work/*.md`), and the website changes separately (below).
- [ ] Commit the rewritten `CLAUDE.md` in `accelerator-platform`.
- [ ] **G2.0:** create the `stage` branch in `accelerator-platform` (only `main` exists today) and add CI running `pnpm typecheck && pnpm test` on every pull request.
- [ ] **G2.0:** Machine Shop: a Vercel project, a `stage` branch, a test database configuration, and previews on every branch.
- [ ] Run migrations 0004 and 0005 on accelerator-test (flywheel.md status), then the live sign-in test (accounts-auth-admin.md).

### 8.2 Platform build (gen2 phases, §4.5)
- [ ] **G2.0b** Partner seam: migration 0006; house partner; `PARTNER_PERMISSIONS` + tests; `store.access()` without the staff bypass; support grants; `partnerRoute()`; the in-memory store and fixtures updated to match.
- [ ] **G2.1** One loop live on Machine Shop (Gen 1 runner): 10 real Work items, with send-back rate and time-to-live measured.
- [ ] **G2.2** Toolbelt v0: `/mcp`, job tokens, 6–8 tools, `acc_tool_calls`; drop `envmachine` from the runner and from Machine Shop's `dev` script.
- [ ] **G2.3** Crew v0: migration 0007; specialists as data; skill assembly across four tiers; Machine Shop's crew.
- [ ] **G2.4** Four screens; retire the Gen 1 pages; migrate `acc_requests`/`acc_changes`/`acc_approvals`/`acc_consultations` into `acc_work*`; demo tenant → Machine Shop.
- [ ] **G2.5** Library (migration 0009, the Site Timeline, export); Skillsmith proposals; Crew Lab with test bench.
- [ ] **G2.6** Boarding end to end on Machine Shop as client #1, logging every human step.
- [ ] Later: partner console UI, white-label domains, wholesale price lists, partner payouts, the Partner Playground, member-facing MCP (§1.4), a dedicated database option.

### 8.3 Website (`accelerator` repo)
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

### 8.5 Open design questions (see §6)
- [ ] Toolbelt hosting (start inside `apps/api`).
- [ ] When to ship member-facing MCP.
- [ ] Voice model for the Interview step.
- [ ] Crew catalog v1: 8 specialists plus 3 Boarding specialists.
