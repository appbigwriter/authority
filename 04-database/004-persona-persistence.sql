-- AUTH-004 Persona persistence tables.
-- Apply after 001, 002 and 003 using the Authority database role.

create table if not exists custom_authorityengine.personas (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  name text not null,
  current_version_id text,
  status text not null check (status in ('draft','profile_generating','profile_generated','pending_approval','revision_requested','approved','rejected','generation_blocked','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.persona_versions (
  id text primary key,
  persona_id text not null references custom_authorityengine.personas(id) on delete restrict,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  version integer not null check (version > 0),
  status text not null check (status in ('draft','generating','generated','pending_approval','approved','superseded','rejected','archived')),
  snapshot jsonb not null default '{}'::jsonb,
  source_run_ids jsonb not null default '[]'::jsonb,
  content_hash text,
  created_at timestamptz not null default now(),
  unique (project_id, id)
);

alter table custom_authorityengine.personas
  drop constraint if exists personas_current_version_fk;
alter table custom_authorityengine.personas
  add constraint personas_current_version_fk
  foreign key (current_version_id)
  references custom_authorityengine.persona_versions(id)
  on delete set null;

create table if not exists custom_authorityengine.persona_version_transitions (
  id text primary key,
  persona_version_id text not null references custom_authorityengine.persona_versions(id) on delete restrict,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  from_status text not null,
  to_status text not null,
  actor text not null,
  reason text not null,
  invalidation jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, id)
);

create index if not exists idx_ae_personas_project_owner on custom_authorityengine.personas(project_id, owner_id);
create index if not exists idx_ae_persona_versions_persona on custom_authorityengine.persona_versions(project_id, persona_id, version);
create index if not exists idx_ae_persona_transitions_version on custom_authorityengine.persona_version_transitions(project_id, persona_version_id, created_at);

alter table custom_authorityengine.personas enable row level security;
alter table custom_authorityengine.persona_versions enable row level security;
alter table custom_authorityengine.persona_version_transitions enable row level security;
alter table custom_authorityengine.personas force row level security;
alter table custom_authorityengine.persona_versions force row level security;
alter table custom_authorityengine.persona_version_transitions force row level security;

drop policy if exists personas_isolated on custom_authorityengine.personas;
create policy personas_isolated on custom_authorityengine.personas for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists persona_versions_isolated on custom_authorityengine.persona_versions;
create policy persona_versions_isolated on custom_authorityengine.persona_versions for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists persona_version_transitions_isolated on custom_authorityengine.persona_version_transitions;
create policy persona_version_transitions_isolated on custom_authorityengine.persona_version_transitions for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());

grant usage on schema custom_authorityengine to current_user;
grant select, insert, update, delete on all tables in schema custom_authorityengine to current_user;
grant usage, select, update on all sequences in schema custom_authorityengine to current_user;
