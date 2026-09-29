# Accounts, Sign-in & Platform Admin — Design (v0.3, approved)

*2026-09-29 · **approved by owner** · repo: `accelerator-platform` · companion to [accelerator-control-room.md](accelerator-control-room.md)*
*v0.3: one-step sign-in (email link **or** texted code); no per-action second factor; role-based access for the platform (Owner · Admin · Staff) and for customers (release approval by role).*

**Status (2026-09-29): built.** API routes, console screens and role gating done; typecheck, tests (22) and both builds pass; demo mode verified end to end. **Waiting on:** migration 0003 applied to accelerator-test, Supabase Auth redirect URLs, then a live sign-in test.

**Where the code is:**
- Permission maps: `packages/domain/src/permissions.ts` (`canPlatform`, `canSite`)
- API guards: `apps/api/lib/http.ts` (`platformRoute`, `siteRoute`: 404 not a member · 423 suspended · 403 role)
- Sign-in + codes: `apps/api/lib/{identity,codes,sms,phone,env}.ts`
- Console: `lib/access.ts` (`homeFor`, `siteAccess`, `platformAccess`), `components/sidebar.tsx` (one `AppSidebar`, nav filtered on the server), `app/login`, `app/profile/mobile`, `app/admin/**`

**Goal.** Invited customers and our team sign in through one screen. **Platform Admin** shows every account, subscription, revenue and platform health, and creates or suspends accounts. What anyone can do is decided by **role → permission maps** in one file.

---

## 1. Pattern (Stripe, Vercel, Supabase, Linear)

- Marketing links to the app; auth lives in the app.
- Staff use the same sign-in, gated server-side.

## 2. Decisions

| # | Decision |
|---|---|
| D1 | One auth screen in the console at **`app.strategicmachines.ai`**. The marketing site links to `/login`. |
| D2 | **Sign in with one step, either:**<br>• **an emailed one-time link**: the API makes the token (Supabase Auth) and sends it with nodemailer, so the link always points at our own Control Room, or<br>• **a code texted to the member's verified mobile.**<br>Each proves possession of an inbox or a phone. There's **no extra per-action second factor**. Google and GitHub come later. |
| D3 | **Mobile captured and verified on first sign-in** (international: E.164, any country code, `libphonenumber-js`; shown masked), with SMS consent recorded. |
| D4 | **Texted codes are generated and checked by our API** (hashed, 10-minute expiry, 5 tries, 5 texts per number per hour). Twilio only *delivers* the text. |
| D5 | **One SMS client, `TwilioSms`, pointed at a base URL:**<br>• **production:** `api.twilio.com`, active once the Twilio keys exist; until then it fails loudly.<br>• **outside production:** the **Twilio emulator** (`npx emulate start --service twilio --port 4013`; its default port 4000 is the console's). On Vercel there's no emulator, so texts are suppressed and logged, and the team uses **reserve codes**. |
| D6 | **`APP_STAGE`** (`development` · `preview` · `production`) is explicit per deployment. Today it's `development` everywhere (test database, test Stripe). |
| D7 | **Outside production:** only `DEV_ALLOWLIST` emails can sign in. **Reserve codes** are per person, stored hashed (`DEV_RESERVE_CODES = email:sha256`), valid only for that email, and ignored in production. Vercel Deployment Protection stays on as the outer wall. |
| D8 | **Invite-only.** Anyone can sign in only if they are a platform staff member, an existing member, or have a pending invite. Self-serve sign-up is off (`SELF_SERVE_SIGNUP`). |
| D9 | **Platform roles: Owner · Admin · Staff** (`acc_platform_admins.role`), bootstrapped from `PLATFORM_ADMIN_EMAILS` as Owner. |
| D10 | **Customer roles: Owner · Operator · Tester · Viewer**, per account. |
| D11 | **Permissions are two maps in `packages/domain/src/permissions.ts`:** platform `role → actions` and customer `role → actions`.<br>• The console hides what a role can't use.<br>• The API refuses it (403).<br>• Each admin sidebar item declares its permission, so **changing who sees what is a one-line edit in the map.**<br>• Money, data, auth and security changes still also need the account Owner (gate policy). |
| D12 | The API trusts only a **verified Supabase JWT**. It resolves user → platform role and memberships → the site's account and role. Suspended account → **423**. Local runs without keys keep the demo tenant. |
| D13 | **Billing:** Stripe subscription (Operate monthly). The installation fee is **custom-quoted at $5,000–$20,000**, and **invoiced**; complex sites include training courses and a support contract. Tables exist now; **Stripe wiring is the next step** after this build. |

## 3. Permissions (initial maps; edit in one place)

**Platform** (the Platform Admin area):

| Action | Owner | Admin | Staff |
|---|---|---|---|
| View overview, accounts, health | ✓ | ✓ | ✓ |
| View revenue and billing | ✓ | ✓ | — |
| Create accounts, invite people, edit plan or billing mode | ✓ | ✓ | — |
| Suspend / resume accounts | ✓ | ✓ | — |
| View audit log | ✓ | ✓ | — |
| Manage platform staff | ✓ | — | — |

**Customer** (the Control Room):

| Action | Owner | Operator | Tester | Viewer |
|---|---|---|---|---|
| View everything | ✓ | ✓ | ✓ | ✓ |
| Create requests | ✓ | ✓ | ✓ | — |
| Try and approve changes (non-money) | ✓ | ✓ | ✓ | — |
| **Release to production (Go live)** | ✓ | ✓ | — | — |
| Approve money, data, auth or security changes | ✓ | — | — | — |
| Skills, limits, configuration | ✓ | ✓ | — | — |
| Members and billing | ✓ | — | — | — |

## 4. Flows

- **Sign in:** `/login` → enter email → **Email me a link** or **Text me a code** (the code path needs a verified mobile) → session → routing.
- **First sign-in:**
  - pending invites become memberships
  - allow-listed platform emails become platform Owners
  - then **add your mobile** (a code confirms it) before continuing
- **Routing:**
  - platform role → `/admin`
  - one account → its site's Control Room
  - several accounts → a picker
  - none → "Invite only"
  - suspended → the suspended page
- **New account (admin):** name, site URL, plan, billing mode (`comped` · `invoiced` · `stripe`), quoted installation fee, owner's email → creates the account and the owner's invite. The owner signs in at `/login` with that email.
- **Suspend/resume:** a reason is required; everything is audited; the account's requests get a 423.
- **Handover** (ts-platform → owners): invite their Owner → optionally remove yourself → billing mode `comped` → `stripe`.

## 5. Screens

| Route | Who | What |
|---|---|---|
| `/login` | Anyone | Split screen: product statement, email field, **Email me a link** / **Text me a code**, then the code boxes. "Use reserve code" appears only outside production. |
| `/auth/confirm` | — | Finishes the emailed link (one use, 1 hour). |
| `/profile/mobile` | Signed in | Add or confirm the mobile, plus SMS consent. |
| `/accounts` | Several accounts | Account picker. |
| `/admin` | Platform roles | Overview: accounts by status, MRR/ARR, quoted installation fees, AI spend vs revenue, texts sent. |
| `/admin/accounts` (+ `/new`, `/[id]`) | Per map | List, create + invite, detail with members, sites, billing, suspend/resume. |
| `/admin/audit` · `/admin/team` | Per map | Admin actions · platform staff. |

## 6. Data (migration `0003_accounts_auth_admin.sql`)

| Table / change | Purpose |
|---|---|
| `acc_profiles (user_id, email, mobile_e164, mobile_verified_at, sms_consent_at, sms_consent_text)` | D3 |
| `acc_platform_admins (user_id, email, role owner·admin·staff, added_by, added_at)` | D9 |
| `acc_orgs` + `status`, `billing_mode`, `install_fee_quote_usd`, `suspended_at`, `suspended_reason`, `created_by` | Lifecycle |
| `acc_invites (org_id, email, role, invited_by, created_at, accepted_at, revoked_at)` | D8 |
| `acc_sms_codes (email, mobile_e164, purpose, code_hash, expires_at, attempts, consumed_at)` | D4 |
| `acc_sms_log (email, to_masked, purpose, provider, status, at)` | Rate limits and health; never stores codes |
| `acc_subscriptions`, `acc_stripe_events` | D13 (populated when Stripe is wired) |
| `acc_admin_audit (actor_user_id, actor_email, action, org_id, detail, at)` | Every admin action |

## 7. Configuration (values in envmachine, never in this repo)

- **`APP_STAGE`**
- **Access:** `PLATFORM_ADMIN_EMAILS`, `DEV_ALLOWLIST`, `DEV_RESERVE_CODES`
- **SMS:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `TWILIO_API_BASE` (the emulator URL locally)
- **Email:** `EMAIL_USER`, `EMAIL_PASS` (Gmail app password), optional `EMAIL_FROM`, `EMAIL_SERVICE`. Locally without them, sign-in links print in the API terminal.
- **URLs, local vs deployed:** `API_URL_LOCAL` / `API_URL_DEPLOYED`, `CONSOLE_URL_LOCAL` / `CONSOLE_URL_DEPLOYED`. The apps read `_DEPLOYED` when Vercel's `VERCEL=1` is set, `_LOCAL` otherwise (defaults `localhost:4001` / `:4000`). One env file serves both.
- **Console:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Supabase dashboard:** no redirect-URL setup needed for sign-in; our API builds the links.

## 8. Owner decisions (2026-09-29)

- ✅ `app.strategicmachines.ai`
- ✅ invite-only
- ✅ installation fee $5K–$20K, custom-quoted (complex sites: training + support contract)
- ✅ one-step sign-in (email link or texted code)
- ✅ platform roles Owner · Admin · Staff
- ✅ role-gated release approval
- ✅ `DEV_ALLOWLIST` = the owner only
- ✅ `PLATFORM_ADMIN_EMAILS` = the owner's work address
