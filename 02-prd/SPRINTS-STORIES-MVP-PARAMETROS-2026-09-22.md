# Sprints e Stories do MVP — Parâmetros 1, 2, 3 e telas do Parâmetro 4

**Projeto:** FBR Authority Engine  
**Data:** 2026-09-22  
**Status:** `PLANEJAMENTO_PARA_DELIBERACAO`  
**Regra:** nenhum item abaixo é considerado implementado por este documento. A implementação só começa após deliberação de Sergio.

## Contrato dos quatro parâmetros

### Parâmetro 1 — Objetivos parciais ou não alcançados fazem parte do MVP
Um gap em qualquer objetivo incluído permanece dentro do MVP até implementação e verificação. Não pode ser reclassificado automaticamente como fase futura.

### Parâmetro 2 — Resultados esperados do MVP
O MVP precisa entregar: fluxo local/runtime autorizado; oportunidade com evidência/dossier; Seeds LLM comparadas; Persona selecionada/desenvolvida; Marca/Blog documentado; calendário preliminar; drafts revisados por Sergio; métricas pré-publicação; histórico completo.

### Parâmetro 3 — Escopo
Tudo listado como incluído é obrigatório para aceite. Tudo listado como fora permanece bloqueado sem Gate específico.

### Parâmetro 4 — Telas
As telas do PRD são a superfície mínima do produto. Cada Story de UI precisa estar ligada a contrato, estado, ação e readback. Fixture não substitui integração.

---

## Definition of Done global

Uma Story só pode ser marcada `concluido_validado` quando:

1. UI e API existem quando aplicável;
2. entrada, sucesso, vazio, erro, sem permissão, insuficiência e aguardando Gate estão definidos;
3. persistência/readback são verificáveis;
4. tenant/owner/RBAC/RLS estão cobertos;
5. o caminho não depende de fixture silenciosa;
6. teste automatizado e/ou E2E fake reproduz o aceite;
7. a evidência registra fato, hipótese, bloqueio e decisão separadamente;
8. o que estiver fora do MVP continua bloqueado;
9. Sergio aprova somente os Gates explicitamente humanos.

---

# S0 — Contrato do MVP e baseline de aceite

**Depende de:** nenhum  
**Telas relacionadas:** todas  
**Objetivo:** transformar os quatro parâmetros em matriz rastreável antes de codar.

### MVP-S0-001 — Matriz Objetivo → Resultado → Tela → API → Tabela
- Mapear cada objetivo funcional aos nove resultados, telas do PRD, endpoints, tabelas, owner, Gate e evidência.
- **Aceite:** nenhum objetivo fica sem Story; nenhum endpoint fica sem tela/consumidor ou justificativa.

### MVP-S0-002 — Registro formal de escopo incluído/fora
- Criar catálogo de capacidades incluídas e bloqueadas.
- **Aceite:** publicação, e-mail, marketplaces reais, browser automation, mídia, AdSense, workers de escala e migrations remotas aparecem como `fora_mvp/bloqueado`.

### MVP-S0-003 — Estados visuais e contrato de erro
- Definir loading, empty, success, recoverable error, blocking error, 401, 403, insufficient data, awaiting Gate, awaiting owner, job running, last readback e next action.
- **Aceite:** cada tela possui matriz de estados antes de implementação.

### MVP-S0-004 — Registro de versão/prompt/modelo/custo
- Definir envelope comum para LLM, adapter, run, versão, hash, custo e limitações.
- **Aceite:** Seeds, Research e Drafts não podem omitir modelo/prompt/versionamento.

### MVP-S0-005 — Harness E2E fake
- Criar fixture controlada para atravessar o MVP sem providers reais.
- **Aceite:** fluxo completo produz receipts fake e nunca afirma integração externa real.

---

# S1 — Shell autenticado, RBAC, tenant e setup

**Depende de:** S0  
**Telas:** Login, Select Tenant, Setup, Dashboard shell, Settings tenant/users.

### MVP-S1-001 — Sessão de usuário
- Implementar login/sessão/expiração/logout e estados de erro.
- **Aceite:** login válido cria sessão; inválido retorna erro; sessão ausente não acessa páginas protegidas.

### MVP-S1-002 — RBAC server-side
- Roles admin/operator/reviewer/publisher/viewer com matriz por ação.
- **Aceite:** 401/403 testados; esconder botão nunca é única proteção.

### MVP-S1-003 — Tenant FBR Agency
- Persistir tenant/membership e remover `Demo tenant`, `tenant-local` e fallback silencioso.
- **Aceite:** contexto `fbr-agency` chega ao backend e o isolamento positivo/negativo passa.

### MVP-S1-004 — Seleção de tenant
- Criar `/select-tenant` condicional a múltiplos memberships.
- **Aceite:** usuário só seleciona tenant autorizado; contexto não vem de input arbitrário.

### MVP-S1-005 — Onboarding `/setup`
- Organização, objetivo editorial, parceiros, fontes, LLM/limite, membros, marca e checklist.
- **Aceite:** estados `setup_incomplete`, `ready_for_research`, `blocked` persistem e têm próxima ação.

### MVP-S1-006 — Shell e ação global
- Dashboard, breadcrumb, tenant, papel, status, Gate, owner, busca e botão Adicionar contextual.
- **Aceite:** cada contexto abre a ação correta; nenhuma ação global abre modal genérico errado.

---

# S2 — Partner Registry e Source Registry

**Depende de:** S1  
**Telas:** Partner Registry, Fontes de pesquisa, Settings partners/sources.

### MVP-S2-001 — Modelo de parceiros
- Persistir parceiro, programa, tipo, mercado, contrato, escopo, secret_ref, status e limitações.
- **Aceite:** CRUD autenticado com ownership e auditoria.

### MVP-S2-002 — UI Partner Registry
- Lista, filtros, formulário, editar metadados, bloquear/desativar e histórico.
- **Aceite:** alteração aparece por readback; segredo nunca é exibido.

### MVP-S2-003 — Modelo de fontes
- Persistir origem, contrato, modo, cobertura, health, limitação e parceiro.
- **Aceite:** estados `planned/configured/verified/blocked/disabled`.

### MVP-S2-004 — UI Source Registry
- Cadastro, filtros, teste autorizado, erros, bloqueio e link para Evidence Ledger.
- **Aceite:** fonte não vira `verified` sem resultado/readback.

### MVP-S2-005 — Adapters fake fail-closed
- Adapter fake explícito para E2E; adapter configurável para provider futuro.
- **Aceite:** provider ausente bloqueia sem inventar fonte/dado.

### MVP-S2-006 — Gates de credencial e custo
- Validar referência de segredo, contrato, orçamento e limitação.
- **Aceite:** nenhum provider real é chamado sem configuração/Gate.

---

# S3 — Intake de pesquisa, Research Brief e Research Run

**Depende de:** S2  
**Telas:** Dashboard Add, Research Briefs, Research Run.

### MVP-S3-001 — Research Brief persistente
- Mercado, país/idioma, nicho, subnicho, problema, público, objetivo, produtos, parceiros, limitações e prazo.
- **Aceite:** criar/editar/duplicar/cancelar com versão e owner.

### MVP-S3-002 — Lista e detalhe de Briefs
- Conectar `/api/research-briefs` à tela; remover fixture.
- **Aceite:** lista mostra status, fontes, última execução e próxima ação reais.

### MVP-S3-003 — Seleção de fontes
- Permitir fontes configuradas no Brief e validar cobertura/limitações.
- **Aceite:** não inicia Run sem fontes ou decisão explícita de modo manual.

### MVP-S3-004 — Enfileirar Research Run
- Criar job/run com heartbeat, modelo, prompt, custo, modo e status.
- **Aceite:** run é idempotente e pode ser reprocessado sem duplicação.

### MVP-S3-005 — Coleta/normalização fake
- Provider fake reproduz registros brutos, produtos, tendências e limitações.
- **Aceite:** DEMO/MANUAL/MIXED ficam explicitamente rotulados e nunca aparecem como LIVE.

### MVP-S3-006 — Research Run por ID
- Rota `/radar/research/:id/runs/:runId` com abas resumo, bruto, produtos, tendências, fontes, erros, limitações e log.
- **Aceite:** cada aba lê o run correto e ações têm endpoint/readback.

### MVP-S3-007 — Research LLM profundo
- Provider OpenAI configurável, prompt versionado, structured output e validação de schema.
- **Aceite:** erro de chave, timeout, schema inválido e orçamento bloqueiam o Run; nenhum resultado inventado.

---

# S4 — Evidence Ledger e Opportunity Radar/Dossier

**Depende de:** S3  
**Telas:** Evidence Ledger, Audience Radar, Opportunities, Dossier, Pipeline.

### MVP-S4-001 — Evidence Ledger persistente
- Fato, hipótese, recomendação, risco, bloqueio e decisão com fonte, URL, data, período, limitação, confiança e vínculos.
- **Aceite:** toda evidência de Dossier aponta para registro consultável.

### MVP-S4-002 — UI Evidence Ledger
- Filtros, relacionamento, revisão, desatualização e fonte original.
- **Aceite:** ações persistem eventos e readback.

### MVP-S4-003 — Opportunity Radar real
- Lista, filtros, score, risco, confiança, produtos, fontes, owner e Gate.
- **Aceite:** criar/abrir/qualificar/bloquear/arquivar/observar por API.

### MVP-S4-004 — Score explicável
- Critérios autoridade, audiência, diferenciação, conteúdo, conformidade, viabilidade e risco; versão do score.
- **Aceite:** UI mostra fatores e evidências, não apenas número final.

### MVP-S4-005 — Opportunity Dossier real
- Resumo, sinais, produtos, concorrência, fatos, hipóteses, riscos, blockers, alternativas, decisão e histórico.
- **Aceite:** Dossier é derivado do Run/Evidence e tem readback por oportunidade.

### MVP-S4-006 — Ações do Dossier
- Qualificar, bloquear, pedir revisão, gerar Seeds, comparar e arquivar.
- **Aceite:** cada botão tem autorização, evento de decisão e resposta recuperável.

### MVP-S4-007 — Pipeline visual conectado
- Cards refletem Research → Opportunity → Dossier e próximas transições autorizadas.
- **Aceite:** nenhum drag ou status visual altera domínio sem API/Gate.

---

# S5 — Seeds Creator via OpenAI, Comparison Pack e decisão

**Depende de:** S4  
**Telas:** Seeds Creator, Comparison Pack, Decisão de Seed.

### MVP-S5-001 — Prompt de Seeds revisável
- Prompt oficial, versão, modelo, custo limite, taxonomia e contexto do Dossier.
- **Aceite:** prompt pode ser lido/revisado; execução registra hash/version.

### MVP-S5-002 — Geração estruturada por OpenAI
- 3–6 Seeds com oportunidade, arquétipo, função, público, problema, tese, promessa, voz, formatos, visual, limites, monetização, riscos, evidências.
- **Aceite:** schema inválido/incompleto bloqueia; resposta válida persiste versão.

### MVP-S5-003 — UI Seeds Creator
- Modal/estado preparado-gerando-concluído-erro-incompleto-bloqueado, origem e limitações.
- **Aceite:** pesquisa selecionada é real; nenhuma duplicação em clique duplo.

### MVP-S5-004 — Comparison Pack
- Cards/tabela lado a lado com todos os critérios do PRD.
- **Aceite:** selecionar uma ou várias Seeds cria cenário versionado.

### MVP-S5-005 — Cenário combinado
- Combinar Seeds com coerência, conflitos, riscos e recomendação indicativa.
- **Aceite:** combinação não seleciona automaticamente nem apaga alternativas.

### MVP-S5-006 — Decisão humana
- Selecionar/rejeitar/devolver com actor, versão, escopo, justificativa, risco aceito, owner e Gate.
- **Aceite:** só papel autorizado muda para `selected`; replay/stale é rejeitado.

### MVP-S5-007 — Handoff Seed → Farmer
- Pacote de entrada com Dossier, Evidence, Seed, prompt/modelo e decisão.
- **Aceite:** Farmer não inicia sem Seed selecionada e aprovada.

---

# S6 — Profile Building/Farmer, Persona, Character Kit e Marca

**Depende de:** S5  
**Telas:** Personas, Workspace Farmer, Marca/Blog, Approval Pack.

### MVP-S6-001 — Lista de Personas
- Persona, Marca, Seed, oportunidade, versão, fase, status, owner, Gate e atividade.
- **Aceite:** filtros e readback por tenant/owner.

### MVP-S6-002 — Persona versionada
- Criar Persona ligada a Seed/Dossier/tenant/Marca; versões imutáveis e transições.
- **Aceite:** mudanças críticas criam versão/invalidação.

### MVP-S6-003 — Character Kit
- Identidade narrativa, caráter, valores, voz, assinatura, discordância, evidência fraca, limites, disclosure.
- **Aceite:** completude e guardrails bloqueiam seção incompleta.

### MVP-S6-004 — Physical/Visual Identity
- Aparência, continuidade, prompts, negative prompt, paleta, roupas, cenários e regras anti-cópia/sexualização.
- **Aceite:** atributos visuais não determinam aprovação nem usam estereótipos.

### MVP-S6-005 — Sistema editorial
- Público, promessa, pilares, subpilares, formatos, séries, cadência, CTAs e plano de 90 dias.
- **Aceite:** tudo versionado e ligado à Persona/Marca.

### MVP-S6-006 — Documento-Mestre de Marca
- Nome, assinatura, domínio, tagline, About, disclaimer, disclosures, categorias, blog e relação FBR.
- **Aceite:** completude, preview e status do domínio sem publicar.

### MVP-S6-007 — Blog como ativo próprio
- Registro Blog/Marca/Persona, navegação, categorias e configuração editorial.
- **Aceite:** blog existe como ativo persistente, mas publicação permanece bloqueada.

### MVP-S6-008 — Approval Pack da Persona
- Origem, Seed, Persona, Marca, Character Kit, visual, editorial, claims, monetização, riscos, custos, métricas e pergunta.
- **Aceite:** Sergio aprova/revisa/rejeita com readback.

---

# S7 — Post Machine, calendário, briefs, drafts e revisão

**Depende de:** S6  
**Telas:** Calendário, Briefing, Editor de Draft, Review Queue.

### MVP-S7-001 — Calendário Editorial
- Criar/duplicar/priorizar/bloquear/arquivar pauta com Persona, Marca, pilar, canal, owner, fonte, produto e Gate.
- **Aceite:** lista/calendário/quadro leem estado persistente.

### MVP-S7-002 — Briefing de conteúdo
- Tema, pergunta, público, pilar, formato, objetivo, fontes, produto, CTA, disclosure, restrições e owner.
- **Aceite:** valida Character Kit, guardrails, fonte e pertinência de produto antes do draft.

### MVP-S7-003 — Draft com OpenAI Gateway
- Gerar draft estruturado por voz, fontes, claims, disclosure e versão do prompt.
- **Aceite:** claims proibidos/schema inválido bloqueiam; sem publicação.

### MVP-S7-004 — Editor de Draft
- Editor, fontes, claims, disclosure, voz, produto, histórico, risco e checklist.
- **Aceite:** salvar/editar/comparar/regenerar seção/readback.

### MVP-S7-005 — Review Queue
- Fila filtrável por tipo, Persona, Marca, owner, risco, prioridade, Gate e status.
- **Aceite:** aprovar/revisar/rejeitar/bloquear/comentar/delegar com actor e evento.

### MVP-S7-006 — Revisor Sergio
- Registrar decisão humana e impedir transição automática para publicação.
- **Aceite:** todo draft termina em revisão; fora do MVP, publicação continua bloqueada.

---

# S8 — Jobs, Gates, Audit, Decision Ledger, Metrics e Feedback

**Depende de:** S3–S7  
**Telas:** Dashboard/Control Room, Jobs, Audit, Metrics, Settings.

### MVP-S8-001 — Jobs e heartbeat
- Jobs duráveis com etapa, progresso, tentativas, erro, owner, artifacts, handoff, next action/check.
- **Aceite:** job bloqueado sempre tem causa/owner/solução/nextCheck.

### MVP-S8-002 — Gates operacionais
- Gates por etapa, papel, estado e risco; ações ilegais bloqueadas server-side.
- **Aceite:** estado visual e API concordam; Gate fica no histórico.

### MVP-S8-003 — Decision Ledger
- Decisões de qualificação, Seed, Persona, Marca, Draft e revisão com versão, actor, justificativa e escopo.
- **Aceite:** histórico append-only e consultável.

### MVP-S8-004 — Audit completo
- Filtros por actor/tenant/recurso/evento/Gate/período/versão/correlação; export sanitizado.
- **Aceite:** nenhuma edição do histórico.

### MVP-S8-005 — Métricas de produção e audiência
- Métricas pré-publicação, produção, revisão, custo LLM, audiência quando existir, fonte/período/modo/limitação.
- **Aceite:** métricas insuficientes são marcadas, nunca inventadas.

### MVP-S8-006 — Feedback Radar
- Criar feedback a partir de métricas/drafts/decisões e vincular a nova hipótese/oportunidade.
- **Aceite:** ciclo Radar → execução → feedback é rastreável.

### MVP-S8-007 — Dashboard operacional final
- Agregar jobs, Gates, opportunities, Seeds, Personas, drafts, metrics, audit e blockers reais.
- **Aceite:** dashboard não depende de fixture para mostrar estado operacional.

---

# S9 — Testes locais, E2E fake e runtime autorizado

**Depende de:** S0–S8  
**Telas:** todas  
**Fora do escopo:** publicação, marketplaces reais, mídia, AdSense, browser automation e migration remota sem Gate.

### MVP-S9-001 — Suíte por Story
- Testes unitários, contrato, RBAC/RLS, estados, idempotência e schema.
- **Aceite:** cada Story concluída possui teste reproduzível.

### MVP-S9-002 — E2E fake completo
- Login/tenant/setup → sources → brief → run → evidence → dossier → Seeds → comparison → decision → Farmer → Brand → Approval → calendar → brief → draft → review → metrics → feedback.
- **Aceite:** todos os nove resultados do Parâmetro 2 aparecem no receipt E2E.

### MVP-S9-003 — Persistência e restart local
- Testar write/readback/restart/reload com banco local autorizado/fake conforme contrato.
- **Aceite:** estado não depende de JSON fixture silencioso.

### MVP-S9-004 — Runtime autorizado sem publicação
- Deploy/health/readback somente após Gate; migration remota continua separada e autorizada.
- **Aceite:** runtime prova identidade, persistência, auth e readback; fora do MVP continua bloqueado.

### MVP-S9-005 — Receipt final do MVP
- Consolidar todos os resultados, Stories, Gates, owners, limitações e itens fora do escopo.
- **Aceite:** nenhum resultado esperado aparece como completo sem evidência.

---

## Grafo de dependências

```text
S0
 ↓
S1 ──→ S2 ──→ S3 ──→ S4 ──→ S5 ──→ S6 ──→ S7 ──→ S8 ──→ S9
             └──────────────────────────────→ E2E fake S9
```

Paralelismo permitido dentro de uma Sprint somente quando não houver tabela/contrato compartilhado sem dono definido. Não iniciar S5 antes de S4, nem S6 antes da decisão formal de Seed.

## Backlog de fora do MVP

Não gerar Stories de implementação para publicação automática, e-mail ativo, integrações reais de marketplaces, browser automation não autorizada, contas novas, evasão, mídia paga, AdSense, workers de escala ou migrations remotas sem Gate. Esses itens ficam apenas em registro de bloqueio/decisão futura.

## Critério para deliberação

Sergio deve revisar:

1. ordem S0–S9;
2. tamanho das Stories;
3. owners e dependências;
4. quais Stories serão executadas primeiro;
5. critérios de aceite e evidências;
6. Gates humanos;
7. confirmação de que nada fora do MVP entrou no plano.

Nenhuma implementação é autorizada por este documento sozinho.
