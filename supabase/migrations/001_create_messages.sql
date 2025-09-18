
-- Run this in Supabase SQL editor to enable messages table for live chat
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  text text not null,
  created_at timestamptz default now()
);

-- Enable RLS and a simple insert policy for anon role
alter table messages enable row level security;
create policy "allow anon insert" on messages for insert using (auth.role() = 'anon') with check (true);
