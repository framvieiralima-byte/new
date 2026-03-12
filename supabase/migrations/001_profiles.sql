-- Table: profiles
-- Stores wallet_address or username, coin_count, and unlocked_pets per user.
-- Run this in Supabase Dashboard → SQL Editor.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique,
  username text unique,
  coin_count integer not null default 0,
  unlocked_pets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint at_least_one_identifier check (
    (wallet_address is not null and wallet_address <> '') or
    (username is not null and username <> '')
  )
);

-- Index for lookups by wallet or username
create index if not exists profiles_wallet_address on public.profiles (wallet_address);
create index if not exists profiles_username on public.profiles (username);

-- RLS: enable and allow read/write for anon (you can tighten with auth later)
alter table public.profiles enable row level security;

create policy "Allow anon read profiles"
  on public.profiles for select
  to anon
  using (true);

create policy "Allow anon insert profiles"
  on public.profiles for insert
  to anon
  with check (true);

create policy "Allow anon update profiles"
  on public.profiles for update
  to anon
  using (true)
  with check (true);

-- Optional: trigger to keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
