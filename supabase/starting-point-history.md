# Marketing traffic and assessment history

Apply `sm_starting_point_reviews.sql` and `sm_page_visits.sql` in the **dedicated marketing Supabase project**, never Cypress or the platform database. These files create private tables and indexes, not save functions. They have not been applied by the coding agent.

The website calls its own server APIs. The server uses `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` to insert/update table rows directly. No browser has that key or public access to the tables.

## Tables to inspect in Supabase

| Table | What it records |
|---|---|
| `sm_page_visits` | Browser page views: path, time, referrer hostname, first landing in a browser-tab session, approximate session ID, source category, suspected bot flag |
| `sm_starting_point_reviews` | Completed/failed assessment executions, cached responses, sanitized website address, score/verdict, and explicitly submitted perspective |
| `sm_fit_scans` | Existing shared rate/spend-limit admissions; hostname, salted IP hash, time and reserved analyst capacity |

The new data-writing paths require no database function. The existing `sm_fit_scan_admit` function remains solely for atomic, shared scan-spend limits across server instances. It is not the comments-save API.

## Page views and SEO

`POST /api/page-visits` writes a page-view record. Initial page load, refresh and client-side page navigation are counted; prefetching a link does not count. Same-event retries are deduplicated by UUID. Session storage groups approximate browser-tab sessions, without cookies, stored IPs, raw user-agent strings, query strings or cross-site identifiers. Do Not Track / Global Privacy Control disable the client tracker. The server flags obvious bots, but this is not complete bot identification. JavaScript blocking, privacy choices and network failures mean counts are incomplete.

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
