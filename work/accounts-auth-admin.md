# Accounts, Sign-in & Platform Admin — Design (v0.1)

*2026-09-29 · status: **for approval** · repo: `accelerator-platform` · companion to [accelerator-control-room.md](accelerator-control-room.md)*

**Goal.** Customers sign up, pay and board themselves, or are set up by the platform owner. Everyone signs in through one screen. Anyone on the platform-admin list lands in a **Platform Admin** area that shows every account, its subscription and revenue, and platform health, and can suspend an account.

---

## 1. How the best products do it (the pattern we copy)

| Product | Marketing site | Sign in / sign up | After sign-in |
|---|---|---|---|
| Stripe | stripe.com | **dashboard.stripe.com**/login | Account dashboard |
| Vercel | vercel.com | vercel.com/login (app routes) | Team → projects |
| Supabase | supabase.com | supabase.com/dashboard/sign-in | Org → projects |
| Linear | linear.app | linear.app/login | Workspace |

**The shared pattern:**
- The marketing site only **links** to sign-in and sign-up. The auth screen lives in the **app** (one widget, one domain).
- Sign-up goes: create account → create organization → choose plan / pay → onboarding.
- Staff reach an internal admin through the **same** sign-in, gated server-side.

**Decisions:**

| # | Decision |
|---|---|
| D1 | One auth screen, in the console, at **`app.strategicmachines.ai`**. The marketing site links to `/login` and `/signup`; it never hosts auth. No cross-domain sessions to manage. |
| D2 | **Supabase Auth**. Methods: **Google** and **GitHub** (one click, and GitHub is natural for repo owners), plus an **email magic link**. No passwords to manage. |
| D3 | Platform admins = a database allow-list (`acc_platform_admins`), bootstrapped from the `PLATFORM_ADMIN_EMAILS` env var (`strategicmachines@gmail.com`). **MFA (TOTP) is required** for admins. |
| D4 | The admin area lives **inside the console at `/admin`** (same sign-in, same deploy) and is gated on **both** the console and the API. It can split out to `apps/ops` later without changing the API. |
| D5 | **Stripe Billing** for subscriptions plus the one-time installation fee (**Stripe Checkout**; the fee is a one-time line on the first invoice). The **Stripe Customer Portal** handles cards and invoices, so we build no card forms. Stripe webhooks keep our tables in sync. |
| D6 | Each account has a **billing mode**: `stripe` (self-serve), `invoiced` (billed manually) or `comped` (no charge; internal or pilot). The platform owner can set up an account that boards without a card. |
| D7 | The API trusts only a **verified Supabase JWT**. It resolves user → memberships → the current org, never from client input. The demo Operator identity survives **only** for local runs without keys. |

---

## 2. Flows

**A. Self-serve customer**
`strategicmachines.ai` **Get started** → `app…/signup` → Google / GitHub / email → **Create organization** (name, site URL) → **Choose plan** → Stripe Checkout (subscription + installation fee) → webhook marks the account **Onboarding** → the onboarding wizard (connect the repo, …) → the site's Control Room.

**B. Owner-provisioned (e.g. ts-platform, pilots)**
Admin → **New account**: name, plan, billing mode (`comped` / `invoiced`), owner's email → an invite email → the owner signs in (any method) → lands in the account at **Onboarding**. No card needed.

**C. Sign-in routing** (one rule, applied after every sign-in)

```
platform admin?                → /admin
member of 1 account            → /s/<its first site>   (or /onboarding if no site yet)
member of 2+ accounts          → account picker
invited, not yet accepted      → accept invite → account
no account                     → /onboarding (create org → plan)
account suspended              → "Account suspended" page (billing contact only)
```

A platform admin can also **switch into** an account they belong to (the account picker shows "Platform Admin" as an extra entry).

**D. Handover (ts-platform to its owners)**
Admin → the account → **Transfer ownership**: add their person as Owner, then optionally remove yourself or downgrade to a "Strategic Machines support" member. Change billing mode from `comped` to `stripe` when they start paying.

**E. Suspend / resume**
Admin → the account → **Suspend** (a reason is required). The API refuses that account's requests with `423 Locked`, except billing and the suspended page. The runner stops taking its jobs. Every action is written to the audit log.

---

## 3. Screens

| Route | Who | What |
|---|---|---|
| `/login`, `/signup` | Anyone | Split screen: product statement on the left, auth widget on the right (Google · GitHub · email link). `/signup?plan=operate` preselects the plan. |
| `/auth/callback` | — | Finishes OAuth / magic link, then applies routing rule C. |
| `/onboarding` | New user | Create organization → choose plan (Stripe) or "Talk to us" → the onboarding steps already in the console. |
| `/accounts` | Multi-account users | Account picker. |
| `/admin` | Platform admins | **Overview:** MRR, ARR, active accounts, onboarding, past due, suspended; AI spend vs revenue (**gross margin**); alerts. |
| `/admin/accounts` | Platform admins | Every account: name · status · plan · billing mode · MRR · sites · members · AI spend this month · last activity. Filters by status. **New account** button. |
| `/admin/accounts/[id]` | Platform admins | Profile, members, sites, subscription and invoices (from Stripe), usage vs limits, audit trail. **Actions:** suspend/resume, change plan or billing mode, resend invite, transfer ownership, open in Control Room (only if a member). |
| `/admin/revenue` | Platform admins | MRR trend, new vs churned, installation fees collected, past-due list, AI cost per account, gross margin per account. |
| `/admin/health` | Platform admins | API error rate and latency, failed Stripe webhooks, AI spend vs limits across tenants, runner queue (when built), Supabase status. |
| `/admin/audit` | Platform admins | Every admin action: who, what, which account, when. |

"All active work across accounts" is left out of v1 on purpose (see §7). The overview shows **counts** only (open requests and changes in flight per account).

---

## 4. Data (migration `0003_accounts_auth_admin.sql`)

| Table / change | Purpose |
|---|---|
| `acc_platform_admins (user_id, email, added_by, added_at)` | The allow-list (D3). |
| `acc_orgs` + `status` (`invited · onboarding · active · past_due · suspended · cancelled`), `billing_mode`, `stripe_customer_id`, `suspended_at`, `suspended_reason`, `created_by` | Account lifecycle. |
| `acc_subscriptions (org_id, stripe_subscription_id, plan, status, current_period_end, mrr_usd, install_fee_usd, install_fee_paid_at)` | Webhook-synced billing state; revenue is computed here. |
| `acc_invites (org_id, email, role, invited_by, token_hash, expires_at, accepted_at)` | Owner-provisioned accounts and new members. |
| `acc_admin_audit (admin_user_id, action, org_id, detail jsonb, at)` | Every admin action; never deleted. |
| `acc_members.user_id` → references `auth.users(id)` | Real users instead of seeded UUIDs. |
| `acc_stripe_events (id, type, received_at, processed_at, error)` | Webhook idempotency and failure view. |

**RLS:** unchanged pattern. Tenant tables stay org-scoped. The admin tables have **no** policies (API-only, via the service role).

---

## 5. API

| Endpoint | Guard |
|---|---|
| `GET /api/me` | Signed in. Returns user, memberships, `isPlatformAdmin`. |
| `POST /api/onboarding/org` | Signed in, no account yet → creates the org (status `onboarding`) with the caller as Owner. |
| `POST /api/billing/checkout` · `POST /api/billing/portal` | Account Owner → Stripe Checkout / Customer Portal URL. |
| `POST /api/webhooks/stripe` | Stripe signature → syncs subscriptions and account status. |
| `POST /api/invites/accept` | Signed in + valid token. |
| `/api/admin/*` (accounts, revenue, health, audit, actions) | `requirePlatformAdmin` (allow-list + MFA level `aal2`). Every write goes to the audit log. |
| All existing `/api/sites/**` | Verified JWT → membership → org; **`423` if the account is suspended**. |

The console sends the user's Supabase access token as `Authorization: Bearer` on server calls, and adds it in its `/api/*` proxy for browser calls. So the token never has to be handled by browser JavaScript.

---

## 6. The front door

- **`app.strategicmachines.ai`** → console. It's a CNAME at Namecheap to Vercel, like the marketing site. The API can stay on its Vercel URL or move to `api.strategicmachines.ai`.
- **The console's `proxy.ts`** (Next 16's renamed middleware) refreshes the session and sends signed-out visitors to `/login`. Signed-out access is allowed only for `/login`, `/signup`, `/auth/*` and invite links.
- **The marketing site gets three links:**
  - the nav's **Sign in** → `app…/login` (today it's a dead button)
  - **Get started** → `app…/signup`
  - "Apply for commissioning" stays for leads who want to talk first.

---

## 7. Build order (after approval)

1. Migration 0003 + Supabase Auth providers (Google, GitHub, email) + `PLATFORM_ADMIN_EMAILS`.
2. Console: `/login`, `/signup`, `/auth/callback`, `proxy.ts`, routing rule C. API: JWT verification in `resolveCaller`, suspended-account `423`.
3. `/admin` overview + accounts list + account detail with **New account (owner-provisioned)**, suspend/resume, audit log.
4. Stripe: products and prices, Checkout, Customer Portal, webhooks → `acc_subscriptions`; the revenue page.
5. Board **ts-platform** as account #1 (billing mode `comped`, owner = you) → run real design updates through it → hand over (flow D).
6. Marketing-site links and the `app.` domain.

**Out of v1:** impersonation ("view as" an account you aren't in), cross-account work queues, dunning emails beyond Stripe's defaults, SSO/SAML.

---

## 8. Open decisions (owner)

1. **Domain:** `app.strategicmachines.ai` for the console. OK?
2. **Self-serve checkout at launch, or invite-only first?** I recommend **invite-only** until ts-platform proves the loop, keeping the Stripe flow built but behind a switch.
3. **Pricing to put in Stripe:** Operate monthly and the installation fee amounts (accelerator.md §8 has ranges).
4. **Admin MFA:** required from day one (recommended), or after launch?
