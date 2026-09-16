# Authority Engine — Schema de Persistência Base

## Estado
Rascunho de schema para migrar o `JsonStore` para Postgres/Supabase. Ainda não aplicado em banco externo.

```sql
create table if not exists opportunities (
  id text primary key,
  niche text not null,
  subniche text not null,
  problem text not null,
  audience text not null,
  status text not null check (status in ('candidate','qualified','blocked','selected','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists influencer_seeds (
  id text primary key,
  opportunity_id text not null references opportunities(id),
  status text not null check (status in ('proposed','selected','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id text primary key,
  seed_id text not null references influencer_seeds(id),
  status text not null check (status in ('development','review','approved','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_items (
  id text primary key,
  profile_id text not null references profiles(id),
  status text not null check (status in ('draft','review','awaiting_human_approval','published','blocked','archived')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approvals (
  id text primary key,
  target_id text not null,
  approved boolean not null,
  scope text not null,
  approved_at timestamptz not null,
  approver text not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_seeds_opportunity on influencer_seeds(opportunity_id);
create index if not exists idx_profiles_seed on profiles(seed_id);
create index if not exists idx_content_profile on content_items(profile_id);
create index if not exists idx_approvals_target on approvals(target_id);
```

## Bloqueio de migração
Aplicar somente após:

- contrato Supabase/Postgres confirmado;
- schema/tenant/RLS definido;
- migration idempotente revisada;
- backup/rollback definidos;
- aprovação de Sergio para alteração externa.
