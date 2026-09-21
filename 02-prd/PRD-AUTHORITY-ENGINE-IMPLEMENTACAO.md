# PRD — Implementação do FBR Authority Engine

## Status

`PRD` | draft | planejamento somente | aguardando aprovação de Sergio

**Projeto:** FBR Authority Engine  
**Versão:** v0.1  
**Módulos:** Opportunity Radar; Influencer Seeds Creator; Profile Building  
**Fases do Profile Building:** Farmer; Post Machine  
**Unidade canônica:** Persona + Marca Editorial  
**Piloto:** SharpEye · by Nadia Volkova  
**Stack proposta:** Next.js/TypeScript/Tailwind, Postgres/Supabase, OpenAI API, workers/filas quando necessário  

> Este documento define o que deverá ser implementado depois da aprovação. Não autoriza código, migration, integração, conta, gasto, publicação ou deploy.

---

## 1. Objetivo do produto

Implementar um sistema multi-tenant que sistematize o ciclo completo de criação de Personas de Autoridade:

```text
intake
→ pesquisa
→ evidência
→ oportunidade
→ seed
→ seleção
→ Farmer
→ Persona/Marca
→ pauta
→ draft
→ revisão humana
→ métricas
→ aprendizado
```

O sistema deve permitir que a FBR crie e opere Personas de Autoridade e desenvolva audiências orgânicas e nichadas com processo repetível, rastreável e governado.

O Authority Engine é responsável pela Persona, Marca Editorial, estratégia de autoridade e produção editorial. O FBR Agency Flux é responsável pela coordenação geral do processo criativo e de gestão junto aos agentes especializados.

---

## 2. Objetivos e resultados esperados

### Objetivos funcionais

- pesquisar oportunidades com fontes e limitações;
- cadastrar parceiros múltiplos;
- qualificar oportunidades com score explicável;
- gerar Seeds por OpenAI;
- comparar Seeds;
- registrar seleção humana;
- desenvolver Persona completa;
- criar Marca Editorial e blog;
- gerar drafts com guardrails;
- manter revisão humana obrigatória;
- medir audiência e produção;
- devolver aprendizado ao Radar;
- acompanhar tudo pelo dashboard operacional.

### Resultados esperados do MVP

1. Um fluxo Sharpeye executável localmente e posteriormente em runtime autorizado.
2. Uma oportunidade com evidência e dossier.
3. Seeds geradas por LLM e comparadas.
4. Uma Persona selecionada e desenvolvida.
5. Um blog/Marca Editorial documentado.
6. Um calendário inicial de pautas.
7. Drafts produzidos e revisados por Sergio.
8. Métricas registradas mesmo antes da publicação real.
9. Histórico completo de decisões, versões, Gates e owners.

---

## 3. Escopo do MVP

### Incluído

- autenticação e RBAC;
- multi-tenancy;
- cadastro de parceiros;
- cadastro de fontes;
- intake de pesquisa;
- Opportunity Radar;
- Opportunity Dossier;
- Seeds Creator via OpenAI;
- comparação e seleção humana;
- Profile Building/Farmer;
- Character Kit;
- Documento-Mestre de Marca;
- blog como ativo próprio;
- matriz de claims e guardrails;
- Post Machine para drafts;
- revisão humana obrigatória;
- dashboard de jobs e Gates;
- ledger de evidências;
- ledger de decisões;
- métricas de produção e audiência;
- feedback Radar;
- auditoria;
- fake adapters e adapters configuráveis fail-closed;
- testes locais e E2E com fake adapters.

### Fora do MVP

- publicação automática;
- captura de e-mail ativa;
- integração real Amazon sem cadastro e permissões;
- integração real de TikTok Shop, ClickBank, BuyGoods, MaxWeb, Digistore24, SellHealth, MarketHealth, NutriProfits e MoreNiche;
- automação de browser não autorizada;
- conta nova em plataforma;
- evasão de bloqueio;
- gasto de mídia;
- AdSense ativo;
- workers de escala sem necessidade demonstrada;
- métricas comerciais inventadas;
- migração remota sem Gate.

---

## 4. Usuários, papéis e autorização

| Papel | Responsabilidades |
|---|---|
| Sergio/Aprovador | aprovar escopo, Seed, Persona, drafts e futuros Gates de publicação |
| Admin de tenant | configurar tenant, parceiros, limites e usuários |
| Estrategista | conduzir oportunidade, score, dossier e recomendações |
| Farmer | desenvolver Persona, Marca e Character Kit |
| Editor | criar pauta, draft e revisões |
| Revisor de compliance | verificar fontes, claims, disclosure e bloqueios |
| Coordenador Flux | manter jobs, owners, dependências, handoffs e acompanhamento |
| Worker de sistema | executar somente jobs autorizados |
| Auditor | consultar histórico e evidências sem alterar decisões |

Todas as permissões devem ser escopadas por `tenant_id`. Sergio possui visão global somente em contexto explicitamente autorizado.

---

## 5. Requisitos funcionais

### 5.1 Fundação transversal — FND

#### FND-001 — Multi-tenant

O sistema deve isolar dados, credenciais referenciadas, jobs, métricas, fontes, custos e auditoria por tenant.

**Aceite:** não é possível consultar ou alterar recurso de outro tenant por manipulação de ID, rota ou payload.

#### FND-002 — RBAC e ownership

Toda ação deve validar tenant, ator, papel, owner e estado do recurso.

**Aceite:** 401 sem autenticação; 403 por papel/ownership; nenhuma rota confia apenas no payload do cliente.

#### FND-003 — Versionamento

Persona, Seed, Opportunity Dossier, Character Kit, Marca, prompt, output LLM, pauta, draft e decisão devem ser versionados.

#### FND-004 — Auditoria

Toda mutação deve gerar evento com ator, timestamp, tenant, recurso, versão, motivo e correlação.

#### FND-005 — Gates

O sistema deve impedir transições que exijam aprovação ainda não registrada.

#### FND-006 — Evidence Ledger

Toda evidência deve armazenar fonte, URL/origem, data, período, observação, tipo, limitação e confiança.

#### FND-007 — Partner Registry

Permitir cadastrar múltiplos parceiros e programas:

- Amazon Seller;
- Amazon Associates;
- TikTok Shop;
- ClickBank;
- BuyGoods;
- MaxWeb;
- Digistore24;
- SellHealth;
- MarketHealth;
- NutriProfits;
- MoreNiche.

O cadastro não significa integração ativa. Cada parceiro deve ter estado `planned`, `configured`, `verified`, `blocked` ou `disabled`.

#### FND-008 — OpenAI Gateway

Todas as chamadas OpenAI devem passar por um gateway interno com:

- modelo;
- versão do prompt;
- schema de saída;
- tokens;
- custo;
- latência;
- status;
- retry;
- erro;
- output sanitizado;
- avaliação.

#### FND-009 — Fail-closed

Sem credencial, contrato, fonte ou Gate, a operação deve bloquear explicitamente.

---

### 5.2 Opportunity Radar — OPR

#### OPR-001 — Criar Research Brief

Campos mínimos:

- tenant;
- mercado;
- país/idioma;
- nicho inicial;
- subnicho;
- público;
- problema;
- objetivo;
- produto próprio relacionado;
- parceiros desejados;
- restrições;
- owner;
- período de pesquisa.

#### OPR-002 — Cadastrar fonte

Campos:

- parceiro;
- nome;
- endpoint ou origem;
- tipo de fonte;
- escopo;
- versão do contrato;
- status;
- credencial por referência;
- limites;
- última verificação;
- limitações.

#### OPR-003 — Executar pesquisa

O sistema deve executar adapter fake, manual ou configurável, classificando o modo dos dados:

- `LIVE`;
- `MANUAL`;
- `PARTNER_FEED`;
- `DEMO`;
- `MIXED`.

#### OPR-004 — Normalizar produtos

Modelo mínimo:

- produto;
- fonte;
- parceiro;
- categoria;
- nicho;
- subnicho;
- preço;
- moeda;
- disponibilidade;
- observação;
- timestamp;
- evidências;
- limitações.

#### OPR-005 — Detectar sinais

O sistema deve identificar:

- tendências;
- assuntos correlatos;
- perguntas;
- problemas recorrentes;
- intenção informacional;
- intenção comparativa;
- intenção transacional;
- contexto de uso;
- produtos relacionados.

Não pode declarar tendência quando houver evidência insuficiente.

#### OPR-006 — Score

Score versionado com fatores separados:

- demanda;
- intenção;
- espaço editorial;
- adequação de conteúdo;
- produto próprio;
- produtos afiliados;
- autoridade possível;
- risco;
- confiança da evidência;
- esforço operacional.

O score não deve somar comissão como compensação automática de risco.

#### OPR-007 — Opportunity Dossier

Saída obrigatória:

- resumo;
- público;
- problema;
- oportunidade;
- produtos;
- contextos correlatos;
- fontes;
- fatos;
- hipóteses;
- recomendações;
- riscos;
- bloqueios;
- score;
- alternativas;
- decisão pendente;
- handoff para Seeds.

#### OPR-008 — Handoff para Seeds

Só pode ocorrer com status `qualified` e evidências mínimas definidas pelo PRD aprovado.

---

### 5.3 Influencer Seeds Creator — ISC

#### ISC-001 — Taxonomia

Manter taxonomia versionada de arquétipos e funções:

- consultora-visionária;
- curadora;
- analista;
- educadora;
- comparadora;
- guardiã;
- outras categorias aprovadas.

Cada item deve possuir força, limite, público, uso, formatos e riscos.

#### ISC-002 — Geração por LLM

A Seed deve conter:

- oportunidade de origem;
- nome provisório;
- arquétipo;
- função;
- público;
- problema;
- tese;
- promessa;
- voz;
- formatos;
- diferenciação;
- visual candidato;
- limites;
- monetização potencial;
- riscos;
- evidências;
- versão do modelo/prompt.

#### ISC-003 — Diferenciação

Comparar contra Personas e Marcas existentes, registrando proximidade, diferenças e limitações da análise.

#### ISC-004 — Score de Seed

Critérios:

- autoridade;
- audiência;
- diferenciação;
- conteúdo;
- conformidade;
- viabilidade;
- penalidade de risco.

A aparência não pode determinar aprovação.

#### ISC-005 — Comparison Pack

Deve apresentar alternativas lado a lado, recomendação indicativa, argumentos contra e perguntas abertas.

#### ISC-006 — Seleção humana

Nenhuma Seed muda para `selected` sem ator, data, versão, justificativa e escopo.

#### ISC-007 — Handoff para Farmer

Somente Seed selecionada e aprovada pode entrar no Profile Building/Farmer.

---

### 5.4 Profile Building — Fase Farmer — PBF

#### PBF-001 — Criar Persona

A Persona deve ser vinculada a uma Seed, Opportunity Dossier, tenant e Marca Editorial.

#### PBF-002 — Character Kit

Deve conter:

- snapshot;
- caráter;
- valores;
- voz;
- tom;
- assinaturas;
- comportamento diante de evidência fraca;
- comportamento diante de produto inadequado;
- como lida com discordância;
- do's e don'ts;
- linhas invioláveis;
- o que a Persona não é;
- disclosure de IA.

#### PBF-003 — Identidade visual

Deve conter prompt-base, negative prompt, paleta, cabelo, rosto, roupas, cenários, iluminação, continuidade e regras contra sexualização ou cópia.

#### PBF-004 — Marca Editorial

Deve conter:

- nome;
- assinatura;
- domínio;
- tagline;
- promessa;
- público;
- página Sobre;
- disclaimer;
- disclosure;
- categorias;
- blog;
- relação com a rede FBR.

#### PBF-005 — Sistema editorial

Deve conter:

- pilares;
- subpilares;
- formatos;
- séries;
- cadência;
- CTAs;
- calendário inicial;
- plano de 90 dias;
- temas de atração;
- temas de monetização;
- temas transversais.

#### PBF-006 — Claims e guardrails

Matriz de claims:

- permitido;
- permitido com fonte;
- suavizar;
- proibido;
- exige especialista;
- exige Gate.

#### PBF-007 — Monetização

Registrar produtos próprios, afiliados, pertinência, fonte, disclosure e restrições. Não habilitar parceiro apenas por comissão.

#### PBF-008 — Blog

Criar configuração do blog como ativo próprio relacionado à Persona e Marca. E-mail fica fora do MVP, mas o modelo deve permitir sua entrada futura.

#### PBF-009 — Approval Pack

Gerar pacote de aprovação com Persona, Marca, Character Kit, identidade, conteúdo, guardrails, monetização, riscos, métricas, custos e decisão pendente.

#### PBF-010 — Aprovação para produção

A Fase Farmer termina somente quando Sergio aprovar a Persona para produção ou solicitar revisão.

---

### 5.5 Profile Building — Fase Post Machine — PBP

#### PBP-001 — Criar pauta

A pauta deve referenciar Persona, Marca, versão, pilar, formato, objetivo e Gate.

#### PBP-002 — Criar briefing

Briefing deve conter:

- título de trabalho;
- pergunta/dor;
- público;
- promessa;
- fonte exigida;
- produto, se houver;
- CTA;
- canal futuro;
- disclosure;
- restrições;
- owner;
- prazo.

#### PBP-003 — Produzir draft

O LLM deve gerar draft estruturado, preservando voz, fontes, claims, CTA e disclosure.

#### PBP-004 — Validar draft

Validar automaticamente:

- schema;
- fonte;
- claims;
- voz;
- disclosure;
- produto;
- duplicação;
- risco;
- consistência com Character Kit.

#### PBP-005 — Revisão de Sergio

No MVP, todos os drafts devem aguardar revisão humana.

#### PBP-006 — Adaptação

Preparar versões futuras por canal sem publicar. Cada adaptação deve manter linhagem, fonte, disclosure e versão.

#### PBP-007 — Métricas

Registrar produção, revisão, audiência, visualizações, engajamento, tráfego, cliques e conversões quando disponíveis.

#### PBP-008 — Feedback

Emitir sinais para Radar com contexto, conteúdo, versão, período, métricas e limitações.

#### PBP-009 — Publicação futura bloqueada

Nenhum endpoint de publicação deve estar habilitado no MVP sem Gate posterior.

---

## 6. Máquina de estados

### Research

```text
created → researching → analyzed → qualified
                              ├── insufficient_evidence
                              ├── blocked
                              └── archived
```

### Opportunity

```text
candidate → qualified → selected_for_seed
                    ├── blocked
                    └── archived
```

### Seed

```text
proposed → selected → farmer_in_progress
    ├── invalid
    ├── blocked
    └── rejected
```

### Persona

```text
draft → generating → generated → review
                              ├── revision_requested
                              ├── blocked
                              └── approved_for_production
```

### Draft

```text
draft → review → awaiting_human_approval
                  ├── revision_requested
                  ├── blocked
                  └── rejected
```

### Future publication

```text
approved → publishing → published
                    ├── failed
                    └── retryable
```

---

## 7. Modelo de dados inicial

### Entidades

- `tenants`
- `users`
- `roles`
- `partners`
- `partner_programs`
- `partner_credentials_refs`
- `sources`
- `research_briefs`
- `research_runs`
- `research_records`
- `evidence_items`
- `opportunities`
- `opportunity_versions`
- `opportunity_scores`
- `seeds`
- `seed_versions`
- `seed_comparison_packs`
- `seed_decisions`
- `personas`
- `persona_versions`
- `brands`
- `character_kits`
- `visual_identity_kits`
- `editorial_systems`
- `claim_rules`
- `monetization_links`
- `blogs`
- `content_pillars`
- `content_briefs`
- `content_drafts`
- `content_versions`
- `review_decisions`
- `metrics`
- `feedback_signals`
- `jobs`
- `job_events`
- `gates`
- `audit_events`
- `outbox_events`
- `inbox_receipts`
- `llm_runs`

### Invariantes

- toda entidade operacional possui `tenant_id`;
- toda Persona possui versão ativa única;
- toda Marca aponta para uma Persona canônica;
- toda Seed aponta para oportunidade e versão;
- todo draft aponta para Persona, Marca, pauta e versão;
- toda recomendação comercial aponta para fonte e disclosure;
- nenhum recurso bloqueado pode avançar por chamada direta;
- nenhuma decisão aprovada pode ser sobrescrita sem nova versão;
- todos os eventos são idempotentes;
- RLS deve falhar fechado sem contexto de tenant/owner.

---

## 8. Contratos de API

### Radar

- `POST /api/research-briefs`
- `GET /api/research-briefs/:id`
- `POST /api/research-briefs/:id/run`
- `GET /api/research-runs/:id`
- `GET /api/evidence`
- `POST /api/opportunities`
- `GET /api/opportunities/:id`
- `GET /api/opportunities/:id/dossier`
- `POST /api/opportunities/:id/qualify`

### Seeds

- `POST /api/opportunities/:id/seeds/generate`
- `GET /api/opportunities/:id/seeds`
- `POST /api/seed-comparison-packs`
- `GET /api/seed-comparison-packs/:id`
- `POST /api/seed-decisions`

### Farmer

- `POST /api/personas`
- `POST /api/personas/:id/generate`
- `GET /api/personas/:id`
- `GET /api/personas/:id/character-kit`
- `GET /api/personas/:id/brand`
- `GET /api/personas/:id/editorial-system`
- `POST /api/personas/:id/approval-pack`
- `POST /api/personas/:id/approve-production`

### Post Machine

- `POST /api/content-briefs`
- `POST /api/content-briefs/:id/draft`
- `GET /api/content-drafts/:id`
- `POST /api/content-drafts/:id/validate`
- `POST /api/content-drafts/:id/review`
- `POST /api/content-drafts/:id/request-revision`
- `POST /api/content-drafts/:id/approve`
- `GET /api/metrics`
- `POST /api/feedback-signals`

### Governança

- `GET /api/jobs/:id`
- `GET /api/gates`
- `POST /api/gates/:id/decision`
- `GET /api/audit-events`
- `GET /api/health`
- `GET /api/readiness`

---

## 9. Requisitos não funcionais

### Segurança

- secrets apenas em Secret Manager/runtime;
- nenhuma chave OpenAI no frontend;
- logs sanitizados;
- RLS por tenant;
- RBAC server-side;
- validação de ownership;
- auditoria imutável;
- fail-closed.

### Confiabilidade

- operações idempotentes;
- retry com limites;
- jobs recuperáveis;
- estados intermediários persistidos;
- nenhum sucesso sem readback;
- nenhum evento duplicado por replay.

### Observabilidade

- logs estruturados;
- correlação de jobs;
- custo por LLM run;
- tempo por etapa;
- erros por fonte;
- bloqueios por Gate;
- heartbeat para jobs ativos;
- dashboard de owner, status, próximo passo e blocker.

### Qualidade LLM

- outputs estruturados;
- validação por schema;
- evals de regressão;
- dataset de casos SharpEye;
- versionamento de prompt/modelo;
- comparação entre versões;
- revisão humana antes de uso operacional.

A OpenAI recomenda evals contínuos porque outputs e comportamento podem variar entre modelos e snapshots.

### Escalabilidade

- arquitetura modular;
- adapters por parceiro;
- jobs assíncronos quando necessário;
- filas somente após necessidade demonstrada;
- isolamento por tenant;
- paginação e filtros;
- não gerar conteúdo em lote sem Gate.

---

## 10. Dashboard operacional

O dashboard deve mostrar:

- tenant;
- Persona;
- Marca;
- módulo;
- fase;
- job;
- owner;
- status;
- heartbeat;
- artefato;
- Gate;
- blocker;
- solução;
- próximo passo;
- última decisão;
- métricas;
- custo LLM;
- histórico.

Nenhum item pode ficar apenas como “bloqueado”. Todo blocker deve conter causa, owner, solução, next action, next check e critério de encerramento.

---

## 11. Estrutura do Projeto — Tela por Tela

Esta seção define a experiência operacional completa necessária para cumprir os requisitos do sistema. Ela transforma o pipeline de domínio em telas, ações, permissões, estados e fluxo de informação.

### 11.1 Estrutura global da aplicação

#### Shell autenticado

Todas as telas autenticadas usam:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Topbar: tenant | busca | notificações | ajuda | usuário             │
├─────────────────────┬───────────────────────────────────────────────┤
│ Menu principal      │ Conteúdo principal                             │
│ lateral esquerdo    │                                               │
│                     │                                               │
│ Authority Engine    │ Dashboard / módulo atual                      │
│ Dashboard           │                                               │
│ Pipeline            │                                               │
│ Opportunity Radar   │                                               │
│   Research Briefs   │                                               │
│   Oportunidades     │                                               │
│   Fontes            │                                               │
│   Parceiros         │                                               │
│ Seeds Creator       │                                               │
│ Profile Building    │                                               │
│   Farmer            │                                               │
│   Personas          │                                               │
│   Marcas/Blogs      │                                               │
│   Post Machine      │                                               │
│   Calendário        │                                               │
│ Aprovações          │                                               │
│ Métricas/Feedback   │                                               │
│ Jobs/Atividade      │                                               │
│ Auditoria           │                                               │
│ Configurações       │                                               │
│ Ajuda/PRD          │                                               │
└─────────────────────┴───────────────────────────────────────────────┘
```

**Regra de layout:** manter o design system atual do Authority Engine, incluindo a navegação lateral esquerda já existente no dashboard local. A estrutura de telas abaixo amplia o produto sem substituir o padrão visual, a posição do menu, a linguagem de componentes ou a identidade já estabelecida.

**Elementos persistentes:**

- tenant ativo;
- usuário e papel;
- breadcrumb;
- status do recurso;
- Gate atual;
- owner;
- último heartbeat quando houver job;
- botão de ação primária;
- alertas de bloqueio;
- busca global;
- link para histórico/auditoria.

**Regra de segurança:** toda ação visível deve ser filtrada por papel, tenant, ownership e estado. Esconder botão não substitui autorização server-side.

---

### 11.2 Tela 01 — Login

**Rota:** `/login`

**Objetivo:** autenticar o usuário no tenant autorizado.

**Componentes:**

- logo Authority Engine;
- e-mail/identificador;
- senha ou provedor SSO futuro;
- recuperação de acesso;
- indicação de ambiente;
- mensagem de erro;
- link de suporte.

**Ações:** entrar, recuperar acesso.

**Estados:** vazio, carregando, credencial inválida, conta bloqueada, tenant não autorizado, sucesso.

**Fluxo:**

```text
credencial
→ autenticação
→ resolução de usuário/tenant/papel
→ criação de sessão
→ Dashboard
```

---

### 11.3 Tela 02 — Seleção de tenant

**Rota:** `/select-tenant`

**Exibição:** somente quando o usuário possuir mais de um tenant autorizado.

**Componentes:** cards de tenant, status, última atividade e papel.

**Ações:** selecionar tenant, sair.

**Destino:** Dashboard com `tenant_id` definido no contexto server-side.

---

### 11.4 Tela 03 — Onboarding da operação

**Rota:** `/setup`

**Objetivo:** configurar o tenant sem conectar automaticamente serviços externos.

**Etapas:**

1. dados da organização;
2. objetivo editorial;
3. parceiros pretendidos;
4. fontes de pesquisa;
5. modelo OpenAI e limite orçamentário;
6. membros e papéis;
7. marca inicial;
8. revisão do checklist.

**Ações:** salvar rascunho, avançar, voltar, concluir configuração.

**Estado:** `setup_incomplete`, `ready_for_research`, `blocked`.

**Gate:** concluir setup não aprova integração, publicação ou gasto.

---

### 11.5 Tela 04 — Dashboard / Control Room

**Rota:** `/dashboard`

**Objetivo:** mostrar o estado operacional de todo o Authority Engine.

**Layout:**

- cabeçalho com tenant e período;
- botão primário **Adicionar**;
- botão **Continuar pipeline**;
- botão **Ver pendências**;
- cards de métricas;
- pipeline visual;
- fila de aprovação;
- jobs ativos;
- bloqueios;
- atividade recente;
- alertas de fonte/LLM/Gate.

**Cards principais:**

- oportunidades em pesquisa;
- oportunidades qualificadas;
- Seeds aguardando decisão;
- Personas em Farmer;
- drafts aguardando revisão;
- followers/audiência;
- visualizações;
- engajamento;
- custo OpenAI;
- bloqueios ativos.

**Ações:**

- Adicionar Research Brief;
- abrir oportunidade;
- abrir comparação de Seeds;
- continuar Farmer;
- abrir fila de revisão;
- abrir blocker;
- filtrar por owner/status/período.

**Dados:** agrega `jobs`, `gates`, `opportunities`, `seeds`, `personas`, `content_drafts`, `metrics`, `audit_events`.

**Estado vazio:** orientar o usuário para **Adicionar Research Brief**.

---

### 11.6 Tela 05 — Pipeline visual

**Rota:** `/pipeline`

**Objetivo:** mostrar o fluxo completo e permitir localizar cada item.

**Colunas:**

```text
Research
→ Opportunities
→ Seeds
→ Selected
→ Farmer
→ Approved Persona
→ Drafts
→ Review
→ Metrics
```

**Cada card exibe:**

- nome;
- tipo;
- tenant;
- owner;
- status;
- versão;
- próximo Gate;
- blocker;
- último evento;
- próxima ação.

**Ações:** abrir, atribuir owner, adicionar observação, iniciar ação permitida, ver histórico.

**Regra:** não permitir arrastar card para coluna que represente transição não autorizada. Transições ocorrem pela API de domínio e Gate.

---

### 11.7 Tela 06 — Partner Registry

**Rota:** `/settings/partners`

**Objetivo:** cadastrar e controlar parceiros, programas e fontes sem declarar integração inexistente.

**Lista:**

- parceiro;
- programa;
- tipo: próprio/afiliado/fonte;
- país/mercado;
- status;
- contrato;
- escopo;
- credencial referenciada;
- última verificação;
- limitações.

**Botão Adicionar parceiro:** abre formulário com:

- nome;
- programa;
- tipo;
- mercado;
- endpoint/origem;
- versão de contrato;
- escopo;
- limites;
- termos;
- referência de Secret Manager;
- status inicial.

**Ações:** adicionar, editar metadados, testar health autorizado, bloquear, desativar, ver fontes, ver histórico.

**Não permitido:** inserir segredo na UI ou declarar `verified` sem readback.

---

### 11.8 Tela 07 — Fontes de pesquisa

**Rota:** `/radar/sources`

**Objetivo:** administrar fontes usadas pelo Radar.

**Componentes:** tabela de fontes, filtros por parceiro/status/modo, health, limitações e cobertura.

**Ações:** cadastrar fonte, editar contrato, executar teste autorizado, ver erros, bloquear fonte, abrir Evidence Ledger.

**Estados:** `planned`, `configured`, `verified`, `blocked`, `disabled`.

**Fluxo:**

```text
Partner Registry
→ Source Registry
→ Research Run
→ Evidence Ledger
```

---

### 11.9 Tela 08 — Research Briefs

**Rota:** `/radar/research`

**Objetivo:** iniciar e acompanhar pesquisas.

**Lista:**

- título;
- nicho;
- subnicho;
- público;
- tenant;
- owner;
- status;
- fontes;
- última execução;
- próxima ação.

**Botão Adicionar Research Brief:** formulário com mercado, país/idioma, nicho, subnicho, problema, público, objetivo, produtos próprios, parceiros, limitações e prazo.

**Ações:** salvar rascunho, executar pesquisa, duplicar versão, cancelar, abrir detalhes.

**Fluxo:**

```text
Adicionar Brief
→ salvar
→ selecionar fontes
→ executar Research Run
→ acompanhar job
→ abrir resultados
```

---

### 11.10 Tela 09 — Research Run / resultados brutos

**Rota:** `/radar/research/:id/runs/:runId`

**Objetivo:** mostrar o que foi coletado sem misturar dado bruto com interpretação.

**Abas:**

- resumo;
- registros brutos;
- produtos;
- tendências;
- assuntos correlatos;
- fontes;
- erros;
- limitações;
- log do job.

**Filtros:** fonte, modo de dados, período, categoria, confiança, status.

**Ações:** aceitar registro, marcar insuficiente, adicionar observação, excluir duplicata lógica, reprocessar, gerar dossier.

**Regra:** `DEMO` nunca pode ser apresentado como `LIVE`.

---

### 11.11 Tela 10 — Evidence Ledger

**Rota:** `/radar/evidence`

**Objetivo:** consultar e auditar todas as evidências.

**Campos exibidos:** fonte, URL/origem, data, período, observação, tipo, limitação, confiança e recursos relacionados.

**Tipos:** fato, hipótese, recomendação, risco, bloqueio, decisão.

**Ações:** filtrar, relacionar a oportunidade, solicitar revisão, marcar desatualizada, abrir fonte original.

---

### 11.12 Tela 11 — Oportunidades

**Rota:** `/radar/opportunities`

**Objetivo:** listar oportunidades e seu estágio.

**Lista/cards:**

- nome;
- nicho;
- subnicho;
- audiência;
- problema;
- status;
- score;
- risco;
- confiança;
- produtos;
- fontes;
- owner;
- próximo Gate.

**Botão Adicionar:** criar manualmente uma oportunidade ou partir de Research Run.

**Ações:** abrir, qualificar, bloquear, arquivar, comparar, gerar Seeds, adicionar observação.

**Regra:** nenhuma oportunidade abre projeto diretamente.

---

### 11.13 Tela 12 — Dossier da oportunidade

**Rota:** `/radar/opportunities/:id`

**Estrutura:**

- resumo executivo;
- público/problema;
- contexto e assuntos correlatos;
- produtos próprios;
- produtos afiliados;
- sinais e tendências;
- concorrência/referências;
- score detalhado;
- fatos;
- hipóteses;
- riscos;
- bloqueios;
- alternativas sem monetização;
- decisão pendente;
- histórico;
- handoff para Seeds.

**Botões:**

- qualificar;
- bloquear;
- gerar Seeds;
- comparar versões;
- pedir revisão;
- arquivar.

**Gate:** somente `qualified` habilita geração formal de Seeds.

---

### 11.14 Tela 13 — Seeds Creator

**Rota:** `/seeds`

**Objetivo:** mostrar Seeds produzidas por oportunidade.

**Lista:** nome, arquétipo, função, score, risco, diferenciação, status, versão e modelo/prompt utilizado.

**Botão:** **Gerar Seeds com OpenAI**.

**Modal de geração:**

- oportunidade;
- versão do dossier;
- taxonomia;
- número de alternativas;
- prompt version;
- limite de custo;
- confirmação de execução.

**Estados:** preparado, gerando, concluído, erro, incompleto, bloqueado.

**Ações:** abrir Seed, comparar, regenerar nova versão, marcar inválida, enviar para comparação.

---

### 11.15 Tela 14 — Comparison Pack de Seeds

**Rota:** `/seeds/comparisons/:id`

**Objetivo:** permitir decisão humana comparando alternativas.

**Layout:** tabela ou cards lado a lado com:

- arquétipo;
- função;
- público;
- problema;
- promessa;
- voz;
- formatos;
- diferenciação;
- risco;
- score;
- monetização;
- argumentos a favor;
- argumentos contra;
- perguntas abertas.

**Botões:**

- selecionar Seed;
- rejeitar todas;
- solicitar nova geração;
- pedir revisão;
- abrir evidências.

**Gate:** somente Sergio ou papel autorizado pode selecionar.

---

### 11.16 Tela 15 — Decisão de Seed

**Rota:** `/seeds/decisions/:id`

**Objetivo:** registrar a decisão formal.

**Campos:** Seed, versão, decisão, escopo, justificativa, riscos aceitos, owner, data e próximo Gate.

**Ações:** selecionar, rejeitar, devolver para revisão.

**Destino:** Seed selecionada → Fase Farmer.

---

### 11.17 Tela 16 — Personas

**Rota:** `/profile-building/personas`

**Objetivo:** listar Personas e fases do Profile Building.

**Cards:**

- Persona;
- Marca;
- Seed de origem;
- oportunidade;
- versão;
- fase atual;
- status;
- owner;
- próximo Gate;
- atividade recente.

**Filtros:** tenant, marca, fase, status, owner, piloto.

**Botão:** iniciar Farmer para Seed selecionada.

---

### 11.18 Tela 17 — Workspace Farmer

**Rota:** `/profile-building/personas/:id/farmer`

**Objetivo:** desenvolver integralmente a Persona.

**Navegação interna:**

1. Overview;
2. Identidade narrativa;
3. Caráter e valores;
4. Voz;
5. Character Kit;
6. Identidade visual;
7. Marca Editorial;
8. Blog;
9. Público e promessa;
10. Pilares e temas;
11. Sistema editorial;
12. Claims e guardrails;
13. Monetização;
14. Fontes;
15. Approval Pack;
16. Histórico de versões.

**Cada aba exibe:**

- conteúdo atual;
- versão;
- status de completude;
- fontes;
- bloqueios;
- sugestões do LLM;
- alterações pendentes;
- autor;
- última revisão.

**Ações:** gerar seção, editar, comparar versão, validar, solicitar revisão, enviar para aprovação.

**Regra:** geração por LLM nunca substitui revisão; saída incompleta deixa a seção bloqueada.

---

### 11.19 Tela 18 — Marca Editorial e Blog

**Rota:** `/profile-building/personas/:id/brand`

**Objetivo:** configurar a unidade `Persona + Marca Editorial`.

**Campos:**

- nome;
- assinatura;
- domínio;
- tagline;
- promessa;
- página Sobre;
- disclaimer;
- disclosure IA;
- disclosure afiliados;
- categorias;
- navegação do blog;
- pilares;
- relacionamento com FBRSigns;
- status do domínio.

**Ações:** salvar rascunho, validar completude, visualizar preview, solicitar aprovação.

**Fora do MVP:** publicação pública do blog sem Gate de infraestrutura/conteúdo.

---

### 11.20 Tela 19 — Approval Pack da Persona

**Rota:** `/profile-building/personas/:id/approval-pack`

**Objetivo:** reunir tudo que Sergio precisa revisar antes de liberar produção.

**Conteúdo:**

- origem da oportunidade;
- Seed selecionada;
- Persona;
- Marca;
- Character Kit;
- identidade visual;
- temas;
- plano editorial;
- guardrails;
- claims;
- monetização;
- riscos;
- custos;
- métricas;
- limitações;
- pergunta de decisão.

**Ações:** aprovar produção, solicitar revisão, rejeitar, registrar observação.

**Destino:** aprovação → Post Machine; revisão → Farmer; rejeição → arquivado/revisão.

---

### 11.21 Tela 20 — Calendário Editorial

**Rota:** `/profile-building/post-machine/calendar`

**Objetivo:** organizar pautas e drafts sem publicar.

**Visualizações:** calendário, lista, quadro por status e filtro por pilar/canal/owner.

**Cada item:** título, pilar, formato, Persona, status, fonte, produto, CTA, owner, prazo e próximo Gate.

**Botão Adicionar pauta:** formulário com briefing editorial.

**Ações:** criar pauta, duplicar, reordenar prioridade, enviar para draft, bloquear, arquivar.

---

### 11.22 Tela 21 — Briefing de conteúdo

**Rota:** `/profile-building/post-machine/briefs/:id`

**Objetivo:** validar a entrada antes da geração.

**Campos:** tema, pergunta, público, pilar, formato, objetivo, fontes, produto, CTA, disclosure, restrições e owner.

**Validações:** Character Kit aprovado, guardrails disponíveis, fonte obrigatória, produto pertinente e próximo Gate definido.

**Ações:** salvar, validar, gerar draft, solicitar contexto.

---

### 11.23 Tela 22 — Editor de Draft

**Rota:** `/profile-building/post-machine/drafts/:id`

**Objetivo:** editar e validar a peça antes da aprovação.

**Layout:**

- editor principal;
- painel de fontes;
- painel de claims;
- painel de disclosure;
- painel de voz;
- painel de produto;
- histórico de versões;
- checklist de revisão;
- painel de risco;
- botão de envio a Sergio.

**Ações:** gerar, regenerar seção, editar, comparar versão, validar, salvar, enviar para revisão, bloquear.

**Estados:** draft, validation_failed, review, revision_requested, awaiting_human_approval, blocked, rejected.

---

### 11.24 Tela 23 — Fila de revisão humana

**Rota:** `/approvals`

**Objetivo:** concentrar todas as decisões de Sergio.

**Filtros:** tipo, Persona, Marca, owner, risco, data, prioridade, status e Gate.

**Card de revisão:**

- resumo;
- draft;
- fontes;
- claims;
- produto;
- disclosure;
- riscos;
- histórico;
- pergunta de decisão.

**Ações:** aprovar, solicitar revisão, rejeitar, bloquear, comentar, delegar revisão técnica.

**Regra MVP:** todo draft termina nessa fila antes de qualquer publicação futura.

---

### 11.25 Tela 24 — Métricas e Feedback

**Rota:** `/metrics`

**Objetivo:** acompanhar audiência, produção e aprendizado.

**Seções:**

- seguidores;
- visualizações;
- audiência recorrente;
- engajamento;
- blog;
- YouTube;
- cliques;
- leads futuros;
- conversões futuras;
- produção por semana;
- tempo de revisão;
- custo LLM;
- qualidade editorial.

**Ações:** adicionar métrica, importar métrica autorizada, marcar insuficiente, criar feedback, vincular a conteúdo, enviar sinal ao Radar.

**Regra:** toda métrica possui período, fonte, modo de coleta e limitação.

---

### 11.26 Tela 25 — Jobs e Atividade

**Rota:** `/jobs`

**Objetivo:** observar o processamento do sistema.

**Cada job:**

- tipo;
- recurso;
- tenant;
- owner;
- estado;
- etapa atual;
- progresso;
- heartbeat;
- tentativas;
- erro;
- próximo passo;
- artefatos;
- handoff.

**Ações:** abrir, pausar quando permitido, cancelar, reprocessar, atribuir owner, abrir blocker.

**Regra:** job bloqueado deve ter causa, owner, solução, next action e next check.

---

### 11.27 Tela 26 — Auditoria e Histórico

**Rota:** `/audit`

**Objetivo:** consultar decisões, versões e eventos.

**Filtros:** ator, tenant, recurso, evento, Gate, período, versão e correlação.

**Ações:** abrir evento, comparar versões, exportar relatório sanitizado, relacionar decisão.

**Não permitido:** editar histórico imutável.

---

### 11.28 Tela 27 — Configurações

**Rota:** `/settings`

**Subtelas:**

- tenant;
- usuários e papéis;
- OpenAI e limites;
- parceiros;
- fontes;
- taxonomia;
- políticas e guardrails;
- domínio/blog;
- preferências de notificações;
- retenção de dados;
- integrações futuras.

**Regra:** secrets não são exibidos; apenas referência, status e última validação.

---

### 11.29 Tela 28 — About / PRD / Ajuda

**Rota:** `/about`

**Conteúdo:**

- propósito do Authority Engine;
- pipeline;
- módulos;
- fases;
- Gates;
- glossário;
- status do sistema;
- limitações;
- link para PRD vigente;
- versão da aplicação;
- modo de dados: live/manual/demo.

---

### 11.30 Ação global — botão Adicionar

O botão **Adicionar** deve ser contextual ao local atual:

| Local | Ação primária |
|---|---|
| Dashboard | Research Brief, oportunidade, pauta ou tarefa |
| Radar | Research Brief, fonte, parceiro ou oportunidade |
| Seeds | geração de Seeds ou Comparison Pack |
| Farmer | Persona, Marca ou seção do Character Kit |
| Post Machine | pauta, briefing ou draft |
| Métricas | métrica ou feedback |
| Configurações | tenant, usuário, parceiro ou fonte |

O menu deve mostrar apenas ações permitidas para o papel, tenant e estado atual.

---

### 11.31 Fluxo de informação entre telas

```text
Login
  ↓ sessão + tenant + papel
Dashboard
  ↓ Adicionar Research Brief
Research Brief
  ↓ executar fonte/adapters
Research Run
  ↓ registros normalizados
Evidence Ledger
  ↓ qualificação
Opportunity Dossier
  ↓ gerar com OpenAI
Seeds Creator
  ↓ Comparison Pack
Decisão humana de Seed
  ↓
Workspace Farmer
  ↓ Persona + Marca + Character Kit + Blog + Guardrails
Approval Pack
  ↓ aprovação humana
Calendário Editorial
  ↓ criar briefing
Briefing de Conteúdo
  ↓ OpenAI Gateway
Editor de Draft
  ↓ validação de fonte/claim/voz/disclosure
Fila de Revisão
  ↓ aprovação ou revisão
Draft aprovado
  ↓ no MVP: permanece preparado, não publicado
Métricas/Feedback
  ↓ eventos e sinais
Opportunity Radar
```

### 11.32 Fluxo de dados por responsabilidade

```text
Partner Registry
→ Source Registry
→ Research Run
→ Evidence Ledger
→ Opportunity Dossier
→ Seed Version
→ Persona Version
→ Brand/Blog
→ Content Brief
→ Content Draft
→ Review Decision
→ Metric Record
→ Feedback Signal
→ novo Research Brief/opportunity
```

Cada seta representa um contrato versionado, não acesso direto a tabelas internas de outro módulo.

### 11.33 Estados visuais obrigatórios

Toda tela precisa mostrar:

- carregando;
- vazio;
- sucesso;
- erro recuperável;
- erro bloqueante;
- sem permissão;
- dados insuficientes;
- aguardando Gate;
- aguardando owner;
- job em andamento;
- último readback;
- próxima ação.

Nunca mostrar somente um spinner ou uma mensagem genérica de erro.

---

## 12. Critérios de aceite globais

- [ ] multi-tenant demonstrado com isolamento positivo e negativo;
- [ ] RBAC demonstrado com 401 e 403;
- [ ] Opportunity Radar funciona com fake adapter;
- [ ] fontes e evidências são rastreáveis;
- [ ] score é versionado e explicado;
- [ ] Seed é gerada por OpenAI com output estruturado;
- [ ] erro de schema do LLM bloqueia a execução;
- [ ] seleção humana é obrigatória;
- [ ] Farmer produz Persona, Marca, Character Kit e sistema editorial;
- [ ] Post Machine produz draft sem publicar;
- [ ] claims e disclosure são validados;
- [ ] Sergio aprova todos os drafts no MVP;
- [ ] métricas possuem período, fonte e limitação;
- [ ] feedback retorna ao Radar;
- [ ] logs não contêm secrets;
- [ ] eventos são idempotentes;
- [ ] restart não perde estado;
- [ ] fake é separado de integração real;
- [ ] nenhum parceiro é declarado integrado sem readback;
- [ ] nenhuma migration/deploy/pubicação ocorre sem Gate.

---

## 13. Roadmap de implementação

### Fase A — Fundação

- Next.js/TypeScript;
- autenticação;
- tenants;
- RBAC;
- Postgres/Supabase;
- RLS;
- auditoria;
- Gates;
- jobs;
- dashboard base.

### Fase B — Opportunity Radar

- Partner Registry;
- Source Registry;
- Research Brief;
- Evidence Ledger;
- adapters fake/manual/configuráveis;
- normalização;
- score;
- dossier;
- handoff.

### Fase C — Seeds Creator

- taxonomia;
- OpenAI Gateway;
- geração estruturada;
- diferenciação;
- score;
- comparison pack;
- decisão humana.

### Fase D — Profile Building/Farmer

- Persona;
- Brand;
- Character Kit;
- visual kit;
- editorial system;
- claims;
- monetização;
- blog;
- approval pack.

### Fase E — Profile Building/Post Machine

- pauta;
- briefing;
- draft;
- validações;
- revisão;
- versionamento;
- métricas;
- feedback.

### Fase F — Integrações futuras

- Amazon Seller;
- Amazon Associates;
- TikTok Shop;
- demais parceiros;
- canais de publicação;
- publicação assistida;
- captura de e-mail;
- workers de escala.

---

## 14. Bloqueios e dependências

- aprovação do Projeto Conceitual;
- aprovação deste PRD;
- definição final do briefing Sharpeye/Nadia;
- cadastro e permissões Amazon;
- decisão do primeiro canal além do blog;
- orçamento OpenAI;
- política de claims para saúde/suplementos;
- definição de critérios do piloto;
- definição da unidade canônica final no schema;
- runtime Supabase/Postgres autorizado;
- Secret Manager configurado;
- contratos com Flux e FBR Blogs.

---

## 15. Regra de transição para execução

Este PRD só pode virar backlog executável depois que Sergio:

1. aprovar o Projeto Conceitual;
2. aprovar o PRD;
3. aprovar o piloto Sharpeye/Nadia;
4. aprovar a ordem das fases;
5. aprovar o orçamento/uso OpenAI;
6. aprovar o escopo do MVP;
7. liberar explicitamente a programação.
