# Backlog

Ideas we want but haven't scheduled. Newest first within each area. Each item says why it matters.
When an item is picked up, move it into the design (gen2-crew.md §8) or a Work item, and delete it here.

## Marketing site (strategicmachines.ai)

- **Email on every walkthrough request (Resend).** (2026-10-21) Today requests are only saved in
  `sm_waitlist`; nobody is told. (1) An alert to us with who, role, site, page, city and country;
  (2) a confirmation to the visitor ("we'll be in touch within one business day"). Needs: a Resend
  account, the `strategicmachines.ai` domain verified (one DNS record), `RESEND_API_KEY` on Vercel,
  and the address alerts go to. Send after the insert succeeds; never fail the request if email fails.
- **A simple "Requests" view for us.** (2026-10-21) Reading `sm_waitlist` needs the Supabase
  dashboard. A password-protected page (or a tab in the platform's Admin) listing requests with
  page, location and status (new · contacted · booked · not a fit), plus a CSV export.
- **Connect a request to the visit that led to it.** (2026-10-21) `sm_page_visits` already has a
  per-tab session id; send it with the request so we can see the pages someone read before asking.
- **Spam protection that survives scale.** (2026-10-21) The rate limit is in memory per server
  instance. Add Cloudflare Turnstile (invisible) or a Supabase-backed limiter before any paid traffic.
- **Remove our QA test rows from `sm_waitlist`.** (2026-10-21) Emails `qa-test-1792611217@example.com`
  and `qa-test-1792611277@example.com` (source "qa-test (Claude, delete me)"):
  `delete from sm_waitlist where email like 'qa-test-%@example.com';`
- **Industry landing pages.** (2026-10-21) One page per available industry (Commerce, then
  Hospitality) with its crew, journeys and proof, for search and for ads. Planned industries collect
  interest per industry (add an `industry` field to the request form).
- **Next industry crews.** (2026-10-21) Churches and charities first (online giving and personal
  data, close to Commerce, badly served today), then home services.
- **Machine Shop case study page.** (2026-10-21) The real #9 record (request → design → 4 steps →
  243 → 276 tests → live) as a short story with screenshots, linked from See it work.
- **Demo video extras.** (2026-10-21) A more natural voice (ElevenLabs); a 15-second muted loop for
  the home hero; a copy on YouTube for search; short Low and Medium versions ("it just ships",
  "approve a one-page brief").

## Platform (accelerator-platform)

- **Rebuild the Engineer pages on Gen 2 records.** (2026-10-20) Proof and Releases from
  `acc_evidence` and `acc_work`; Metrics as real vital signs (G2.1a); fold Health into Site.
- **Data Desk needs a real data connector.** (2026-10-20) Read-only questions about the site's data
  (e.g. Machine Shop's MongoDB catalog) through the Toolbelt; fixes previewed row by row.
- **Prove refreshes capability test links.** (2026-10-20) Today a person re-runs Survey so a new test
  links to its capability; Prove should do it. Add a one-line hint on accepted capability cards about
  what happens next.
- **Tell a missing page from a missing item.** (2026-10-20) The console turns any API 404 into "not
  found"; a missing route (a stale dev server) should say so instead.
- **Calibrate complexity: test-only changes are Low.** (2026-10-20) Work item #8 "add a test to the
  home page" was rated Medium.
- **Turn on the model proxy.** (2026-10-20) `RUNNER_MODEL_PROXY=on` once the live runs show single
  model calls finish within 300 seconds; then no agent holds a model key.
- **Crew Lab test bench.** (2026-10-20) Replay and holdout evaluation, so Skillsmith proposals stop
  saying "not evaluated".
- **Live payments switch.** (2026-10-21) Machine Shop is Stripe test mode only. Going live is its own
  High Work item: live keys in Vercel Production only, a refund path, order emails.

## Machine Shop (next steps for the store)

From #9's "out of scope" list, each a Work item of its own:
- Sales tax · a cart with several products · order confirmation emails · reducing stock on sale ·
  refunds · an orders page for the owner.

## Business and legal

- **Go-live checklist.** (2026-10-19) CRON_SECRET on the API's Vercel project; Vault secrets;
  Machine Shop's test keys into the vault, then `RUNNER_ENVMACHINE=off`; remove
  `NEXT_PUBLIC_OPENAI_API_KEY`; confirm providers' data-retention and no-training settings.
- **Subscription terms and the one-page Agreement template** for the first paying client.
