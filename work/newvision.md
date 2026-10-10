# New Vision: from Control Room to a product the market buys

*Strategic Machines · 2026-10-08 · status: recommendations for owner review*
*Reads with: [accelerator.md](accelerator.md) · [accelerator-control-room.md](accelerator-control-room.md) · [flywheel.md](flywheel.md) · [accounts-auth-admin.md](accounts-auth-admin.md)*

> **The short version.** The thinking so far is strong, and Customer Zero is real proof. But the product has grown wide before it has gone deep. It speaks to three different buyers in a dozen invented words, and its one core promise has not run live end to end: a request goes in, and a tested change comes out live, with nobody touching code.
>
> My recommendation is to narrow to **one buyer with an urgent, new pain**: people who built a web app with AI tools (Lovable, v0, Bolt, Cursor, Replit) and now have a live product they can't safely change. Sell them a **crew of specialist AI agents that keeps the site safe, current and moving, and shows its work**. Borrow Uber's gateway pattern to make keys and connections disappear from the customer's life. Make "specialist agents" a configuration (skills + tools + permissions + model), not a swarm of separate programs. Then add an agent that improves the crew's skills from every job it finishes.

---

## 1. The Uber MCP Gateway, read for our purposes

### What Uber built
Uber has hundreds of teams wiring AI agents to thousands of internal services. That led to duplicated plumbing, inconsistent security and tools nobody could find. Their answer is a single gateway with two halves:
- a **control plane**: a registry of tools, auto-discovered by a crawler, *disabled by default*, enabled by the owning team, every change a reviewed diff with rollback
- a **data plane**: executes tool calls, translates protocols, and enforces authorization, redaction and observability in one place

Their closing line is the one that matters to us: *"the hardest part isn't the AI. It's the connective tissue: the discovery, the security, the reliability."*

### Five ideas to take

| Uber idea | What it means for us |
|---|---|
| **Existing APIs are the fastest way to give an agent tools** | A site's existing accounts are its tools: GitHub, Vercel, Supabase, Stripe, Cloudinary, DNS, analytics. Don't build new integrations per customer. Wrap each provider's API once as governed tools, and every site reuses them. |
| **The gateway holds the credentials, not the agent** | **This is the answer to the env-key worry.** Agents never receive keys. They call tools such as `vercel.promote`, `supabase.query_readonly` or `stripe.list_test_payments`, and our API attaches the credential, checks the role, logs the call and redacts the response. A builder sandbox gets only the *test* environment it needs to run the app. Nothing else. |
| **Discovery does not imply exposure** | This matches our gate philosophy exactly. Anything the engine discovers or generates (a tool, a skill, an invariant, an env-manifest row) arrives **disabled**, as a diff the site Owner approves, with version history and rollback. |
| **AutoCrawler** | The commissioning work in accelerator.md §4 becomes a crawler over the customer's repo and accounts. It drafts the Stack card, env manifest, route map, database schema and RLS map, test map, invariant draft and the tool set the site needs. Everything lands disabled until reviewed. Six weeks of consulting becomes an afternoon plus a review. |
| **Progressive discovery and Code Mode** | A crew with dozens of skills and tools can't load them all into every prompt. Give agents a small index (`find_skill`, `find_tool`, `get_schema`, `invoke`), and let a building agent write large outputs to files and search them. This also fits our "no vector embeddings, assemble context per task" rule. |

### What not to take
- **The infrastructure itself.** Uber needed protocol translation (gRPC, Thrift, TChannel), a service mesh and 800 servers. We need roughly **15 well-made provider connectors** for one stack. Build a *thin* gateway inside `apps/api`, not a gateway product.
- **The gateway as something to sell.** Infrastructure and cloud vendors are already shipping MCP gateways, and that market will commoditize fast. Our customer never sees the word "MCP". The gateway is plumbing that makes the product safe; it isn't the product.

**Verdict:** Uber's write-up is a strong validation of a *governance pattern* we have already half-designed (gates, the vault, the env manifest, skill toggles). Adopting it tidies three separate ideas (Connections, the Vault and Skills) into one concept: **the site's Toolbelt**. It also takes credentials off the customer's to-do list.

---

## 2. The stable of specialist agents (and the agent that builds agents)

### The instinct is right; the word "swarm" is a trap
Specialists are how real web teams work: design, API, data, build, test, docs, release. Customers understand a team. The risk is in the engineering. Many autonomous agents editing one codebase at once produce merge conflicts, contradictory decisions, divided responsibility and token bills that grow with the number of agents. Customer Zero worked because **one builder** held the whole change in its head, followed a rulebook, and a human said "go" at the right moments.

### Recommendation: a crew, where each specialist is a configuration
A specialist agent is **four things in a record**, not a separate program:

```
Specialist = Skills (know-how) + Tools (what it may touch, via the gateway) + Permissions (gates) + Model
```

| Specialist | Skills (examples) | Tools it may use | Can't |
|---|---|---|---|
| **Consultant** | requirements from conversation, domain interview | read the Library, the site, analytics | edit code |
| **Designer** | shadcn/Tailwind design system, accessibility, copy | screenshots, design tokens, Figma (later) | touch data |
| **Builder** | Next.js, React, TypeScript, the site's rulebook | sandbox repo, test env | reach production, push to `main` |
| **Data** | Postgres, Supabase RLS, migrations, synthetic data | test DB (write), prod DB (read-only, gated) | write production |
| **Tester / Judge** | journey tests, invariants, held-out suites | preview URLs, test runner | edit the code it judges |
| **Librarian** | docs, backlog, decisions, drift detection | the Library, the repo docs | ship anything |
| **Release** | promotion, smoke tests, rollback | Vercel, git merge (gated) | skip a gate |
| **Upkeep** | dependency/framework upgrades, security headers, Lighthouse | everything the Builder has, plus scanners | merge without the Judge |

How they work together:
- **Parallel across work, one builder within a change.** Many Work items can run at once in separate worktrees. Inside one Work item, specialists take turns along the rail (Discuss → Design → Plan → Build → Prove → Try → Release → Learn). That is the rail that flywheel.md already defines.
- **A "panel" only where parallel thinking helps:** options during Discuss and Design, and several independent judges during Prove.
- **In the interface it should *feel* like a crew.** Show the specialist's name and avatar on each step ("Data is preparing a test dataset…", "Judge sent it back: totals off by $5"). That gives the swarm experience without the chaos.

### The agent that builds agents: the **Skillsmith**
This is where "agents that build agents" pays off, and it is the real flywheel:
- After every Work item, during **Learn**, the Skillsmith reads what happened: send-backs, test failures, owner corrections, escaped bugs.
- It **proposes** a new skill or an edit to an existing one ("When a Supabase table is added, always write the RLS policy and a test that an anonymous user can't read it").
- Proposals arrive **disabled, as a diff** (Uber's pattern). The Owner, or Strategic Machines for shared skills, approves them, and rollback is one click.
- Before it's enabled, each skill change is **replayed against past Work items** ("with this skill, 3 of the last 20 send-backs would not have happened").
- **Two levels:** *site skills* stay private to the customer. *Crew skills* are generalized, anonymized and shared across every customer. Each new customer makes the crew better for all of them. This is the moat the docs call the "evidence data flywheel", made concrete.

### Moving to other stacks
The Protocol, gates, rail, evidence and gateway don't depend on the stack. Only **skill packs** and **checkout recipes** do (how to install, build, test and preview). Expanding to another stack means writing a new skill pack plus a recipe, running it through the Judge on reference repos, and turning it on. Suggested order, following where the customers are:
1. Next.js + Supabase + Tailwind/shadcn on Vercel *(launch)*
2. Vite + React + Supabase *(the Lovable / Bolt output, an adjacent and very large population)*
3. Astro and static marketing sites
4. Then a deliberate choice between **WordPress** (an enormous, already-proven maintenance market) and **Python/Django or Rails** (deeper apps, fewer of them).

---

## 3. Honest evaluation of the current design and code

### What is genuinely strong
- **Real proof.** ts-platform is the evidence: 12 weeks, live, real money, 615 tests. Most AI dev-tool companies don't have a Customer Zero this convincing.
- **The right principles:** the actor is never the judge; gates are deterministic policy; evidence over trust; customer knowledge in open formats; model-agnostic roles; "the owner's time went to plumbing, and the value was judgement". These would survive any pivot.
- **Clean architecture:** one API, a pure domain with tests, one api-client, permission maps in one file, a vault that never returns secrets. The foundation is sound.
- **The flywheel rail** (one Work item, eight stops, three human gates) is the clearest, most ownable idea across all the docs.

### What is holding it back

**1. Wide before deep.**
- The console has **24 site and admin pages**, and the docs describe 15 Control Room areas, all running on a demo tenant.
- flywheel.md says the runner is "built, not yet run live". The GitHub App, preview deploys, Try/Release automation and the Judge pass are all "not yet".
- The one thing a customer pays for, an unattended request → tested preview → live change with evidence, hasn't happened outside a demo.

  Every week spent on Metrics, Data Desk, Health triage or Account pages delays that proof.

**2. Three buyers, one pitch.**
- accelerator.md targets companies with 1–8 engineers and $250K–$1.5M of engineering spend.
- The Control Room doc targets "a person who knows their business but not git".
- The SKUs include a managed-operator service and an agency partner program.

  These are different buyers, with different budgets, sales motions and screens. A product built for all three reads as built for none.

**3. Too many invented words.** Accelerator, commissioning, lattice, AC0–AC5, Control Room, Bridge, Flywheel, Navigator, Work item, Request, Change Room, Consultation, Protocol, Readiness Report, Discipline Pack, Evidence Package, Signals, Facts registry, Skills, Stack card…
- A buyer will remember about three.
- The code also shows the drift: `requests`, `change` and `consult` pages still sit next to `work`, even though flywheel decision F1 says Work replaces them.

**4. Onboarding is the plumbing we promised to remove.**
- The Install phase has 8 manual items: GitHub org, branches, Vercel, protection bypass, two databases, keys per environment, DNS and people.
- Your worry about env keys is the market telling you the same thing. If onboarding needs a $5–20K human installation, the product is a consultancy with software, and it scales like one.

**5. Services economics in disguise.** Commissioning fees, a Managed Operator at +$10–20K/month and certification all point to a services firm. That's a fine business, but it should be a deliberate choice, not where the product lands by default.

### On the "agent configurator with generated shadcn forms for keys"
The instinct is right: keys are the worst part of onboarding. Generating the forms with AI is the wrong tool:
- Putting secrets through LLM-generated UI adds risk and unpredictability, for no gain.
- The set of providers is small and known.

Do this instead, in order of preference:
1. **Connect buttons (OAuth), not keys.** GitHub (a GitHub App), Vercel (an Integration), Supabase (OAuth / Management API) and Stripe (Connect or a restricted key flow) all let a customer authorize us without copying a key. The gateway stores the tokens, and the customer never sees an env var.
2. **We provision the test side.** Through those connections, the crew creates the `stage` branch, the preview settings, the test database branch or project, and Stripe test keys. Install becomes "click four Connect buttons".
3. **A connection catalog for everything else.** Leftover keys (an email provider, an SMS provider) get one declarative entry each: the fields, "where to find it" steps with screenshots, and the test call that proves the key works. It is rendered by **one** shadcn form component. AI's job is limited to:
   - reading the repo to decide *which* catalog entries the site needs (the crawler)
   - explaining a failed connection test in plain words

   This is predictable, testable, and still feels magical.

---

## 4. Who to sell to: the recommended beachhead

### The new, urgent pain: AI-built apps that are live and fragile
AI app builders created a large, new population of people with **real web apps in production**, mostly on **exactly our stack**: React/Next, Supabase/Postgres, Tailwind/shadcn and Vercel. They typically hit the same wall:
- Every new prompt breaks something that used to work. There are no tests, no staging and no rollback.
- **Security gaps**, especially missing Supabase row-level security. These have been widely reported in AI-generated apps.
- Getting stuck past roughly 70% done. The builder tool can't finish, and the founder can't code.
- Dependencies and frameworks drifting out of date, with nobody responsible for upgrades.
- Having **paying customers** now, so breaking the app costs money.

These people already pay monthly for AI tools, already accept AI doing the work, and feel the pain *this week*. Agencies that wrote code by hand are a slower, more sceptical sale. Owners of Wix and Squarespace sites have no custom code to maintain.

**Who they are:** founders, solo builders and small teams (0–3 developers) running a revenue-earning app built with Lovable, v0, Bolt, Cursor or Replit, or an agency handing such apps to clients.

### Second: agencies, as a channel
Agencies maintaining 20–200 client sites live on monthly maintenance retainers with thin margins. Offer them "run 50 client sites with 2 people", sold per site at wholesale. This is the existing Partner Program idea, but **after** the product works self-serve, not instead of it.

### Third, kept as a premium service: businesses with custom apps
The original accelerator.md buyer (Customer Zero-style businesses with real engineering spend) stays as a premium, managed service. It funds the company and supplies the hardest cases, but it isn't the product's primary design target.

---

## 5. The offer, made simple

### One sentence
> **"Your AI-built site, made safe, kept current and moving forward, by an AI crew that shows its work before anything goes live."**

Shorter variants for the website: *"Ship changes without breaking things."* · *"The crew that maintains your app."* · *"Hands off the code. Hands on the controls."* (keep this one).

### Three steps a customer can understand

| Step | What they get | Price idea (to validate) |
|---|---|---|
| **1. Free Checkup** | Paste a URL and connect GitHub. In minutes: a security report (RLS, headers, exposed keys), a freshness report (framework and dependency age), a test-safety score and a ranked fix list. *The Fit Scan, extended into the repo.* | Free. The lead engine |
| **2. Stabilize** (one-off) | The crew fixes the critical findings and installs the safety net: staging, preview links, a baseline test suite around the money and login paths, branch protection and rollback. You watch it happen on the rail and approve each fix. | Fixed price, e.g. **$499–$1,999** by size. Replaces the $5–20K installation for this segment |
| **3. Crew plan** (monthly) | Ongoing: request changes in plain words → design → preview → approve → live. Plus automatic upkeep: upgrades, security patches, health monitoring and a weekly briefing. | Tiers by changes per month, e.g. **$199 / $599 / $1,499**. Model costs are metered inside a cap |

The premium managed service (custom apps, the Customer Zero type) stays custom-quoted, as it is today.

### What the customer actually sees: four screens, not 24
1. **Inbox ("Needs you")**: every decision, approval and "please try this", one tap each. *(The most important screen.)*
2. **Work**: the rail. Every Work item with its conversation, design, plan, live build log, evidence, preview and Go live / Undo.
3. **Site**: one page with Health (Checkup scores over time), Toolbelt (Connect buttons and status), Library (rulebook, decisions, designs) and Releases (with Undo).
4. **Crew**: the specialists, what each may do, which model plays each role, spend so far and limits, and the Skillsmith's proposals waiting for approval.

Everything else becomes a tab inside one of these, moves behind Engineer view, or waits. Platform Admin stays internal.

### The words we keep (and the ones we retire)
**Keep:** Crew · Work item · Inbox · Preview · Go live · Undo · Checkup · Evidence.
**Internal only:** Protocol, gates, AC levels, commissioning, Stack card.
**Retire from customer-facing copy:** lattice, accelerator physics, Bridge, Navigator (call it "you"), Discipline Pack, Readiness Report (it *is* the Checkup).

---

## 6. Architecture changes that follow (no code yet, just direction)

1. **The Toolbelt (thin gateway) in `apps/api`.** Every external action is a named, schema-described tool. Credentials stay server-side, and the gateway does per-specialist allowlists, audit, redaction and spend caps. The runner calls tools through the API and holds only test env vars for the sandbox. This *replaces* the separate Connections / Vault / env-manifest pages with one model.
2. **Crew registry.** Specialists are data: skills + tools + permissions + model. `packages/domain` keeps the permission and gate policy, as it does today.
3. **Site Crawler.** Turns a repo plus its connected accounts into the drafts listed in §1 (Stack card, env manifest, routes, schema/RLS map, tests, invariants), all disabled until the Owner approves. It powers the free Checkup and the start of Stabilize.
4. **Skillsmith plus a skill registry with versions, diffs, replay evaluation and rollback.** Crew skills are shared; site skills are private.
5. **Progressive discovery** for skills and tools, so context stays small as the crew grows.
6. **Keep:** the rail, the three human gates, the independent Judge, test-only data for builders, open formats, and model choice per role.

---

## 7. The next 90 days

The rule for this period: **depth before breadth. No new pages until the loop runs live.**

| Window | Goal | Done when |
|---|---|---|
| **Weeks 1–3: one real loop** | Run migration 0004/0005 live. Run the runner on Machine Shop, then Cypress: request → design → plan → build → tests → preview → approve → live, with evidence, unattended between the gates. Add a GitHub App and Vercel previews. | **10 real Work items shipped** through the rail on 2 sites, with send-back rate and time-to-live measured |
| **Weeks 3–6: Checkup + Toolbelt v0** | Extend Fit Scan into a repo Checkup (RLS, keys in the repo, freshness, tests). Connect buttons for GitHub, Vercel and Supabase, with test-side provisioning. Collapse the console toward the four screens. | A stranger connects a repo and gets a useful report in under 10 minutes with **zero pasted keys** |
| **Weeks 6–10: 5 design partners** | Recruit 5 founders running AI-built apps (from communities around Lovable, v0, Bolt and Supabase). Stabilize each one free or at cost, in exchange for honest feedback and metrics. | 5 apps stabilized; each has had ≥5 crew changes go live; at least 3 say they would pay |
| **Weeks 10–13: price and Skillsmith v0** | Charge for Crew plans. Turn on Skillsmith proposals from Learn, with replay evaluation. | First paid revenue; the first crew skill learned on one customer and adopted by another |

**Metrics to watch from day one:**
- time from request to live
- first-pass approval rate (approved without send-back)
- escaped defects
- owner minutes per change
- model cost per change
- Checkup → Stabilize conversion

### Kill or pivot signals
- After 5 design partners, owners still need a developer to get through Stabilize.
- Cost per accepted change stays above roughly $25 at the starter tier.
- Founders say "nice" but won't pay $199/month. That would point back to agencies or the premium managed service as the real business.

---

## 8. Risks, with mitigations

| Risk | Mitigation |
|---|---|
| **App builders (Lovable, v0, Replit) add "maintenance mode" themselves** | They are tied to their own builder and their own hosting. We work on *any* repo on the stack, after the customer has left the builder, with an independent judge and open formats. Many of their users will have outgrown them anyway. |
| **Coding agents (Cursor, Devin, Codex, Claude Code) move toward owner-facing custody** | Same answer as accelerator.md §6: they are engines we drive, and our moat is the rail, the gates, the evidence, the Toolbelt and accumulated crew skills. |
| **Liability when the crew breaks a live site** | Gates on money, data and auth, one-click Undo, test-only data, evidence on every change, and contract language by change class. |
| **Model cost eats margin** | Route cheap models to cheap jobs, cap every job, keep the Judge's tests deterministic, and price by changes per month, not seats. |
| **Founder bandwidth** | Freeze breadth. One loop, one buyer, one stack, until the metrics above are green. |

---

## 9. Decisions for the owner

1. **Beachhead:** do we lead with *AI-built apps that are live and fragile*, keeping Customer Zero-type businesses as the premium managed tier? *(Recommended: yes.)*
2. **Name in market:** keep *The Accelerator*, or lead with the crew ("Strategic Machines Crew")? *(Recommended: test "crew" language on the website alongside "Accelerator" with the first 5 prospects.)*
3. **Onboarding:** replace the $5–20K installation with a **fixed-price Stabilize** for this segment? *(Recommended: yes, and keep custom quotes for the premium tier.)*
4. **UI freeze:** accept the four-screen target and hide the remaining pages behind Engineer view or a later release? *(Recommended: yes.)*
5. **Toolbelt and Connect buttons** replace pasted env keys as the default way to connect a site? *(Recommended: yes.)*
6. **Skillsmith:** shared crew skills learned from customers, with anonymization and owner approval. Is this acceptable in the customer agreement? *(Needs a contract clause.)*
7. **Design partners:** who are the first five? Fit-scan the candidates first.
