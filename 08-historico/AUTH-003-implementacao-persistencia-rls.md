# AUTH-003 — Implementação de persistência relacional e RLS

## Status
Implementado localmente e verificado em `09-codigo`.

## Data/hora
2026-09-18 00:56:20 ESAST

## Arquivos criados/modificados neste escopo

- `04-database/001-custom-authorityengine-operational.sql`
  - Schema local idempotente `custom_authorityengine`.
  - Tabelas operacionais para todas as coleções de `StoreData`.
  - `project_id`/`owner_id`, FKs qualificadas, índices e RLS fail-closed.
- `04-database/schema-foundation.sql.md`
  - Documentação do mapeamento StoreData → tabelas e blockers de migração remota.
- `09-codigo/src/persistence/types.ts`
  - Interface `PersistenceStore`, `PersistenceContext`, `SqlClient`, `StoreData`, coleções operacionais e empty store.
- `09-codigo/src/repository.ts`
  - `JsonStoreFake` mantido como fake/teste/local explícito.
  - Alias `JsonStore` preservado apenas por compatibilidade.
  - `RelationalAuthorityStore` atrás de `PersistenceStore`, exigindo `projectId`/`ownerId` e filtrando por ownership.
  - Mapeamento de coleções para tabelas relacionais.
- `09-codigo/src/start.ts`
  - Runtime local passa a instanciar `JsonStoreFake` explicitamente.
- `09-codigo/src/server.ts`
  - Server recebe `PersistenceStore` em vez de depender do tipo concreto JsonStore.
- `09-codigo/src/services/opportunity-research.ts`
  - `createResearchRecord` tipado contra `PersistenceStore`.
- `09-codigo/src/types.ts`
  - Ownership runtime opcional em tipos usados por persistência/autorização local.
- `09-codigo/src/auth.ts`
  - Ajuste mínimo de compatibilidade de tipo em `stampOwner<T extends object>` para aceitar interfaces sem index signature; arquivo estava em trabalho concorrente de AUTH-004.
- `09-codigo/src/tests/auth-003-persistence.test.ts`
  - Testes dedicados de contrato SQL, cobertura de coleções, RLS/ownership e adapter relacional.

## Comandos executados

```bash
cd F:/Projetos/_FBR/AuthorityEngine/09-codigo
npm run build
npm run check
```

## Resultado dos testes

`npm run check` passou.

Resumo do output:

- build TypeScript: passou.
- `node --test dist/tests/*.test.js`: passou.
- testes: 33
- pass: 33
- fail: 0
- duração reportada: 343.39 ms

## Evidências principais

- Todas as coleções operacionais de `StoreData` têm destino relacional documentado e testado:
  - `opportunities`, `seeds`, `profiles`, `content`, `briefs`, `assets`, `approvals`, `receipts`, `metrics`, `feedback`, `events`, `research`, `farmer_profiles`, `post_machine`.
- SQL usa schema qualificado `custom_authorityengine` nos `create table`, FKs, índices e policies.
- RLS é fail-closed localmente:
  - `enable row level security` + `force row level security` em todas as tabelas operacionais.
  - policies dependem de `custom_authorityengine.current_project_id()` e `custom_authorityengine.current_owner_id()`; sem settings locais, retornam `null` e não autorizam acesso.
- Adapter relacional falha fechado sem `projectId`/`ownerId` (`persistence_context_required`).
- Teste negativo cobre isolamento por filtro obrigatório `where project_id = $1 and owner_id = $2`.
- `JsonStoreFake` não é classificado como integração real; fica explícito como fake/local/teste.

## Blockers preservados

- Nenhuma migration remota foi aplicada.
- Forma oficial de setar `app.current_project_id`/`app.current_owner_id` no runtime/PostgREST/Supabase depende do trabalho de runtime/auth.
- FKs relacionais foram criadas para relações conhecidas, mas várias colunas relacionais permanecem opcionais para preservar payloads legados. Decisão de produto pendente: tornar quais relações obrigatórias por fluxo e em qual etapa de migração.
- SQL ainda não foi executado contra um Postgres local real; a verificação atual é por build/testes de contrato estáticos e adapter com client fake.

## Observações de concorrência

Durante a execução havia alterações locais de outro agente em runtime/auth (`src/auth.ts`, `src/server.ts`, testes AUTH-004 e publicação). Mantive o adapter atrás de `PersistenceStore` e fiz apenas os ajustes mínimos necessários para compatibilidade de tipos e `npm run check` verde.

## Handoff

Próximo responsável: runtime/auth ou banco.

Próximos passos recomendados:

1. Validar `04-database/001-custom-authorityengine-operational.sql` em Postgres local descartável.
2. Decidir contrato de tenancy: source dos settings `app.current_project_id` e `app.current_owner_id` por request/conexão.
3. Decidir obrigatoriedade das FKs por coleção antes de migration real.
4. Só depois abrir gate humano para migration remota/Supabase.
