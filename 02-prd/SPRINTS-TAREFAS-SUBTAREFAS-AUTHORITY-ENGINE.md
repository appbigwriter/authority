# Backlog Mestre — Sprints, Tarefas e Subtarefas do Authority Engine

**PRD de origem:** `02-prd/PRD-AUTHORITY-ENGINE-IMPLEMENTACAO.md`  
**Estado:** planejado; execução depende da revisão final do backlog e abertura do Sprint 0  
**Piloto:** SharpEye · by Nadia Volkova  
**Stack:** Next.js/TypeScript/Tailwind, Postgres/Supabase, OpenAI API  
**Regra:** nenhum item abaixo é considerado implementado apenas por estar planejado.

---

## 0. Regras do backlog

- Sprints executadas em ordem de dependência.
- Tarefas podem ter subtarefas paralelas quando não houver dependência real.
- Cada tarefa precisa de evidência própria.
- Cada sprint possui Gate de saída.
- Fake adapters validam somente domínio/contrato local.
- Integrações reais permanecem bloqueadas sem contrato, credencial, autorização e readback.
- Nenhuma publicação, gasto, criação de conta, migration remota ou deploy ocorre automaticamente.
- Farmer e Post Machine são fases sequenciais do mesmo módulo Profile Building.
- O dashboard operacional deve mostrar owner, status, heartbeat, artefato, blocker e próxima ação.
- Uma tarefa só pode ser `concluída` após seus critérios de aceite e evidência serem verificados.

---

## 1. Grafo macro de execução

```text
S0 Fundação e contratos
  ├── S1 Identidade, multi-tenant, RBAC e shell
  ├── S2 Partner Registry e OpenAI Gateway
  │     ├── S3 Opportunity Radar
  │     │     └── S4 Seeds Creator
  │     │           └── S5 Profile Building / Farmer
  │     │                 └── S6 Profile Building / Post Machine
  │     └── S7 Dashboard e telas operacionais
  └── S8 Auditoria, métricas, feedback e observabilidade
                              ↓
                    S9 E2E SharpEye e hardening
                              ↓
                    S10 Gates de integração real
```

### Paralelismo permitido

- S1, S2 e parte de S8 podem iniciar após S0.
- S3 depende de S2 para fontes, mas pode usar fake após S0.
- S7 pode começar com contratos estáveis de S0/S1 e fixtures.
- S4 depende do contrato de Opportunity Dossier de S3.
- S5 depende do contrato de Seed selecionada de S4.
- S6 depende da saída aprovada de S5.
- S9 depende de todos os módulos locais e da suíte integrada.
- S10 somente após Gates externos específicos.

---

# SPRINT S0 — Fundação, contratos e governança

**Objetivo:** transformar o PRD aprovado em contratos técnicos estáveis antes de implementar módulos.

**Dependências:** aprovação do PRD.  
**Owner provável:** David/arquitetura.  
**Saída:** contratos, decisões, schema inicial e Definition of Done.

## S0-T01 — Reconciliar documentação e escopo

### Subtarefas

- S0-T01-S01: comparar Projeto Conceitual, MP-000, PRD e briefing SharpEye.
- S0-T01-S02: listar divergências de nomenclatura, estados, entidades e ownership.
- S0-T01-S03: confirmar `Persona + Marca Editorial` como unidade canônica.
- S0-T01-S04: confirmar Profile Building com fases Farmer → Post Machine.
- S0-T01-S05: criar matriz de decisões, hipóteses, bloqueios e dependências.
- S0-T01-S06: registrar decisões de Sergio sem converter hipótese em fato.

**Aceite:** matriz aprovada e nenhuma fronteira de módulo ambígua.  
**Evidência:** matriz de reconciliação e receipt.

## S0-T02 — Contratos de domínio

### Subtarefas

- S0-T02-S01: definir IDs, versões, timestamps e `tenant_id`.
- S0-T02-S02: definir contratos Research Brief, Evidence, Opportunity Dossier e Seed.
- S0-T02-S03: definir contratos Persona, Brand, Character Kit e Approval Pack.
- S0-T02-S04: definir Content Brief, Draft, Review Decision, Metric e Feedback.
- S0-T02-S05: definir estados e transições permitidas.
- S0-T02-S06: definir códigos de erro e bloqueio.
- S0-T02-S07: definir eventos e envelopes idempotentes.

**Aceite:** contratos têm exemplos de request/response e casos inválidos.  
**Evidência:** schemas/tipos e testes de contrato.

## S0-T03 — Definition of Done e Gates

### Subtarefas

- S0-T03-S01: definir DoD de tarefa.
- S0-T03-S02: definir DoD de sprint.
- S0-T03-S03: mapear Gates G0–G10 para rotas e telas.
- S0-T03-S04: definir evidência mínima por Gate.
- S0-T03-S05: definir critérios de reabertura de tarefa.

**Gate S0:** contratos, estados, Gates e ownership aprovados.

---

# SPRINT S1 — Identidade, multi-tenant, RBAC e shell

**Objetivo:** criar a base segura do sistema e o shell visual usando o design system atual.

**Dependências:** S0.  
**Owner provável:** backend + frontend.

## S1-T01 — Tenants e usuários

### Subtarefas

- S1-T01-S01: criar modelo de tenants.
- S1-T01-S02: criar usuários, papéis e memberships.
- S1-T01-S03: criar contexto server-side de tenant.
- S1-T01-S04: implementar seleção de tenant para usuários com múltiplos acessos.
- S1-T01-S05: testar isolamento positivo e negativo.

## S1-T02 — Autenticação e RBAC

### Subtarefas

- S1-T02-S01: implementar login e sessão.
- S1-T02-S02: implementar recuperação/bloqueio de acesso.
- S1-T02-S03: proteger rotas server-side.
- S1-T02-S04: implementar matriz de papéis.
- S1-T02-S05: testar 401, 403, ownership e tenant incorreto.

## S1-T03 — RLS e persistência base

### Subtarefas

- S1-T03-S01: definir schema base.
- S1-T03-S02: criar RLS por tenant e owner.
- S1-T03-S03: criar migrations locais idempotentes.
- S1-T03-S04: criar adapter relacional e fake adapter.
- S1-T03-S05: testar read/write/restart local.
- S1-T03-S06: separar explicitamente fake de produção.

## S1-T04 — Shell visual atual

### Subtarefas

- S1-T04-S01: preservar layout atual do dashboard.
- S1-T04-S02: preservar menu lateral esquerdo e componentes visuais existentes.
- S1-T04-S03: implementar topbar, tenant ativo, usuário, busca e notificações.
- S1-T04-S04: implementar breadcrumbs e estados de carregamento/erro/vazio.
- S1-T04-S05: implementar navegação protegida.
- S1-T04-S06: validar responsividade sem alterar o design system.

**Gate S1:** login, tenant, RBAC, RLS local e shell passam testes de segurança e UI.

---

# SPRINT S2 — Partner Registry, Source Registry e OpenAI Gateway

**Objetivo:** criar a camada configurável para múltiplos parceiros, fontes e LLM.

**Dependências:** S0 e S1.  
**Owner provável:** backend/infrastructure.

## S2-T01 — Partner Registry

### Subtarefas

- S2-T01-S01: modelar partners e partner programs.
- S2-T01-S02: cadastrar Amazon Seller.
- S2-T01-S03: cadastrar Amazon Associates.
- S2-T01-S04: cadastrar TikTok Shop.
- S2-T01-S05: cadastrar ClickBank.
- S2-T01-S06: cadastrar BuyGoods, MaxWeb e Digistore24.
- S2-T01-S07: cadastrar SellHealth, MarketHealth, NutriProfits e MoreNiche.
- S2-T01-S08: implementar status planned/configured/verified/blocked/disabled.
- S2-T01-S09: implementar telas de listagem, adição, edição e histórico.

## S2-T02 — Source Registry

### Subtarefas

- S2-T02-S01: modelar fontes e contratos.
- S2-T02-S02: registrar endpoint/origem, versão, escopo e limites.
- S2-T02-S03: implementar referência de credencial sem exibir segredo.
- S2-T02-S04: implementar health check fail-closed.
- S2-T02-S05: registrar limitações e última verificação.
- S2-T02-S06: implementar bloqueio/desativação.

## S2-T03 — OpenAI Gateway

### Subtarefas

- S2-T03-S01: criar gateway server-side.
- S2-T03-S02: configurar referência segura da API key.
- S2-T03-S03: registrar modelo, prompt version e schema version.
- S2-T03-S04: validar JSON Schema de saída.
- S2-T03-S05: registrar tokens, custo, latência e status.
- S2-T03-S06: implementar retry limitado e erro explícito.
- S2-T03-S07: criar orçamento/limite por tenant.
- S2-T03-S08: criar logs sanitizados.
- S2-T03-S09: criar evals iniciais para SharpEye.

**Gate S2:** parceiros podem ser cadastrados, fontes podem falhar fechado e o OpenAI Gateway produz output versionado sem expor segredo.

---

# SPRINT S3 — Opportunity Radar

**Objetivo:** transformar pesquisas em oportunidades qualificadas e rastreáveis.

**Dependências:** S1 e S2.  
**Owner provável:** backend + research/domain.

## S3-T01 — Research Brief

### Subtarefas

- S3-T01-S01: criar formulário de briefing.
- S3-T01-S02: validar mercado, idioma, nicho, público e objetivo.
- S3-T01-S03: vincular produtos próprios e parceiros.
- S3-T01-S04: salvar versões.
- S3-T01-S05: implementar listagem, filtros e detalhe.

## S3-T02 — Research Run

### Subtarefas

- S3-T02-S01: criar job de pesquisa.
- S3-T02-S02: implementar fake adapter determinístico.
- S3-T02-S03: implementar adapter manual/import.
- S3-T02-S04: implementar adapter configurável fail-closed.
- S3-T02-S05: registrar modo LIVE/MANUAL/PARTNER_FEED/DEMO/MIXED.
- S3-T02-S06: persistir raw records e limitações.
- S3-T02-S07: exibir progresso, erro e heartbeat.

## S3-T03 — Evidence Ledger

### Subtarefas

- S3-T03-S01: criar modelo de evidência.
- S3-T03-S02: relacionar evidência a produto, tendência, oportunidade e conteúdo.
- S3-T03-S03: implementar tipos fato/hipótese/recomendação/risco/bloqueio/decisão.
- S3-T03-S04: implementar confiança e validade temporal.
- S3-T03-S05: criar tela de consulta e filtros.

## S3-T04 — Normalização e tendências

### Subtarefas

- S3-T04-S01: normalizar produto, preço, moeda, disponibilidade e timestamp.
- S3-T04-S02: deduplicar por fonte sem apagar origem distinta.
- S3-T04-S03: detectar assuntos correlatos.
- S3-T04-S04: classificar evidência insuficiente.
- S3-T04-S05: registrar período de observação.

## S3-T05 — Opportunity Dossier

### Subtarefas

- S3-T05-S01: implementar score versionado.
- S3-T05-S02: implementar penalidades de risco.
- S3-T05-S03: separar produtos próprios e afiliados.
- S3-T05-S04: gerar dossier estruturado.
- S3-T05-S05: implementar qualificação, bloqueio e arquivamento.
- S3-T05-S06: implementar handoff para Seeds.

## S3-T06 — Interface Radar

### Subtarefas

- S3-T06-S01: tela Research Briefs.
- S3-T06-S02: tela Research Run.
- S3-T06-S03: tela Evidence Ledger.
- S3-T06-S04: tela Oportunidades.
- S3-T06-S05: tela Dossier.
- S3-T06-S06: botão Adicionar contextual.

**Gate S3:** existe oportunidade SharpEye qualificada, com fontes, evidências, score, riscos e dossier verificável.

---

# SPRINT S4 — Influencer Seeds Creator

**Objetivo:** gerar, comparar e selecionar Seeds de forma humana e rastreável.

**Dependências:** S3 e S2.  
**Owner provável:** domain + LLM + frontend.

## S4-T01 — Taxonomia

### Subtarefas

- S4-T01-S01: consolidar taxonomia de arquétipos.
- S4-T01-S02: definir Consultora-visionária para SharpEye.
- S4-T01-S03: registrar limites, formatos e público por arquétipo.
- S4-T01-S04: versionar taxonomia.

## S4-T02 — Geração de Seeds

### Subtarefas

- S4-T02-S01: criar prompt versionado.
- S4-T02-S02: montar contexto do dossier.
- S4-T02-S03: chamar OpenAI Gateway.
- S4-T02-S04: validar output estruturado.
- S4-T02-S05: marcar incompleta/ inválida.
- S4-T02-S06: persistir Seed e versão.

## S4-T03 — Diferenciação e score

### Subtarefas

- S4-T03-S01: cadastrar referências do portfólio.
- S4-T03-S02: comparar público, problema, função, voz, formato e visual.
- S4-T03-S03: registrar limitações heurísticas.
- S4-T03-S04: calcular score explicável.
- S4-T03-S05: bloquear risco crítico.

## S4-T04 — Comparison Pack

### Subtarefas

- S4-T04-S01: criar tabela comparativa.
- S4-T04-S02: gerar argumentos contra.
- S4-T04-S03: registrar perguntas abertas.
- S4-T04-S04: impedir seleção automática.
- S4-T04-S05: criar decisão humana versionada.

## S4-T05 — Interface Seeds

### Subtarefas

- S4-T05-S01: tela de Seeds.
- S4-T05-S02: tela Comparison Pack.
- S4-T05-S03: tela decisão.
- S4-T05-S04: estados de geração/erro/bloqueio.

**Gate S4:** Sergio seleciona uma Seed SharpEye ou rejeita todas, com versão, justificativa e escopo.

---

# SPRINT S5 — Profile Building / Fase Farmer

**Objetivo:** desenvolver integralmente a Persona + Marca Editorial.

**Dependências:** S4, S2 e S1.  
**Owner provável:** domain + LLM + editorial.

## S5-T01 — Persona base

### Subtarefas

- S5-T01-S01: criar Persona vinculada à Seed.
- S5-T01-S02: criar estados e versões.
- S5-T01-S03: definir identidade narrativa.
- S5-T01-S04: definir público, problema, tese e promessa.

## S5-T02 — Character Kit

### Subtarefas

- S5-T02-S01: gerar caráter e valores.
- S5-T02-S02: definir voz e tom.
- S5-T02-S03: definir bordões e assinaturas.
- S5-T02-S04: definir situações sensíveis.
- S5-T02-S05: definir linhas invioláveis.
- S5-T02-S06: declarar IA e limites de representação.

## S5-T03 — Identidade visual

### Subtarefas

- S5-T03-S01: cadastrar âncora Nadia.
- S5-T03-S02: criar prompt-base.
- S5-T03-S03: criar negative prompt.
- S5-T03-S04: definir paleta, roupas, cenários e iluminação.
- S5-T03-S05: criar regras de continuidade.
- S5-T03-S06: bloquear sexualização, cópia e falso case.

## S5-T04 — Marca Editorial e blog

### Subtarefas

- S5-T04-S01: configurar SharpEye · by Nadia Volkova.
- S5-T04-S02: configurar domínio previsto.
- S5-T04-S03: criar tagline e promessa.
- S5-T04-S04: criar página Sobre.
- S5-T04-S05: criar disclaimers e disclosures.
- S5-T04-S06: configurar categorias e navegação do blog.

## S5-T05 — Sistema editorial

### Subtarefas

- S5-T05-S01: definir pilares.
- S5-T05-S02: definir temas transversais.
- S5-T05-S03: definir The Teardown.
- S5-T05-S04: criar plano de 90 dias.
- S5-T05-S05: criar formatos, CTAs e cadência.
- S5-T05-S06: conectar produtos próprios e afiliados relevantes.

## S5-T06 — Claims, guardrails e Approval Pack

### Subtarefas

- S5-T06-S01: criar matriz de claims.
- S5-T06-S02: validar limites de “olho de arquiteta”.
- S5-T06-S03: bloquear credenciais/projetos inventados.
- S5-T06-S04: criar Approval Pack.
- S5-T06-S05: criar tela Workspace Farmer.
- S5-T06-S06: criar tela Marca/Blog.
- S5-T06-S07: criar tela Approval Pack.

**Gate S5:** Sergio aprova a Persona SharpEye/Nadia para produção ou solicita revisão.

---

# SPRINT S6 — Profile Building / Fase Post Machine

**Objetivo:** criar um fluxo confiável de produção e revisão de drafts.

**Dependências:** S5 aprovado.  
**Owner provável:** editorial + LLM + frontend.

## S6-T01 — Calendário e pauta

### Subtarefas

- S6-T01-S01: criar pilares e calendário.
- S6-T01-S02: criar pauta.
- S6-T01-S03: criar briefing.
- S6-T01-S04: validar Persona/Marca/versão.
- S6-T01-S05: implementar prioridades e owners.

## S6-T02 — Geração de draft

### Subtarefas

- S6-T02-S01: criar prompt de draft.
- S6-T02-S02: incluir Character Kit.
- S6-T02-S03: incluir fontes e claims.
- S6-T02-S04: incluir produto e CTA.
- S6-T02-S05: incluir disclosure.
- S6-T02-S06: validar JSON/estrutura.

## S6-T03 — Validação editorial

### Subtarefas

- S6-T03-S01: validar voz.
- S6-T03-S02: validar fontes.
- S6-T03-S03: validar claims.
- S6-T03-S04: validar disclosure IA/afiliado.
- S6-T03-S05: validar produto pertinente.
- S6-T03-S06: bloquear conteúdo inadequado.

## S6-T04 — Revisão humana

### Subtarefas

- S6-T04-S01: criar fila de aprovação.
- S6-T04-S02: criar aprovação, revisão e rejeição.
- S6-T04-S03: registrar comentário e motivo.
- S6-T04-S04: versionar revisão.
- S6-T04-S05: manter publicação desabilitada no MVP.

## S6-T05 — Interface Post Machine

### Subtarefas

- S6-T05-S01: tela Calendário.
- S6-T05-S02: tela Briefing.
- S6-T05-S03: Editor de Draft.
- S6-T05-S04: Fila de Aprovação.
- S6-T05-S05: estados vazios/erro/bloqueio.

**Gate S6:** fluxo produz drafts consistentes e revisáveis; nenhum conteúdo é publicado.

---

# SPRINT S7 — Dashboard, Control Room e telas transversais

**Objetivo:** integrar a operação em uma interface única preservando o design system atual.

**Dependências:** S1 e contratos das S2–S6.  
**Owner provável:** frontend + UX.

## S7-T01 — Dashboard

### Subtarefas

- S7-T01-S01: cards de métricas.
- S7-T01-S02: pipeline visual.
- S7-T01-S03: fila de aprovação.
- S7-T01-S04: jobs ativos.
- S7-T01-S05: bloqueios e próximas ações.
- S7-T01-S06: botão Adicionar contextual.

## S7-T02 — Pipeline e atividade

### Subtarefas

- S7-T02-S01: pipeline por estágio.
- S7-T02-S02: cards com owner/status/Gate.
- S7-T02-S03: jobs/heartbeat.
- S7-T02-S04: blocker panel.
- S7-T02-S05: histórico por recurso.

## S7-T03 — Configurações e governança

### Subtarefas

- S7-T03-S01: Configurações.
- S7-T03-S02: usuários/papéis.
- S7-T03-S03: OpenAI/limites.
- S7-T03-S04: parceiros/fontes.
- S7-T03-S05: taxonomia/políticas.
- S7-T03-S06: About/PRD/Ajuda.

**Gate S7:** usuário consegue navegar e localizar qualquer item do pipeline sem quebrar o design system atual.

---

# SPRINT S8 — Auditoria, métricas, feedback e observabilidade

**Objetivo:** fechar o ciclo de controle, aprendizado e rastreabilidade.

**Dependências:** S1–S7.  
**Owner provável:** backend/observability/data.

## S8-T01 — Audit Events

### Subtarefas

- S8-T01-S01: registrar eventos imutáveis.
- S8-T01-S02: registrar ator, tenant, versão e correlação.
- S8-T01-S03: criar filtros de auditoria.
- S8-T01-S04: criar comparação de versões.
- S8-T01-S05: impedir edição do histórico.

## S8-T02 — Métricas

### Subtarefas

- S8-T02-S01: registrar seguidores.
- S8-T02-S02: registrar visualizações.
- S8-T02-S03: registrar audiência recorrente.
- S8-T02-S04: registrar engajamento.
- S8-T02-S05: registrar blog/YouTube.
- S8-T02-S06: registrar cliques e conversões quando disponíveis.
- S8-T02-S07: registrar fonte/período/limitação.

## S8-T03 — Feedback para Radar

### Subtarefas

- S8-T03-S01: criar Feedback Signal.
- S8-T03-S02: vincular conteúdo, Persona e oportunidade.
- S8-T03-S03: separar observação de interpretação.
- S8-T03-S04: criar nova pergunta/oportunidade.
- S8-T03-S05: exibir retorno no Dashboard.

## S8-T04 — Observabilidade

### Subtarefas

- S8-T04-S01: logs estruturados.
- S8-T04-S02: correlação de jobs.
- S8-T04-S03: heartbeat.
- S8-T04-S04: custo/latência OpenAI.
- S8-T04-S05: alertas de bloqueio e falha.
- S8-T04-S06: readiness e health com payload honesto.

**Gate S8:** todas as decisões, métricas e falhas relevantes são auditáveis e o feedback retorna ao Radar.

---

# SPRINT S9 — E2E SharpEye, QA e hardening local

**Objetivo:** provar o processo completo localmente com fake/manual adapters, sem alegar integração de produção.

**Dependências:** S0–S8.  
**Owner provável:** David + QA independente.

## S9-T01 — Fixture SharpEye

### Subtarefas

- S9-T01-S01: criar Research Brief SharpEye.
- S9-T01-S02: criar dataset manual/fake Store Signs & Displays.
- S9-T01-S03: criar produtos próprios FBRSigns como dados configuráveis.
- S9-T01-S04: criar fontes e limitações explícitas.
- S9-T01-S05: criar critérios de teste do piloto.

## S9-T02 — E2E pipeline

### Subtarefas

- S9-T02-S01: intake → Research Run.
- S9-T02-S02: Research Run → Opportunity Dossier.
- S9-T02-S03: Dossier → Seeds.
- S9-T02-S04: Seed → decisão humana.
- S9-T02-S05: Seed → Farmer.
- S9-T02-S06: Farmer → Approval Pack.
- S9-T02-S07: aprovação → Post Machine.
- S9-T02-S08: draft → revisão humana.
- S9-T02-S09: métricas → feedback.

## S9-T03 — QA negativo

### Subtarefas

- S9-T03-S01: tenant incorreto.
- S9-T03-S02: papel insuficiente.
- S9-T03-S03: fonte ausente.
- S9-T03-S04: evidência insuficiente.
- S9-T03-S05: Seed não selecionada.
- S9-T03-S06: Persona sem guardrail.
- S9-T03-S07: draft sem disclosure.
- S9-T03-S08: claim proibido.
- S9-T03-S09: replay de evento.
- S9-T03-S10: restart com readback.

## S9-T04 — Auditoria independente

### Subtarefas

- S9-T04-S01: revisar diff.
- S9-T04-S02: executar suíte completa.
- S9-T04-S03: executar smoke UI.
- S9-T04-S04: revisar contratos.
- S9-T04-S05: revisar segurança.
- S9-T04-S06: classificar implementado/local/fake/bloqueado.

**Gate S9:** E2E local completo, QA independente e receipt sem blockers críticos locais.

---

# SPRINT S10 — Integrações reais e publicação assistida futura

**Objetivo:** preparar e executar somente integrações que tenham Gate específico.

**Dependências:** S9, contratos externos, credenciais seguras e autorização explícita.

## S10-T01 — Amazon

### Subtarefas

- S10-T01-S01: confirmar cadastro Seller.
- S10-T01-S02: confirmar cadastro Associates.
- S10-T01-S03: validar endpoints e permissões.
- S10-T01-S04: configurar secrets por referência.
- S10-T01-S05: executar read-only health.
- S10-T01-S06: executar pesquisa limitada autorizada.
- S10-T01-S07: validar normalização e readback.

## S10-T02 — Parceiros adicionais

### Subtarefas

- S10-T02-S01: priorizar parceiro.
- S10-T02-S02: documentar contrato.
- S10-T02-S03: validar termos e compliance.
- S10-T02-S04: implementar adapter atrás da interface.
- S10-T02-S05: executar smoke autorizado.
- S10-T02-S06: registrar limitações.

## S10-T03 — Publicação assistida futura

### Subtarefas

- S10-T03-S01: definir canal piloto.
- S10-T03-S02: validar adapter oficial.
- S10-T03-S03: validar disclosure.
- S10-T03-S04: validar idempotência.
- S10-T03-S05: validar receipt.
- S10-T03-S06: aprovar publicação de uma peça.
- S10-T03-S07: executar readback.
- S10-T03-S08: manter pausa/rollback.

**Gate S10:** nenhuma integração ou publicação é considerada concluída sem evidência externa e readback exato.

---

## 2. Matriz resumida de dependências

| Sprint | Depende de | Saída principal | Gate |
|---|---|---|---|
| S0 | PRD aprovado | contratos e governança | contratos aprovados |
| S1 | S0 | identidade, tenant, RBAC, shell | segurança local |
| S2 | S0/S1 | parceiros, fontes, OpenAI Gateway | adapters fail-closed |
| S3 | S1/S2 | Opportunity Dossier | oportunidade qualificada |
| S4 | S2/S3 | Seed selecionada | decisão humana |
| S5 | S1/S2/S4 | Persona + Marca aprovadas | Farmer aprovado |
| S6 | S5 | drafts revisáveis | Post Machine local |
| S7 | S1–S6 | Control Room completo | navegação integrada |
| S8 | S1–S7 | auditoria/métricas/feedback | ciclo observável |
| S9 | S0–S8 | E2E local SharpEye | QA independente |
| S10 | S9 + Gates externos | integração/publicação futura | readback externo |

---

## 3. Handoffs obrigatórios

### S0 → S1/S2

Contratos, estados, tenant, papéis, erros e eventos.

### S3 → S4

Opportunity Dossier versionado com evidências, score, riscos, limitações e decisão pendente.

### S4 → S5

Seed selecionada, versão, justificativa, escopo e riscos aceitos.

### S5 → S6

Persona aprovada, Marca, Character Kit, sistema editorial, claims, disclosure e Approval Pack.

### S6 → S8

Drafts, decisões, versões, fontes, métricas de produção e feedback.

### S9 → S10

Receipt local, QA independente, limitações, lista de Gates externos e readback planejado.

---

## 4. Critério de conclusão do backlog de planejamento

- [ ] Todo requisito do PRD possui uma tarefa.
- [ ] Toda tarefa possui subtarefas executáveis.
- [ ] Toda sprint possui dependência e Gate.
- [ ] Todo handoff possui entrada e saída explícitas.
- [ ] O piloto SharpEye possui fixture e fluxo E2E planejado.
- [ ] Integrações reais estão separadas do domínio local.
- [ ] Publicação e gastos permanecem atrás de Gate.
- [ ] O backlog foi revisado por Sergio.

**Estado:** backlog proposto para revisão. Não é autorização de execução automática.
