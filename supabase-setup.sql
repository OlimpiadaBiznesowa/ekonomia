-- Uruchom cały plik jeden raz w Supabase → SQL Editor.
-- Tabele nie przechowują haseł. Hasła obsługuje wyłącznie Supabase Auth.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  points integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mastered jsonb not null default '[]'::jsonb,
  starred jsonb not null default '[]'::jsonb,
  points integer not null default 0 check (points >= 0),
  awarded_flashcards jsonb not null default '[]'::jsonb,
  completed_quizzes integer not null default 0 check (completed_quizzes >= 0),
  completed_owe_quizzes integer not null default 0 check (completed_owe_quizzes >= 0),
  completed_tests integer not null default 0 check (completed_tests >= 0),
  completed_learn_sessions integer not null default 0 check (completed_learn_sessions >= 0),
  study_seconds double precision not null default 0 check (study_seconds >= 0),
  awarded_study_blocks integer not null default 0 check (awarded_study_blocks >= 0),
  boost_activated_on text,
  boost_ends_at timestamptz,
  daily_streak integer not null default 0 check (daily_streak >= 0),
  best_daily_streak integer not null default 0 check (best_daily_streak >= 0),
  last_study_date text,
  daily_quest_date text,
  daily_quest_ids jsonb not null default '[]'::jsonb,
  daily_quest_baseline jsonb not null default '{}'::jsonb,
  quest_rewards jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Bezpieczna aktualizacja istniejącej tabeli po dodaniu boosta, arkuszy OWE, serii i dziennych questów.
alter table public.study_progress add column if not exists boost_activated_on text;
alter table public.study_progress add column if not exists boost_ends_at timestamptz;
alter table public.study_progress add column if not exists completed_owe_quizzes integer not null default 0 check (completed_owe_quizzes >= 0);
alter table public.study_progress add column if not exists completed_learn_sessions integer not null default 0 check (completed_learn_sessions >= 0);
alter table public.study_progress add column if not exists daily_streak integer not null default 0 check (daily_streak >= 0);
alter table public.study_progress add column if not exists best_daily_streak integer not null default 0 check (best_daily_streak >= 0);
alter table public.study_progress add column if not exists last_study_date text;
alter table public.study_progress add column if not exists daily_quest_date text;
alter table public.study_progress add column if not exists daily_quest_ids jsonb not null default '[]'::jsonb;
alter table public.study_progress add column if not exists daily_quest_baseline jsonb not null default '{}'::jsonb;
alter table public.study_progress add column if not exists quest_rewards jsonb not null default '{}'::jsonb;

create index if not exists profiles_points_idx on public.profiles (points desc, updated_at asc);

alter table public.profiles enable row level security;
alter table public.study_progress enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.study_progress from anon;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.study_progress to authenticated;

drop policy if exists "Authenticated users can view leaderboard" on public.profiles;
create policy "Authenticated users can view leaderboard"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can view their own progress" on public.study_progress;
create policy "Users can view their own progress"
  on public.study_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own progress" on public.study_progress;
create policy "Users can create their own progress"
  on public.study_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.study_progress;
create policy "Users can update their own progress"
  on public.study_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'Uczeń'));
  if char_length(requested_name) < 2 then requested_name := 'Uczeń'; end if;
  requested_name := left(requested_name, 30);

  insert into public.profiles (id, display_name, points)
  values (new.id, requested_name, 0)
  on conflict (id) do nothing;

  insert into public.study_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Dodaje profile również kontom utworzonym przed uruchomieniem tego pliku.
insert into public.profiles (id, display_name, points)
select
  id,
  left(
    case
      when char_length(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(email, '@', 1), '')) >= 2
        then coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(email, '@', 1))
      else 'Uczeń'
    end,
    30
  ),
  0
from auth.users
on conflict (id) do nothing;

insert into public.study_progress (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Użytkownik może usunąć wyłącznie własne konto. Powiązane rekordy znikają przez ON DELETE CASCADE.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := (select auth.uid());
begin
  if requesting_user is null then
    raise exception 'Authentication required';
  end if;
  delete from auth.users where id = requesting_user;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
