# Catálogo de Stories — FBR Authority Engine

**Fonte:** `02-prd/SPRINTS-TAREFAS-SUBTAREFAS-AUTHORITY-ENGINE.md`  
**Estado:** planejado; nenhuma Story implementada nesta entrega  
**Regra:** cada tarefa do backlog corresponde a uma Story; as subtarefas abaixo são o checklist de execução da Story.

## Índice por Sprint

- **S0 — Fundação, contratos e governança:** S0-T01, S0-T02, S0-T03
- **S1 — Identidade, multi-tenant, RBAC e shell:** S1-T01, S1-T02, S1-T03, S1-T04
- **S2 — Partner Registry, Source Registry e OpenAI Gateway:** S2-T01, S2-T02, S2-T03
- **S3 — Opportunity Radar:** S3-T01, S3-T02, S3-T03, S3-T04, S3-T05, S3-T06
- **S4 — Influencer Seeds Creator:** S4-T01, S4-T02, S4-T03, S4-T04, S4-T05
- **S5 — Profile Building / Fase Farmer:** S5-T01, S5-T02, S5-T03, S5-T04, S5-T05, S5-T06
- **S6 — Profile Building / Fase Post Machine:** S6-T01, S6-T02, S6-T03, S6-T04, S6-T05
- **S7 — Dashboard, Control Room e telas transversais:** S7-T01, S7-T02, S7-T03
- **S8 — Auditoria, métricas, feedback e observabilidade:** S8-T01, S8-T02, S8-T03, S8-T04
- **S9 — E2E SharpEye, QA e hardening local:** S9-T01, S9-T02, S9-T03, S9-T04
- **S10 — Integrações reais e publicação assistida futura:** S10-T01, S10-T02, S10-T03

## Definition of Ready de cada Story

- PRD e contrato da Story identificados.
- dependências e Gate de entrada liberados.
- owner definido.
- critério de aceite compreendido.
- nenhuma credencial/secreta necessária está sendo inventada.

## Stories

## S0 — Fundação, contratos e governança

### S0-T01 — Reconciliar documentação e escopo

**Status:** `planned`  
**Depende de:** nenhum — liberar após aprovação do PRD  
**Gate relacionado:** Gate de saída do S0  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Reconciliar documentação e escopo**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Reconciliar documentação e escopo** conforme o PRD aprovado e o backlog do S0. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S0-T01-S01** — comparar Projeto Conceitual, MP-000, PRD e briefing SharpEye.
- [ ] **S0-T01-S02** — listar divergências de nomenclatura, estados, entidades e ownership.
- [ ] **S0-T01-S03** — confirmar `Persona + Marca Editorial` como unidade canônica.
- [ ] **S0-T01-S04** — confirmar Profile Building com fases Farmer → Post Machine.
- [ ] **S0-T01-S05** — criar matriz de decisões, hipóteses, bloqueios e dependências.
- [ ] **S0-T01-S06** — registrar decisões de Sergio sem converter hipótese em fato.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S0-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S0; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S0-T02 — Contratos de domínio

**Status:** `planned`  
**Depende de:** nenhum — liberar após aprovação do PRD  
**Gate relacionado:** Gate de saída do S0  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Contratos de domínio**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Contratos de domínio** conforme o PRD aprovado e o backlog do S0. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S0-T02-S01** — definir IDs, versões, timestamps e `tenant_id`.
- [ ] **S0-T02-S02** — definir contratos Research Brief, Evidence, Opportunity Dossier e Seed.
- [ ] **S0-T02-S03** — definir contratos Persona, Brand, Character Kit e Approval Pack.
- [ ] **S0-T02-S04** — definir Content Brief, Draft, Review Decision, Metric e Feedback.
- [ ] **S0-T02-S05** — definir estados e transições permitidas.
- [ ] **S0-T02-S06** — definir códigos de erro e bloqueio.
- [ ] **S0-T02-S07** — definir eventos e envelopes idempotentes.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S0-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S0; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S0-T03 — Definition of Done e Gates

**Status:** `planned`  
**Depende de:** nenhum — liberar após aprovação do PRD  
**Gate relacionado:** Gate de saída do S0  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Definition of Done e Gates**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Definition of Done e Gates** conforme o PRD aprovado e o backlog do S0. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S0-T03-S01** — definir DoD de tarefa.
- [ ] **S0-T03-S02** — definir DoD de sprint.
- [ ] **S0-T03-S03** — mapear Gates G0–G10 para rotas e telas.
- [ ] **S0-T03-S04** — definir evidência mínima por Gate.
- [ ] **S0-T03-S05** — definir critérios de reabertura de tarefa.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S0-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S0; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S1 — Identidade, multi-tenant, RBAC e shell

### S1-T01 — Tenants e usuários

**Status:** `planned`  
**Depende de:** S0 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S1  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Tenants e usuários**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Tenants e usuários** conforme o PRD aprovado e o backlog do S1. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S1-T01-S01** — criar modelo de tenants.
- [ ] **S1-T01-S02** — criar usuários, papéis e memberships.
- [ ] **S1-T01-S03** — criar contexto server-side de tenant.
- [ ] **S1-T01-S04** — implementar seleção de tenant para usuários com múltiplos acessos.
- [ ] **S1-T01-S05** — testar isolamento positivo e negativo.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S1-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S1; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S1-T02 — Autenticação e RBAC

**Status:** `planned`  
**Depende de:** S0 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S1  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Autenticação e RBAC**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Autenticação e RBAC** conforme o PRD aprovado e o backlog do S1. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S1-T02-S01** — implementar login e sessão.
- [ ] **S1-T02-S02** — implementar recuperação/bloqueio de acesso.
- [ ] **S1-T02-S03** — proteger rotas server-side.
- [ ] **S1-T02-S04** — implementar matriz de papéis.
- [ ] **S1-T02-S05** — testar 401, 403, ownership e tenant incorreto.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S1-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S1; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S1-T03 — RLS e persistência base

**Status:** `planned`  
**Depende de:** S0 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S1  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **RLS e persistência base**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **RLS e persistência base** conforme o PRD aprovado e o backlog do S1. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S1-T03-S01** — definir schema base.
- [ ] **S1-T03-S02** — criar RLS por tenant e owner.
- [ ] **S1-T03-S03** — criar migrations locais idempotentes.
- [ ] **S1-T03-S04** — criar adapter relacional e fake adapter.
- [ ] **S1-T03-S05** — testar read/write/restart local.
- [ ] **S1-T03-S06** — separar explicitamente fake de produção.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S1-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S1; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S1-T04 — Shell visual atual

**Status:** `planned`  
**Depende de:** S0 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S1  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Shell visual atual**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Shell visual atual** conforme o PRD aprovado e o backlog do S1. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S1-T04-S01** — preservar layout atual do dashboard.
- [ ] **S1-T04-S02** — preservar menu lateral esquerdo e componentes visuais existentes.
- [ ] **S1-T04-S03** — implementar topbar, tenant ativo, usuário, busca e notificações.
- [ ] **S1-T04-S04** — implementar breadcrumbs e estados de carregamento/erro/vazio.
- [ ] **S1-T04-S05** — implementar navegação protegida.
- [ ] **S1-T04-S06** — validar responsividade sem alterar o design system.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S1-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S1; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S2 — Partner Registry, Source Registry e OpenAI Gateway

### S2-T01 — Partner Registry

**Status:** `planned`  
**Depende de:** S1 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S2  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Partner Registry**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Partner Registry** conforme o PRD aprovado e o backlog do S2. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S2-T01-S01** — modelar partners e partner programs.
- [ ] **S2-T01-S02** — cadastrar Amazon Seller.
- [ ] **S2-T01-S03** — cadastrar Amazon Associates.
- [ ] **S2-T01-S04** — cadastrar TikTok Shop.
- [ ] **S2-T01-S05** — cadastrar ClickBank.
- [ ] **S2-T01-S06** — cadastrar BuyGoods, MaxWeb e Digistore24.
- [ ] **S2-T01-S07** — cadastrar SellHealth, MarketHealth, NutriProfits e MoreNiche.
- [ ] **S2-T01-S08** — implementar status planned/configured/verified/blocked/disabled.
- [ ] **S2-T01-S09** — implementar telas de listagem, adição, edição e histórico.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S2-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S2; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S2-T02 — Source Registry

**Status:** `planned`  
**Depende de:** S1 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S2  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Source Registry**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Source Registry** conforme o PRD aprovado e o backlog do S2. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S2-T02-S01** — modelar fontes e contratos.
- [ ] **S2-T02-S02** — registrar endpoint/origem, versão, escopo e limites.
- [ ] **S2-T02-S03** — implementar referência de credencial sem exibir segredo.
- [ ] **S2-T02-S04** — implementar health check fail-closed.
- [ ] **S2-T02-S05** — registrar limitações e última verificação.
- [ ] **S2-T02-S06** — implementar bloqueio/desativação.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S2-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S2; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S2-T03 — OpenAI Gateway

**Status:** `planned`  
**Depende de:** S1 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S2  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **OpenAI Gateway**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **OpenAI Gateway** conforme o PRD aprovado e o backlog do S2. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S2-T03-S01** — criar gateway server-side.
- [ ] **S2-T03-S02** — configurar referência segura da API key.
- [ ] **S2-T03-S03** — registrar modelo, prompt version e schema version.
- [ ] **S2-T03-S04** — validar JSON Schema de saída.
- [ ] **S2-T03-S05** — registrar tokens, custo, latência e status.
- [ ] **S2-T03-S06** — implementar retry limitado e erro explícito.
- [ ] **S2-T03-S07** — criar orçamento/limite por tenant.
- [ ] **S2-T03-S08** — criar logs sanitizados.
- [ ] **S2-T03-S09** — criar evals iniciais para SharpEye.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S2-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S2; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S3 — Opportunity Radar

### S3-T01 — Research Brief

**Status:** `planned`  
**Depende de:** S2 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S3  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Research Brief**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Research Brief** conforme o PRD aprovado e o backlog do S3. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S3-T01-S01** — criar formulário de briefing.
- [ ] **S3-T01-S02** — validar mercado, idioma, nicho, público e objetivo.
- [ ] **S3-T01-S03** — vincular produtos próprios e parceiros.
- [ ] **S3-T01-S04** — salvar versões.
- [ ] **S3-T01-S05** — implementar listagem, filtros e detalhe.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S3-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S3; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S3-T02 — Research Run

**Status:** `planned`  
**Depende de:** S2 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S3  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Research Run**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Research Run** conforme o PRD aprovado e o backlog do S3. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S3-T02-S01** — criar job de pesquisa.
- [ ] **S3-T02-S02** — implementar fake adapter determinístico.
- [ ] **S3-T02-S03** — implementar adapter manual/import.
- [ ] **S3-T02-S04** — implementar adapter configurável fail-closed.
- [ ] **S3-T02-S05** — registrar modo LIVE/MANUAL/PARTNER_FEED/DEMO/MIXED.
- [ ] **S3-T02-S06** — persistir raw records e limitações.
- [ ] **S3-T02-S07** — exibir progresso, erro e heartbeat.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S3-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S3; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S3-T03 — Evidence Ledger

**Status:** `planned`  
**Depende de:** S2 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S3  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Evidence Ledger**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Evidence Ledger** conforme o PRD aprovado e o backlog do S3. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S3-T03-S01** — criar modelo de evidência.
- [ ] **S3-T03-S02** — relacionar evidência a produto, tendência, oportunidade e conteúdo.
- [ ] **S3-T03-S03** — implementar tipos fato/hipótese/recomendação/risco/bloqueio/decisão.
- [ ] **S3-T03-S04** — implementar confiança e validade temporal.
- [ ] **S3-T03-S05** — criar tela de consulta e filtros.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S3-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S3; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S3-T04 — Normalização e tendências

**Status:** `planned`  
**Depende de:** S2 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S3  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Normalização e tendências**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Normalização e tendências** conforme o PRD aprovado e o backlog do S3. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S3-T04-S01** — normalizar produto, preço, moeda, disponibilidade e timestamp.
- [ ] **S3-T04-S02** — deduplicar por fonte sem apagar origem distinta.
- [ ] **S3-T04-S03** — detectar assuntos correlatos.
- [ ] **S3-T04-S04** — classificar evidência insuficiente.
- [ ] **S3-T04-S05** — registrar período de observação.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S3-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S3; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S3-T05 — Opportunity Dossier

**Status:** `planned`  
**Depende de:** S2 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S3  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Opportunity Dossier**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Opportunity Dossier** conforme o PRD aprovado e o backlog do S3. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S3-T05-S01** — implementar score versionado.
- [ ] **S3-T05-S02** — implementar penalidades de risco.
- [ ] **S3-T05-S03** — separar produtos próprios e afiliados.
- [ ] **S3-T05-S04** — gerar dossier estruturado.
- [ ] **S3-T05-S05** — implementar qualificação, bloqueio e arquivamento.
- [ ] **S3-T05-S06** — implementar handoff para Seeds.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S3-T05` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S3; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S3-T06 — Interface Radar

**Status:** `planned`  
**Depende de:** S2 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S3  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Interface Radar**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Interface Radar** conforme o PRD aprovado e o backlog do S3. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S3-T06-S01** — tela Research Briefs.
- [ ] **S3-T06-S02** — tela Research Run.
- [ ] **S3-T06-S03** — tela Evidence Ledger.
- [ ] **S3-T06-S04** — tela Oportunidades.
- [ ] **S3-T06-S05** — tela Dossier.
- [ ] **S3-T06-S06** — botão Adicionar contextual.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S3-T06` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S3; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S4 — Influencer Seeds Creator

### S4-T01 — Taxonomia

**Status:** `planned`  
**Depende de:** S3 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S4  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Taxonomia**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Taxonomia** conforme o PRD aprovado e o backlog do S4. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S4-T01-S01** — consolidar taxonomia de arquétipos.
- [ ] **S4-T01-S02** — definir Consultora-visionária para SharpEye.
- [ ] **S4-T01-S03** — registrar limites, formatos e público por arquétipo.
- [ ] **S4-T01-S04** — versionar taxonomia.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S4-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S4; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S4-T02 — Geração de Seeds

**Status:** `planned`  
**Depende de:** S3 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S4  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Geração de Seeds**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Geração de Seeds** conforme o PRD aprovado e o backlog do S4. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S4-T02-S01** — criar prompt versionado.
- [ ] **S4-T02-S02** — montar contexto do dossier.
- [ ] **S4-T02-S03** — chamar OpenAI Gateway.
- [ ] **S4-T02-S04** — validar output estruturado.
- [ ] **S4-T02-S05** — marcar incompleta/ inválida.
- [ ] **S4-T02-S06** — persistir Seed e versão.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S4-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S4; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S4-T03 — Diferenciação e score

**Status:** `planned`  
**Depende de:** S3 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S4  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Diferenciação e score**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Diferenciação e score** conforme o PRD aprovado e o backlog do S4. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S4-T03-S01** — cadastrar referências do portfólio.
- [ ] **S4-T03-S02** — comparar público, problema, função, voz, formato e visual.
- [ ] **S4-T03-S03** — registrar limitações heurísticas.
- [ ] **S4-T03-S04** — calcular score explicável.
- [ ] **S4-T03-S05** — bloquear risco crítico.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S4-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S4; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S4-T04 — Comparison Pack

**Status:** `planned`  
**Depende de:** S3 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S4  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Comparison Pack**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Comparison Pack** conforme o PRD aprovado e o backlog do S4. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S4-T04-S01** — criar tabela comparativa.
- [ ] **S4-T04-S02** — gerar argumentos contra.
- [ ] **S4-T04-S03** — registrar perguntas abertas.
- [ ] **S4-T04-S04** — impedir seleção automática.
- [ ] **S4-T04-S05** — criar decisão humana versionada.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S4-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S4; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S4-T05 — Interface Seeds

**Status:** `planned`  
**Depende de:** S3 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S4  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Interface Seeds**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Interface Seeds** conforme o PRD aprovado e o backlog do S4. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S4-T05-S01** — tela de Seeds.
- [ ] **S4-T05-S02** — tela Comparison Pack.
- [ ] **S4-T05-S03** — tela decisão.
- [ ] **S4-T05-S04** — estados de geração/erro/bloqueio.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S4-T05` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S4; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S5 — Profile Building / Fase Farmer

### S5-T01 — Persona base

**Status:** `planned`  
**Depende de:** S4 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S5  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Persona base**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Persona base** conforme o PRD aprovado e o backlog do S5. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S5-T01-S01** — criar Persona vinculada à Seed.
- [ ] **S5-T01-S02** — criar estados e versões.
- [ ] **S5-T01-S03** — definir identidade narrativa.
- [ ] **S5-T01-S04** — definir público, problema, tese e promessa.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S5-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S5; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S5-T02 — Character Kit

**Status:** `planned`  
**Depende de:** S4 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S5  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Character Kit**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Character Kit** conforme o PRD aprovado e o backlog do S5. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S5-T02-S01** — gerar caráter e valores.
- [ ] **S5-T02-S02** — definir voz e tom.
- [ ] **S5-T02-S03** — definir bordões e assinaturas.
- [ ] **S5-T02-S04** — definir situações sensíveis.
- [ ] **S5-T02-S05** — definir linhas invioláveis.
- [ ] **S5-T02-S06** — declarar IA e limites de representação.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S5-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S5; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S5-T03 — Identidade visual

**Status:** `planned`  
**Depende de:** S4 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S5  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Identidade visual**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Identidade visual** conforme o PRD aprovado e o backlog do S5. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S5-T03-S01** — cadastrar âncora Nadia.
- [ ] **S5-T03-S02** — criar prompt-base.
- [ ] **S5-T03-S03** — criar negative prompt.
- [ ] **S5-T03-S04** — definir paleta, roupas, cenários e iluminação.
- [ ] **S5-T03-S05** — criar regras de continuidade.
- [ ] **S5-T03-S06** — bloquear sexualização, cópia e falso case.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S5-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S5; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S5-T04 — Marca Editorial e blog

**Status:** `planned`  
**Depende de:** S4 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S5  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Marca Editorial e blog**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Marca Editorial e blog** conforme o PRD aprovado e o backlog do S5. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S5-T04-S01** — configurar SharpEye · by Nadia Volkova.
- [ ] **S5-T04-S02** — configurar domínio previsto.
- [ ] **S5-T04-S03** — criar tagline e promessa.
- [ ] **S5-T04-S04** — criar página Sobre.
- [ ] **S5-T04-S05** — criar disclaimers e disclosures.
- [ ] **S5-T04-S06** — configurar categorias e navegação do blog.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S5-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S5; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S5-T05 — Sistema editorial

**Status:** `planned`  
**Depende de:** S4 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S5  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Sistema editorial**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Sistema editorial** conforme o PRD aprovado e o backlog do S5. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S5-T05-S01** — definir pilares.
- [ ] **S5-T05-S02** — definir temas transversais.
- [ ] **S5-T05-S03** — definir The Teardown.
- [ ] **S5-T05-S04** — criar plano de 90 dias.
- [ ] **S5-T05-S05** — criar formatos, CTAs e cadência.
- [ ] **S5-T05-S06** — conectar produtos próprios e afiliados relevantes.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S5-T05` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S5; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S5-T06 — Claims, guardrails e Approval Pack

**Status:** `planned`  
**Depende de:** S4 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S5  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Claims, guardrails e Approval Pack**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Claims, guardrails e Approval Pack** conforme o PRD aprovado e o backlog do S5. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S5-T06-S01** — criar matriz de claims.
- [ ] **S5-T06-S02** — validar limites de “olho de arquiteta”.
- [ ] **S5-T06-S03** — bloquear credenciais/projetos inventados.
- [ ] **S5-T06-S04** — criar Approval Pack.
- [ ] **S5-T06-S05** — criar tela Workspace Farmer.
- [ ] **S5-T06-S06** — criar tela Marca/Blog.
- [ ] **S5-T06-S07** — criar tela Approval Pack.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S5-T06` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S5; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S6 — Profile Building / Fase Post Machine

### S6-T01 — Calendário e pauta

**Status:** `planned`  
**Depende de:** S5 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S6  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Calendário e pauta**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Calendário e pauta** conforme o PRD aprovado e o backlog do S6. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S6-T01-S01** — criar pilares e calendário.
- [ ] **S6-T01-S02** — criar pauta.
- [ ] **S6-T01-S03** — criar briefing.
- [ ] **S6-T01-S04** — validar Persona/Marca/versão.
- [ ] **S6-T01-S05** — implementar prioridades e owners.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S6-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S6; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S6-T02 — Geração de draft

**Status:** `planned`  
**Depende de:** S5 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S6  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Geração de draft**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Geração de draft** conforme o PRD aprovado e o backlog do S6. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S6-T02-S01** — criar prompt de draft.
- [ ] **S6-T02-S02** — incluir Character Kit.
- [ ] **S6-T02-S03** — incluir fontes e claims.
- [ ] **S6-T02-S04** — incluir produto e CTA.
- [ ] **S6-T02-S05** — incluir disclosure.
- [ ] **S6-T02-S06** — validar JSON/estrutura.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S6-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S6; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S6-T03 — Validação editorial

**Status:** `planned`  
**Depende de:** S5 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S6  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Validação editorial**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Validação editorial** conforme o PRD aprovado e o backlog do S6. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S6-T03-S01** — validar voz.
- [ ] **S6-T03-S02** — validar fontes.
- [ ] **S6-T03-S03** — validar claims.
- [ ] **S6-T03-S04** — validar disclosure IA/afiliado.
- [ ] **S6-T03-S05** — validar produto pertinente.
- [ ] **S6-T03-S06** — bloquear conteúdo inadequado.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S6-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S6; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S6-T04 — Revisão humana

**Status:** `planned`  
**Depende de:** S5 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S6  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Revisão humana**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Revisão humana** conforme o PRD aprovado e o backlog do S6. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S6-T04-S01** — criar fila de aprovação.
- [ ] **S6-T04-S02** — criar aprovação, revisão e rejeição.
- [ ] **S6-T04-S03** — registrar comentário e motivo.
- [ ] **S6-T04-S04** — versionar revisão.
- [ ] **S6-T04-S05** — manter publicação desabilitada no MVP.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S6-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S6; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S6-T05 — Interface Post Machine

**Status:** `planned`  
**Depende de:** S5 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S6  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Interface Post Machine**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Interface Post Machine** conforme o PRD aprovado e o backlog do S6. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S6-T05-S01** — tela Calendário.
- [ ] **S6-T05-S02** — tela Briefing.
- [ ] **S6-T05-S03** — Editor de Draft.
- [ ] **S6-T05-S04** — Fila de Aprovação.
- [ ] **S6-T05-S05** — estados vazios/erro/bloqueio.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S6-T05` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S6; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S7 — Dashboard, Control Room e telas transversais

### S7-T01 — Dashboard

**Status:** `planned`  
**Depende de:** S6 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S7  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Dashboard**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Dashboard** conforme o PRD aprovado e o backlog do S7. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S7-T01-S01** — cards de métricas.
- [ ] **S7-T01-S02** — pipeline visual.
- [ ] **S7-T01-S03** — fila de aprovação.
- [ ] **S7-T01-S04** — jobs ativos.
- [ ] **S7-T01-S05** — bloqueios e próximas ações.
- [ ] **S7-T01-S06** — botão Adicionar contextual.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S7-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S7; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S7-T02 — Pipeline e atividade

**Status:** `planned`  
**Depende de:** S6 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S7  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Pipeline e atividade**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Pipeline e atividade** conforme o PRD aprovado e o backlog do S7. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S7-T02-S01** — pipeline por estágio.
- [ ] **S7-T02-S02** — cards com owner/status/Gate.
- [ ] **S7-T02-S03** — jobs/heartbeat.
- [ ] **S7-T02-S04** — blocker panel.
- [ ] **S7-T02-S05** — histórico por recurso.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S7-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S7; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S7-T03 — Configurações e governança

**Status:** `planned`  
**Depende de:** S6 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S7  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Configurações e governança**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Configurações e governança** conforme o PRD aprovado e o backlog do S7. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S7-T03-S01** — Configurações.
- [ ] **S7-T03-S02** — usuários/papéis.
- [ ] **S7-T03-S03** — OpenAI/limites.
- [ ] **S7-T03-S04** — parceiros/fontes.
- [ ] **S7-T03-S05** — taxonomia/políticas.
- [ ] **S7-T03-S06** — About/PRD/Ajuda.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S7-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S7; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S8 — Auditoria, métricas, feedback e observabilidade

### S8-T01 — Audit Events

**Status:** `planned`  
**Depende de:** S7 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S8  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Audit Events**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Audit Events** conforme o PRD aprovado e o backlog do S8. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S8-T01-S01** — registrar eventos imutáveis.
- [ ] **S8-T01-S02** — registrar ator, tenant, versão e correlação.
- [ ] **S8-T01-S03** — criar filtros de auditoria.
- [ ] **S8-T01-S04** — criar comparação de versões.
- [ ] **S8-T01-S05** — impedir edição do histórico.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S8-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S8; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S8-T02 — Métricas

**Status:** `planned`  
**Depende de:** S7 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S8  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Métricas**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Métricas** conforme o PRD aprovado e o backlog do S8. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S8-T02-S01** — registrar seguidores.
- [ ] **S8-T02-S02** — registrar visualizações.
- [ ] **S8-T02-S03** — registrar audiência recorrente.
- [ ] **S8-T02-S04** — registrar engajamento.
- [ ] **S8-T02-S05** — registrar blog/YouTube.
- [ ] **S8-T02-S06** — registrar cliques e conversões quando disponíveis.
- [ ] **S8-T02-S07** — registrar fonte/período/limitação.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S8-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S8; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S8-T03 — Feedback para Radar

**Status:** `planned`  
**Depende de:** S7 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S8  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Feedback para Radar**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Feedback para Radar** conforme o PRD aprovado e o backlog do S8. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S8-T03-S01** — criar Feedback Signal.
- [ ] **S8-T03-S02** — vincular conteúdo, Persona e oportunidade.
- [ ] **S8-T03-S03** — separar observação de interpretação.
- [ ] **S8-T03-S04** — criar nova pergunta/oportunidade.
- [ ] **S8-T03-S05** — exibir retorno no Dashboard.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S8-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S8; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S8-T04 — Observabilidade

**Status:** `planned`  
**Depende de:** S7 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S8  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Observabilidade**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Observabilidade** conforme o PRD aprovado e o backlog do S8. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S8-T04-S01** — logs estruturados.
- [ ] **S8-T04-S02** — correlação de jobs.
- [ ] **S8-T04-S03** — heartbeat.
- [ ] **S8-T04-S04** — custo/latência OpenAI.
- [ ] **S8-T04-S05** — alertas de bloqueio e falha.
- [ ] **S8-T04-S06** — readiness e health com payload honesto.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S8-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S8; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S9 — E2E SharpEye, QA e hardening local

### S9-T01 — Fixture SharpEye

**Status:** `planned`  
**Depende de:** S8 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S9  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Fixture SharpEye**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Fixture SharpEye** conforme o PRD aprovado e o backlog do S9. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S9-T01-S01** — criar Research Brief SharpEye.
- [ ] **S9-T01-S02** — criar dataset manual/fake Store Signs & Displays.
- [ ] **S9-T01-S03** — criar produtos próprios FBRSigns como dados configuráveis.
- [ ] **S9-T01-S04** — criar fontes e limitações explícitas.
- [ ] **S9-T01-S05** — criar critérios de teste do piloto.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S9-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S9; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S9-T02 — E2E pipeline

**Status:** `planned`  
**Depende de:** S8 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S9  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **E2E pipeline**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **E2E pipeline** conforme o PRD aprovado e o backlog do S9. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S9-T02-S01** — intake → Research Run.
- [ ] **S9-T02-S02** — Research Run → Opportunity Dossier.
- [ ] **S9-T02-S03** — Dossier → Seeds.
- [ ] **S9-T02-S04** — Seed → decisão humana.
- [ ] **S9-T02-S05** — Seed → Farmer.
- [ ] **S9-T02-S06** — Farmer → Approval Pack.
- [ ] **S9-T02-S07** — aprovação → Post Machine.
- [ ] **S9-T02-S08** — draft → revisão humana.
- [ ] **S9-T02-S09** — métricas → feedback.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S9-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S9; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S9-T03 — QA negativo

**Status:** `planned`  
**Depende de:** S8 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S9  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **QA negativo**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **QA negativo** conforme o PRD aprovado e o backlog do S9. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S9-T03-S01** — tenant incorreto.
- [ ] **S9-T03-S02** — papel insuficiente.
- [ ] **S9-T03-S03** — fonte ausente.
- [ ] **S9-T03-S04** — evidência insuficiente.
- [ ] **S9-T03-S05** — Seed não selecionada.
- [ ] **S9-T03-S06** — Persona sem guardrail.
- [ ] **S9-T03-S07** — draft sem disclosure.
- [ ] **S9-T03-S08** — claim proibido.
- [ ] **S9-T03-S09** — replay de evento.
- [ ] **S9-T03-S10** — restart com readback.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S9-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S9; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S9-T04 — Auditoria independente

**Status:** `planned`  
**Depende de:** S8 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S9  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Auditoria independente**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Auditoria independente** conforme o PRD aprovado e o backlog do S9. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S9-T04-S01** — revisar diff.
- [ ] **S9-T04-S02** — executar suíte completa.
- [ ] **S9-T04-S03** — executar smoke UI.
- [ ] **S9-T04-S04** — revisar contratos.
- [ ] **S9-T04-S05** — revisar segurança.
- [ ] **S9-T04-S06** — classificar implementado/local/fake/bloqueado.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S9-T04` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S9; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## S10 — Integrações reais e publicação assistida futura

### S10-T01 — Amazon

**Status:** `planned`  
**Depende de:** S9 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S10  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Amazon**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Amazon** conforme o PRD aprovado e o backlog do S10. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S10-T01-S01** — confirmar cadastro Seller.
- [ ] **S10-T01-S02** — confirmar cadastro Associates.
- [ ] **S10-T01-S03** — validar endpoints e permissões.
- [ ] **S10-T01-S04** — configurar secrets por referência.
- [ ] **S10-T01-S05** — executar read-only health.
- [ ] **S10-T01-S06** — executar pesquisa limitada autorizada.
- [ ] **S10-T01-S07** — validar normalização e readback.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S10-T01` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S10; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S10-T02 — Parceiros adicionais

**Status:** `planned`  
**Depende de:** S9 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S10  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Parceiros adicionais**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Parceiros adicionais** conforme o PRD aprovado e o backlog do S10. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S10-T02-S01** — priorizar parceiro.
- [ ] **S10-T02-S02** — documentar contrato.
- [ ] **S10-T02-S03** — validar termos e compliance.
- [ ] **S10-T02-S04** — implementar adapter atrás da interface.
- [ ] **S10-T02-S05** — executar smoke autorizado.
- [ ] **S10-T02-S06** — registrar limitações.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S10-T02` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S10; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

### S10-T03 — Publicação assistida futura

**Status:** `planned`  
**Depende de:** S9 concluído e Gate de saída aprovado  
**Gate relacionado:** Gate de saída do S10  
**Owner provável:** conforme backlog mestre  

**Como** responsável por **Publicação assistida futura**, **quero** entregar este componente de forma verificável **para** avançar o pipeline do Authority Engine sem perder rastreabilidade.

#### Objetivo
Implementar/configurar/verificar o escopo de **Publicação assistida futura** conforme o PRD aprovado e o backlog do S10. A Story só termina com evidência executada; documentação ou intenção não contam como conclusão.

#### Subtarefas

- [ ] **S10-T03-S01** — definir canal piloto.
- [ ] **S10-T03-S02** — validar adapter oficial.
- [ ] **S10-T03-S03** — validar disclosure.
- [ ] **S10-T03-S04** — validar idempotência.
- [ ] **S10-T03-S05** — validar receipt.
- [ ] **S10-T03-S06** — aprovar publicação de uma peça.
- [ ] **S10-T03-S07** — executar readback.
- [ ] **S10-T03-S08** — manter pausa/rollback.

#### Critérios de aceite
- [ ] Todas as subtarefas de `S10-T03` foram executadas ou receberam classificação objetiva de bloqueio.
- [ ] O comportamento principal possui teste automatizado, contrato ou prova operacional adequada ao tipo de entrega.
- [ ] Entradas inválidas, dependência ausente e Gate não autorizado falham fechado.
- [ ] Artefatos, comandos, resultados, limitações e próximo passo estão registrados no receipt/handoff.
- [ ] Nenhuma integração externa é declarada como real sem credencial segura, readback e evidência específica.

#### Saída e handoff
- Entregar artefatos, testes, receipt e handoff para a próxima etapa do S10; separar local/fake/real e registrar blockers.
- O handoff deve informar entrada, feito, artefatos, testes, riscos, blockers, owner, next action, next check e critério de encerramento.

#### Casos obrigatórios de validação
- caminho feliz;
- entrada inválida ou incompleta;
- dependência ausente ou credencial não configurada;
- permissão/ownership incorreto;
- replay/idempotência quando houver evento ou job;
- restart/readback quando houver persistência.

---

## Resumo de cobertura

- Sprints catalogados: **11**
- Stories geradas: **46**
- Subtarefas referenciadas: **275**
- Nenhuma Story foi marcada como implementada.
- Próximo Gate: revisão de Sergio e abertura formal do Sprint S0.
