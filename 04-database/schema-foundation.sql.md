# Authority Engine — Schema de Persistência Base

## Estado
AUTH-003 implementado localmente em `04-database/001-custom-authorityengine-operational.sql`.

O arquivo SQL é um contrato local idempotente para Postgres/Supabase e **não foi aplicado remotamente**.

## Escopo coberto

- Schema qualificado: `custom_authorityengine`.
- Coleções operacionais de `StoreData` mapeadas:
  - `opportunities` → `custom_authorityengine.opportunities`
  - `seeds` → `custom_authorityengine.influencer_seeds`
  - `profiles` → `custom_authorityengine.profiles`
  - `content` → `custom_authorityengine.content_items`
  - `briefs` → `custom_authorityengine.briefs`
  - `assets` → `custom_authorityengine.assets`
  - `approvals` → `custom_authorityengine.approvals`
  - `receipts` → `custom_authorityengine.receipts`
  - `metrics` → `custom_authorityengine.metrics`
  - `feedback` → `custom_authorityengine.feedback`
  - `events` → `custom_authorityengine.events`
  - `research` → `custom_authorityengine.research`
  - `farmer_profiles` → `custom_authorityengine.farmer_profiles`
  - `post_machine` → `custom_authorityengine.post_machine_outputs`
- Ownership obrigatório por `project_id` e `owner_id`.
- RLS fail-closed via `current_setting('app.current_project_id', true)` e `current_setting('app.current_owner_id', true)`: sem contexto local configurado, policies não liberam leitura/escrita.
- Índices por projeto, owner e principais relações operacionais.
- FKs qualificadas para as relações conhecidas; campos opcionais preservam compatibilidade com payloads legados enquanto produto não decide cardinalidade obrigatória de todos os fluxos.

## Bloqueio de migração remota

Aplicar somente após:

- contrato Supabase/Postgres confirmado;
- papéis runtime e forma oficial de setar `app.current_project_id`/`app.current_owner_id` confirmados pelo agente de runtime/auth;
- decisão de produto sobre FKs opcionais versus obrigatórias para payloads legados;
- migration revisada em banco local Postgres real;
- backup/rollback definidos;
- aprovação humana explícita para alteração externa.
