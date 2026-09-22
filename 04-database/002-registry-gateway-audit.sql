-- AUTH-005 local-only registry, gateway and audit tables.
-- Never apply remotely without an explicit migration gate and rollback plan.
create schema if not exists custom_authorityengine;


create table if not exists custom_authorityengine.partner_programs (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  partner_id text not null,
  name text not null,
  status text not null check (status in ('planned','configured','verified','blocked','disabled')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.sources (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  partner_id text not null,
  origin text not null,
  contract_version text not null,
  scope text not null,
  credential_ref text,
  limits text not null,
  status text not null check (status in ('planned','configured','verified','blocked','disabled')),
  last_checked_at timestamptz,
  limitation text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.llm_runs (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  tenant_id text not null,
  model text not null,
  prompt_version text not null,
  schema_version text not null,
  status text not null check (status in ('completed','failed','blocked')),
  input_tokens integer,
  output_tokens integer,
  cost_cents numeric,
  latency_ms integer,
  sanitized_output jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.audit_events (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  tenant_id text not null,
  actor_id text not null,
  action text not null,
  resource_id text not null,
  resource_version integer not null check (resource_version > 0),
  correlation_id text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  unique (project_id, id),
  unique (project_id, tenant_id, resource_id, resource_version, action)
);

create index if not exists idx_ae_sources_project_partner on custom_authorityengine.sources(project_id, partner_id);
create index if not exists idx_ae_llm_runs_project_tenant on custom_authorityengine.llm_runs(project_id, tenant_id, created_at desc);
create index if not exists idx_ae_audit_project_resource on custom_authorityengine.audit_events(project_id, tenant_id, resource_id, occurred_at desc);

alter table custom_authorityengine.partner_programs enable row level security;
alter table custom_authorityengine.sources enable row level security;
alter table custom_authorityengine.llm_runs enable row level security;
alter table custom_authorityengine.audit_events enable row level security;
alter table custom_authorityengine.partner_programs force row level security;
alter table custom_authorityengine.sources force row level security;
alter table custom_authorityengine.llm_runs force row level security;
alter table custom_authorityengine.audit_events force row level security;

create policy partner_programs_isolated on custom_authorityengine.partner_programs for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
create policy sources_isolated on custom_authorityengine.sources for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
create policy llm_runs_isolated on custom_authorityengine.llm_runs for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
create policy audit_events_isolated on custom_authorityengine.audit_events for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
