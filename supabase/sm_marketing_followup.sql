-- Additive upgrade: run in the dedicated marketing Supabase project AFTER
-- sm_starting_point_reviews.sql and sm_page_visits.sql. No save procedures.
alter table public.sm_starting_point_reviews add column if not exists contact_name text check (length(contact_name) <= 120);
alter table public.sm_starting_point_reviews add column if not exists company_name text check (length(company_name) <= 200);
alter table public.sm_starting_point_reviews add column if not exists phone_number text check (length(phone_number) <= 50);
alter table public.sm_page_visits add column if not exists ip_address inet;

create table if not exists public.sm_fit_scan_reports (
  site_key text primary key,
  report jsonb not null,
  scanned_at timestamptz not null
);
alter table public.sm_fit_scan_reports enable row level security;
revoke all on public.sm_fit_scan_reports from public, anon, authenticated;
grant select, insert, update, delete on public.sm_fit_scan_reports to service_role;
-- Only public scan data belongs here. Never save visitor receipts, perspective
-- or contact information in the shared report. Expiry uses original scanned_at.
