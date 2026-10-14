-- Use the same dedicated MARKETING Supabase project as sm_fit_scan.sql.
-- Never run this against Cypress/ts-platform production.
-- This is scan usage history, not general website page-view analytics.
create table if not exists public.sm_starting_point_reviews (
  id uuid primary key,
  feedback_token_hash text not null check (feedback_token_hash ~ '^[a-f0-9]{64}$'),
  website_url text not null check (length(website_url) between 1 and 2048),
  host text not null check (length(host) between 1 and 255),
  status text not null check (status in ('completed', 'failed')),
  cache_hit boolean not null default false,
  fit_score integer check (fit_score between 0 and 100),
  verdict text check (length(verdict) <= 40),
  business_goal text check (length(business_goal) <= 1000),
  must_preserve text check (length(must_preserve) <= 1000),
  change_frequency text check (change_frequency in ('unknown', 'rarely', 'monthly', 'weekly')),
  created_at timestamptz not null default now(),
  perspective_saved_at timestamptz
);
create index if not exists sm_starting_point_reviews_recent
  on public.sm_starting_point_reviews (created_at desc);
create index if not exists sm_starting_point_reviews_host
  on public.sm_starting_point_reviews (host, created_at desc);
alter table public.sm_starting_point_reviews enable row level security;
-- No public access. Only our server's marketing service-role credential may write.
revoke all on public.sm_starting_point_reviews from public, anon, authenticated;
grant select, insert, update, delete on public.sm_starting_point_reviews to service_role;

-- Saving is performed by our website API using a direct table update.
-- The API checks the review ID, token hash, completed state and 24-hour expiry.
-- No save function / stored procedure is required.

-- Dashboard queries (run as an authorized project administrator):
-- select created_at, website_url, status, cache_hit, fit_score, verdict,
--        business_goal, must_preserve, change_frequency, perspective_saved_at
-- from public.sm_starting_point_reviews order by created_at desc;
-- select date_trunc('day', created_at) as day, count(*) as reviews,
--        count(*) filter (where cache_hit) as cached_reviews,
--        count(*) filter (where perspective_saved_at is not null) as with_comments
-- from public.sm_starting_point_reviews group by 1 order by 1 desc;
-- Retention: authorized admin job should delete reviews older than 90 days.
-- No public retention/deletion RPC is provided.
