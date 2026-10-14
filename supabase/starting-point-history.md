# Marketing traffic and assessment history

Apply `sm_starting_point_reviews.sql`, `sm_page_visits.sql`, then `sm_marketing_followup.sql` in the **dedicated marketing Supabase project**, never Cypress or the platform database. These files create private tables and indexes, not save functions. They have not been applied by the coding agent.

The website calls its own server APIs. The server uses `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` to insert/update table rows directly. No browser has that key or public access to the tables.

## Tables to inspect in Supabase

| Table | What it records |
|---|---|
| `sm_page_visits` | Browser page views: path, time, referrer hostname, first landing in a browser-tab session, approximate session ID, source category, suspected bot flag |
| `sm_starting_point_reviews` | Completed/failed assessment executions, cached responses, sanitized website address, score/verdict, and explicitly submitted perspective |
| `sm_fit_scans` | Existing shared rate/spend-limit admissions; hostname, salted IP hash, time and reserved analyst capacity |

The new data-writing paths require no database function. The existing `sm_fit_scan_admit` function remains solely for atomic, shared scan-spend limits across server instances. It is not the comments-save API.

## Page views and SEO

`POST /api/page-visits` writes a page-view record. Initial page load, refresh and client-side page navigation are counted; prefetching a link does not count. Same-event retries are deduplicated by UUID. Session storage groups approximate browser-tab sessions, without cookies, raw user-agent strings, query strings or cross-site identifiers. The server also stores the request IP in `ip_address`, from the hosting proxy header; configure hosting to overwrite that header. An IP is not a reliable individual/company identity. Do Not Track / Global Privacy Control disable the client tracker. The server flags obvious bots, but this is not complete bot identification. JavaScript blocking, privacy choices and network failures mean counts are incomplete.

SQL examples at the bottom of `sm_page_visits.sql` show daily views, tab sessions, popular paths and search-referral landings. Search Console remains the source for Google search impressions, clicks, CTR and position; these tables cannot infer search keywords or rankings. Counts in the different tables have different meanings and should not be equated to unique people or exact conversion attribution.

## Separate perspective submission

`POST /api/fit-scan/perspective` validates input and makes a direct update filtered by review ID, SHA-256 token hash, completed status and 24-hour creation window. Only the matching row ID is returned internally to confirm success. No matching record returns 409; unavailable storage returns 503. The UI preserves the draft and distinguishes failure from success. Downloads omit the private token. A walkthrough request stores contact details separately.

A previous local migration draft contained `sm_starting_point_save_perspective`; this implementation does not create or call it. If that earlier draft was applied elsewhere, the obsolete function can be removed after confirming no older deployed version still uses it. It is not required by current code.

## Deployment verification

1. Apply the two table SQL files in the marketing project.
2. Open a public page and navigate to another page; check separate `sm_page_visits` rows with paths and timestamps.
3. Run a starting-point review, then save a perspective without rescanning; check a single matching review row, comments and `perspective_saved_at`.
4. Confirm a wrong token cannot update a record, and anonymous public clients cannot read either table.
5. Schedule authorized cleanup for records older than 90 days. No cleanup job or public history dashboard is installed by these migrations.

The SQL files contain reporting queries for authorized administrators. Use Supabase Table Editor/SQL Editor to inspect traffic; no visitor-facing analytics dashboard is added.


## Seven-day public report reuse and follow-up upgrade

`sm_marketing_followup.sql` adds the contact fields, page-visit IP and `sm_fit_scan_reports` shared cache. It is additive and safe to apply after the earlier table scripts, whether or not those tables already contain rows. No stored save procedures are introduced.

The report cache uses a normalized site hostname (www and non-www share a key) and the original `scannedAt` for its seven-day expiry. The first scanned public page for that hostname is the reused snapshot; its URL/date remain visible. Repeated visits do not extend expiry. The database-backed report is checked before scan admission, PageSpeed or analyst work. A bounded process cache accelerates repeat views; a database outage falls back to available process memory and otherwise a fresh scan, with a cache-persistence warning if saving fails.

Every reuse still creates a separate review record/token, and the form starts blank. The cache stores public report data only, never contact details, business comments or private receipts. Historical summary-only records cannot reconstruct earlier reports; one new full report must be saved before reuse begins.

The entire report is presented before Step 2; name, company and email are required on submission; phone is optional and saved by the perspective API to that visitor's review only. They do not enter the shared report cache or get shown to another visitor.

Useful reporting fields are now `contact_name`, `company_name`, `contact_email`, `phone_number` on `sm_starting_point_reviews`, and `ip_address` on `sm_page_visits`. Access remains private to authorized operators. Apply retention and deletion procedures to IP/contact data as well as comments. No production migration was applied by the coding agent.

Apply `supabase/sm_perspective_email.sql` after the earlier scripts before deploying the required-email form. Existing scan rows remain valid; the API requires name/company and a syntactically valid email for new perspective submissions. Business-domain or email-ownership verification is a future enhancement.
