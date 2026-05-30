/* =====================================================================
   Beacon: Supabase schema for Phase 5

   HOW TO RUN
   1. Open the Supabase dashboard for your project.
   2. Go to SQL Editor.
   3. Paste this whole file and click Run.
   4. Run it ONCE before testing Phase 5 features (signup migration,
      dashboard caching, refresh analysis). Re-running is safe: every
      statement uses IF NOT EXISTS / OR REPLACE.

   WHAT IT CREATES
   - public.profiles            (one row per user, stores wizard answers)
   - public.scoring_results     (one row per /api/score call, stores raw result)
   - Row-level security policies so each user can only see their own data.
   ===================================================================== */

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  answers jsonb
);

create table if not exists public.scoring_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  results jsonb not null
);

create index if not exists scoring_results_user_id_created_at_idx
  on public.scoring_results (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.scoring_results enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "scoring_results_select_own" on public.scoring_results;
create policy "scoring_results_select_own" on public.scoring_results
  for select using (auth.uid() = user_id);

drop policy if exists "scoring_results_insert_own" on public.scoring_results;
create policy "scoring_results_insert_own" on public.scoring_results
  for insert with check (auth.uid() = user_id);

drop policy if exists "scoring_results_update_own" on public.scoring_results;
create policy "scoring_results_update_own" on public.scoring_results
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.touch_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_profiles_updated_at();
