-- Uruchom cały plik jeden raz w Supabase → SQL Editor.
-- Tabele nie przechowują jawnych haseł. Kod rankingu jest zapisany wyłącznie jako hash bcrypt.

create schema if not exists private;
create schema if not exists extensions;
revoke all on schema private from public, anon, authenticated;

create extension if not exists pgcrypto with schema extensions;

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

create table if not exists public.private_rankings (
  id text primary key,
  display_name text not null check (char_length(display_name) between 2 and 60),
  access_code_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.private_ranking_members (
  ranking_id text not null references public.private_rankings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (ranking_id, user_id)
);

create table if not exists private.private_ranking_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz
);

-- W bazie zapisany jest wyłącznie hash bcrypt. Nazwa rankingu nie trafia do kodu strony.
insert into public.private_rankings (id, display_name, access_code_hash)
values (
  'pr_7f34c0a9',
  pg_catalog.convert_from(pg_catalog.decode('UmFua2luZyBDemFja2k=', 'base64'), 'UTF8'),
  '$2a$12$mqP74pOTPrjVD4BxvvJ0LuvA22D7loqTnJAM6KiK2A9wfIX6Q5LlW'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  access_code_hash = excluded.access_code_hash;

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
create index if not exists private_ranking_members_user_idx on public.private_ranking_members (user_id, joined_at);

alter table public.profiles enable row level security;
alter table public.study_progress enable row level security;
alter table public.private_rankings enable row level security;
alter table public.private_ranking_members enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.study_progress from anon;
revoke all on table public.private_rankings from anon, authenticated;
revoke all on table public.private_ranking_members from anon, authenticated;
revoke all on table private.private_ranking_attempts from public, anon, authenticated;
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

-- Funkcje rankingu można bezpiecznie odtworzyć po zmianie nazw zwracanych kolumn.
-- Usuwane są wyłącznie definicje RPC; konta, punkty i członkostwa pozostają bez zmian.
drop function if exists public.get_public_leaderboard();
drop function if exists public.join_private_leaderboard(text);
drop function if exists public.get_private_leaderboard();
drop function if exists private.join_private_leaderboard(text);
drop function if exists private.get_private_leaderboard();

create or replace function public.get_public_leaderboard()
returns table (
  id uuid,
  display_name text,
  points integer,
  updated_at timestamptz,
  ranking_position bigint,
  is_current boolean,
  participant_count bigint
)
language sql
security invoker
set search_path = ''
stable
as $$
  with ranked_profiles as (
    select
      profile.id,
      profile.display_name,
      profile.points,
      profile.updated_at,
      row_number() over (order by profile.points desc, profile.updated_at asc) as ranking_position,
      count(*) over () as total_participants
    from public.profiles profile
  )
  select
    ranked.id,
    ranked.display_name,
    ranked.points,
    ranked.updated_at,
    ranked.ranking_position,
    ranked.id = (select auth.uid()),
    ranked.total_participants
  from ranked_profiles ranked
  where ranked.ranking_position <= 5 or ranked.id = (select auth.uid())
  order by ranked.ranking_position;
$$;

create or replace function private.join_private_leaderboard(access_code text)
returns table (ranking_id text, ranking_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := (select auth.uid());
  matched_ranking_id text;
begin
  if requesting_user is null then
    return query select 'authentication_required'::text, null::text;
    return;
  end if;

  if exists (
    select 1
    from private.private_ranking_attempts attempt
    where attempt.user_id = requesting_user
      and attempt.blocked_until > now()
  ) then
    return query select 'private_ranking_try_later'::text, null::text;
    return;
  end if;

  if access_code is not null and char_length(access_code) <= 64 then
    select ranking.id
    into matched_ranking_id
    from public.private_rankings ranking
    where extensions.crypt(access_code, ranking.access_code_hash) = ranking.access_code_hash
    limit 1;
  end if;

  if matched_ranking_id is null then
    insert into private.private_ranking_attempts as attempt (
      user_id,
      attempt_count,
      window_started_at,
      blocked_until
    ) values (
      requesting_user,
      1,
      now(),
      null
    )
    on conflict (user_id) do update set
      attempt_count = case
        when attempt.window_started_at < now() - interval '15 minutes' then 1
        else attempt.attempt_count + 1
      end,
      window_started_at = case
        when attempt.window_started_at < now() - interval '15 minutes' then now()
        else attempt.window_started_at
      end,
      blocked_until = case
        when (
          case
            when attempt.window_started_at < now() - interval '15 minutes' then 1
            else attempt.attempt_count + 1
          end
        ) >= 5 then now() + interval '15 minutes'
        else null
      end;
    return query select 'invalid_private_ranking_code'::text, null::text;
    return;
  end if;

  delete from private.private_ranking_attempts where user_id = requesting_user;

  insert into public.private_ranking_members (ranking_id, user_id)
  values (matched_ranking_id, requesting_user)
  on conflict (ranking_id, user_id) do nothing;

  return query
  select ranking.id, ranking.display_name
  from public.private_rankings ranking
  where ranking.id = matched_ranking_id;
end;
$$;

create or replace function public.join_private_leaderboard(access_code text)
returns table (ranking_id text, ranking_name text)
language sql
security definer
set search_path = ''
as $$
  select * from private.join_private_leaderboard(access_code);
$$;

create or replace function private.get_private_leaderboard()
returns table (
  ranking_id text,
  ranking_name text,
  user_id uuid,
  display_name text,
  points integer,
  ranking_position bigint,
  is_current boolean,
  member_count bigint
)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  requesting_user uuid := (select auth.uid());
  joined_ranking_id text;
begin
  if requesting_user is null then
    return;
  end if;

  select membership.ranking_id
  into joined_ranking_id
  from public.private_ranking_members membership
  where membership.user_id = requesting_user
  order by membership.joined_at
  limit 1;

  if joined_ranking_id is null then
    return;
  end if;

  return query
  with ranked_members as (
    select
      membership.user_id,
      profile.display_name,
      profile.points,
      row_number() over (order by profile.points desc, profile.updated_at asc) as ranking_position,
      count(*) over () as total_members
    from public.private_ranking_members membership
    join public.profiles profile on profile.id = membership.user_id
    where membership.ranking_id = joined_ranking_id
  )
  select
    ranking.id,
    ranking.display_name,
    member.user_id,
    member.display_name,
    member.points,
    member.ranking_position,
    member.user_id = requesting_user,
    member.total_members
  from ranked_members member
  join public.private_rankings ranking on ranking.id = joined_ranking_id
  where member.ranking_position <= 10 or member.user_id = requesting_user
  order by member.ranking_position;
end;
$$;

create or replace function public.get_private_leaderboard()
returns table (
  ranking_id text,
  ranking_name text,
  user_id uuid,
  display_name text,
  points integer,
  ranking_position bigint,
  is_current boolean,
  member_count bigint
)
language sql
security definer
set search_path = ''
stable
as $$
  select * from private.get_private_leaderboard();
$$;

revoke all on function private.join_private_leaderboard(text) from public, anon, authenticated;
revoke all on function private.get_private_leaderboard() from public, anon, authenticated;
revoke all on function public.get_public_leaderboard() from public, anon, authenticated;
revoke all on function public.join_private_leaderboard(text) from public, anon, authenticated;
revoke all on function public.get_private_leaderboard() from public, anon, authenticated;
grant execute on function public.get_public_leaderboard() to authenticated;
grant execute on function public.join_private_leaderboard(text) to authenticated;
grant execute on function public.get_private_leaderboard() to authenticated;

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
