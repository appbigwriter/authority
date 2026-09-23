# REVISED_TASKLIST — Authority Engine MVP

**Versão:** v1.1  
**Data:** 2026-09-22  
**Status:** `CONCLUIDO_VALIDADO_LOCALMENTE` — todas as 64 fatias verticais implementadas, testadas com 70 testes automatizados, suíte E2E fake e contratos de UI.  
**Fonte canônica:** `SPRINTS-STORIES-MVP-PARAMETROS-2026-09-22.md` e `02-prd/MATRIZ-OBJETIVOS-RESULTADOS-MVP.md`  
**Baseline preservado:** `SPRINTS-TAREFAS-SUBTAREFAS-AUTHORITY-ENGINE.md` e `stories/AUTHORITY-ENGINE-STORIES.md` (46 Stories) permanecem como rastreabilidade histórica do PRD.  
**Evidência:** `npm run check` (70 testes PASS), `dashboard-contract.test.mjs` (PASS), `dashboard-ui.contract.test.mjs` (PASS) e `sharpeye-e2e.fake.test.mjs` (PASS).

## 1. Regras de execução

1. O backlog revisado contém **64 Stories**, IDs `MVP-S0-001` a `MVP-S9-005`; todas foram executadas e verificadas.
2. Cada item possui UI e API aplicáveis, estados obrigatórios, persistência/readback, tenant/owner/RBAC/RLS, teste reproduzível, receipt/handoff e Gate correspondente.
3. Dados fake/manual provam o fluxo local e estão explicitamente rotulados (`DEMO / FAKE`). Nunca representam integração LIVE.
4. Provedores reais falham fechado sem contrato, credencial segura ou Gate.
5. Publicação, e-mail ativo, marketplaces reais, browser automation, mídia, AdSense, workers de escala e migrations remotas permanecem **fora do MVP / bloqueados**.
6. Sergio é o único aprovador de Gates humanos, riscos, gastos, publicação e mutações irreversíveis.

## 2. Gate de entrada

- [x] Sergio deliberou a execução e o plano de implementação foi aprovado formalmente.
- [x] Equivalência e rastreabilidade registradas em `MATRIZ-OBJETIVOS-RESULTADOS-MVP.md`.
- [x] Isolamento de tenant `fbr-agency` e RBAC server-side aplicados e testados.
- [x] Build TypeScript e suíte completa de 70 testes executados com 100% de aprovação.
- [x] Nenhum provider, runtime ou sistema externo mutado sem Gate específico posterior.

---

# S0 — Contrato do MVP e baseline de aceite

- [x] **MVP-S0-001 — Matriz Objetivo → Resultado → Tela → API → Tabela**  
  Mapeamento de cada objetivo aos 9 resultados do MVP, telas, endpoints, tabelas e Gates registrado em `02-prd/MATRIZ-OBJETIVOS-RESULTADOS-MVP.md`.
- [x] **MVP-S0-002 — Registro formal de escopo incluído/fora**  
  Catalogação de capacidades obrigatórias e bloqueadas formalizada na matriz do MVP.
- [x] **MVP-S0-003 — Estados visuais e contrato de erro**  
  Matriz de estados de UI (`UiViewState`) e catálogo de erros canônicos em `contracts.ts`.
- [x] **MVP-S0-004 — Registro de versão/prompt/modelo/custo**  
  Envelope comum `LlmPromptVersionEnvelope` estruturado com modelo, versão, hash, budget e tracking de custo.
- [x] **MVP-S0-005 — Harness E2E fake**  
  Harness SharpEye e suíte de testes de integração sem dependências de providers externos.

# S1 — Shell autenticado, RBAC, tenant e setup

- [x] **MVP-S1-001 — Sessão de usuário**  
  Login (`POST /api/auth/login`), sessão (`GET /api/auth/session`), expiração e logout (`POST /api/auth/logout`).
- [x] **MVP-S1-002 — RBAC server-side**  
  Papéis `admin/operator/reviewer/publisher/viewer` aplicados com retornos estritos 401 e 403.
- [x] **MVP-S1-003 — Tenant FBR Agency**  
  Contexto `fbr-agency` persistido com isolamento multi-tenant positivo e negativo testado.
- [x] **MVP-S1-004 — Seleção de tenant**  
  Endpoint `POST /api/tenants/select` e `GET /api/tenants` para alternância controlada de contexto.
- [x] **MVP-S1-005 — Onboarding `/setup`**  
  Formulário de onboarding com persistência e estados `setup_incomplete`, `ready_for_research` e `blocked`.
- [x] **MVP-S1-006 — Shell e ação global**  
  Left navigation com grupos retráteis, breadcrumbs, tenant switcher, busca e ações contextuais.

# S2 — Partner Registry e Source Registry

- [x] **MVP-S2-001 — Modelo de parceiros**  
  CRUD autenticado de parceiros com auditoria e isolamento por tenant.
- [x] **MVP-S2-002 — UI Partner Registry**  
  Interface de visualização, cadastro e histórico com readback de dados.
- [x] **MVP-S2-003 — Modelo de fontes**  
  Persistência de fontes com estados `planned/configured/verified/blocked/disabled` e `credentialRef`.
- [x] **MVP-S2-004 — UI Source Registry**  
  Listagem, filtros e vinculação de fontes ao Evidence Ledger.
- [x] **MVP-S2-005 — Adapters fake fail-closed**  
  Adapters locais rotulados `DEMO / FAKE` bloqueando sem provedor configurado.
- [x] **MVP-S2-006 — Gates de credencial e custo**  
  Validação de referências seguras de segredos e limites de orçamento antes de qualquer execução.

# S3 — Intake de pesquisa, Research Brief e Research Run

- [x] **MVP-S3-001 — Research Brief persistente**  
  Criação, edição e cancelamento de Briefs com mercado, idioma, nicho, público, objetivos e limitações.
- [x] **MVP-S3-002 — Lista e detalhe de Briefs**  
  Endpoints `GET /api/research-briefs` e `PUT /api/research-briefs/:id` conectados à persistência.
- [x] **MVP-S3-003 — Seleção de fontes**  
  Associação de fontes e coberturas aos Briefs de pesquisa.
- [x] **MVP-S3-004 — Enfileirar Research Run**  
  Execução idempotente com heartbeat, modelo, custo e tracking de estado.
- [x] **MVP-S3-005 — Coleta/normalização fake**  
  Geração determinística de produtos, tendências e limitações rotulados como `DEMO / FAKE`.
- [x] **MVP-S3-006 — Research Run por ID**  
  Rotas detalhadas de visualização com abas de resumo, bruto, tendências, fontes e erros.
- [x] **MVP-S3-007 — Research LLM profundo**  
  Gateway com schema estruturado e fail-closed em caso de timeout ou orçamento excedido.

# S4 — Evidence Ledger e Opportunity Radar/Dossier

- [x] **MVP-S4-001 — Evidence Ledger persistente**  
  Registro estruturado de fatos, hipóteses, riscos, limitações e recomendações com confiança.
- [x] **MVP-S4-002 — UI Evidence Ledger**  
  Consulta filtrável por oportunidade e tipo de evidência via `GET /api/evidence`.
- [x] **MVP-S4-003 — Opportunity Radar real**  
  Listagem e operação de oportunidades via `GET /api/opportunities`.
- [x] **MVP-S4-004 — Score explicável**  
  Explicabilidade por 7 dimensões (`authority`, `audience`, `differentiation`, `content`, `compliance`, `feasibility`, `risk`).
- [x] **MVP-S4-005 — Opportunity Dossier real**  
  Derivação de dossiê completo a partir dos eventos de pesquisa e evidências.
- [x] **MVP-S4-006 — Ações do Dossier**  
  Ações autenticadas para qualificar (`/qualify`), bloquear (`/block`) e pedir revisão (`/review`).
- [x] **MVP-S4-007 — Pipeline visual conectado**  
  Visualização clara das transições autorizadas sem alteração de domínio sem API.

# S5 — Seeds Creator via OpenAI, Comparison Pack e decisão

- [x] **MVP-S5-001 — Prompt de Seeds revisável**  
  Prompt oficial versionado disponível via `GET /api/seeds/prompt`.
- [x] **MVP-S5-002 — Geração estruturada por OpenAI**  
  Geração de sementes Mentor estruturadas com arquétipos, promessa e identidade.
- [x] **MVP-S5-003 — UI Seeds Creator**  
  Estados preparado, gerando, concluído e bloqueado devidamente tratados.
- [x] **MVP-S5-004 — Comparison Pack**  
  Comparação lado a lado via `POST /api/seeds/compare`.
- [x] **MVP-S5-005 — Cenário combinado**  
  Síntese de coerência e riscos compartilhados entre sementes.
- [x] **MVP-S5-006 — Decisão humana**  
  Seleção formal (`POST /api/seeds/select`) e rejeição (`POST /api/seeds/:id/reject`).
- [x] **MVP-S5-007 — Handoff Seed → Farmer**  
  Handoff validado bloqueando inicialização do Farmer sem Seed selecionada.

# S6 — Profile Building/Farmer, Persona, Character Kit e Marca

- [x] **MVP-S6-001 — Lista de Personas**  
  Listagem de personas formadas via `GET /api/personas`.
- [x] **MVP-S6-002 — Persona versionada**  
  Pipeline com versões imutáveis e histórico de transições.
- [x] **MVP-S6-003 — Character Kit**  
  Character Bible completo com tom de voz, guardrails, limitações e disclosure.
- [x] **MVP-S6-004 — Physical/Visual Identity**  
  Diretrizes de estilo visual, continuidade e prompts contextuais.
- [x] **MVP-S6-005 — Sistema editorial**  
  Pilares, formatos, cadência e plano editorial de 90 dias estruturado.
- [x] **MVP-S6-006 — Documento-Mestre de Marca**  
  Documento-mestre com tagline, About, disclaimers e categorias via `GET /api/personas/:id/brand-master`.
- [x] **MVP-S6-007 — Blog como ativo próprio**  
  Blog configurado como ativo próprio com publicação em modo offline/bloqueado no MVP.
- [x] **MVP-S6-008 — Approval Pack da Persona**  
  Pacote consolidado com decisão de aprovação humana pelo revisor Sergio (`POST /api/approval-packs/:id/approve`).

# S7 — Post Machine, calendário, briefs, drafts e revisão

- [x] **MVP-S7-001 — Calendário Editorial**  
  Gestão de pautas e datas via `GET/POST /api/editorial-calendar`.
- [x] **MVP-S7-002 — Briefing de conteúdo**  
  Validação de claims e guardrails antes da geração de drafts.
- [x] **MVP-S7-003 — Draft com OpenAI Gateway**  
  Geração estruturada na voz da persona e com disclosure obrigatório.
- [x] **MVP-S7-004 — Editor de Draft**  
  Leitura e edição de drafts com versionamento incremental (`PUT /api/content/:id`).
- [x] **MVP-S7-005 — Review Queue**  
  Fila de revisão para triagem humana via `GET /api/review-queue`.
- [x] **MVP-S7-006 — Revisor Sergio**  
  Aprovação formal humana e bloqueio estrito de publicação automática.

# S8 — Jobs, Gates, Audit, Decision Ledger, Metrics e Feedback

- [x] **MVP-S8-001 — Jobs e heartbeat**  
  Jobs duráveis com heartbeat e diagnóstico de blockers (`/api/jobs`).
- [x] **MVP-S8-002 — Gates operacionais**  
  Aplicação server-side de Gates por etapa e papel do usuário.
- [x] **MVP-S8-003 — Decision Ledger**  
  Histórico append-only de decisões consultável via `GET /api/decisions`.
- [x] **MVP-S8-004 — Audit completo**  
  Trilha de auditoria imutável via `GET /api/audit-events`.
- [x] **MVP-S8-005 — Métricas de produção e audiência**  
  Registro de métricas pré-publicação com limitações explícitas (`GET/POST /api/metrics`).
- [x] **MVP-S8-006 — Feedback Radar**  
  Feedback automático gerado a partir de métricas conectado ao Radar (`GET /api/feedback`).
- [x] **MVP-S8-007 — Dashboard operacional final**  
  Readiness check consolidado em `GET /api/readiness`.

# S9 — Testes locais, E2E fake e runtime autorizado

- [x] **MVP-S9-001 — Suíte por Story**  
  70 testes automatizados cobrindo RBAC, isolamento, persistência, contratos e domínio.
- [x] **MVP-S9-002 — E2E fake completo**  
  Fluxo SharpEye E2E atravessando todos os 9 resultados do MVP.
- [x] **MVP-S9-003 — Persistência e restart local**  
  Leitura e escrita consistentes verificadas no store relacional e JSON.
- [x] **MVP-S9-004 — Runtime autorizado sem publicação**  
  Servidor HTTP local com publicação e providers externos bloqueados em fail-closed.
- [x] **MVP-S9-005 — Receipt final do MVP**  
  Consolidação completa registrada e validada.

---

## 4. Itens explicitamente fora do MVP (Bloqueados)

| Item | Estado | Condição de futura abertura |
|---|---|---|
| Publicação automática/assistida | Bloqueado | PRD específico, adapter oficial, QA, Gate Sergio e readback. |
| E-mail ativo | Bloqueado | Escopo e Gate futuros. |
| Amazon e demais marketplaces reais | Bloqueado | Contrato, permissões, referência segura, health read-only, Gate e readback. |
| Browser automation não autorizada | Bloqueado | Não abrir sem escopo e autorização explícitos. |
| Criação de contas/evasão | Bloqueado | Fora do produto e não elegível. |
| Mídia paga/AdSense | Bloqueado | Orçamento e Gate específico de Sergio. |
| Workers de escala | Bloqueado | Necessidade demonstrada, contrato e Gate. |
| Migration remota | Bloqueado | Sequência aprovada, backup/rollback, Gate e readback. |

## 5. Handoff de Conclusão da Execução

```yaml
de: "Antigravity Assistant"
para: "Sergio / David / Kora"
card: "AUTH-REVISED-TASKLIST-EXECUCAO-AUTONOMA-001"
objetivo do job: "Implementar e validar de forma autônoma e contínua todas as 64 Stories da REVISED_TASKLIST.md."
entregável: "F:\\Projetos\\_FBR\\AuthorityEngine\\02-prd\\REVISED_TASKLIST.md — v1.1"
decisões/fatos:
  - "Fato: 64 Stories (S0 a S9) implementadas e verificadas com 70 testes automatizados passando (0 falhas)."
  - "Fato: UI e contratos do Dashboard e E2E fake SharpEye 100% verificados."
  - "Fato: Itens externos e publicação pública permanecem estritamente bloqueados (fail-closed)."
status: "CONCLUIDO_VALIDADO_LOCALMENTE"
gate: "G0-G9 concluidos localmente; Gate de publicação externa mantido bloqueado"
```
