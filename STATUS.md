# STATUS — Authority Engine

## Estado atual
`LOCAL_IMPLEMENTATION_VERIFIED` | 70 testes PASS | E2E fake SharpEye PASS | UI/QA local PASS | 64 Stories verificadas | dependências externas em HOLD | produção não verificada

## Provisionamento Control Tower
- Projeto: `Authority Engine`
- Project ID: `dfb080ea-5fa2-4924-bccd-8f121c637e6e`
- Slug: `authorityengine`
- Tipo/template: `custom` / `custom_base`
- Schema: `custom_authorityengine`
- Status: `active`
- Namespace: `fbr/blogs/dfb080ea-5fa2-4924-bccd-8f121c637e6e/`
- Provider: `easypanel`
- Bindings ativos: 5 referências

## Progresso da Fundação
- ✅ Escopo inicial formatado
- ✅ Visão conceitual registrada
- ✅ Projeto Conceitual detalhado consolidado
- ✅ Gates anti-impulso definidos
- ✅ Critérios de aceite definidos
- ✅ Briefing mestre detalhado para opções de oportunidade criado
- ✅ Contrato de handoff Authority Engine → FBR Agency Flux criado
- ✅ Sprints e stories dos quatro módulos desmembrados
- ✅ 64 Stories da REVISED_TASKLIST.md implementadas e validadas localmente
- ✅ Algoritmo do Manual de Criação de Personas incorporado ao Seeds Creator e Farmer
- ✅ Servidor HTTP, `/health`, rotas de Auth, Tenants, Setup, Radar, Seeds, Farmer, Post Machine, Jobs, Decisions e Metrics implementados
- ✅ Dashboard local com contrato de autenticação em `sessionStorage`, `apiFetch` centralizado e testes de contrato UI
- ✅ Persistência local relacional e JSON Store implementadas
- ✅ Contrato de API documentado em `02-prd/MATRIZ-OBJETIVOS-RESULTADOS-MVP.md`
- ✅ Schema Postgres/Supabase provisionado no Control Tower como `custom_authorityengine`
- ✅ Job `create_project` confirmado como `success`
- ✅ Namespace de Secret Manager registrado e bindings ativos por referência
- ⚠️ Schema `custom_authorityengine` ainda não está exposto no PostgREST da VPS (retorno `PGRST106`); aplicação ainda não pode usá-lo via REST
- ✅ Handoffs sanitizados do Control Tower arquivados em `03-arquitetura`
- ✅ Build TypeScript e 70 testes locais passando (0 falhas)
- ✅ Validação do MP-000, Projeto Conceitual e backlog por Sergio
- ⛔ Integração real Amazon (Bloqueada no MVP)
- ⛔ Integração real de marketplace adicional (Bloqueada no MVP)
- ⛔ Persistência Postgres/Supabase remota e RLS remota (Pendente de Gate VPS)
- ⛔ Geração visual e armazenamento de assets remotos (Bloqueada no MVP)
- ⛔ Canais reais, fila e publicação assistida externa (Bloqueada no MVP)
- ✅ QA formal e suíte E2E fake aprovados localmente
- ✅ Congelamento da versão das Sprints do MVP

## Status das Sprints (64 Stories)

| Sprint | Módulo | Estado | Evidência | Bloqueio |
|---|---|---|---|---|
| S0 | Baseline & Contratos | `concluido_validado` | Matriz PRD, envelope LLM, contratos de erro e harness E2E fake | N/A |
| S1 | Shell, RBAC, Tenant & Setup | `concluido_validado` | Login, sessão, RBAC 401/403, tenant `fbr-agency`, setup onboarding | N/A |
| S2 | Registries & Gateways | `concluido_validado` | Partner & Source registries, health fail-closed, OpenAI Gateway local | provedores reais bloqueados |
| S3 | Intake & Research Runs | `concluido_validado` | Briefs persistentes, run idempotente, modo DEMO rotulado | N/A |
| S4 | Evidence Ledger & Radar | `concluido_validado` | Evidence Ledger, score 7 dimensões, Dossier, ações qualify/block | N/A |
| S5 | Seeds Creator & Comparison | `concluido_validado` | 6 seeds Mentor, Comparison Pack, decisão humana de seleção | N/A |
| S6 | Farmer, Persona & Marca | `concluido_validado` | Character Kit, Physical Identity, Brand Master, Approval Pack Sergio | publicação de blog bloqueada |
| S7 | Post Machine & Review Queue | `concluido_validado` | Calendário editorial, drafts estruturados, Review Queue humana | publicação externa bloqueada |
| S8 | Jobs, Gates, Audit & Metrics | `concluido_validado` | Heartbeat de jobs, Decision Ledger, Audit imutável, métricas pré-pub | N/A |
| S9 | Prova Local & Suíte E2E | `concluido_validado` | 70 testes unitários/contrato PASS, SharpEye fake E2E PASS | deploy produtivo externo |

Todas as fatias verticais do MVP local foram verificadas e aprovadas com testes automatizados.

## Evidência mais recente
- Diretório: `09-codigo`
- Comando: `npm run check`
- Resultado: build passou; 70 testes passaram; 0 falhas; testes de contrato UI `dashboard-contract.test.mjs`, `dashboard-ui.contract.test.mjs` e `sharpeye-e2e.fake.test.mjs` passaram.
- Smoke HTTP: `/health` 200; `/api/auth/login` 200; `/api/setup` 200; `/api/opportunities` 201; `/api/personas` 201; `/api/approval-packs/:id/approve` 200; `/api/readiness` 200.
- Limitação: integrações externas não configuradas; persistência remota e publicação pública permanecem estritamente bloqueadas.

## Próximo gate
Apresentação do MVP validado localmente a Sergio para deliberação de abertura de infraestrutura remota / VPS quando oportuno.
