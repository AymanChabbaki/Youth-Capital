-- 001_init.sql
-- Shared "public" schema: things that are national / span every jiha.

create extension if not exists pgcrypto;

-- Mirrors Supabase auth.users with the app-facing profile fields.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Registry of every jiha and the Postgres schema that holds its data.
create table if not exists public.jihat (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,            -- e.g. 'casablanca', 'rabat'
  name_ar text not null,
  name_fr text not null,
  schema_name text not null unique,     -- e.g. 'jiha_casablanca'
  created_at timestamptz not null default now()
);

-- Canonical list of department types, shared across every jiha
-- (a jiha's own "departments" table references this catalog).
create table if not exists public.department_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,            -- e.g. 'tech', 'entrepreneuriat'
  name_ar text not null,
  name_fr text not null
);

-- National-level roles: national department lead ("ممثل") and
-- national leadership. Regional coordinator lives inside each jiha
-- schema instead, since it's scoped to one jiha.
create type public.national_role_type as enum ('national_lead', 'leadership');

create table if not exists public.national_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  department_id uuid references public.department_catalog (id) on delete cascade,
  role public.national_role_type not null,
  assigned_at timestamptz not null default now(),
  -- leadership oversees everything, so department_id is only required for national_lead
  constraint national_lead_needs_department
    check (role <> 'national_lead' or department_id is not null)
);

-- Cross-jiha search index. Every jiha schema keeps this in sync (via
-- trigger or the backend service) so a national lead can see every
-- idea for their department across all jihat without querying every
-- jiha schema individually.
create table if not exists public.idea_index (
  idea_id uuid primary key,
  jiha_id uuid not null references public.jihat (id) on delete cascade,
  department_id uuid not null references public.department_catalog (id) on delete cascade,
  title text not null,
  status text not null,
  open_to_collab boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists idea_index_department_idx on public.idea_index (department_id);
create index if not exists idea_index_jiha_idx on public.idea_index (jiha_id);
