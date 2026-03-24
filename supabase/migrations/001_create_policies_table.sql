-- Run this in your Supabase SQL editor
-- Creates the policies table required by the spec

create table if not exists public.policies (
  id                     uuid primary key default gen_random_uuid(),
  title                  text not null,
  category               text not null check (category in ('Attendance','Behavior','Remote Work','Security','General')),
  description            text,
  document_url           text,
  document_type          text not null default 'pdf' check (document_type in ('pdf','docx')),
  version                text not null default '1.0',
  is_active              boolean not null default true,
  requires_acknowledgement boolean not null default true,
  created_by             text,
  effective_date         date,
  expiry_date            date,
  assigned_to            text not null default 'all' check (assigned_to in ('all','department')),
  assigned_departments   text[],
  storage_path           text,
  file_name              text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_policies_updated_at on public.policies;
create trigger set_policies_updated_at
  before update on public.policies
  for each row execute function update_updated_at_column();

-- Disable RLS (service role client bypasses it anyway, but be explicit)
alter table public.policies enable row level security;

-- Allow service role full access (used by Next.js API routes)
create policy "Service role full access" on public.policies
  for all using (true) with check (true);
