-- Run this in your Supabase SQL editor
-- Drops the previous policies table and recreates it exactly per spec

drop table if exists public.policies cascade;

create table public.policies (
  id                       uuid default uuid_generate_v4() primary key,
  title                    text not null,
  category                 text not null,
  description              text,
  document_url             text,
  document_type            text check (document_type in ('pdf', 'docx')),
  version                  text default '1.0',
  is_active                boolean default true,
  requires_acknowledgement boolean default true,
  created_by               uuid references public.employees(id),
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
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

alter table public.policies enable row level security;

create policy "Service role full access" on public.policies
  for all using (true) with check (true);
