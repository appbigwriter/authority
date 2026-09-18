# AUTH-001 — Persistência relacional/RLS

## 1. Resultado executivo

**Status da story:** `PARCIALMENTE_ATENDIDA / AUDITORIA_CONCLUIDA`.

A auditoria local foi executada sem mutações remotas, sem uso/exposição de secrets e sem deploy. O núcleo local continua usando `JsonStore`; o schema relacional documentado em `04-database/schema-foundation.sql.md` cobre apenas parte das coleções operacionais e não possui RLS/políticas/ownership por tenant. Portanto, AUTH-001 entrega o mapa e os blockers para migração segura, mas **não libera integração Postgres/Supabase runtime**.

## 2. Escopo auditado

- Story e critérios: `02-prd/stories/AUTH-001-persistencia-relacional-rls.md`.
- Schema/migration local: `04-database/schema-foundation.sql.md`.
- Persistência/repository: `09-codigo/src/repository.ts`.
- API/runtime local: `09-codigo/src/server.ts`, `09-codigo/src/start.ts`.
- Tipos/contratos: `09-codigo/src/types.ts`, `09-codigo/src/types-extended.ts`.
- Testes: `09-codigo/src/tests/*.test.ts`.
- Estado/documentos de Control Tower: `STATUS.md`, `03-arquitetura/integrations.md`, `03-arquitetura/bigwriter-handoff.md`.

## 3. Evidência de execução

| Quando | Diretório | Comando | Resultado |
|---|---|---|---|
| 2026-09-17T21:18:20-03:00 | `F:/Projetos/_FBR/AuthorityEngine` | `git status --short && git log -5 --oneline` | Working tree com stories não rastreadas: `02-prd/TASKLIST-AUTHORITY-ENGINE.md`, `02-prd/stories/AUTH-001-persistencia-relacional-rls.md`, `02-prd/stories/AUTH-002-integracao-piloto-qa.md`; últimos commits: `98e2ac2`, `8d6efd4`, `fa4a94c`, `1671a6c`, `7132202`. |
| 2026-09-17T21:18:20-03:00 | `F:/Projetos/_FBR/AuthorityEngine` | listar `04-database/**/*` | Único arquivo encontrado: `04-database/schema-foundation.sql.md`. |
| 2026-09-17T21:18:20-03:00 | `F:/Projetos/_FBR/AuthorityEngine/09-codigo` | `npm run build` | `tsc -p tsconfig.json` concluiu com exit code 0. |
| 2026-09-17T21:18:20-03:00 | `F:/Projetos/_FBR/AuthorityEngine/09-codigo` | `npm test` | 26 testes passaram; 0 falhas; duração reportada 270.3975ms. |
| 2026-09-17T21:18:20-03:00 | `F:/Projetos/_FBR/AuthorityEngine/09-codigo` | `npm run check` | Build + testes passaram; 26 testes passaram; 0 falhas; duração reportada 235.8357ms. |
| 2026-09-17T21:18:20-03:00 | `F:/Projetos/_FBR/AuthorityEngine` | busca textual por `row level security|enable row level|policy|rls|auth.uid|tenant|owner|organization|workspace` | Encontrou apenas referência a RLS como pendência em `schema-foundation.sql.md` e referências documentais de owner/tenant; nenhuma política SQL/RLS implementada. |

## 4. Estado local observado

### 4.1 Repository/runtime

- `JsonStore` lê/escreve um arquivo JSON local (`AUTHORITY_STORE` ou `./data/authority-engine.json`).
- `StoreData` contém as coleções: `opportunities`, `seeds`, `profiles`, `content`, `briefs`, `assets`, `approvals`, `receipts`, `metrics`, `feedback`, `events`, `research`, `farmer_profiles`, `post_machine`.
- A API `/health` declara explicitamente `persistence: 'json-store'`, `externalIntegrations: 'not_configured'` e `publicationMode: 'assisted_only'`.
- Não há adapter Postgres/Supabase no código auditado; `createAuthorityServer` recebe `JsonStore` diretamente.

### 4.2 Schema local documentado

`04-database/schema-foundation.sql.md` contém rascunho SQL com cinco tabelas:

- `opportunities`
- `influencer_seeds`
- `profiles`
- `content_items`
- `approvals`

O próprio documento declara: rascunho para migrar `JsonStore`, ainda não aplicado em banco externo, e aplicação bloqueada até contrato Supabase/Postgres, schema/tenant/RLS, migration idempotente, backup/rollback e aprovação de Sergio.

## 5. Mapa entidades → tabelas relacionais

| Entidade/coleção runtime | Origem no código | Tabela relacional proposta/atual | Status de cobertura | FK/constraints/index previstos | Divergência principal |
|---|---|---|---|---|---|
| `opportunities` | `StoreData.opportunities`; `POST /api/opportunities` | `opportunities` | **coberta parcialmente** | PK `id`; checks de `status`; índice não necessário além da PK | Tipo local tem `products`, `trends`, `scores`, `risks`, `evidence`, `blockers`; schema guarda esses campos só em `payload`, sem colunas consultáveis. |
| `seeds` | `StoreData.seeds`; `POST /api/seeds`, `/api/seeds/generate`, `/api/seeds/select` | `influencer_seeds` | **coberta parcialmente** | FK `opportunity_id -> opportunities(id)`; índice `idx_seeds_opportunity`; check de `status` | Nome runtime `seeds`; schema `influencer_seeds`. Status local inclui `invalid` em `types.ts`, mas schema só aceita `proposed/selected/blocked/archived`. Campos de taxonomia/score ficam em `payload`. |
| `profiles` | `StoreData.profiles`; endpoints legados de S4 | `profiles` | **coberta parcialmente/legado** | FK `seed_id -> influencer_seeds(id)`; índice `idx_profiles_seed`; check de `status` | Fluxo S3 atual usa `farmer_profiles`, não `profiles`; schema não cobre diferença entre profile legado e farmer profile completo. |
| `farmer_profiles` | `StoreData.farmer_profiles`; `/api/farmer/profile*` | `profiles` ou nova `farmer_profiles` | **não coberta de forma segura** | Se fundir em `profiles`: precisa coluna/tipo `profile_kind` e payload; se separar: FK `seed_id` + índices | Entidade operacional real do Farmer não está nomeada no schema. Usar `profiles` sem contrato pode misturar modelos e quebrar FKs/status. |
| `briefs` | `StoreData.briefs`; `POST /api/briefs` | Sem tabela dedicada | **não coberta** | Necessário FK para profile/farmer_profile, `status`, `owner`, `priority`, `next_gate`, índices por status/profile | Atualmente só existe em JSON. `content_items` não substitui briefing porque briefing é gate/entrada editorial. |
| `content` | `StoreData.content`; `POST /api/content`, review/publish | `content_items` | **coberta parcialmente** | FK `profile_id -> profiles(id)`; índice `idx_content_profile`; check de `status` | Conteúdo local referencia `briefId`, versão, canal, assets; schema usa `profile_id` e `payload`, sem FK para briefing nem versionamento explícito. |
| `post_machine` | `StoreData.post_machine`; `/api/post-machine/generate` | Sem tabela dedicada ou `content_items` agregado | **não coberta** | Necessário FK para farmer_profile/profile, `week`, `status`, índices por profile/week | Output semanal contém artigos/scripts/shorts/stories; não há tabela para lote, itens gerados e revisões. |
| `approvals` | `StoreData.approvals`; `POST /api/approvals` | `approvals` | **coberta parcialmente** | PK `id`; índice `idx_approvals_target` | Schema não tem `target_version`, `channel`; `target_id` não é FK polimórfica verificável; escopo local é `publication`. |
| `receipts` | `StoreData.receipts`; publish assisted/fake | Sem tabela dedicada | **não coberta** | FK para draft/content e approval; campos provider/mode/external_id/published_at | Essencial para auditoria de publicação; hoje ficaria fora do schema. |
| `metrics` | `StoreData.metrics`; `POST /api/metrics` | Sem tabela dedicada | **não coberta** | FK para receipt/brief/draft; índices por período/canal | Necessário para feedback ao Radar e avaliação de performance. |
| `feedback` | `StoreData.feedback`; criado junto com métricas | Sem tabela dedicada | **não coberta** | FK para metric/brief; status/recommendation | Feedback operacional não tem destino relacional. |
| `events` | `StoreData.events` | Possível `events` no contrato BigWriter/Control Tower | **não coberta no schema foundation** | Índices por actor/target/timestamp; RLS por tenant | Existe no store vazio, mas não é escrito pelos endpoints auditados e não aparece no SQL foundation. |
| `assets` | `StoreData.assets` | Sem tabela no schema foundation; BigWriter espera `files` | **não coberta** | FK para brief/content/profile; provider/license/disclosure | Tipos possuem `AssetVersion`, mas `StoreData.assets` é `any[]` e schema não define tabela. |
| `research` | `StoreData.research`; `/api/opportunities/research`, `/api/research` | Sem tabela dedicada | **não coberta** | FK `opportunity_id`, status, source/evidence | Etapa S1/S2 depende de research, mas schema foundation não persiste relacionalmente. |

## 6. Ownership, isolamento e RLS

### Fatos verificados localmente

- O schema foundation não usa prefixo `custom_authorityengine.` nos `create table`; se executado sem `search_path` controlado, pode criar tabelas no schema errado.
- Não há `tenant_id`, `project_id`, `organization_id`, `owner_id`, `created_by` ou `workspace_id` nas tabelas foundation.
- Não há `alter table ... enable row level security`, `create policy`, `auth.uid()` ou policy por role no SQL auditado.
- `STATUS.md` registra schema provisionado `custom_authorityengine`, namespace `fbr/blogs/dfb080ea-5fa2-4924-bccd-8f121c637e6e/` e PostgREST ainda não exposto para esse schema (`PGRST106`).
- `bigwriter-handoff.md` espera isolamento no schema `custom_authorityengine` e lista tabelas genéricas `entities`, `entity_relations`, `records`, `files`, `settings`, `audit_logs`, `events`, divergentes do schema foundation.

### Risco de isolamento

| Risco | Severidade | Evidência | Ação necessária |
|---|---:|---|---|
| Tabelas podem ser criadas fora do schema do projeto se o SQL for aplicado sem `custom_authorityengine.` ou `search_path` controlado. | Alta | `schema-foundation.sql.md` usa nomes não qualificados. | Qualificar todas as tabelas/índices/FKs com `custom_authorityengine` antes de qualquer aplicação. |
| RLS inexistente permite leitura/escrita ampla caso PostgREST exponha schema com role permissiva. | Crítica | Busca textual não encontrou policies/RLS; schema não tem owner/tenant. | Definir ownership: `project_id` obrigatório ou schema isolado + grants mínimos + policies fail-closed. |
| `target_id` de approvals é polimórfico sem FK; pode aprovar target errado ou cross-tenant se exposto. | Alta | `approvals.target_id text not null` sem FK/target_type robusto. | Adicionar `target_type`, `target_version`, `channel`, FK ou trigger de validação; RLS por target/projeto. |
| Runtime local não autentica operadores. | Alta | `api-contract-v0.1.md` lista autenticação ainda não implementada; `/health` declara JSON store. | Antes de PostgREST/runtime remoto: autenticação, roles e escopos. |
| Store relacional não cobre entidades operacionais do pipeline S1→S4. | Alta | Mapa acima. | Revisar migration para cobrir `research`, `farmer_profiles`, `briefs`, `post_machine`, `receipts`, `metrics`, `feedback`, `assets/events`. |

## 7. Divergências local / Control Tower / runtime

| Camada | Estado factual local | Divergência/limitação |
|---|---|---|
| Código local | API usa `JsonStore`; build/testes passam; health declara `persistence: json-store`. | Não há persistência real Postgres/Supabase nem RLS exercitada pelos testes. |
| Schema foundation local | Cinco tabelas operacionais em SQL markdown, sem schema qualificado e sem policies. | Não cobre todas as coleções do `StoreData`; status/colunas divergem dos tipos. |
| Control Tower documentado | `STATUS.md` registra Project ID `dfb080ea-5fa2-4924-bccd-8f121c637e6e`, schema `custom_authorityengine`, namespace e bindings ativos. | Este relatório não fez readback remoto; trata esse estado como documentação local, não confirmação externa nova. |
| PostgREST/runtime remoto documentado | `STATUS.md` informa `PGRST106`: schema `custom_authorityengine` ainda não exposto no PostgREST. | Sem endpoint remoto funcional, não há como provar REST, RLS ou persistência runtime sem credenciais/aprovação. |
| BigWriter/integração editorial | `bigwriter-handoff.md` espera tabelas genéricas (`entities`, `records`, `files`, etc.) no schema provisionado. | Contrato editorial diverge do schema foundation (`opportunities`, `influencer_seeds`, etc.) e do runtime `JsonStore`. |

## 8. Blockers

| ID | Blocker | Severidade | Owner proposto | Próxima ação | Evidência necessária para liberar |
|---|---|---:|---|---|---|
| B1 | Modelo relacional incompleto frente ao `StoreData` operacional. | Alta | Backend/DB Engineer Authority Engine | Atualizar migration local cobrindo todas as coleções ou declarar quais ficam agregadas em payload auditável. | Migration revisada + testes de contrato local. |
| B2 | RLS/ownership não definidos. | Crítica | DB/Supabase Engineer + Sergio para gate externo | Definir padrão: schema isolado por projeto + grants mínimos ou RLS por `project_id`; implementar policies fail-closed. | SQL com `enable row level security`, policies, grants e testes negativos. |
| B3 | Schema foundation não qualificado com `custom_authorityengine`. | Alta | DB Engineer | Qualificar tabelas, índices e FKs; validar idempotência. | Diff local e revisão antes de qualquer aplicação. |
| B4 | Divergência entre schema foundation e contrato BigWriter/Control Tower. | Alta | Arquiteto do projeto | Decidir se Authority Engine usará tabelas específicas, tabelas genéricas `records`, ou bridge entre os dois. | ADR/decisão registrada e migration compatível. |
| B5 | PostgREST `custom_authorityengine` não exposto segundo `STATUS.md`. | Alta | Control Tower/Infra | Expor schema no PostgREST e validar readback sanitizado sem mutação destrutiva. | Health/metadata/readback remoto com HTTP/status e campos não sensíveis. |
| B6 | Runtime não tem autenticação operacional. | Alta | Backend/Auth Engineer | Definir autenticação e roles antes de expor escrita. | Teste com usuário/role autorizada e teste negativo sem permissão. |

## 9. Ajustes aplicados

Nenhum ajuste em código, migration ou configuração foi aplicado. Única mutação local desta execução:

- Criado este artefato: `F:/Projetos/_FBR/AuthorityEngine/08-historico/AUTH-001-persistencia-relacional.md`.

## 10. Próximo responsável

**Próximo responsável recomendado:** DB/Supabase Engineer do Authority Engine.

**Missão:** transformar esta auditoria em migration local revisada, com tabelas completas, schema qualificado, RLS/ownership, grants e testes locais de contrato, sem aplicar remotamente até gate de Sergio e readback seguro do Control Tower/PostgREST.

## 11. Validação contra critérios da story

| Critério AUTH-001 | Status | Evidência |
|---|---|---|
| Cada entidade operacional tem destino relacional identificado. | **Atendido para auditoria** | Seção 5 mapeia todas as coleções de `StoreData` para tabela existente/proposta e marca cobertura. |
| RLS, ownership e risco de isolamento estão documentados. | **Atendido para auditoria; implementação bloqueada** | Seção 6 documenta ausência de RLS/ownership e riscos. |
| Diferenças entre local, Control Tower e runtime remoto estão separadas. | **Atendido** | Seção 7 separa código local, schema foundation, Control Tower documentado e runtime/PostgREST. |
| Nenhuma integração remota é afirmada sem evidência. | **Atendido** | Relatório explicita que não houve readback remoto nesta execução e classifica dados de Control Tower como documentação local. |

## 12. Handoff

```yaml
de: "Hermes subagent — AUTH-001 auditoria local"
para: "DB/Supabase Engineer Authority Engine"
card: "AUTH-001 — Persistência relacional/RLS"
objetivo do job: "Revisar código, migrations e contratos para definir caminho verificável de saída do JsonStore local para Postgres/Supabase relacional com RLS, sem mutações externas."
entregável: "F:/Projetos/_FBR/AuthorityEngine/08-historico/AUTH-001-persistencia-relacional.md"
decisões/suposições:
  - "FATO: runtime local usa JsonStore e health declara persistence=json-store."
  - "FATO: schema foundation local tem cinco tabelas e não contém RLS/policies/ownership."
  - "FATO: Control Tower e PostgREST não foram consultados remotamente nesta execução; dados remotos citados vêm de STATUS.md e docs locais."
  - "HIPÓTESE: o caminho mais seguro é schema qualificado custom_authorityengine + grants mínimos + RLS/policies fail-closed por project_id/role, a validar pelo DB Engineer."
pendências/blockers:
  - "B1 Alta: schema não cobre todas as coleções operacionais; owner DB/Supabase Engineer."
  - "B2 Crítica: RLS/ownership ausentes; owner DB/Supabase Engineer + Sergio para gate externo."
  - "B3 Alta: SQL não qualifica custom_authorityengine; owner DB Engineer."
  - "B4 Alta: contrato BigWriter diverge do schema foundation; owner Arquiteto do projeto."
  - "B5 Alta: PostgREST custom_authorityengine documentado como não exposto; owner Control Tower/Infra."
  - "B6 Alta: autenticação runtime ausente; owner Backend/Auth Engineer."
gate: "revisão — não autoriza migration remota, deploy ou exposição PostgREST"
critérios de aceite/evidência:
  - "Entidades operacionais mapeadas: seção 5."
  - "RLS/ownership/isolamento documentados: seção 6."
  - "Divergências local/Control Tower/runtime separadas: seção 7."
  - "Checks locais executados: npm run build, npm test, npm run check; 26 testes passaram; seção 3."
```
