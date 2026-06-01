create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  venue text,
  host_pin text not null default '1234',
  is_voting_open boolean not null default false,
  current_performance_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.performances (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  singer_name text not null,
  song_title text not null,
  artist text,
  queue_order int not null default 0,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  performance_id uuid not null references public.performances(id) on delete cascade,
  voter_key text not null,
  score int not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  unique(performance_id, voter_key)
);

alter table public.events enable row level security;
alter table public.performances enable row level security;
alter table public.votes enable row level security;

drop policy if exists "events are publicly readable" on public.events;
create policy "events are publicly readable"
on public.events for select
using (true);

drop policy if exists "events are publicly insertable" on public.events;
create policy "events are publicly insertable"
on public.events for insert
with check (true);

drop policy if exists "events are publicly updateable" on public.events;
create policy "events are publicly updateable"
on public.events for update
using (true);

drop policy if exists "performances are publicly readable" on public.performances;
create policy "performances are publicly readable"
on public.performances for select
using (true);

drop policy if exists "performances are publicly insertable" on public.performances;
create policy "performances are publicly insertable"
on public.performances for insert
with check (true);

drop policy if exists "performances are publicly updateable" on public.performances;
create policy "performances are publicly updateable"
on public.performances for update
using (true);

drop policy if exists "votes are publicly readable" on public.votes;
create policy "votes are publicly readable"
on public.votes for select
using (true);

drop policy if exists "votes are publicly insertable" on public.votes;
create policy "votes are publicly insertable"
on public.votes for insert
with check (true);
