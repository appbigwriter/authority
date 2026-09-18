# Relatório de Auditoria Completa — FBR Authority Engine

**Data/hora:** 2026-09-18 14:39:50 -03:00  
**Auditor:** David  
**Repositório:** `F:/Projetos/_FBR/AuthorityEngine`  
**Commit observado:** `50f33a7 feat: implement core persona domain, persistence, contracts, and tests`  
**Modo:** auditoria local, sem migration, deploy, publicação, alteração remota ou acesso a secrets.

## 1. Veredito executivo

**Resultado: IMPLEMENTAÇÃO LOCAL PARCIAL, com núcleo backend forte e blockers reais na interface e na operação externa.**

O Authority Engine possui quatro módulos locais, autenticação/RBAC, persistência fake para smoke local, adapter relacional preparado, pipeline de Persona versionada e gates de publicação. A suíte local atual passou com **49 testes**, build TypeScript aprovado e `git diff --check` limpo.

Isso **não é E2E de produção**. O runtime padrão continua iniciado por `src/start.ts` com `JsonStoreFake` e o próprio `STATUS.md` registra que o schema remoto não está exposto no PostgREST (`PGRST106`), além de integrações externas, canais reais e QA formal permanecerem pendentes.

O relatório anterior que afirmava que os três bugs da interface já estavam corrigidos não é confirmado pelo estado atual do repositório: o seletor `$('runPM')` ainda está presente, não existe listener para `#researchSelect`, e `dashboard-check.mjs` não executa em Node puro porque depende de `document`.

## 2. Matriz de status

| Área | Estado | Evidência | Limitação |
|---|---|---|---|
| S1 Opportunity Radar | `localmente_verificado` | testes OPR-001 a OPR-005; rotas em `src/server.ts` | adapters reais e credenciais não configurados |
| S2 Influencer Seeds | `localmente_verificado` | testes S2; rota `/api/seeds/generate` | UI não liga seleção de pesquisa ao fluxo |
| S3 Influencer Farmer | `localmente_verificado` | testes IFR; guardrails Mentor/disclosure | persistência e handoff operacional ainda locais |
| S4 Post Machine | `localmente_verificado` / UI `parcial` | testes PMA-001 a PMA-005; rota de geração | bug de seletor quebra loading; publicação real bloqueada |
| Persona/PersonaVersion | `localmente_verificado` | testes AUTH-F1-001/003 e rotas versionadas | schema/adapter remoto e readback não provados |
| Auth/RBAC | `localmente_verificado` no backend | `auth.ts`, `auth-runtime.test.ts`, `api.test.ts` | dashboard não envia Bearer |
| RLS/persistência relacional | `parcial` | SQL, `RelationalAuthorityStore`, testes de contrato | runtime padrão usa JSON; remoto não foi lido de volta |
| Outbox/evento Persona | `localmente_verificado` local | `persona-outbox`, testes de dedupe/sanitização | assinatura, delivery e consumer remoto não implementados/provados |
| Dashboard | `parcial` | HTML servido pela rota `/about`; análise estática | bugs de interação e ausência de contrato UI→API |
| E2E remoto/público | `bloqueado` | `STATUS.md`, handoff Fase 0/1 | falta runtime remoto autorizado, schema exposto e readback |

## 3. Evidências executadas

### 3.1 Suíte TypeScript

Comando:

```text
cd F:/Projetos/_FBR/AuthorityEngine/09-codigo
npm run check
```

Resultado factual:

- `tsc -p tsconfig.json`: passou.
- `node --test dist/tests/*.test.js`: passou.
- **49 testes, 49 pass, 0 fail, 0 skipped**.
- Duração reportada: `582.3448ms`.

A suíte cobre API, auth, RLS/adapter, Persona versionada, outbox/inbox local, S1–S4 e gates de publicação. Ela prova comportamento local coberto pelos testes; não prova deploy, schema remoto, restart/redeploy ou readback público.

### 3.2 Análise estática do dashboard

Comando executado contra `public/dashboard.html`:

```text
postMachineMissingHash: 2
postMachineHasHash: 0
researchSelectOnchange: false
seedModalNoArg: true
fetchCalls: 9
authHeaders: 0
```

Achados diretamente verificáveis:

1. Linha 213 mantém `$('runPM').disabled=true` e `$('runPM').disabled=false`; o helper usa `document.querySelector`, portanto `runPM` sem `#` não encontra o botão.
2. O HTML cria `select#researchSelect`, mas não registra `onchange` nem `addEventListener` para esse seletor.
3. `loadSeedsForResearch(researchId)` termina com `openSeedsModal()` sem preservar `researchId`, o que dispara nova chamada com ID indefinido após uma geração bem-sucedida.
4. Nenhuma das nove chamadas `fetch()` do dashboard inclui cabeçalho `Authorization`/`authorization`.

### 3.3 Script de validação da UI

Comando:

```text
node dashboard-check.mjs
```

Resultado factual: falhou com `ReferenceError: document is not defined`.

Classificação: **evidência de que o teste não é executável em Node puro**, não evidência de que a UI esteja correta. É necessário um harness DOM/browser real ou teste de contrato de navegador.

### 3.4 Git e integridade do artefato

- Branch: `main`, alinhada na leitura com `origin/main`.
- Commit observado: `50f33a7`.
- `git diff --check`: passou.
- A auditoria foi registrada neste arquivo histórico.

## 4. Achados detalhados

### A-01 — Bugs de interação no Dashboard

- **Tipo:** FATO.
- **Severidade:** alta para usabilidade do S4; média para o fluxo geral.
- **Causa verificável:** seletor inválido em `#pmForm`; listener ausente em `#researchSelect`; reabertura de modal sem argumento em `loadSeedsForResearch`.
- **Impacto:** geração do Post Machine pode lançar exceção ao controlar o botão; Seeds não inicia geração ao trocar pesquisa; fluxo de seeds pode fazer request adicional inválido.
- **Solução:** corrigir para `$('#runPM')`; criar listener explícito que chame `loadSeedsForResearch(selectedResearchId)`; após sucesso, atualizar estado/renderizar sem chamar o modal novamente com ID ausente.
- **Aceite:** teste browser/DOM cobre seleção de pesquisa, geração de seeds uma única vez, renderização dos cards e geração S4 com loading encerrado sem exceção.

### A-02 — Dashboard incompatível com auth ativada

- **Tipo:** FATO.
- **Severidade:** alta em runtime com tokens configurados.
- **Causa verificável:** `auth.ts` exige `Authorization: Bearer ...` para rotas protegidas; dashboard faz fetch sem esse cabeçalho.
- **Impacto:** painel recebe `401 missing_credential` nas rotas de API protegidas, embora a página HTML pública carregue.
- **Solução:** definir mecanismo seguro de sessão/token para o painel, sem embutir secrets no HTML, localStorage ou logs. Para runtime interno, preferir sessão/proxy autenticado; se token local for inevitável, documentar escopo e não tratá-lo como solução de produção.
- **Aceite:** teste de navegador com sessão autorizada carrega `/api/state`, `/api/research`, perfis e mutações permitidas; teste anônimo continua recebendo 401; nenhum secret aparece no bundle, HTML ou receipt.

### A-03 — Persistência de produção não está comprovada

- **Tipo:** FATO.
- **Severidade:** crítica para declarar operação durável; não é crítica para o smoke local.
- **Causa verificável:** `src/start.ts` instancia `new JsonStoreFake(file)`; `STATUS.md` diz que o PostgREST remoto retorna `PGRST106` e que persistência ainda é `JsonStore` local.
- **Impacto:** decisões locais não constituem prova de sobrevivência a restart/redeploy nem de isolamento remoto/RLS operacional.
- **Solução:** fechar schema/adapter/ownership/RLS, configurar runtime por referência segura e executar readback autorizado após Gate. Manter fail-closed até schema e readback serem comprovados.
- **Aceite:** runtime autorizado usa `RelationalAuthorityStore`; write→readback após novo processo retorna os mesmos IDs/versões; testes de ownership e RLS passam contra banco alvo; nenhum fallback silencioso para JSON.

### A-04 — Contrato global ainda não está totalmente implementado

- **Tipo:** FATO, conforme `HANDOFF-AUDITORIA-FASE0-FASE1-2026-09-18.md` e `F0-STRUCT-001`.
- **Severidade:** alta para integração Authority→Flux→Blogs→Control Tower.
- **Causa verificável:** contratos locais de Persona, Bibles, runs e outbox existem em parte; porém assinatura, delivery, inbox remoto, blogs/name/domain, DNS e readbacks intersistemas ainda são gaps/bloqueadores documentados.
- **Impacto:** não é possível declarar handoff operacional global nem abrir execução comercial/publicação externa.
- **Solução:** concluir F0-01/F0-02, fechar ownership e APIs, implementar adapter Authority/Blogs e Flux, E2E local com fake adapters e somente então solicitar Gate de readback remoto.
- **Aceite:** E2E local percorre Persona aprovada→evento→consumer fake→receipt idempotente sem publicação; cada sistema confirma seu owner; readbacks remotos ficam separados e têm evidência própria.

### A-05 — Status/documentação está desatualizado em números

- **Tipo:** FATO.
- **Severidade:** média, governança.
- **Causa verificável:** `STATUS.md` registra 26 testes, enquanto `npm run check` atual reporta 49; o handoff registra 33.
- **Impacto:** dificulta saber qual baseline é válido e pode gerar falsa sensação de cobertura ou regressão.
- **Solução:** atualizar `STATUS.md` e handoffs com timestamp, commit e comando; separar histórico de estado atual.
- **Aceite:** status atual reproduz o comando, total e commit observados; qualquer número histórico é rotulado como histórico.

## 5. Conformidade com PRD/ADR

### Atendido localmente

- Pipeline S1→S2→S3→S4 está representado em código e testes.
- Seeds não são selecionadas automaticamente; testes cobrem diferenciação e risco.
- Farmer produz perfil Mentor com guardrails, disclosure e matriz de claims.
- Post Machine exige perfil aprovado e preserva gates de revisão/aprovação/publicação.
- Auth local possui roles `admin`, `operator`, `reviewer`, `publisher`, `viewer`, com checks de ownership em várias rotas.
- Persona/PersonaVersion, Character Bible, Physical Identity Bible, module runs, approval pack e outbox possuem implementação local/testada em parte.
- Publicação usa `UnconfiguredPublishingAdapter` e falha fechado sem adapter configurado.

### Não atendido ou não comprovado

- MP-000 permanece `em_revisao_estrutural`; o quadro mestre declara sprints pendentes.
- Integrações Amazon/marketplaces, imagem, armazenamento e canais reais não estão configuradas.
- Persistência remota/RLS operacional, restart/redeploy e readback público não estão comprovados.
- Assinatura/autenticação de evento, delivery, inbox remoto e integração real com Flux/Blogs/Control Tower não estão comprovados.
- Dashboard não é funcional de ponta a ponta quando auth está ativada.
- QA formal de browser não existe; `dashboard-check.mjs` não é um teste executável sem DOM.

## 6. Plano de correção priorizado

### P0 — Corrigir a interface antes de qualquer piloto

1. Corrigir seletores S4.
2. Implementar listener do `researchSelect` e fluxo de modal sem request duplicado.
3. Criar teste browser/DOM com payloads reais das rotas.
4. Definir transporte de autenticação do painel.

**Gate de saída:** ações Seeds e Post Machine executadas no navegador com requests autorizados e sem exceção.

### P1 — Consolidar runtime e contrato local

1. Atualizar `STATUS.md` e receipt com baseline 49 testes/commit/timestamp.
2. Testar cada UI action contra o validator da rota.
3. Exercitar restart local e readback do store escolhido.
4. Reconciliar schema SQL, `RelationalAuthorityStore` e campos efetivamente selecionados/escritos.

**Gate de saída:** contrato local reproduzível e nenhuma alegação de persistência remota baseada apenas em teste fake.

### P2 — E2E de integração sem publicação real

1. Conectar adapter Authority/Blogs/Flux com fake adapters.
2. Testar evento aprovado, dedupe, retry, dead-letter e receipt.
3. Validar ownership, versões e invalidação de approval stale.
4. Registrar blocker separado para migrations/deploy/readback remoto.

**Gate de saída:** E2E local completo, fail-closed e receipt verificável.

### P3 — Gate remoto humano

Somente após P0–P2 e aprovação específica de Sergio: configurar runtime remoto, aplicar migrations autorizadas, fazer readback sanitizado e validar publicamente. Esta auditoria não autoriza nenhuma dessas mutações.

## 7. Conclusão

O sistema é um **protótipo local avançado / fundação em transição**, não uma operação E2E pronta. O backend demonstra boa cobertura local e governança fail-closed, mas a UI contém defeitos reproduzíveis e o caminho remoto ainda está bloqueado por schema, runtime, integrações e readback.

### STATUS

- **implementado:** núcleo S1–S4, auth/RBAC local, Persona versionada e gates locais.
- **verificado_localmente:** `npm run check` — 49/49 testes; TypeScript; análise estática; git diff check.
- **verificado_remotamente:** nada nesta auditoria.
- **bloqueado:** dashboard autenticado, bugs UI, persistência remota/readback, integrações Flux/Blogs/Control Tower, canais reais.
- **solução:** executar P0→P2; somente depois abrir Gate remoto P3.
- **próxima ação:** corrigir A-01/A-02 com testes de navegador/contrato; não declarar a auditoria como “100% funcional”.

## 8. Receipt da auditoria

- Artefato: `08-historico/AUDITORIA-COMPLETA-2026-09-18.md`
- Repositório: `F:/Projetos/_FBR/AuthorityEngine`
- Commit auditado: `50f33a7`
- Suíte: 49 pass / 0 fail
- Execução: 2026-09-18 14:39:50 -03:00
- External state: nenhuma mutação remota, deploy, migration, publicação ou secret acessado.
