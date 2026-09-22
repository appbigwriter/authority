# Auditoria página por página — Authority Engine

**Data:** 2026-09-22  
**Escopo:** UI local em `09-codigo/public/dashboard.html`, backend `09-codigo/src/server.ts`, PRD `02-prd/PRD-AUTHORITY-ENGINE-IMPLEMENTACAO.md`, STATUS e testes locais.  
**Regra de classificação:** build/teste verde não transforma fixture em produto; “feito” exige UI, ação, contrato/API, persistência/readback e estado correto.

## Conclusão executiva

A percepção de Sergio está correta: o Authority atual é um **shell visual com núcleo local parcialmente implementado**, não o produto tela-a-tela descrito no PRD.

- O PRD especifica 28 telas/áreas.
- O dashboard atual expõe 17 views client-side em um único HTML, via `?view=`; isso não equivale às 28 telas planejadas.
- Existem APIs locais para parte do fluxo, mas várias views não as consomem.
- Muitas telas exibem `DEMO / FAKE`, dados determinísticos ou botões sem listener/API.
- O estado oficial do projeto já dizia S1–S4 “parcial”, mas a UI apresentava partes como se fossem operacionais.
- O runtime remoto chegou a provar banco, migration e grants, mas persistência/RLS/readback ainda não são aceites globais do produto.
- Alterações no working tree durante esta auditoria foram congeladas e não contam como entrega publicada: `dashboard.html`, `server.ts`, `influencer-seeds.ts` e teste de prompt estão modificados localmente.

**Decisão de processo:** não continuar implementando telas isoladas antes de aceitar esta auditoria e transformar os gaps em um backlog de produto verificável.

---

## Páginas/áreas existentes no shell atual

### 1. Login / autenticação

**1 — O que estava planejado?**  
Autenticar usuário, resolver usuário/tenant/papel, criar sessão e encaminhar ao Dashboard. Rota planejada: `/login`; estados de credencial inválida, conta bloqueada, tenant não autorizado e sucesso.

**2 — O que está feito atende?**  
**Não.** O shell possui um campo de Bearer token em `sessionStorage`. Não há login de usuário, sessão de aplicação, recuperação de acesso, resolução de tenant por usuário ou `/login` funcional. O warning “password field not contained in a form” é sintoma da implementação superficial do campo.

**3 — O que precisa ser feito?**  
Criar sessão real/cookie ou SSO, usuário, papel, tenant e expiração; remover o token manual da experiência normal; manter Bearer apenas para operação técnica; testar 401/403, sessão expirada e tenant não autorizado.

---

### 2. Seleção de tenant

**1 — O que estava planejado?**  
Exibir `/select-tenant` somente quando o usuário possuir mais de um tenant autorizado, com cards, papel e última atividade; contexto definido server-side.

**2 — O que está feito atende?**  
**Não.** Existe um `<select>` visual com `FBR Agency/fbr-agency`, sem consulta a tenants, membership ou autorização server-side. O tenant é configuração/fallback, não cadastro persistente multi-tenant.

**3 — O que precisa ser feito?**  
Implementar `tenants`, `tenant_members`, papéis e contexto de sessão; mostrar seleção somente quando necessário; remover qualquer tenant fictício/fallback; aplicar RLS e testar isolamento positivo/negativo.

---

### 3. Onboarding da operação / Setup

**1 — O que estava planejado?**  
`/setup` com organização, objetivo editorial, parceiros, fontes, modelo OpenAI/limite, membros, marca e checklist; estados `setup_incomplete`, `ready_for_research`, `blocked`.

**2 — O que está feito atende?**  
**Não existe.** A tela não está no shell e não há fluxo de onboarding.

**3 — O que precisa ser feito?**  
Criar persistência e wizard de setup, contratos de validação, gates e readback; não conectar fornecedor/gasto automaticamente ao concluir setup.

---

### 4. Dashboard / Control Room — `overview`

**1 — O que estava planejado?**  
Estado operacional agregado: métricas, pipeline, fila de aprovação, jobs, blockers, atividade, alertas de fontes/LLM/Gates e ações contextuais.

**2 — O que está feito atende?**  
**Parcial, insuficiente.** Cards e blocos visuais existem, mas dependem de `state`/fixtures; não há agregação completa de followers, audiência, custo LLM, produção e bloqueios reais. A ação global `Adicionar` abre principalmente o modal de oportunidade, independentemente do contexto.

**3 — O que precisa ser feito?**  
Criar read model do Control Room, endpoints agregadores, filtros por tenant/owner/status/período, jobs e gates reais, alertas e ações que levam às páginas corretas. Estado vazio/erro deve orientar para ações reais, não fixtures.

---

### 5. Pipeline visual — `pipeline`

**1 — O que estava planejado?**  
Colunas Research → Opportunities → Seeds → Selected → Farmer → Approved Persona → Drafts → Review → Metrics; cards com owner, status, versão, Gate, blocker, evento e próxima ação; transições somente pela API.

**2 — O que está feito atende?**  
**Parcial, insuficiente.** Há um quadro local/read-only. Cards não executam atribuição, observação, transição autorizada, histórico ou próxima ação persistida de forma completa.

**3 — O que precisa ser feito?**  
Criar read model real, endpoints de transição, ownership, blockers e histórico; impedir drag/transição ilegal; cada card deve abrir o recurso real e comprovar readback.

---

### 6. Partner Registry

**1 — O que estava planejado?**  
`/settings/partners`: parceiros, programas, tipo, mercado, contrato, escopo, referência de secret, status, health e limitações.

**2 — O que está feito atende?**  
**Não na UI.** Existem APIs locais `/api/partners` e `/api/registries/partners`, mas não há tela, formulário, edição, health, bloqueio ou histórico.

**3 — O que precisa ser feito?**  
Criar tela e formulário conectados aos endpoints, persistência relacional, estados `planned/configured/verified/blocked/disabled`, health autorizado e readback; nunca declarar verificado sem evidência.

---

### 7. Fontes de pesquisa / Source Registry

**1 — O que estava planejado?**  
`/radar/sources`: fontes por parceiro/status/modo, health, limitações, cobertura, contrato e Evidence Ledger.

**2 — O que está feito atende?**  
**Não na UI.** Existem APIs `/api/sources` e `/api/registries/sources`, mas a view e os fluxos planejados não existem.

**3 — O que precisa ser feito?**  
Criar cadastro, filtros, teste autorizado, bloqueio, erro, cobertura e ligação fonte → Research Run → Evidence Ledger.

---

### 8. Audience Radar / Oportunidades — `radar`

**1 — O que estava planejado?**  
Pesquisar nichos, subnichos e produtos, gerar oportunidades com evidência, score, risco, confiança, fontes, qualificação, bloqueio, arquivamento e handoff para Seeds; nenhuma oportunidade abre projeto diretamente.

**2 — O que está feito atende?**  
**Parcial.** Criar oportunidade e executar pesquisa possuem APIs (`POST /api/opportunities`, `POST /api/opportunities/research`) e persistência foi exercitada no runtime. Porém a tela é simples, sem lista completa de score/fontes/risco, sem fontes reais, sem filtros, sem qualificação visível e sem read model completo. O nome de apresentação foi alterado para Audience Radar; contratos internos continuam `/api/opportunities`.

**3 — O que precisa ser feito?**  
Conectar fontes/partners, pesquisa profunda real, score explicado/versionado, Evidence Ledger, filtros, qualificar/bloquear/arquivar e handoff formal; testar com dados reais autorizados e não chamar fixture de live.

---

### 9. Research Briefs — `briefs`

**1 — O que estava planejado?**  
Criar e acompanhar briefs com mercado, país/idioma, nicho, subnicho, problema, público, objetivo, produtos, parceiros, limitações e prazo; salvar, executar, duplicar, cancelar e abrir detalhes.

**2 — O que está feito atende?**  
**Não.** A view é explicitamente `DEMO / FAKE`. O botão “Adicionar Research Brief” abre o modal genérico de oportunidade, não um formulário de Brief. As APIs locais existentes são:

```text
POST /api/research-briefs
GET  /api/research-briefs/:id
POST /api/research-briefs/:id/run
```

Mas a UI não as consome adequadamente.

**3 — O que precisa ser feito?**  
Criar formulário próprio, lista baseada em GET/readback, seleção de fontes, execução via run, status/job/owner/última execução, duplicação/versionamento e tratamento de erro/insuficiência.

---

### 10. Research Run — `research`

**1 — O que estava planejado?**  
Rota `/radar/research/:id/runs/:runId`, com resumo, registros brutos, produtos, tendências, correlatos, fontes, erros, limitações e log; aceitar, marcar insuficiente, observar, deduplicar, reprocessar e gerar dossier.

**2 — O que está feito atende?**  
**Não.** A view exibe `DEMO · NÃO LIVE`, usa `state.researchRuns[0]` e botões sem ações. Existe `GET /api/research-runs/:id` e a execução local `POST /api/research-briefs/:id/run`, mas a página não carrega run por ID nem mostra os dados reais.

**3 — O que precisa ser feito?**  
Criar rota/estado selecionado por brief/run, carregar readback real, abas funcionais, fonte/limitação/confiança, ações de revisão, reprocessamento e geração do Dossier; separar obrigatoriamente DEMO, MANUAL, MIXED e LIVE.

---

### 11. Evidence Ledger — `evidence`

**1 — O que estava planejado?**  
Consultar todas as evidências com fonte, origem/URL, data, período, observação, tipo, limitação, confiança e recursos relacionados; filtrar, relacionar, revisar, desatualizar e abrir fonte.

**2 — O que está feito atende?**  
**Não.** A tabela usa `DEMO_SURFACES.evidence`; filtros e botões não têm ação. Há `/api/audit-events` e eventos de dossier, mas não um Evidence Ledger relacional/API próprio.

**3 — O que precisa ser feito?**  
Criar entidade/endpoint de evidência, ingestão a partir de fontes/runs, tipos e confiança, filtros, vínculo a brief/opportunity/dossier/seed/persona, revisão e readback imutável.

---

### 12. Opportunity Dossier — `dossier`

**1 — O que estava planejado?**  
Resumo executivo, público/problema, produtos, sinais, concorrência, score, fatos, hipóteses, riscos, blockers, alternativas, decisão, histórico e handoff para Seeds. Botões: qualificar, bloquear, gerar Seeds, comparar, pedir revisão e arquivar.

**2 — O que está feito atende?**  
**Não originalmente; parcialmente no working tree não publicado.** A tela usava `state.dossiers[0]`/fixture e tinha botões estáticos. Existem APIs reais de dossier e qualificação. Foram preparados localmente endpoints de revisão/bloqueio e ligação para Seeds, mas isso ainda não foi publicado nem validado no runtime remoto.

**3 — O que precisa ser feito?**  
Carregar dossier por `opportunityId`, mostrar dados reais do Research Run/Evidence Ledger, implementar todos os botões com autorização, histórico e readback, impedir Seeds sem `qualified`, e testar gate completo.

---

### 13. Influencer Seeds Creator — `seeds`

**1 — O que estava planejado?**  
Gerar Seeds por OpenAI a partir de oportunidade/dossier, com nome, arquétipo, função, público, problema, tese, promessa, voz, formatos, diferenciação, visual candidato, limites, monetização, riscos, evidências e versão de modelo/prompt.

**2 — O que está feito atende?**  
**Parcial e anteriormente insuficiente.** A UI possuía seletor de pesquisa, mas havia falha de requisição duplicada, fallback fake e seleção sem persistência confiável. O backend usava arquétipos determinísticos, não geração LLM. Durante a auditoria foi preparado localmente um prompt LLM explícito, endpoint `/api/seeds/prompt`, geração estruturada e idempotência; ainda não é entrega remota aceita.

**3 — O que precisa ser feito?**  
Publicar e validar LLM real, registrar model/prompt/version/custo, validar schema e bloquear saída incompleta, exibir pesquisa de origem, características intelectuais/físicas, fontes e riscos; garantir seleção humana versionada.

---

### 14. Comparison Pack — `comparisons`

**1 — O que estava planejado?**  
Comparar Seeds lado a lado por arquétipo, função, público, problema, promessa, voz, formatos, diferenciação, risco, score, monetização, argumentos e perguntas abertas; selecionar, rejeitar, regenerar, revisar e abrir evidências.

**2 — O que está feito atende?**  
**Não na implementação original.** Era tabela estática de fixture, com botões disabled ou sem ação. Durante a auditoria foi preparada localmente uma versão de seleção múltipla e cenário combinado via `/api/seeds/compare` e `/api/seeds/select`; ainda não está publicada/read back.

**3 — O que precisa ser feito?**  
Persistir Comparison Pack versionado, permitir uma ou várias Seeds, gerar cenário combinado coerente, registrar decisão/justificativa/escopo/ator, mostrar evidências e enviar o conjunto selecionado para Farmer.

---

### 15. Decisão de Seed

**1 — O que estava planejado?**  
Rota `/seeds/decisions/:id` para registrar Seed, versão, decisão, escopo, justificativa, riscos, owner, data e próximo Gate.

**2 — O que está feito atende?**  
**Não existe como página.** O endpoint `/api/seeds/select` apenas muda status; não registra pacote formal de decisão com justificativa, escopo e ator explícitos.

**3 — O que precisa ser feito?**  
Criar decisão persistente/append-only, Gate humano, versão stale rejection, aprovação/rejeição/revisão e handoff formal para Farmer.

---

### 16. Personas

**1 — O que estava planejado?**  
`/profile-building/personas`: listar Persona, Marca, Seed, oportunidade, versão, fase, status, owner, Gate e atividade; filtros e início de Farmer.

**2 — O que está feito atende?**  
**Não como página.** Existem contratos/API locais de Persona (`/api/personas` e domínio versionado), mas não há listagem/visualização operacional no dashboard.

**3 — O que precisa ser feito?**  
Criar read model de Personas, filtros, versões, ownership, status, atividade e ligação Seed→Dossier→Persona→Marca.

---

### 17. Workspace Farmer

**1 — O que estava planejado?**  
Workspace completo com 16 áreas: identidade, caráter, voz, Character Kit, visual, Marca, Blog, público, pilares, sistema editorial, claims, monetização, fontes, Approval Pack e histórico.

**2 — O que está feito atende?**  
**Não.** Há modal simples e view Farmer com fixture/texto; `POST /api/farmer/profile` cria um perfil determinístico a partir de uma Seed, mas não há workspace por abas, LLM por seção, completude, fontes, versões ou bloqueios por seção.

**3 — O que precisa ser feito?**  
Implementar PersonaVersion/Character Bible/Physical Identity/Visual/Editorial/Channel Plans, geração modular, validação, fontes, guardrails, histórico, revisão e Approval Pack.

---

### 18. Marca Editorial e Blog

**1 — O que estava planejado?**  
`/profile-building/personas/:id/brand`: nome, assinatura, domínio, tagline, promessa, About, disclaimers, disclosure, categorias, navegação, pilares e relação FBR.

**2 — O que está feito atende?**  
**Não existe.** Não há página nem modelo operacional de Marca/Blog na UI atual.

**3 — O que precisa ser feito?**  
Criar entidade vinculada à Persona/version, formulário, completude, preview, domínio/status e Gate; publicação fica fora do MVP sem aprovação.

---

### 19. Approval Pack da Persona

**1 — O que estava planejado?**  
Reunir origem, Seed, Persona, Marca, Character Kit, visual, temas, plano editorial, guardrails, claims, monetização, riscos, custos, métricas e pergunta de decisão.

**2 — O que está feito atende?**  
**Não como página.** Existem pacotes locais de aprovação no domínio, mas não há página unificada nem revisão completa na UI.

**3 — O que precisa ser feito?**  
Gerar snapshot versionado, mostrar evidência/custos/limitações, ações aprovar/revisar/rejeitar, actor server-side e destino Farmer/Post Machine.

---

### 20. Calendário Editorial

**1 — O que estava planejado?**  
Calendário/lista/quadro por status, pilar, canal e owner; criar pauta, duplicar, priorizar, enviar para draft, bloquear e arquivar.

**2 — O que está feito atende?**  
**Não.** Existe `editorial_calendar` em fixture e uma view Post Machine simples; não há calendário persistente nem ações reais.

**3 — O que precisa ser feito?**  
Criar entidade editorial brief/pauta, calendário, filtros, prioridades, versionamento, Gate e readback.

---

### 21. Briefing de conteúdo

**1 — O que estava planejado?**  
Validar tema, pergunta, público, pilar, formato, objetivo, fontes, produto, CTA, disclosure, restrições e owner antes do draft.

**2 — O que está feito atende?**  
**Parcial no backend, não na página.** Existem `/api/briefs` e validações de Post Machine, mas não há tela específica nem todos os campos/validações expostos.

**3 — O que precisa ser feito?**  
Criar página por brief, validação de Persona/Character Kit/guardrails/fontes/produto, salvar/validar/gerar e mostrar blockers.

---

### 22. Editor de Draft

**1 — O que estava planejado?**  
Editor com fontes, claims, disclosure, voz, produto, versões, checklist, risco e envio a Sergio; estados de draft/review/blocked/etc.

**2 — O que está feito atende?**  
**Não como página.** Existem APIs de conteúdo/review/publish e serviços locais, mas não editor operacional.

**3 — O que precisa ser feito?**  
Criar editor versionado, painéis de evidência/claims/disclosure, validação automática, revisão, histórico e bloqueio de publicação.

---

### 23. Fila de revisão humana — `approvals`

**1 — O que estava planejado?**  
Centralizar decisões de Sergio por tipo, Persona, Marca, owner, risco, prioridade e Gate; aprovar, revisar, rejeitar, bloquear, comentar e delegar revisão.

**2 — O que está feito atende?**  
**Não.** A view é uma tabela simples de `state.approvals`; não possui filtros nem ações funcionais. Há `/api/approvals`, mas a UI não fecha o fluxo.

**3 — O que precisa ser feito?**  
Criar Approval Queue real, approval pack contextual, decisões versionadas, comentários, permissões e readback.

---

### 24. Métricas e Feedback — `metrics`

**1 — O que estava planejado?**  
Seguidores, views, recorrência, engajamento, blog, YouTube, cliques, leads/conversões futuras, produção, revisão, custo LLM e qualidade; adicionar/importar/insuficiente/feedback/Radar.

**2 — O que está feito atende?**  
**Não.** A UI é tabela de fixture. `/api/metrics` e `/api/feedback` existem, mas não há formulários/importação/filtros/gráficos ou sinal ao Radar.

**3 — O que precisa ser feito?**  
Modelar métricas por período/fonte/modo/limitação, UI de entrada/readback, feedback relacionado a conteúdo/oportunidade e integração com Radar.

---

### 25. Jobs e Atividade — `jobs`

**1 — O que estava planejado?**  
Observar jobs com tipo, recurso, tenant, owner, estado, etapa, progresso, heartbeat, tentativas, erro, next step, artefatos e handoff; pausar/cancelar/reprocessar/atribuir.

**2 — O que está feito atende?**  
**Não.** A view tabela usa `state.jobs`/fixture e não há lifecycle de job real para as operações principais.

**3 — O que precisa ser feito?**  
Persistir jobs e heartbeats, endpoints de ação autorizada, blockers com owner/nextCheck, artefatos/readbacks e observabilidade real.

---

### 26. Auditoria e Histórico — `audit`

**1 — O que estava planejado?**  
Consultar eventos imutáveis por ator, tenant, recurso, evento, Gate, período, versão/correlação; comparar/exportar/relacionar decisão.

**2 — O que está feito atende?**  
**Parcial.** `/api/audit-events` e ledger local existem e são append-only em parte; a UI é uma tabela sem filtros, comparação ou exportação sanitizada.

**3 — O que precisa ser feito?**  
Read model de auditoria, filtros, correlação, versões, exportação sanitizada e cobertura de todos os eventos de decisão.

---

### 27. Configurações — `settings`

**1 — O que estava planejado?**  
Tenant, usuários/papéis, OpenAI/limites, parceiros, fontes, taxonomia, políticas, domínio/blog, notificações, retenção e integrações futuras; secrets apenas como referência/status.

**2 — O que está feito atende?**  
**Não.** A página é texto estático com “DEMO / FAKE”, sem edição, readback, usuários, limites ou configuração OpenAI.

**3 — O que precisa ser feito?**  
Criar subpáginas e contratos de configuração, Secret Manager references/status, limites/custos, tenant/memberships, fontes/parceiros e validação server-side.

---

### 28. About / PRD / Ajuda — `about`

**1 — O que estava planejado?**  
Propósito, pipeline, módulos, fases, Gates, glossário, status, limitações, PRD vigente, versão e modo de dados.

**2 — O que está feito atende?**  
**Parcial.** Há uma página documental extensa, mas contém linguagem e módulos que não refletem integralmente o estado atual; não há versão/readback/status dinâmico confiável.

**3 — O que precisa ser feito?**  
Ligar ao PRD/status vigente, mostrar commit/versão, modo real (`live/manual/demo`), limitações atuais e links funcionais.

---

## APIs existentes relevantes e o que falta conectar

### Research

```text
POST /api/research-briefs
GET  /api/research-briefs/:id
POST /api/research-briefs/:id/run
GET  /api/research-runs/:id
GET  /api/research
GET  /api/opportunities/:id/dossier
POST /api/opportunities/:id/qualify
```

Essas rotas existem no backend local, mas as páginas correspondentes não estão conectadas ao fluxo real. O `runLocalResearch` é explicitamente `DEMO`, portanto não atende à exigência de pesquisa profunda real.

### Seeds/Persona

```text
GET  /api/seeds/prompt
POST /api/seeds/generate
POST /api/seeds/compare
POST /api/seeds/select
POST /api/farmer/profile
GET  /api/farmer/profiles
POST /api/farmer/profile/approve
```

A geração LLM e Comparison Pack foram preparados no working tree durante a sessão, mas não devem ser classificados como entregues antes de testes de contrato específicos, deploy e readback.

## Critério objetivo para retomar implementação

A ordem correta não é “embelezar todas as páginas”. É fechar fatias verticais:

1. **Audience Radar real:** Sources → Brief → Run → Evidence → Dossier.
2. **Seeds real:** Dossier qualified → prompt/model/version → Seeds → Comparison Pack → decisão.
3. **Persona real:** Seed selecionada → Farmer completo → Approval Pack → aprovação.
4. **Editorial real:** calendário → briefing → draft → revisão humana.
5. **Observabilidade:** jobs, audit, métricas e settings ligados ao mesmo estado.

Cada fatia só pode ser marcada pronta com UI, API, persistência/readback, estados de erro/vazio/Gate e teste reproduzível.

### Parâmetro 3 — Escopo do MVP

O escopo abaixo é vinculante para a solução. Itens incluídos são obrigatórios para aceitar o MVP, mesmo quando hoje estejam parciais ou ausentes. Itens fora do MVP não podem ser usados como justificativa para declarar o MVP pronto e permanecem bloqueados sem Gate específico.

#### Incluído — obrigatório para aceite

- autenticação e RBAC;
- multi-tenancy;
- cadastro de parceiros;
- cadastro de fontes;
- intake de pesquisa;
- Audience Radar;
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

#### Fora do MVP — bloqueado sem Gate

- publicação automática;
- captura de e-mail ativa;
- integração real Amazon sem cadastro e permissões;
- integrações reais TikTok Shop, ClickBank, BuyGoods, MaxWeb, Digistore24, SellHealth, MarketHealth, NutriProfits e MoreNiche;
- automação de browser não autorizada;
- criação de contas novas em plataformas;
- evasão de bloqueio;
- gasto de mídia;
- AdSense ativo;
- workers de escala sem necessidade demonstrada;
- métricas comerciais inventadas;
- migration remota sem Gate.

**Regra de leitura:** “fake adapter” é permitido para provar o fluxo local; não substitui as entidades, telas, Gates, persistência e contratos obrigatórios do MVP.


### Parâmetro 1 — Objetivos parciais ou não alcançados fazem parte do MVP

Decisão de Sergio: objetivos parciais ou não alcançados **não são escopo futuro automaticamente**; são gaps de aceitação do MVP e devem permanecer no backlog do MVP até implementação e verificação. Um núcleo local, fixture, mock, endpoint isolado, build ou teste unitário não pode promover o item a concluído.

### Segunda parte — Resultados esperados do MVP

| Resultado esperado | Status factual atual | Lacuna para aceite |
|---|---|---|
| 1. Fluxo executável localmente e posteriormente em runtime autorizado | **Parcial** | Existe fluxo local/fake e partes de API; o fluxo completo de UI, persistência real, RLS, runtime autorizado e readback não está fechado. |
| 2. Uma oportunidade com evidência e dossier | **Parcial** | Há dossier/evidência local DEMO; falta oportunidade real com fontes autorizadas, Evidence Ledger conectado e readback completo. |
| 3. Seeds geradas por LLM e comparadas | **Não alcançado como MVP** | A implementação anterior era determinística/fixture; prompt, geração LLM e Comparison Pack foram preparados localmente, mas ainda não validados/publicados como fluxo real. |
| 4. Uma Persona selecionada e desenvolvida | **Parcial** | Há domínio local de Persona/Farmer; falta seleção formal versionada, Workspace Farmer completo, persistência/readback e aprovação. |
| 5. Blog/Marca Editorial documentado e pronto para desenvolvimento | **Não alcançado** | Não existe fluxo operacional de Marca/Blog vinculado à Persona com domínio, About, disclosure, categorias, pilares e Gate. |
| 6. Calendário preliminar de pautas | **Não alcançado** | Existe calendário fixture; falta calendário persistente, pautas vinculadas a Persona/Marca/versão, fontes, owner e Gate. |
| 7. Drafts produzidos e revisados por Sergio | **Parcial técnico** | Serviços/API locais de draft existem; falta editor, validações completas, Review Queue funcional e decisão real de Sergio com readback. |
| 8. Métricas registradas antes da publicação real | **Parcial técnico** | `/api/metrics` e contratos existem; falta tela, formulário/importação, fonte/período/limitação visíveis e feedback integrado ao Radar. |
| 9. Histórico completo de decisões, versões, Gates e owners | **Parcial** | Há audit/eventos/versionamento local; falta cobertura completa de decisões, Persona/Marca/Draft/Approval, filtros, correlação, readback remoto e histórico transversal. |

### Conclusão dos resultados esperados

Os nove resultados permanecem dentro do MVP. Nenhum deve ser reclassificado como “fase futura” apenas porque a implementação atual ficou parcial. O estado correto é:

```text
MVP: não aceito
Fundação local: parcial/verificada
Resultados esperados: 0 completos; vários parcialmente fundados; gaps de aceitação abertos
```


1. **O que foi planejado?** Um sistema operacional de pesquisa → evidência → oportunidade → Seed → Persona → blog/editorial, com Gates e rastreabilidade.
2. **O que existe atende?** Não. Existe um protótipo local parcial: shell visual, contratos de domínio, APIs locais e fixtures; não existe ainda a experiência operacional planejada.
3. **O que precisa ser feito?** Reconstruir as telas como produto conectado a contratos reais, começando pela fatia Audience Radar completa, removendo fixtures das telas live, implementando ações, persistência/readback e Gates antes de avançar.

**Aceite da auditoria:** a entrega atende ao briefing de revisão página por página; não autoriza classificar nenhuma Sprint ou página como pronta.
