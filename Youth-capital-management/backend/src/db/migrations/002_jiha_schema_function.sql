-- 002_jiha_schema_function.sql
-- Every jiha gets its own Postgres schema with the same table shape.
-- Instead of copy-pasting table definitions per jiha, one function
-- creates a new jiha's schema on demand.

create or replace function public.create_jiha_schema(p_code text, p_name_ar text, p_name_fr text)
returns void
language plpgsql
as $$
declare
  v_schema text := 'jiha_' || p_code;
  v_jiha_id uuid;
begin
  insert into public.jihat (code, name_ar, name_fr, schema_name)
  values (p_code, p_name_ar, p_name_fr, v_schema)
  returning id into v_jiha_id;

  execute format('create schema if not exists %I', v_schema);

  -- Departments active in this jiha (one row per department_catalog entry in use here).
  execute format($f$
    create table %I.departments (
      id uuid primary key default gen_random_uuid(),
      department_catalog_id uuid not null references public.department_catalog (id),
      coordinator_user_id uuid references public.users (id),
      created_at timestamptz not null default now(),
      unique (department_catalog_id)
    )
  $f$, v_schema);

  -- Membership of a user in one of this jiha's departments.
  execute format($f$
    create table %I.members (
      user_id uuid not null references public.users (id) on delete cascade,
      department_id uuid not null references %I.departments (id) on delete cascade,
      joined_at timestamptz not null default now(),
      primary key (user_id, department_id)
    )
  $f$, v_schema, v_schema);

  execute format($f$
    create type %I.idea_status as enum (
      'draft', 'submitted', 'regional_review', 'national_review', 'approved', 'rejected'
    )
  $f$, v_schema);

  execute format($f$
    create table %I.ideas (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      title text not null,
      description text not null,
      founder_id uuid not null references public.users (id),
      department_id uuid not null references %I.departments (id),
      open_to_collab boolean not null default false,
      status %I.idea_status not null default 'draft',
      pdf_url text,               -- locked field, see RLS / views
      contact_info text,          -- locked field, see RLS / views
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      approved_at timestamptz
    )
  $f$, v_schema, v_schema, v_schema);

  execute format($f$
    create table %I.idea_collaborators (
      idea_id uuid not null references %I.ideas (id) on delete cascade,
      user_id uuid not null references public.users (id) on delete cascade,
      added_at timestamptz not null default now(),
      primary key (idea_id, user_id)
    )
  $f$, v_schema, v_schema);

  execute format($f$
    create type %I.collab_request_status as enum ('pending', 'approved', 'rejected')
  $f$, v_schema);

  execute format($f$
    create table %I.collab_requests (
      id uuid primary key default gen_random_uuid(),
      idea_id uuid not null references %I.ideas (id) on delete cascade,
      requester_id uuid not null references public.users (id) on delete cascade,
      status %I.collab_request_status not null default 'pending',
      requested_at timestamptz not null default now(),
      decided_at timestamptz
    )
  $f$, v_schema, v_schema, v_schema);

  -- Public teaser view: every locked field is excluded. This is what
  -- "regular member" access reads from — never the base ideas table.
  execute format($f$
    create view %I.ideas_public as
    select id, name, title, description, founder_id, department_id,
           open_to_collab, status, created_at, updated_at, approved_at
    from %I.ideas
  $f$, v_schema, v_schema);

  execute format('alter table %I.ideas enable row level security', v_schema);
  execute format('alter table %I.collab_requests enable row level security', v_schema);
  execute format('alter table %I.idea_collaborators enable row level security', v_schema);
end;
$$;

-- Example usage (run once per jiha):
-- select public.create_jiha_schema('casablanca', 'الدار البيضاء', 'Casablanca-Settat');
-- select public.create_jiha_schema('rabat', 'الرباط', 'Rabat-Salé-Kénitra');
