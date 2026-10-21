-- Walkthrough requests: one row per request, with where it came from.
-- Run in the marketing Supabase project (the one with sm_waitlist). Additive and re-runnable.
--
-- Why: sm_waitlist.email was unique, so a second request from the same person (from another page,
-- days later) was silently dropped while the visitor still saw "Request received". Every request is
-- now its own row, and records the page it was made on, the referring page, the request IP and the
-- approximate location Vercel derives from it, and the browser.

alter table sm_waitlist drop constraint if exists sm_waitlist_email_key;
create index if not exists sm_waitlist_email on sm_waitlist (email, created_at desc);

alter table sm_waitlist add column if not exists page        text;   -- the page the form was on, e.g. /customers/cypress-resort
alter table sm_waitlist add column if not exists referrer    text;   -- the page the visitor came from (hostname and path only)
alter table sm_waitlist add column if not exists ip_address  inet;   -- as supplied by the hosting proxy
alter table sm_waitlist add column if not exists country     text;   -- Vercel's approximate location for that IP
alter table sm_waitlist add column if not exists region      text;
alter table sm_waitlist add column if not exists city        text;
alter table sm_waitlist add column if not exists user_agent  text;

-- To read the latest requests (SQL editor):
--   select created_at, email, role, property_name, page, source, ip_address, city, region, country
--   from sm_waitlist order by created_at desc limit 50;
