# Accounts, Sign-in & Platform Admin — Design (v0.2)

*2026-09-29 · status: **for approval** · repo: `accelerator-platform` · companion to [accelerator-control-room.md](accelerator-control-room.md)*
*v0.2: SMS second step (Twilio, emulated outside production), explicit `APP_STAGE`, non-production access gate, owner decisions recorded.*

**Goal.** Customers are invited (self-serve comes later). Everyone signs in through one screen with **email + a texted code**. Anyone on the platform-admin list lands in **Platform Admin**, which shows every account, subscription, revenue and platform health, and can create or suspend accounts.

---

## 1. Pattern (Stripe, Vercel, Supabase, Linear)

- The marketing site only **links** to sign-in and sign-up; auth lives in the **app**.
- Sign-up: account → organization → plan and payment → onboarding.
- Staff reach an internal admin through the **same** sign-in, gated server-side.

## 2. Decisions

| # | Decision |
|---|---|
| D1 | One auth screen, in the console at **`app.strategicmachines.ai`** (the domain is already set up in Vercel). The marketing site links to `/login` and `/signup`. |
| D2 | **Supabase Auth** for identity: **email magic link**, **Google**, **GitHub**. |
| D3 | **Second step for everyone: a code texted to the member's verified mobile.** It's required for sign-in (session level `aal2`) and on every admin action. |
| D4 | **Sign-up captures email + mobile**, plus SMS consent (timestamp and wording shown). The mobile is verified by code before the account opens.<br>**International numbers:**<br>• a country picker plus a number field, validated and stored in **E.164** (`+<country code><number>`) with `libphonenumber-js`<br>• any country Twilio Verify supports, never assuming `+1`<br>• the number is shown masked (`•••• 5391`) everywhere after entry |
| D5 | **SMS goes through one seam, `SmsProvider`** (the ts-platform `getMailProvider()` pattern):<br>• `emulate` when `APP_STAGE` ≠ `production`: the **Twilio emulator** (`vercel-labs/emulate`, Twilio **Verify v2 + Messaging**) embedded in the API via `@emulators/adapter-next` at `/emulate`.<br>• `twilio` in production: real Twilio Verify. **Stubbed for now**; it fails loudly with "Twilio not configured" until you sign up. |
| D6 | **`APP_STAGE`** (`development` · `preview` · `production`) is set explicitly per deployment. Vercel's "Production" label does **not** make us production. Today every deployment is `development` (test database, test Stripe). |
| D7 | **Access gate outside production.** When `APP_STAGE` ≠ `production`:<br>• only emails on `DEV_ALLOWLIST` can sign up or sign in (others see "Invite only")<br>• codes are delivered **only to allow-listed numbers**<br>• the emulator's inspector and its code-lookup route are **admin-only**<br>• keep **Vercel Deployment Protection** on the console and preview deployments as the outer wall |
| D8 | **Reserve codes** (dev team only, non-production only): each allow-listed person gets their **own** code, stored **hashed** in `DEV_RESERVE_CODES` (`email:sha256`), accepted **only** for that person's verified number, and **refused entirely in production**. The emulator's fixed `123456` is **never** accepted as a reserve code. |
| D9 | Platform admins = a database allow-list (`acc_platform_admins`), bootstrapped from `PLATFORM_ADMIN_EMAILS` (the owner; see §9). The admin second step is the same SMS code (D3); **TOTP/passkey is the planned upgrade** for admins. |
| D10 | **Admin area inside the console at `/admin`**, gated on both the console and the API. It can split to `apps/ops` later without API changes. |
| D11 | **Billing:** Stripe subscription (Operate monthly). **The installation fee is custom-quoted, $5,000–$20,000** by site complexity and scope, and **invoiced** (Stripe invoice), not a fixed Checkout price. For highly complex sites it includes **training courses** (so the customer's team leads the migration) and a **support contract**, recorded on the account as quote line items. |
| D12 | **Invite-only at launch.** Self-serve Checkout is built behind the `SELF_SERVE_SIGNUP` switch, off until ts-platform proves the loop. |
| D13 | The API trusts only a **verified Supabase JWT at `aal2`**. It resolves user → memberships → the current org, never from client input. The demo Operator survives only for local runs without keys. |

## 3. How the texted code works

```
Sign in (email link / Google / GitHub) ─► session at aal1
   └─► "Text me a code" ─► API /api/auth/sms/start ─► SmsProvider.sendVerification(verified mobile)
            emulate: Twilio Verify emulator (code readable in /emulate inspector, admin-only)
            twilio:  real Twilio Verify (production; stub today)
   └─► enter code ─► API /api/auth/sms/check ─► SmsProvider.check(code)  — or reserve code (D8, non-prod only)
            └─► pass ─► session stepped up to aal2 ─► routing rule (§4C)
```

- **How the session is marked `aal2`:** Supabase MFA with a phone factor, where Supabase's **Send-SMS hook** points at our API → `SmsProvider`. Supabase then owns code verification and stamps `aal2` on the JWT, and the API simply checks the claim.
- **Verify during build:** that the Send-SMS hook covers phone MFA on our plan.
- **Fallback:** our own step-up record (`acc_step_ups`) keyed to the Supabase session.
- **Local development:** Supabase must reach the hook, so it goes through your **ngrok** tunnel. Vercel deployments use the API's URL.
- **Rate limits:** 5 code requests per number per hour; 5 wrong entries lock the code.

## 4. Flows

- **A. Invited (launch path).**
  1. Admin → **New account**: name, plan, billing mode (`invoiced` / `comped`), owner's email + mobile.
  2. The owner gets the invite → signs in → confirms their mobile by code → the account opens at **Onboarding**.
- **B. Self-serve (off at launch).** `/signup` → identity → mobile + consent → code → create organization → Stripe Checkout (subscription) → onboarding. The installation fee is quoted and invoiced separately.
- **C. Routing after `aal2`:**
  - platform admin → `/admin`
  - member of one account → that site's Control Room (or `/onboarding` if there's no site yet)
  - member of two or more → account picker
  - pending invite → accept the invite
  - no account → "Invite only" (or `/onboarding` when self-serve is on)
  - suspended → the suspended page
- **D. Handover** (ts-platform → owners): add their Owner → optionally remove yourself or downgrade to "Strategic Machines support" → billing mode `comped` → `stripe`.
- **E. Suspend/resume:** requires a reason. The API returns `423` for the account (except billing), and the runner stops its jobs. Both are audited.

## 5. Screens

| Route | Who | What |
|---|---|---|
| `/login`, `/signup` | Anyone | Split screen: product statement, and the auth widget (email link · Google · GitHub). Sign-up adds mobile + SMS consent. |
| `/verify` | Signed in at `aal1` | "We texted a code to •••• 4567" → six boxes → resend (rate-limited). A **"Use reserve code"** link appears only outside production. |
| `/auth/callback` | — | Finishes the link or OAuth → `/verify`. |
| `/onboarding`, `/accounts` | Members | Create organization / account picker. |
| `/admin` | Admins | MRR, ARR, active / onboarding / past-due / suspended accounts, **AI cost vs revenue (gross margin)**, alerts. |
| `/admin/accounts`, `/admin/accounts/[id]` | Admins | The list, plus detail pages with members, sites, subscription, quoted installation fee, usage and audit. **Actions:** new account, suspend/resume, plan or billing mode, resend invite, transfer ownership. |
| `/admin/revenue` · `/admin/health` · `/admin/audit` | Admins | Revenue and margin · platform health (API errors, webhooks, AI spend vs limits, SMS sends) · every admin action. |
| API `/emulate` | Admins, non-prod only | The Twilio emulator inspector (texts "sent" and codes). |

## 6. Data (migration `0003_accounts_auth_admin.sql`)

| Table / change | Purpose |
|---|---|
| `acc_profiles (user_id, email, mobile_e164, mobile_verified_at, sms_consent_at, sms_consent_text)` | Captured at sign-up (D4). |
| `acc_platform_admins (user_id, email, added_by, added_at)` | Admin allow-list (D9). |
| `acc_orgs` + `status`, `billing_mode` (`stripe · invoiced · comped`), `stripe_customer_id`, `install_fee_quote_usd`, `suspended_at`, `suspended_reason`, `created_by` | Account lifecycle and the quoted installation fee (D11). |
| `acc_subscriptions`, `acc_stripe_events` | Webhook-synced billing and idempotency. |
| `acc_invites (org_id, email, mobile_e164, role, invited_by, token_hash, expires_at, accepted_at)` | Invite-only launch (D12). |
| `acc_sms_log (user_id, to_masked, purpose, provider, status, at)` | Rate limits and health; never stores codes. |
| `acc_admin_audit (admin_user_id, action, org_id, detail, at)` | Every admin action; never deleted. |

## 7. Configuration

| Key | Where | Notes |
|---|---|---|
| `APP_STAGE` | api + console | `development` now on every deployment (D6). |
| `PLATFORM_ADMIN_EMAILS` | api | Bootstraps admins. |
| `DEV_ALLOWLIST` | api | Team emails; enforced when not `production`. |
| `DEV_RESERVE_CODES` | api | `email:sha256(code)` pairs; ignored in `production`. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` | api | The emulator's seeded values outside production; real values later. |
| `SELF_SERVE_SIGNUP` | api + console | `off` at launch. |

## 8. Build order (after approval)

1. Migration 0003; Supabase providers (email, Google, GitHub) + phone MFA + Send-SMS hook; `APP_STAGE`, allow-lists.
2. `SmsProvider` (`emulate` via `@emulators/adapter-next` in apps/api; a `twilio` stub); `/api/auth/sms/*`; reserve codes; rate limits.
3. Console: `/login`, `/signup`, `/verify`, `/auth/callback`, `proxy.ts`, routing (§4C). API: JWT at `aal2`, `423` on suspended accounts.
4. `/admin`: overview, accounts, **New account (invite)**, suspend/resume, audit.
5. Stripe: subscription + invoiced installation fee, Customer Portal, webhooks, revenue page (self-serve behind the switch).
6. Board **ts-platform** as account #1 (`comped`, owner = you) → real design updates → handover.
7. Marketing site: **Sign in** / **Get started** → `app.strategicmachines.ai`.

**Out of v1:** impersonation, cross-account work queues, SSO/SAML, TOTP/passkeys (planned for admins).

## 9. Owner decisions (2026-09-29)

- ✅ Domain `app.strategicmachines.ai` (already defined in Vercel).
- ✅ Invite-only first; self-serve built behind a switch.
- ✅ Installation fee custom-quoted, **$5,000–$20,000** by complexity and scope; complex sites include training courses + a support contract.
- ✅ Second factor = texted code (Twilio; emulated outside production); reserve codes for the dev team only.
- ✅ `DEV_ALLOWLIST` = **the owner only** for now (work email + mobile). Values live in envmachine, **never in this repo** (this doc is committed to GitHub).
- ✅ Mobile numbers are international: E.164, any country code.
- **To confirm:** `PLATFORM_ADMIN_EMAILS`, the owner's work address (`pdhoward@strategicmachines.ai`) instead of the Gmail address, or both?
