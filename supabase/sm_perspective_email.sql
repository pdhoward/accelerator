-- Apply after sm_marketing_followup.sql in the marketing Supabase project.
-- Historical reviews and URL-only scans have no contact email; keep it nullable.
alter table public.sm_starting_point_reviews
  add column if not exists contact_email text check (length(contact_email) <= 254);
-- Required name/company/email are enforced by the perspective API on submission.
