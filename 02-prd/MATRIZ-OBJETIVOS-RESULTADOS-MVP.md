# Matriz Objetivo → Resultado → Tela → API → Tabela (MVP-S0-001 & MVP-S0-002)

**Projeto:** FBR Authority Engine  
**Versão:** 1.0.0 (MVP)  
**Data:** 2026-09-22  
**Status:** `CONCLUIDO_VALIDADO`

---

## 1. Mapeamento dos 9 Resultados do MVP

| # | Resultado Esperado do PRD | Telas / Superfícies | Endpoints de API | Tabelas / Coleções | Gate Associado | DoD / Critério de Aceite |
|---|---|---|---|---|---|---|
| **R1** | **Fluxo local e runtime autorizado** | Shell `/dashboard`, `/setup`, `/select-tenant` | `GET /health`, `GET /api/info`, `GET /api/state`, `POST /api/setup` | `tenants`, `memberships`, `setup_state` | **G1 — Sessão & Tenant** | Runtime prova identidade, isolamento `fbr-agency` e ausência de provedor externo sem configuração. |
| **R2** | **Oportunidade qualificada com evidência e Dossier** | Audience Radar, Opportunity Dossier, Evidence Ledger | `POST /api/research-briefs`, `POST /api/research-briefs/:id/run`, `GET /api/opportunities/:id/dossier`, `POST /api/opportunities/:id/qualify` | `events`, `opportunities`, `evidence` | **G4 — Qualificação de Oportunidade** | Nenhuma oportunidade é qualificada sem evidência persistida e score explicável por fatores. |
| **R3** | **Seeds geradas por LLM e comparadas** | Seeds Creator, Comparison Pack | `GET /api/seeds/prompt`, `POST /api/seeds/generate`, `POST /api/seeds/compare` | `seeds`, `llm_runs` | **G5 — Geração de Seeds** | 3–6 sementes estruturadas com arquétipos Mentor, limites, monetização e visual identity. |
| **R4** | **Decisão formal e Persona desenvolvida (Farmer)** | Workspace Farmer, Persona Details | `POST /api/seeds/select`, `POST /api/personas`, `POST /api/personas/:id/generate` | `events (formation)`, `personas`, `persona_versions` | **G6 — Formação de Persona** | Persona vinculada à Seed selecionada com Character Kit e Physical/Visual Identity. |
| **R5** | **Documento-Mestre de Marca e Blog como ativo** | Workspace Marca/Blog, Approval Pack | `GET /api/personas/:id/read-model`, `POST /api/personas/:id/approval-pack` | `persona_artifacts`, `approval_packages` | **G6 — Brand Master & Blog** | Blog existe como ativo próprio vinculado à Persona; publicação remota permanece bloqueada. |
| **R6** | **Calendário editorial e pautas preliminares** | Calendário Editorial, Content Briefs | `POST /api/briefs`, `GET /api/editorial-calendar` | `briefs`, `editorial_calendar` | **G7 — Pauta Editorial** | Pautas estruturadas com público, pilar, formato e validação de claims antes do draft. |
| **R7** | **Drafts gerados e revisados por Sergio** | Editor de Drafts, Review Queue | `POST /api/content`, `POST /api/content/:id/review`, `POST /api/approvals` | `content`, `approvals` | **G7 — Revisão Humana de Conteúdo** | Drafts incorporam voz e claims; todo draft termina em revisão humana obrigatória; publicação direta bloqueada. |
| **R8** | **Métricas pré-publicação e observabilidade** | Dashboard Metrics, Control Room | `POST /api/metrics`, `GET /api/feedback`, `GET /api/jobs` | `metrics`, `feedback`, `jobs` | **G8 — Métricas & Feedback** | Métricas insuficientes são rotuladas (`DEMO / FAKE`); feedback fecha ciclo com o Radar. |
| **R9** | **Histórico operacional imutável e auditável** | Audit Ledger, Decision Ledger | `GET /api/audit-events`, `GET /api/decisions` | `events`, `decisions` | **G8 — Auditoria & Governança** | Registro append-only com actor, tenant, correlação e integridade imutável. |

---

## 2. Catálogo de Escopo: Incluído no MVP vs Bloqueado

### Escopo Incluído (Obrigatório para o Aceite do MVP)
- ✅ Shell autenticado com isolamento multi-tenant (`fbr-agency`) e RBAC server-side (`admin`, `operator`, `reviewer`, `publisher`, `viewer`).
- ✅ Onboarding `/setup` com persistência de metas editoriais e status de readiness.
- ✅ Registries de Parceiros e Fontes de pesquisa com mascaramento de `secret_ref` e teste de health fail-closed.
- ✅ Intake de pesquisa com Research Briefs, Research Runs determinísticos (rotulados `DEMO / FAKE`) e Evidence Ledger.
- ✅ Opportunity Radar e Dossier com score explicável por 7 dimensões.
- ✅ Geração estruturada de Seeds por LLM com Comparison Pack e Decisão Humana formal.
- ✅ Profile Building / Farmer com Character Kit, Physical Identity, Sistema Editorial e Approval Pack.
- ✅ Post Machine com Calendário Editorial, Briefing de Conteúdo, Editor de Drafts e Review Queue humana.
- ✅ Jobs duráveis com heartbeat, Decision Ledger, Audit Ledger e Dashboard consolidado.
- ✅ Suíte de testes unitários, testes de contrato e harness E2E fake.

### Escopo Bloqueado (Fora do MVP / Fail-Closed)
- ⛔ **Publicação automática ou assistida em produção**: bloqueada até Gate específico e adapter real configurado.
- ⛔ **Disparo ativo de e-mails**: bloqueado.
- ⛔ **Conexão LIVE com Amazon e marketplaces externos**: bloqueada sem contrato/credencial e Gate do Sergio.
- ⛔ **Automação de browser não autorizada**: fora do escopo do produto.
- ⛔ **Criação automatizada de contas e evasão**: fora do produto.
- ⛔ **Mídia paga e integração de AdSense**: bloqueadas.
- ⛔ **Workers de escala assíncrona distribuída**: não aplicável ao MVP local.
- ⛔ **Migrations remotas automáticas em banco de produção**: bloqueadas.
