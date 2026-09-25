-- Waitlist table for the Strategic Machines marketing site.
-- Run this in a dedicated Supabase project (see design.md §8, §12 open question 5)
-- — never in the ts-platform production project.

create table if not exists sm_waitlist (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  role          text,
  property_name text,
  source        text,
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz
);

alter table sm_waitlist enable row level security;

-- Insert-only from the anon key, used exclusively by app/waitlist/route.ts.
-- No select/update/delete policy is granted to anon — reading the list
-- requires the Supabase dashboard or a service-role key, never this client.
create policy "anon can insert waitlist signups"
  on sm_waitlist
  for insert
  to anon
  with check (true);
