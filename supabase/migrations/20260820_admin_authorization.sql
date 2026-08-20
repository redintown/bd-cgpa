-- Admin authorization foundation (PROPOSED — NOT YET APPLIED)
--
-- This migration is intentionally NOT executed by the application. Review it,
-- then apply it manually via the Supabase SQL editor or `supabase db push`.
--
-- What it does:
--   1. Creates a minimal, database-backed admin allowlist table `public.admins`
--      keyed by the Supabase Auth user id. Membership in this table — NOT merely
--      being authenticated — is what makes a user an admin.
--   2. Enables Row Level Security and adds a single SELECT policy so an
--      authenticated user may read ONLY their own admin row (used by the app to
--      check "am I an admin?"). No INSERT/UPDATE/DELETE policies are created, so
--      the table can only be managed with elevated privileges (SQL editor /
--      service role) — never by public or ordinary authenticated clients.
--   3. Adds a SECURITY DEFINER helper `public.is_admin()` that other tables'
--      future write policies can call, e.g. `USING (public.is_admin())`, to
--      enforce admin-only writes at the database level.
--
-- It does NOT touch the existing public read policies on universities/grading
-- data and does NOT create any public write policy.
--
-- After applying, grant admin access to an existing auth user by id:
--   insert into public.admins (user_id) values ('<auth-user-uuid>');
-- (Create the admin account itself in Supabase Auth; there is no self-signup.)

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  note text
);

comment on table public.admins is
  'Allowlist of admin users. Presence of a row grants admin authorization. Managed only with elevated privileges; there is no public/self write path.';

alter table public.admins enable row level security;

-- Authenticated users may read only their own admin row (to check admin status).
drop policy if exists "Admins can read their own admin row" on public.admins;
create policy "Admins can read their own admin row"
  on public.admins
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Reusable authorization predicate for future admin-only RLS write policies.
-- SECURITY DEFINER so it can read `public.admins` regardless of the caller's
-- own RLS, avoiding recursion in policies that reference it.
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

comment on function public.is_admin() is
  'Returns true when the current auth user is in public.admins. Intended for admin-only RLS write policies, e.g. USING (public.is_admin()).';

grant execute on function public.is_admin() to authenticated;
