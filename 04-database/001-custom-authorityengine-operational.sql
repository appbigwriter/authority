-- AUTH-003 local-only relational persistence model for Authority Engine.
-- Do not apply remotely without explicit migration approval and rollback plan.

create schema if not exists custom_authorityengine;

create or replace function custom_authorityengine.current_project_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.current_project_id', true), '')
$$;

create or replace function custom_authorityengine.current_owner_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.current_owner_id', true), '')
$$;

create or replace function custom_authorityengine.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists custom_authorityengine.projects (
  id text primary key,
  owner_id text not null,
  name text not null,
  status text not null default 'active' check (status in ('active','archived','blocked')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists custom_authorityengine.opportunities (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  niche text,
  subniche text,
  status text check (status in ('candidate','qualified','blocked','selected','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.research (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  opportunity_id text references custom_authorityengine.opportunities(id) on delete restrict,
  status text check (status in ('pending','completed','failed','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.influencer_seeds (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  opportunity_id text references custom_authorityengine.opportunities(id) on delete restrict,
  status text check (status in ('proposed','selected','blocked','invalid','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.profiles (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  seed_id text references custom_authorityengine.influencer_seeds(id) on delete restrict,
  status text check (status in ('development','review','approved','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.farmer_profiles (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  seed_id text references custom_authorityengine.influencer_seeds(id) on delete restrict,
  status text check (status in ('development','review','approved','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.briefs (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  profile_id text references custom_authorityengine.profiles(id) on delete restrict,
  status text check (status in ('draft','review','awaiting_human_approval','published','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.content_items (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  brief_id text references custom_authorityengine.briefs(id) on delete restrict,
  status text check (status in ('draft','review','awaiting_human_approval','published','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.post_machine_outputs (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  profile_id text references custom_authorityengine.farmer_profiles(id) on delete restrict,
  status text check (status in ('draft','review','approved','published','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.assets (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  brief_id text references custom_authorityengine.briefs(id) on delete restrict,
  status text check (status in ('draft','review','approved','published','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.approvals (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  target_id text not null,
  scope text not null,
  approved boolean not null default false,
  status text check (status in ('approved','rejected','revoked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.receipts (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  brief_id text references custom_authorityengine.briefs(id) on delete restrict,
  external_id text,
  provider text,
  status text check (status in ('published','failed','retracted','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.metrics (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  brief_id text references custom_authorityengine.briefs(id) on delete restrict,
  receipt_id text references custom_authorityengine.receipts(id) on delete set null,
  status text check (status in ('observed','insufficient','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.feedback (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  brief_id text references custom_authorityengine.briefs(id) on delete restrict,
  metric_id text references custom_authorityengine.metrics(id) on delete restrict,
  status text check (status in ('open','accepted','rejected','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.events (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  type text not null,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.authority_outbox_events (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  status text not null check (status in ('pending','dispatching','delivered','retrying','dead_letter','cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  next_retry_at timestamptz,
  last_error text,
  dead_lettered_at timestamptz,
  delivered_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

create table if not exists custom_authorityengine.outbox_receipts (
  id text primary key,
  project_id text not null references custom_authorityengine.projects(id) on delete restrict,
  owner_id text not null,
  receipt_id text not null,
  event_id text not null,
  consumer text not null,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, receipt_id)
);

create index if not exists idx_ae_projects_owner on custom_authorityengine.projects(owner_id);
create index if not exists idx_ae_opportunities_project_owner on custom_authorityengine.opportunities(project_id, owner_id);
create index if not exists idx_ae_research_project_opportunity on custom_authorityengine.research(project_id, opportunity_id);
create index if not exists idx_ae_seeds_project_opportunity on custom_authorityengine.influencer_seeds(project_id, opportunity_id);
create index if not exists idx_ae_profiles_project_seed on custom_authorityengine.profiles(project_id, seed_id);
create index if not exists idx_ae_farmer_profiles_project_seed on custom_authorityengine.farmer_profiles(project_id, seed_id);
create index if not exists idx_ae_briefs_project_profile on custom_authorityengine.briefs(project_id, profile_id);
create index if not exists idx_ae_content_project_brief on custom_authorityengine.content_items(project_id, brief_id);
create index if not exists idx_ae_post_machine_project_profile on custom_authorityengine.post_machine_outputs(project_id, profile_id);
create index if not exists idx_ae_assets_project_brief on custom_authorityengine.assets(project_id, brief_id);
create index if not exists idx_ae_approvals_project_target on custom_authorityengine.approvals(project_id, target_id);
create index if not exists idx_ae_receipts_project_brief on custom_authorityengine.receipts(project_id, brief_id);
create index if not exists idx_ae_metrics_project_brief on custom_authorityengine.metrics(project_id, brief_id);
create index if not exists idx_ae_feedback_project_metric on custom_authorityengine.feedback(project_id, metric_id);
create index if not exists idx_ae_events_project_type_created on custom_authorityengine.events(project_id, type, created_at desc);
create index if not exists idx_ae_outbox_project_status_retry on custom_authorityengine.authority_outbox_events(project_id, status, next_retry_at);
create index if not exists idx_ae_outbox_receipts_event_consumer on custom_authorityengine.outbox_receipts(project_id, event_id, consumer);

alter table custom_authorityengine.projects enable row level security;
alter table custom_authorityengine.opportunities enable row level security;
alter table custom_authorityengine.research enable row level security;
alter table custom_authorityengine.influencer_seeds enable row level security;
alter table custom_authorityengine.profiles enable row level security;
alter table custom_authorityengine.farmer_profiles enable row level security;
alter table custom_authorityengine.briefs enable row level security;
alter table custom_authorityengine.content_items enable row level security;
alter table custom_authorityengine.post_machine_outputs enable row level security;
alter table custom_authorityengine.assets enable row level security;
alter table custom_authorityengine.approvals enable row level security;
alter table custom_authorityengine.receipts enable row level security;
alter table custom_authorityengine.metrics enable row level security;
alter table custom_authorityengine.feedback enable row level security;
alter table custom_authorityengine.events enable row level security;
alter table custom_authorityengine.authority_outbox_events enable row level security;
alter table custom_authorityengine.outbox_receipts enable row level security;

alter table custom_authorityengine.projects force row level security;
alter table custom_authorityengine.opportunities force row level security;
alter table custom_authorityengine.research force row level security;
alter table custom_authorityengine.influencer_seeds force row level security;
alter table custom_authorityengine.profiles force row level security;
alter table custom_authorityengine.farmer_profiles force row level security;
alter table custom_authorityengine.briefs force row level security;
alter table custom_authorityengine.content_items force row level security;
alter table custom_authorityengine.post_machine_outputs force row level security;
alter table custom_authorityengine.assets force row level security;
alter table custom_authorityengine.approvals force row level security;
alter table custom_authorityengine.receipts force row level security;
alter table custom_authorityengine.metrics force row level security;
alter table custom_authorityengine.feedback force row level security;
alter table custom_authorityengine.events force row level security;
alter table custom_authorityengine.authority_outbox_events force row level security;
alter table custom_authorityengine.outbox_receipts force row level security;

drop policy if exists projects_isolated on custom_authorityengine.projects;
create policy projects_isolated on custom_authorityengine.projects
  for all
  using (id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id())
  with check (id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());

drop policy if exists opportunities_isolated on custom_authorityengine.opportunities;
create policy opportunities_isolated on custom_authorityengine.opportunities for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists research_isolated on custom_authorityengine.research;
create policy research_isolated on custom_authorityengine.research for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists influencer_seeds_isolated on custom_authorityengine.influencer_seeds;
create policy influencer_seeds_isolated on custom_authorityengine.influencer_seeds for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists profiles_isolated on custom_authorityengine.profiles;
create policy profiles_isolated on custom_authorityengine.profiles for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists farmer_profiles_isolated on custom_authorityengine.farmer_profiles;
create policy farmer_profiles_isolated on custom_authorityengine.farmer_profiles for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists briefs_isolated on custom_authorityengine.briefs;
create policy briefs_isolated on custom_authorityengine.briefs for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists content_items_isolated on custom_authorityengine.content_items;
create policy content_items_isolated on custom_authorityengine.content_items for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists post_machine_outputs_isolated on custom_authorityengine.post_machine_outputs;
create policy post_machine_outputs_isolated on custom_authorityengine.post_machine_outputs for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists assets_isolated on custom_authorityengine.assets;
create policy assets_isolated on custom_authorityengine.assets for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists approvals_isolated on custom_authorityengine.approvals;
create policy approvals_isolated on custom_authorityengine.approvals for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists receipts_isolated on custom_authorityengine.receipts;
create policy receipts_isolated on custom_authorityengine.receipts for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists metrics_isolated on custom_authorityengine.metrics;
create policy metrics_isolated on custom_authorityengine.metrics for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists feedback_isolated on custom_authorityengine.feedback;
create policy feedback_isolated on custom_authorityengine.feedback for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists events_isolated on custom_authorityengine.events;
create policy events_isolated on custom_authorityengine.events for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists authority_outbox_events_isolated on custom_authorityengine.authority_outbox_events;
create policy authority_outbox_events_isolated on custom_authorityengine.authority_outbox_events for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
drop policy if exists outbox_receipts_isolated on custom_authorityengine.outbox_receipts;
create policy outbox_receipts_isolated on custom_authorityengine.outbox_receipts for all using (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id()) with check (project_id = custom_authorityengine.current_project_id() and owner_id = custom_authorityengine.current_owner_id());
