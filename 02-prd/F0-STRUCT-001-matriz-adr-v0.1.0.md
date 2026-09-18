# F0-STRUCT-001 — Matriz global de entidades, ownership, estados e readbacks

**Versão:** `0.1.0`  
**Data do artefato:** `2026-09-18`  
**Status:** `DRAFT-CONTRACT / para revisão e Gate de Sergio`  
**Escopo de escrita:** somente documentação do Authority Engine.  
**Não executa:** migrations, deploy, provisionamento, publicação ou alteração em outros projetos.

## 0. Legenda de rastreabilidade

- **FATO** — observado em arquivo/contrato existente; a fonte é indicada.
- **DECISÃO** — aprovado no documento global ou já decidido no MP-000 local.
- **RECOMENDAÇÃO** — contrato proposto por este ADR para fechar uma lacuna; não é implementação nem aprovação de schema.
- **BLOQUEADOR** — dependência que impede declarar o contrato implementado/operacional.

Este documento reconcilia o fluxo global aprovado com o MP-000, o SQL local e o contrato HTTP atualmente versionado do Authority Engine. Onde o global usa `authority_*`, esta matriz mantém o prefixo como **nome lógico proposto**; não afirma que as tabelas já existem.

## 1. Decisões de arquitetura deste ADR

| ID | Tipo | Decisão / regra | Evidência ou motivo |
|---|---|---|---|
| ADR-001 | DECISÃO | Authority Engine é a fonte canônica de Persona e versões de Persona, Character Bible, Physical Identity Bible e módulos formadores. | Global, §2.1/§7; MP-000 §§20–46. |
| ADR-002 | DECISÃO | Agency Flux é o orquestrador durável e dono dos Gates operacionais, jobs globais, retries, blockers, handoffs, auditoria e readbacks de integração. | Global, §7/§9. |
| ADR-003 | DECISÃO | FBR Blogs consome Persona aprovada por API/evento e não lê tabelas internas do Authority Engine. | Global, §7/§8; MP-000 §46. |
| ADR-004 | DECISÃO | Control Tower/GestaoDB é dono do catálogo técnico, projeto, schema, configuração, namespace, referências de secrets, health/readbacks técnicos; não é fonte canônica da Persona. | Global, §7/§13; `03-arquitetura/developer-doc.md`. |
| ADR-005 | DECISÃO | Nenhuma transição de integração avança sem readback persistido do estado/efeito real. | Global, §§5.5, 9, 13, 16. |
| ADR-006 | DECISÃO | Aprovações são versionadas e por escopo; aprovação antiga não vale automaticamente para nova versão. | Global, §§5.4–5.5 e §14. |
| ADR-007 | RECOMENDAÇÃO | O Authority Engine deve expor APIs de consulta/consulta de pacote e emissão de eventos; consumidores não recebem acesso SQL direto. | Global, §8; necessário para separar o contrato lógico do SQL atual. |
| ADR-008 | RECOMENDAÇÃO | Persistir transições append-only ou em histórico de transição com `from_state`, `to_state`, ator, motivo, timestamp, correlation ID e evidência sanitizada. | Global, §10; o SQL atual não possui tabela de transição. |
| ADR-009 | RECOMENDAÇÃO | Outbox no Authority Engine e inbox/deduplicação no Agency Flux usam `event_id` + consumidor como chave lógica de idempotência. | Global, §§8–9. |
| ADR-010 | BLOQUEADOR | Este ADR não autoriza migration. O schema, nomes finais, RLS, assinatura/autenticação e readbacks remotos ainda dependem de revisão/Gate. | Global, §§11, 17–18; SQL local é explicitamente local-only. |

## 2. Ownership por sistema

| Sistema | Dono de escrita | Pode ler | Não deve fazer | Readback exigido |
|---|---|---|---|---|
| **Authority Engine** | Entidades de Persona, versões, Bibles, runs, jobs de geração, blogs derivados, versões de nome/domínio e eventos de negócio emitidos por ele. | Dados próprios; estado recebido por APIs oficiais quando necessário. | Provisionar banco/app/secrets; publicar sem Gate; expor tabelas internas. | Confirmar persistência da versão/estado/evento e devolver IDs/versões no handoff. |
| **FBR Agency Flux** | Jobs globais, dependências, handoffs, blockers, receipts, inbox/deduplicação, índice da Central de Aprovações e estado global da execução. | APIs/eventos do Authority, Blogs e Control Tower. | Tornar-se fonte canônica da Persona; aprovar pacote desatualizado. | Ler novamente aprovação/job/receipt após cada write e antes de liberar transição. |
| **FBR Blogs** | Binding da Persona aprovada, configuração editorial, pautas, drafts e jobs editoriais próprios. | API/evento de Persona aprovada e versão aprovada. | Ler SQL do Authority; criar contas reais de social/YouTube na fase 1. | Confirmar `persona_version_id` consumido, binding, configuração e estado editorial. |
| **Control Tower / GestaoDB** | Catálogo técnico, projetos, schemas, artefatos de configuração, namespaces, bindings/referências de secrets e health checks. | Handoff/job autorizado e APIs oficiais. | Ser fonte canônica da Persona; armazenar/exibir valores de secrets; depender de clique manual no fluxo normal. | Confirmar projeto/schema/artefatos/namespace/health e retornar IDs/estado ao Flux. |
| **Hermes/provider** | Execução de geração conforme runtime configurado e metadados de provider/modelo. | Prompt/entrada autorizada pelo Authority. | Fixar provider no código ou inserir secrets em conteúdo/eventos. | Retornar `generation_job_id`, provider, model, model version quando disponível e status. |

## 3. Matriz de entidades e contratos

### 3.1 Entidades canônicas do Authority Engine

| Entidade lógica | Tabela lógica proposta | Owner | Campos mínimos / invariantes | Estado | API pública Authority (proposta) | Eventos de saída / consumidores | Readback de aceite |
|---|---|---|---|---|---|---|---|
| Persona | `authority_personas` | Authority | `persona_id`, `project_id`, `current_version_id`, `status`, timestamps; não sobrescrever versão aprovada. | `draft`, `profile_generating`, `profile_generated`, `pending_approval`, `revision_requested`, `approved`, `rejected`, `generation_blocked`, `archived`. | `POST /api/personas`; `GET /api/personas/:id`; `GET /api/personas/:id/versions`; `POST /api/personas/:id/submit`. | `persona.profile_generated`; `persona.pending_approval`; `persona.approved`; `persona.revision_requested`. Flux; Blogs após approved. | GET retorna mesmo `persona_id`, status esperado e `current_version_id`; versão aprovada permanece imutável. |
| PersonaVersion | `authority_persona_versions` | Authority | `persona_version_id`, `persona_id`, monotonic `version`, snapshot de entradas/saídas, `source_run_ids`, `status`, hash opcional, timestamps. | `draft`, `generating`, `generated`, `pending_approval`, `approved`, `superseded`, `rejected`, `archived`. | `GET /api/persona-versions/:id`; `GET /api/personas/:id/versions/:version`. | Incluída nos eventos de Persona; consumida por Flux/Blogs. | GET do ID devolve a versão exata referenciada no approval/handoff; mismatch bloqueia avanço. |
| Character Bible | `authority_character_bibles` | Authority | `character_bible_id`, `persona_version_id`, conteúdo versionado, guardrails, voz, disclosure, prompts, `status`, `version`. | `draft`, `generated`, `pending_approval`, `approved`, `superseded`, `blocked`. | `GET /api/persona-versions/:id/character-bible`. | Parte do pacote de aprovação; `persona.approved` referencia ID/versão. Flux; Blogs. | Pacote e GET têm o mesmo ID/versão/hash lógico; ausência impede `profile_generated`. |
| Physical Identity Bible | `authority_physical_identity_bibles` | Authority | `physical_identity_bible_id`, `persona_version_id`, atributos físicos, invariantes, variações permitidas, prompts positivo/negativo, assets/ref IDs, geração metadata. | `draft`, `generated`, `pending_approval`, `approved`, `superseded`, `blocked`. | `GET /api/persona-versions/:id/physical-identity-bible`. | Pacote; `persona.approved` referencia ID/versão. Blogs e geradores autorizados. | GET confirma campos mínimos, provider/model/prompt version e IDs de assets; mudança crítica invalida dependentes. |
| Visual consistency profile | `authority_visual_consistency_profiles` | Authority | invariantes visuais, referências, prompts, versão e vínculo ao Physical Identity Bible. | `draft`, `generated`, `approved`, `superseded`, `blocked`. | `GET /api/persona-versions/:id/visual-consistency`. | Pacote; Blogs/geradores. | Versão usada no pacote coincide com versão armazenada. |
| Editorial profile | `authority_editorial_profiles` | Authority | pilares, formatos, cadência, temas, critérios de qualidade, versão de Persona. | `draft`, `generated`, `approved`, `superseded`, `blocked`. | `GET /api/persona-versions/:id/editorial-profile`. | Blogs; Flux no pacote integral. | Blogs confirma `persona_version_id` e versão do perfil. |
| Channel plan | `authority_channel_plans` | Authority | canal (`blog`, `social`, `youtube`), plano/pautas, disclosure, versionamento; sem criação de contas reais na fase 1. | `draft`, `generated`, `approved`, `superseded`, `blocked`. | `GET /api/persona-versions/:id/channel-plans`. | Blogs; Flux. | Cada plano tem ID/versão no snapshot integral. |
| Module run | `authority_generation_module_runs` | Authority | `run_id`, `persona_version_id`, `module_key`, input/output refs ou sanitizados, `module_version`, provider/model, prompt version, status, error sanitizado, timestamps. | `pending`, `running`, `waiting_external`, `retrying`, `success`, `failed`, `blocked`, `cancelled`. | `GET /api/persona-versions/:id/module-runs`; `GET /api/module-runs/:id`. | `persona.module_run.completed`; `persona.module_run.failed` (Flux observabilidade). | Todos os módulos obrigatórios têm run terminal `success`; qualquer falha deixa Persona bloqueada. |
| Generation job | `authority_generation_jobs` | Authority | `generation_job_id`, target/entity/version, provider/model, prompt version, idempotency key, status, attempt count, last error, timestamps. | `pending`, `running`, `waiting_external`, `retrying`, `blocked`, `success`, `failed`, `cancelled`. | `GET /api/generation-jobs/:id`; `POST /api/generation-jobs/:id/retry` (policy). | Flux opcional para acompanhamento; evento terminal. | GET confirma status terminal e metadados sem secret/prompt sensível indevido. |
| Approval pack | lógico: snapshot em `authority_approvals` + artefacts | Authority prepara; Flux indexa/decide | snapshot de todos IDs/versões; correlation; `job_id`; nenhum booleano isolado. | `draft`, `assembled`, `pending`, `approved`, `rejected`, `revision_requested`, `superseded`, `cancelled`. | `GET /api/approval-packs/:id`; `POST /api/personas/:id/approval-pack`. | `approval.requested`; `approval.approved`; `approval.rejected`; `approval.revision_requested`. Flux Central. | Flux lê snapshot e confirma que nenhum artefato mudou antes da decisão. |
| Blog project | `authority_blog_projects` | Authority para vínculo/derivação; Flux para execução global | `blog_id`, `persona_id`, `approved_persona_version_id`, project/correlation refs, status. Uma Persona:N blogs. | `draft`, `awaiting_persona_approval`, `awaiting_blog_name_approval`, `domain_generated`, `awaiting_dns`, `dns_manual_confirmed`, `dns_verified`, `ready_for_provisioning`, `provisioning`, `provisioned`, `awaiting_publication_approval`, `published`, `blocked`, `failed`, `archived`. | `POST /api/blogs`; `GET /api/blogs/:id`; `GET /api/blogs/:id/binding`. | `blog.created`; `blog.name_approved`; `blog.dns_verified`; `blog.ready_for_provisioning`. Flux; Blogs; Control Tower. | GET confirma `blog_id`, Persona/version, nome/domínio e status; não criar novo blog por alteração de versão. |
| Blog name version | `authority_blog_name_versions` | Authority | `blog_name_version_id`, `blog_id`, name, slug, version, status, actor/reason, timestamps; slug derivado deterministically. | `draft`, `pending_approval`, `approved`, `superseded`, `rejected`. | `GET /api/blogs/:id/name-versions`; `POST /api/blogs/:id/name-versions`. | `blog.name_approval_requested`; `blog.name_approved`. Flux. | GET devolve versão aprovada referenciada no approval; mesmo `blog_id`. |
| Domain version | `authority_domain_versions` | Authority para histórico; Control Tower para validação técnica | `domain_version_id`, `blog_id`, name version ref, domain, type, status, DNS evidence/ref, timestamps. | `domain_generated`, `awaiting_dns`, `dns_manual_confirmed`, `dns_verified`, `superseded`, `blocked`. | `GET /api/blogs/:id/domain-versions`; `POST /api/blogs/:id/domain-versions`; `POST /api/blogs/:id/dns/confirm` (manual request). | `domain.generated`; `dns.manual_confirmed`; `dns.verified`; `dns.failed`. Flux/Control Tower. | Control Tower/Flux devolve readback DNS técnico; manual confirmation isolada não autoriza `dns_verified`. |
| Approval decision | `authority_approvals` (com espelho/index em Flux) | Flux decide Gate; Authority registra referência/auditoria local quando aplicável | `approval_id`, target refs, type, status, requested/reviewed by/at, reason, comment, approved_versions, artifact IDs, job/correlation. | `pending`, `approved`, `rejected`, `revision_requested`, `superseded`, `cancelled`. | Authority: `GET /api/approvals/:id`; Flux é write owner da Central. | Eventos de decisão assinados; consumidores revalidam snapshot. | Readback da decisão persistida e comparação dos IDs/versões antes da transição. |
| Outbox event | `authority_outbox_events` | Authority | envelope §4 abaixo, payload sanitizado, status, attempts, next retry, delivered_at, idempotency key; append-only. | `pending`, `dispatching`, `delivered`, `retrying`, `dead_letter`, `cancelled`. | Interna; `GET /api/outbox-events/:id` somente operador/admin. | Agency Flux Inbox. | Flux confirma `event_id`, signature/check result, processed status e correlation; evento duplicado não duplica recurso. |
| Transition/audit record | recomendada `authority_state_transitions` | Sistema que realiza transição | `entity_type/id`, from/to, actor, reason, correlation, causation, evidence/error sanitized, timestamp. | `recorded` (não é estado de negócio). | `GET /api/audit/transitions?entity=...` (admin). | Flux/Control Tower para auditoria conforme escopo. | Readback mostra transição e evidência correspondente; sem apagar histórico. |

### 3.2 Entidades de consumidores e readbacks

| Sistema | Entidade lógica | Owner | Relacionamentos mínimos | Readback obrigatório |
|---|---|---|---|---|
| Agency Flux | `flux_projects` | Flux | `authority_persona_id`, `blog_id`, Control Tower project ref. | Projeto global e refs coincidem com handoff. |
| Agency Flux | `flux_jobs` / dependencies | Flux | source event, idempotency key, target system, attempts, blocker, next check. | Job terminal ou blocker explícito; nenhuma transição sem resposta do target. |
| Agency Flux | `flux_approvals` / Central | Flux | snapshot IDs/versões, type/status, reviewer, reason. | Releitura da decisão antes de liberar. |
| Agency Flux | `flux_handoffs` / artifacts / blockers | Flux | payload versionado, artifact refs, owner, next gate. | Receipt/handoff persistido e consultável. |
| Agency Flux | `flux_inbox_events` / `flux_readbacks` | Flux | `event_id`, consumer, attempts/status, response snapshot, checked_at. | Dedupe por `(event_id, consumer)` e readback do target. |
| FBR Blogs | `blog_persona_bindings` | Blogs | `blog_id`, `persona_id`, `persona_version_id`, source event/API receipt. | Binding aponta para versão aprovada; mudança exige nova aprovação. |
| FBR Blogs | `blog_applications`, editorial profiles/pillars/plans/jobs | Blogs | binding e IDs de origem; sem SQL cross-service. | Aplicação/configuração e jobs confirmam versão consumida. |
| Control Tower | `projects` | Control Tower | `control_tower_project_id`, public catalog fields, schema/namespace refs. | `project_id`, schema, status e template lidos após upsert. |
| Control Tower | provisioning jobs/artifacts | Control Tower | job, config artifact, public vars metadata, health URL, secret binding refs. | Artefatos, namespace, health e referências reconciliados; valores secretos nunca retornados. |

## 4. Envelope de evento e ownership da entrega

### 4.1 Envelope mínimo

```json
{
  "event_id": "uuid",
  "event_type": "persona.approved",
  "event_version": 1,
  "occurred_at": "ISO-8601",
  "source": "authority-engine",
  "aggregate_type": "persona",
  "aggregate_id": "uuid",
  "aggregate_version": 3,
  "correlation_id": "uuid",
  "causation_id": "uuid|null",
  "payload": {
    "persona_id": "uuid",
    "persona_version_id": "uuid",
    "character_bible_id": "uuid",
    "physical_identity_bible_id": "uuid",
    "blog_id": "uuid",
    "blog_name_version_id": "uuid",
    "domain_version_id": "uuid"
  }
}
```

**DECISÃO:** o Authority Engine grava e entrega o evento via outbox; Agency Flux recebe em inbox, deduplica, cria job idempotente e chama APIs dos consumidores.  
**BLOQUEADOR:** assinatura, autenticação, algoritmo/chaves e endpoint de delivery ainda não estão definidos no contrato local.  
**REGRA:** nenhum token, senha, service role, CVC, secret ou valor privado entra no payload, log ou receipt.

### 4.2 Eventos mínimos

| Evento | Emissor | Consumidor | Pré-condição | Readback |
|---|---|---|---|---|
| `persona.profile_generated` | Authority | Flux/Approval Central | módulos obrigatórios success | GET da Persona + pacote montado. |
| `persona.approval_requested` | Authority/Flux | Central | snapshot versionado completo | approval pending persistido. |
| `persona.approved` | Flux/Authority reference | Flux, Blogs | G2 aprovado e readback | version IDs confirmados. |
| `blog.name_approved` | Flux | Authority/Blogs | G3 aprovado | name version aprovada. |
| `domain.generated` | Authority | Flux/Control Tower | nome/slug aprovado | domain version persistida. |
| `dns.manual_confirmed` | Flux/Sergio | Control Tower | confirmação humana com motivo quando necessário | confirmação registrada; ainda não verified. |
| `dns.verified` | Control Tower | Flux/Blogs | check técnico positivo | health/DNS readback. |
| `provisioning.requested` | Flux | Control Tower | G4/G5 pré-condições | job técnico criado. |
| `provisioning.completed` | Control Tower | Flux/Blogs | artifacts + health + refs read back | projeto/schema/artifacts confirmados. |
| `publication.approval_requested` | Flux | Central | pacote integral e receipts | approval pending. |
| `publication.approved` | Flux | Flux/Blogs | G6 aprovado | snapshot integral revalidado. |
| `publication.completed` | Flux | Central/Authority | adapter autorizado | receipt e estado published lidos novamente. |

## 5. Estados e transições verificáveis

### 5.1 Persona e geração

```text
draft
  -> profile_generating       [G0: dados-base completos]
profile_generating
  -> profile_generated        [todos módulos obrigatórios success + consistência ok]
profile_generating
  -> generation_blocked       [falha/bloqueio de módulo/provider]
profile_generated
  -> pending_approval         [approval pack versionado e completo]
pending_approval
  -> approved                 [G2: Sergio aprovou; readback da decisão]
pending_approval
  -> rejected                 [G2 rejeitado com motivo]
pending_approval
  -> revision_requested       [G2 devolvido com motivo]
revision_requested
  -> profile_generating       [nova PersonaVersion/run]
approved
  -> archived                 [substituição explícita, sem apagar histórico]
```

**Regra:** `approved` é da versão, não um booleano mutável que autoriza versões futuras.

### 5.2 Blog, nome, domínio e provisionamento

```text
draft
  -> awaiting_persona_approval
  -> awaiting_blog_name_approval
  -> domain_generated         [slug/name version aprovado]
  -> awaiting_dns
  -> dns_manual_confirmed     [G4 manual]
  -> dns_verified              [check técnico Control Tower]
  -> ready_for_provisioning
  -> provisioning
  -> provisioned                [G5 + readbacks técnicos]
  -> awaiting_publication_approval
  -> published                  [G6/G7 + receipt final]
```

Qualquer etapa pode ir para `blocked`/`failed` com transição registrada. `dns_manual_confirmed` não pode saltar para `dns_verified` sem verificação técnica. Alterar nome/domínio cria nova versão, não novo `blog_id`.

### 5.3 Jobs

```text
pending -> running -> success
pending/running -> waiting_external -> running
running/waiting_external -> retrying -> running
qualquer não-terminal -> blocked | failed | cancelled
```

Cada retry precisa de `attempt_count`, motivo, `next_retry_at` e último erro sanitizado.

### 5.4 Gates

| Gate | Dono da decisão | Entrada | Saída desbloqueada | Evidência mínima |
|---|---|---|---|---|
| G0 Dados-base | Authority / Sergio quando lacuna | nicho, subnicho, problema, audiência, nome blog | `profile_generating` | brief estruturado e lacunas resolvidas. |
| G1 Persona completa | Sergio via Central | PersonaVersion + Bibles + runs | `approved` da Persona | pacote versionado e origem de cada saída. |
| G2 Aprovação Persona | Sergio via Flux | approval pack | eventos/Blog handoff | approval persistida e readback. |
| G3 Nome blog | Sergio via Flux | BlogNameVersion | domínio inicial | name version aprovada. |
| G4 Domínio/DNS | Sergio + Control Tower | DomainVersion | `dns_verified` | confirmação manual + check automático. |
| G5 Provisionamento | Flux após pré-condições | Persona/blog/DNS aprovados | `provisioned` | Control Tower project/schema/config/secrets refs/health readbacks. |
| G6 Publicação integral | Sergio via Central | snapshot integral, evidências, readbacks | `published` | approval com todos IDs/versões. |
| G7 Publicação | Flux executor | G6 aprovado e revalidado | receipt final | receipt e estado lidos novamente. |

## 6. Reconciliação com contratos atuais do Authority Engine

### 6.1 O que já existe (FATO)

1. **SQL local:** `04-database/001-custom-authorityengine-operational.sql` cria schema `custom_authorityengine` e tabelas genéricas `projects`, `opportunities`, `research`, `influencer_seeds`, `profiles`, `farmer_profiles`, `briefs`, `content_items`, `post_machine_outputs`, `assets`, `approvals`, `receipts`, `metrics`, `feedback`, `events`, com isolamento por `project_id`/`owner_id` e RLS local declarada.
2. **SQL local:** `approvals` atualmente tem `approved boolean`, `scope`, `status` limitado a `approved|rejected|revoked|archived`; não possui o modelo completo de approval type, versions snapshot, reviewer/reason/correlation/job exigido no global.
3. **SQL local:** `events` é uma tabela de eventos genérica; não é um outbox com `event_version`, aggregate version, delivery attempts, retry/dead-letter e dedupe por consumidor.
4. **API v0.1:** `03-arquitetura/api-contract-v0.1.md` descreve base HTTP local, `/health`, `/api/state`, POST de opportunities/seeds/profiles/content/approvals; declara JSON Store, autenticação não implementada e integração externa não configurada.
5. **Código atual:** `09-codigo/src/server.ts` implementa rotas para Opportunity Radar, Seeds, Farmer, Post Machine, briefs/content/approvals/publication/metrics. A autorização atual usa roles locais; `/api/state` é admin; aprovação de publicação exige `targetId`, `targetVersion`, `channel`, `approver` e `scope=publication`.
6. **Tipos atuais:** `09-codigo/src/types.ts` já contém `CharacterBible`, `Profile`, evidências, estados editoriais e `Approval` de publicação; `src/persistence/types.ts` contém collections JSON e `EventRecord`, mas não contém as entidades versionadas do fluxo global.
7. **Developer doc:** `03-arquitetura/developer-doc.md` registra project ID `dfb080ea-5fa2-4924-bccd-8f121c637e6e`, schema `custom_authorityengine`, catálogo/projeto Control Tower e referências de secrets, sem valores reais.

### 6.2 Divergências e classificação

| Tema | Estado atual observado | Contrato global/ADR | Classificação | Ação fora do escopo deste artefato |
|---|---|---|---|---|
| Unidade principal | SQL/código centram oportunidade/profile/farmer profile; global exige Persona/blogs versionados. | Persona é fonte canônica e pode ter vários blogs. | **BLOQUEADOR de implementação** | Definir migration/adapter e revisar MP-000 antes de alterar SQL. |
| Character Bible | Tipo existe dentro de `Profile`; não há tabela/versionamento dedicado no SQL. | Bible é entidade versionada e aprovada. | **FATO + RECOMENDAÇÃO** | Extrair contrato persistente em migration aprovada. |
| Physical Identity Bible | Há campos visuais em `Profile`/FarmerProfile; não há entidade dedicada. | Ficha física detalhada/versionada com metadata de geração. | **BLOQUEADOR** | Especificar schema e migração após Gate. |
| Module runs/generation jobs | Serviços locais geram research/seeds/farmer/post; não há tabela global de runs/jobs. | Todo módulo registra entrada, saída, versão, provider/model/status. | **BLOQUEADOR** | Implementar persistência/orquestração autorizada. |
| Blogs/name/domain | Ausentes no SQL, tipos e rotas atuais. | `authority_blog_projects`, name/domain versions e DNS states. | **BLOQUEADOR** | Contrato e owner externos precisam ser alinhados com Flux/Blogs/Control Tower. |
| Approvals | SQL genérico e API atual são publicação de conteúdo; API exige aprovação específica de publicação. | Central Flux, múltiplos tipos e snapshot integral. | **FATO + DECISÃO de separação** | Não reutilizar aprovação editorial como aprovação de Persona/provisionamento sem adapter explícito. |
| Outbox/events | SQL `events` e `EventRecord` genéricos; sem outbox/inbox. | Outbox Authority + inbox Flux, assinatura, dedupe, retries. | **BLOQUEADOR** | Definir contrato de evento/segurança e migration. |
| Estados | SQL tem estados de oportunidade/perfil/editorial; API declara JSON local; global define estados Persona/blog/job/DNS. | State machine deste ADR. | **FATO + RECOMENDAÇÃO** | Introduzir campos/tabelas de state transition sem quebrar contratos existentes. |
| Ownership/RLS | SQL usa `project_id`/`owner_id` e RLS; API runtime usa principal/roles e JSON store. | Ownership por sistema e APIs/eventos sem cross-table. | **FATO + BLOQUEADOR** | Reconciliar identidade, RLS e tenancy com Control Tower/Flux. |
| Readbacks | API atual tem respostas locais; não há readback remoto de Flux/Blogs/Control Tower demonstrado. | Todo avanço exige readback real. | **BLOQUEADOR externo** | Executar apenas em ambiente autorizado, após contratos/Gates. |
| MP-000 | MP-000 define quatro módulos, Gates G0–G7 e Authority upstream; ainda está `em_revisao_estrutural`. | Global aprovado pede atualização específica dos MP-000. | **FATO** | Sergio deve aprovar a atualização estrutural antes de migrations/integrações. |

### 6.3 Compatibilidade de fase

**DECISÃO:** preservar os contratos existentes de oportunidades, seeds, farmer e post machine como legado/fase de fundação; o fluxo Persona/blog não deve ser simulado mapeando silenciosamente `profiles` para `authority_personas`.  
**RECOMENDAÇÃO:** criar adapter explícito e IDs de correlação entre o pipeline legado (Opportunity Radar → Seeds → Farmer → Post Machine) e o pipeline global de formação (Brief Interpreter → … → Approval Packager).  
**BLOQUEADOR:** sem decisão de compatibilidade/versionamento do MP-000 e do schema, não é seguro afirmar que o SQL atual implementa a matriz global.

## 7. Requisitos de readback por handoff

| Handoff | Quem escreve | Quem lê de volta | Critério objetivo |
|---|---|---|---|
| Authority → Flux: Persona aprovada | Authority/outbox; Flux job | Flux | `persona_id`, `persona_version_id`, Bible IDs, approval ID e event ID persistidos e iguais ao snapshot. |
| Flux → Blogs: binding aprovado | Flux/evento; Blogs API | Flux + Blogs | Blogs retorna binding com `persona_version_id` aprovado e sem acesso SQL direto. |
| Flux → Control Tower: provisionamento | Flux job; Control Tower | Flux | project/schema/config artifact/namespace refs/health são retornados e consultáveis. |
| Control Tower → Flux: DNS/health | Control Tower | Flux | check técnico timestamped, domínio/version e URL health confirmados. |
| Flux → Central: publicação | Flux | Central | pacote integral, approvals, jobs, blockers, receipts e readbacks exibidos; novo dado invalida snapshot. |
| Publicação → Authority | Flux receipt/event | Authority | receipt sanitizado, channel/version e estado final; sem declarar publicado só pela resposta HTTP. |

## 8. Acceptance checklist do F0-STRUCT-001

- [x] Artefato versionado salvo em `02-prd`.
- [x] Persona e PersonaVersion cobertas.
- [x] Character Bible e Physical Identity Bible cobertas.
- [x] Module runs e generation jobs cobertos.
- [x] Blogs, name versions e domain versions cobertos.
- [x] Approvals, outbox events e consumidores cobertos.
- [x] Ownership por Authority, Flux, Blogs e Control Tower coberto.
- [x] Estados, transições e Gates descritos com pré-condições/readbacks.
- [x] Reconciliação com global aprovado, MP-000, SQL e API local registrada.
- [x] Fato, decisão, recomendação e bloqueador rotulados.
- [x] Nenhuma migration, deploy, segredo ou sistema externo alterado.
- [ ] Contratos finais multi-sistema implementados e readback remoto executado — **não é aceite deste artefato; bloqueado por Gate/ambiente**.

## 9. Evidências consultadas

- `F:/Projetos/_FBR/AuthorityEngine/02-prd/GLOBAL-FLOW-AUTHORITY-BLOGS-FLUX-CONTROL-TOWER.md` — briefing global aprovado, status/aprovação nas linhas 1–18; entidades, APIs/eventos, estados, Gates e blockers nos §§5–18.
- `F:/Projetos/_FBR/AuthorityEngine/02-prd/MP-000-foundation.md` — fundação, ownership, quatro módulos, Gates G0–G7 e status `em_revisao_estrutural`.
- `F:/Projetos/_FBR/AuthorityEngine/04-database/001-custom-authorityengine-operational.sql` — contrato SQL local-only, tabelas, checks, índices e RLS atuais.
- `F:/Projetos/_FBR/AuthorityEngine/03-arquitetura/api-contract-v0.1.md` — contrato HTTP v0.1 e limitações declaradas.
- `F:/Projetos/_FBR/AuthorityEngine/09-codigo/src/server.ts` — rotas e autorização efetivamente implementadas localmente.
- `F:/Projetos/_FBR/AuthorityEngine/09-codigo/src/types.ts` — tipos de CharacterBible/Profile/Approval/evidências/editorial.
- `F:/Projetos/_FBR/AuthorityEngine/09-codigo/src/persistence/types.ts` — collections/event record/persistence store atuais.
- `F:/Projetos/_FBR/AuthorityEngine/03-arquitetura/developer-doc.md` — project/schema/Control Tower e política de secrets por referência.

## 10. Blockers de encerramento estrutural

1. **BLOQUEADOR:** contratos finais de API/eventos entre Authority, Flux, Blogs e Control Tower não estão implementados nem validados remotamente.
2. **BLOQUEADOR:** schema atual não contém as entidades globais dedicadas de Persona/blog/name/domain/run/job/outbox; qualquer migration exige revisão e Gate de Sergio.
3. **BLOQUEADOR:** mecanismo de assinatura/autenticação do evento e identidade compartilhada dos consumidores ainda não foram definidos.
4. **BLOQUEADOR:** readback remoto de Control Tower/Flux/Blogs não foi executado nesta tarefa e não deve ser inventado.
5. **BLOQUEADOR:** MP-000 específico ainda está em revisão estrutural; este ADR não o marca como aprovado.

**Próxima decisão recomendada:** Sergio aprovar/reprovar este contrato lógico e nomear owners dos contratos externos; somente depois abrir tarefa separada para schema/API/eventos, com migration plan, RLS, testes de contrato e readback autorizado.
