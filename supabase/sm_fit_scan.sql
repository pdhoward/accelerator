-- Fit Scan spend guard for the Strategic Machines marketing site.
-- Run in the same dedicated Supabase project as sm_waitlist.sql — never in
-- the ts-platform production project.
--
-- Why this exists: serverless instances don't share memory, so an in-memory
-- rate limit can't cap Claude spend. This table + function is the one shared,
-- atomic counter every instance consults before running a scan.

create table if not exists sm_fit_scans (
  id           bigint generated always as identity primary key,
  ip_hash      text not null,          -- sha256(salt:ip); raw IPs are never stored
  host         text,
  used_analyst boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists sm_fit_scans_ip_recent on sm_fit_scans (ip_hash, created_at desc);
create index if not exists sm_fit_scans_recent on sm_fit_scans (created_at desc);

-- RLS on with no policies: the anon key can neither read nor write this table
-- directly. The only way in is sm_fit_scan_admit() below.
alter table sm_fit_scans enable row level security;

-- Admits (or refuses) one scan and decides whether it may use the AI analyst.
-- Limits are constants here on purpose: callers can't raise them.
create or replace function sm_fit_scan_admit(p_ip_hash text, p_host text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  per_ip_limit        constant int      := 5;                    -- scans per visitor…
  per_ip_window       constant interval := interval '1 hour';    -- …per hour
  global_hourly_limit constant int      := 120;                  -- all visitors combined, per hour
  analyst_daily_cap   constant int      := 150;                  -- Claude calls per UTC day
  ip_count      int;
  hour_count    int;
  analyst_count int;
  use_analyst   boolean;
begin
  if p_ip_hash is null or length(p_ip_hash) <> 64 then
    raise exception 'invalid ip hash';
  end if;

  -- Serialize admissions so concurrent requests can't all slip under a limit.
  perform pg_advisory_xact_lock(hashtext('sm_fit_scan_admit'));

  select count(*) into ip_count
    from sm_fit_scans
   where ip_hash = p_ip_hash and created_at > now() - per_ip_window;
  if ip_count >= per_ip_limit then
    return jsonb_build_object('allowed', false, 'reason', 'ip');
  end if;

  select count(*) into hour_count
    from sm_fit_scans
   where created_at > now() - interval '1 hour';
  if hour_count >= global_hourly_limit then
    return jsonb_build_object('allowed', false, 'reason', 'global');
  end if;

  select count(*) into analyst_count
    from sm_fit_scans
   where used_analyst
     and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  use_analyst := analyst_count < analyst_daily_cap;

  insert into sm_fit_scans (ip_hash, host, used_analyst)
  values (p_ip_hash, left(p_host, 255), use_analyst);

  return jsonb_build_object('allowed', true, 'analyst', use_analyst);
end;
$$;

revoke all on function sm_fit_scan_admit(text, text) from public;
grant execute on function sm_fit_scan_admit(text, text) to anon;
