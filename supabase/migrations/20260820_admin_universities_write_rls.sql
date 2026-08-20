-- Admin-only write RLS for public.universities (PROPOSED — NOT YET APPLIED)
--
-- This migration is intentionally NOT executed by the application. Review it,
-- then apply it manually via the Supabase SQL editor or `supabase db push`.
--
-- Ordering / dependency:
--   Apply AFTER `20260820_admin_authorization.sql`, because these policies call
--   `public.is_admin()`, which that migration defines. `public.admins` must also
--   contain at least one admin row for any write to be permitted.
--
-- What it does:
--   1. Ensures Row Level Security is enabled on `public.universities`.
--   2. Adds an admin-only INSERT policy (WITH CHECK public.is_admin()).
--   3. Adds an admin-only UPDATE policy (USING + WITH CHECK public.is_admin()).
--
-- What it deliberately does NOT do:
--   - It does not add, remove, or weaken any SELECT policy: existing public read
--     access is left exactly as-is.
--   - It creates NO DELETE policy (deletion is out of scope for this step).
--   - It grants NO public/anon write access.
--
-- IMPORTANT — public read access:
--   Public reads currently work, which means `public.universities` already has a
--   SELECT policy (with RLS enabled). The `enable row level security` statement
--   below is idempotent and a no-op in that case. If — and only if — your table
--   currently has RLS DISABLED, confirm a public SELECT policy exists BEFORE
--   applying this, otherwise enabling RLS would remove anonymous read access.
--   Example (only if you do not already have one):
--     -- create policy "Public can read universities"
--     --   on public.universities for select to anon, authenticated using (true);

alter table public.universities enable row level security;

-- Admin-only INSERT.
drop policy if exists "Admins can insert universities" on public.universities;
create policy "Admins can insert universities"
  on public.universities
  for insert
  to authenticated
  with check (public.is_admin());

-- Admin-only UPDATE.
drop policy if exists "Admins can update universities" on public.universities;
create policy "Admins can update universities"
  on public.universities
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
