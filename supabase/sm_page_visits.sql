-- Dedicated marketing Supabase project only. No stored procedures required.
create table if not exists public.sm_page_visits (
  id uuid primary key,
  session_id uuid not null,
  page_path text not null check (length(page_path) between 1 and 500),
  referrer_host text check (length(referrer_host) <= 253),
  is_landing boolean not null default false,
  traffic_source text not null check (traffic_source in ('direct-or-unknown','internal','search','referral')),
  suspected_bot boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sm_page_visits_recent on public.sm_page_visits (created_at desc);
create index if not exists sm_page_visits_path on public.sm_page_visits (page_path, created_at desc);
alter table public.sm_page_visits enable row level security;
revoke all on public.sm_page_visits from public, anon, authenticated;
grant select, insert, update, delete on public.sm_page_visits to service_role;

-- Daily page views and approximate browser-tab sessions, excluding obvious bots:
-- select date_trunc('day',created_at) as day, count(*) as page_views,
-- count(distinct session_id) as tab_sessions from public.sm_page_visits
-- where not suspected_bot group by 1 order by 1 desc;
-- Search-origin landing pages:
-- select page_path, referrer_host, count(*) as landings from public.sm_page_visits
-- where is_landing and traffic_source='search' and not suspected_bot
-- group by 1,2 order by 3 desc;
-- Popular pages:
-- select page_path,count(*) from public.sm_page_visits where not suspected_bot
-- group by 1 order by 2 desc;
-- These are browser-reported views, not verified people or search impressions.
