# Auditoria completa — Authority / Agency Flux / Control Tower / FBR Blogs

**Data da verificação:** 2026-09-19 22:29:31 -03:00  
**Owner:** David  
**Task:** `AUDIT-20260919-AUTHORITY-CONTROL-TOWER-AGENCY-001`  
**Modo:** auditoria local e read-only sobre os quatro repositórios; nenhum deploy, migration, publicação, DNS, rotação de secret ou mutação remota foi executado nesta revisão.

## 1. Veredito executivo

### Veredito

O desenho correto do sistema é:

```text
Authority Engine = domínio-fonte da Persona e dos contratos de identidade/editorial
Agency Flux      = control plane e orquestrador soberano do fluxo operacional
Control Tower    = control plane de infraestrutura/provisionamento técnico
FBR Blogs        = executor editorial e consumidor versionado da Persona
GestaoDB         = catálogo central e interface operacional do Control Tower
Hermes/provider  = runtime de geração, não dono de estado
```

A decisão de Sergio de deixar o **Agency controlando todo o fluxo** é arquiteturalmente correta e deve ser formalizada como regra central. O Agency não deve gerar a Persona, possuir a verdade editorial ou executar SQL arbitrário como parte do fluxo normal; ele deve possuir a máquina de estados global, os jobs, dependências, Gates, retries, blockers, Handoffs, receipts e readbacks.

**Estado real em 2026-09-19:**

- **Authority:** núcleo de Persona versionada, formação, approval pack, autenticação local, outbox local e runtime relacional fail-closed implementados localmente. `npm run check`: **49/49**. Conexão e readback reais ainda não comprovados porque o runtime exige referências de banco ausentes.
- **Agency Flux:** arquitetura de orquestração, inbox/outbox local, dispatcher, approvals, read scopes e E2E local existem. A suíte executada terminou em **165/168 testes**, com três falhas reais: duas por schema relacional ausente/estado contaminado e uma por `EBUSY` na limpeza do E2E. Portanto, não está totalmente verde.
- **Control Tower/GestaoDB:** suíte executada com **50/50**, typecheck e build aprovados. Isso verifica o código local e fixtures, não o Supabase remoto, RLS efetivo, runtime servido ou readback autenticado. A auditoria existente mantém achados críticos de segurança e integridade que ainda impedem aprovação global.
- **FBR Blogs:** **30/30 testes**, typecheck e build aprovados. O contrato local autenticado e fail-closed existe; a persistência relacional das entidades derivadas, o adapter real do Flux, staging e readback remoto permanecem não confirmados.
- **E2E transversal:** **não comprovado**. Há contratos e simulações locais, mas não há evidência de uma cadeia real Authority → Agency → Control Tower → Blogs → Agency com persistência, autenticação serviço-a-serviço, restart/redeploy e readback independente.
- **Produção/publicação:** corretamente bloqueada.

### Decisão arquitetural recomendada

A partir deste artefato, o fluxo deve ser tratado como **Agency-led orchestration**:

1. Authority publica fatos de domínio e eventos de negócio.
2. Agency recebe, deduplica, valida versão/hash/aprovação, cria e executa jobs.
3. Agency decide se uma etapa pode avançar, sempre exigindo resposta/readback do sistema-alvo.
4. Control Tower executa somente provisionamento técnico autorizado e devolve evidências.
5. Blogs executa somente configuração editorial derivada de uma Persona aprovada.
6. Agency consolida tudo, abre Gates e decide a prontidão operacional; publicação continua dependente do Gate humano de Sergio.

## 2. Escopo e fontes consultadas

### Repositórios auditados

- `F:\Projetos\_FBR\AuthorityEngine`
- `F:\Projetos\_FBR\FBR Agency Flux`
- `F:\Projetos\_FBR\GestaoDB`
- `F:\Projetos\_FBR\FBR Blogs`

### Documentos-base

- `AuthorityEngine\GLOBAL-FLOW-AUTHORITY-BLOGS-FLUX-CONTROL-TOWER.md`
- `AuthorityEngine\02-prd\F0-STRUCT-001-matriz-adr-v0.1.0.md`
- `AuthorityEngine\STATUS.md`
- `AuthorityEngine\08-historico\RECEIPT-AUTH-RELATIONAL-RUNTIME-2026-09-19.md`
- `FBR Agency Flux\09-codigo\docs\PRD.md`
- `FBR Agency Flux\08-historico\RUNBOOK-MIGRATIONS-AUTHORITY-FLUX-CONTROL-TOWER-2026-09-18.md`
- `FBR Agency Flux\08-historico\AUDITORIA-POS-DEPLOY-AUTH-FLUX-CONTROL-BLOGS-2026-09-18.md`
- `GestaoDB\docs\control-tower\GDB-AUDIT-20260918-FLOW-GAPS.md`
- `GestaoDB\docs\control-tower\CT-001-project-configuration-artifacts.md`
- `FBR Blogs\03-arquitetura\authority-blogs-flux-contract.md`
- `FBR Blogs\08-historico\AUDITORIA-INDEPENDENTE-FBR-BLOGS-2026-09-18.md`
- `FBR Blogs\STATUS.md`

### Verificações executadas nesta revisão

| Sistema | Verificação | Resultado |
|---|---|---|
| Authority | `npm run check` em `AuthorityEngine\09-codigo` | PASS — build + 49 testes |
| Agency Flux | `npm test` | FAIL — 165/168; 3 falhas |
| Agency Flux | falhas observadas | `flux_cards` ausente; duplicate key em fixture; `EBUSY` no cleanup do E2E |
| Control Tower | `npm test` | PASS — 50 testes |
| Control Tower | `npm run typecheck` | PASS |
| Control Tower | `npm run build` | PASS |
| FBR Blogs | `npm test` | PASS — 30 testes |
| FBR Blogs | `npm run typecheck` | PASS |
| FBR Blogs | `npm run build` | PASS |
| quatro repositórios | `git status --short --branch` e `git diff --check` | consultado; artefatos gerados ficaram não commitados em Flux, GestaoDB e Blogs |

**Regra de interpretação:** build/teste local comprova somente o escopo coberto no ambiente local. Não comprova migration remota, deploy, RLS efetivo, secrets, DNS, provider externo, persistência após restart ou E2E público.

## 3. Modelo de autoridade do sistema

### 3.1 Quem decide o quê

| Domínio | Fonte/dono | Agency pode fazer | Agency não pode fazer |
|---|---|---|---|
| Persona, versão, Bibles, perfil editorial | Authority | validar versão/hash/status; criar jobs derivados | sobrescrever snapshot ou virar fonte canônica |
| Aprovação operacional e publicação | Agency Central | registrar decisão versionada, revalidar pacote, abrir Gate | aceitar aprovação stale ou implícita |
| Jobs, dependências, blockers, Handoffs | Agency Flux | criar, retry, bloquear, esperar, consolidar readbacks | marcar `completed` sem evidência/readback |
| Catálogo técnico, schema, namespace, artifacts, health | Control Tower/GestaoDB | solicitar/acompanhar via API oficial | guardar Persona, executar sem scope ou retornar sucesso inferido |
| Binding editorial, configuração, pautas, drafts | FBR Blogs | receber pacote aprovado e acompanhar job | aceitar Persona não aprovada ou ler SQL do Authority |
| Provider/modelo de geração | Hermes/runtime autorizado | acompanhar metadados e falhas | fixar provider no código ou persistir secrets |
| DNS e domínio técnico | Control Tower + confirmação humana | esperar confirmação e readback | promover confirmação manual a `dns_verified` sem verificação técnica |
| Publicação/gasto/criação de contas | Sergio via Gate; Agency executor | preparar pacote e executar após Gate | publicar por autonomia implícita |

### 3.2 Princípio de não acoplamento

Nenhum sistema deve ler tabelas internas de outro sistema. O único caminho aceitável é:

```text
API oficial + evento assinado + inbox/outbox + Handoff versionado + readback
```

O Agency é o ponto de coordenação, não o ponto de fusão dos bancos. Ele mantém referências, snapshots de aprovação, IDs, hashes, estados e evidências suficientes para provar o fluxo sem duplicar a verdade de domínio.

## 4. Fluxo-alvo sob Agency como controlador

```text
[G0] Intake estruturado no Authority
  → nicho, subnicho, problema, audiência, nome inicial do blog

Authority
  → cria PersonaVersion
  → executa módulos formadores via provider configurado
  → valida completude, guardrails e consistência
  → monta ApprovalPackage versionado
  → estado pending_approval

Agency Central
  → lê pacote pelo contrato oficial
  → cria approval request
  → Sergio aprova/rejeita/solicita revisão
  → Agency lê a decisão de volta

Authority
  → confirma PersonaVersion aprovada e imutável
  → cria/atualiza BlogProject e BlogNameVersion

Agency
  → valida G3 (nome) e cria job de domínio
  → Control Tower deriva domínio/artefatos técnicos
  → espera confirmação manual de DNS
  → Control Tower faz DNS + health readback
  → Agency só então libera G5

Agency
  → cria jobs idempotentes para Control Tower e Blogs
  → Control Tower provisiona catálogo, schema, namespace, artifacts e bindings
  → Blogs valida persona_id/version/hash/approval/event
  → Blogs persiste binding editorial e planos de canal
  → cada sistema devolve receipt metadata-only

Agency
  → consolida jobs, artifacts, blockers, readbacks e Handoffs
  → cria pacote de publicação G6
  → Sergio aprova/rejeita
  → Agency revalida todos os IDs/versões/hashes
  → executor autorizado publica
  → Agency lê receipt/estado final
  → somente então estado published
```

### Regra de parada

Se qualquer readback obrigatório não existir, o Agency deve manter `waiting_external`, `blocked` ou `failed`, conforme o caso. Nunca avançar por HTTP 200, promessa de deploy, build verde, fixture ou arquivo local.

## 5. Inventário por sistema

### 5.1 Authority Engine

**Implementado/verificado localmente**

- Persona e PersonaVersion com snapshots, hashes, source run IDs e transições append-only.
- Character Bible, Physical Identity Bible, Visual Consistency Profile, Editorial Profile e Channel Plans no domínio local.
- Pipeline modular com retries, bloqueio de geração, consistência e approval pack.
- API local com autenticação/roles/ownership e respostas 401/403/404/409/422 cobertas.
- Outbox local com sanitização, attempts, retry/dead-letter e receipts por consumidor.
- `start.ts` exige `DATABASE_URL`, `AUTHORITY_PROJECT_ID` e `AUTHORITY_OWNER_ID`, faz `select 1` antes de abrir a porta e não possui fallback JSON no runtime.
- `npm run check` PASS, 49 testes.

**Parcial/bloqueado**

- O receipt de 2026-09-19 confirma que as referências de banco não estão disponíveis no runtime atual. Não há conexão real, validação de schema/RLS, escrita real, readback pré-restart ou readback pós-restart.
- `STATUS.md` ainda contém linguagem histórica de `JsonStore` e `persistence=json-store`; deve ser reconciliado com o runtime relacional novo e com o readback público real antes de ser usado como fonte única.
- API/evento público definitivo do Authority para consumidores ainda precisa ser separado do legado de opportunities/seeds/profiles/content.
- Migrations dedicadas de Persona, Bibles, runs, blogs, names/domains, approval package e outbox ainda não estão aprovadas/aplicadas remotamente.

**Conclusão:** Authority é o domínio mais avançado localmente, mas ainda não é uma fonte remota operacional comprovada.

### 5.2 Agency Flux

**Implementado/verificado localmente**

- Sessões/roles, read scopes explícitos, entidades de jobs, cards, approvals, gates, handoffs, artifacts, blockers e events.
- Orquestração durável, inbox/dispatcher local, idempotência por event/consumer e receipts.
- Central de aprovações com revisão, rejeição, `revision_requested`, stale package e actor server-side.
- Rota `persona-approved` local, explicitamente documentada como boundary local-only.
- Dashboard com visão de projetos/jobs/Handoffs e política `FLUX_PUBLIC_READ_SCOPE` fail-closed.

**Falhas atuais reproduzidas**

1. `tests/backend-relacional.test.ts`: relação `flux_cards` não existe no banco usado pelo teste.
2. `tests/backend-relacional.test.ts`: fixture falha por duplicate key em `flux_tenants_slug_key`, indicando estado de teste não isolado/reutilizável.
3. `tests/flux-qa-016.e2e.test.ts`: `EBUSY` ao remover `flux-qa-016-TlCO5W/state.json`.

**Parcial/bloqueado**

- O teste E2E local não terminou; portanto, não se pode afirmar a cadeia Authority → Flux → Blogs → Control Tower nem mesmo no harness atual.
- O endpoint `persona-approved` é local-only e usa sessão/role local; não é o adapter serviço-a-serviço real.
- Persistência remota, inbox/outbox remotos, delivery assinado, worker contínuo e heartbeat real permanecem dependentes de schema, runtime e credenciais autorizados.
- Snapshot público depende de escopo explícito; a home pode responder 200 sem que o estado operacional esteja acessível.

**Conclusão:** Agency é o controlador correto, mas o seu próprio control plane ainda precisa provar durabilidade relacional, E2E e operação contínua sem concorrência/fixtures contaminadas.

### 5.3 Control Tower / GestaoDB

**Implementado/verificado localmente**

- Catálogo de projetos, templates, jobs, artifacts de configuração, namespaces, bindings, health e adapters Easypanel.
- CT-001 tem botões/rotas para variáveis públicas, namespace e domínio de validação, com upsert local e sem secrets no payload.
- Saga local, readbacks simulados, DNS state machine, archive/delete/rebuild fail-closed e fixtures de homologação.
- 50 testes, typecheck e build aprovados nesta execução.

**Achados que impedem aprovação global**

- **GDB-NEW-01 crítica:** criação de identity pode aceitar `scopes: ["*"]` e produzir autorização global.
- **GDB-NEW-02 crítica:** editor SQL via RPC `security definer` não exige scope de execução nem ownership/tenant adequados.
- **GDB-NEW-03 alta:** `business_type` e `template_key` podem formar par inconsistente.
- **GDB-NEW-04 alta:** caminho de rebuild pode ignorar `{ error }` de RPC e retornar sucesso sem readback estrutural.
- **GDB-NEW-05 alta:** provisionamento não possui idempotency key/correlation key robusta.
- **GDB-NEW-06 alta:** artifacts não guardam origem/version/hash/readback/approval package/actor server-side suficientes.
- **GDB-NEW-07 alta:** namespaces/bindings podem aceitar associação cross-project sem derivação/validação canônica.
- **GDB-NEW-08 média:** Developer Doc e gerador de configuração usam namespaces diferentes.
- Operações destrutivas e bindings ainda exigem transação ou compensação verificável.
- Migration `011_project_configuration_artifacts.sql` local não é prova de aplicação remota.

**Conclusão:** Control Tower é um provisionador local útil, mas não deve ser chamado de pronto para governar o fluxo até fechar segurança, idempotência, reconciliação e readback remoto.

### 5.4 FBR Blogs

**Implementado/verificado localmente**

- Endpoint `/api/integrations/flux/blog-provisioning` autenticado por token de serviço em runtime.
- Rejeição de Persona não aprovada, versão divergente e hash divergente.
- Receipt metadata-only e idempotência local por evento/chave.
- Secret references sem plaintext, produção fail-closed sem configuração.
- 30 testes, typecheck e build aprovados.

**Parcial/bloqueado**

- `JsonRepository` continua usado em local/development; `SupabaseRepository` cobre o núcleo antigo do blog, mas não implementa de forma comprovada a persistência de `blog_persona_bindings`, `editorial_profiles` e inbox/readbacks do novo contrato.
- `schema.sql` é contrato local, não prova migration aplicada.
- O domínio/DNS ainda é string opcional no runtime principal, sem lifecycle persistido completo.
- Não há evidência de adapter real do Agency chamando Blogs em ambiente remoto.
- Não há readback remoto de binding/editorial config.
- A UI manual ainda representa criação solta e precisa diferenciar sandbox de blog derivado governado pelo Agency.

**Conclusão:** Blogs está pronto para contrato local controlado, não para staging/produção integrada.

## 6. Matriz E2E atual

| Etapa | Local | Remoto/público | Veredito |
|---|---|---|---|
| Intake base | implementado | não confirmado | parcial |
| PersonaVersion | implementado | persistência/readback pendentes | bloqueado remoto |
| Formação modular | verificado | provider/runtime não confirmado | parcial |
| Approval pack | implementado | Gate/readback real não confirmado | parcial |
| Authority outbox | implementado local | delivery assinado não confirmado | bloqueado remoto |
| Agency inbox/dedupe | implementado local | banco/runtime remoto não confirmado | parcial |
| Agency jobs/gates | implementado local | worker contínuo e heartbeat não confirmados | parcial |
| Control Tower catalog | implementado local | catálogo/RLS/readback autenticado não confirmados | bloqueado remoto |
| Control Tower artifacts | implementado local | migration/POST/GET real pendentes | bloqueado remoto |
| DNS/health | fixture/state machine local | DNS real e After Forty não confirmados | bloqueado |
| Blogs binding | contrato local | persistência/adapter/readback remotos pendentes | bloqueado remoto |
| Publicação | fail-closed | não executada | corretamente bloqueada |
| Restart/redeploy survival | não demonstrado transversalmente | não demonstrado | não verificado |
| E2E completo | harness incompleto por 3 falhas | inexistente | não comprovado |

## 7. Gaps prioritários: causa → impacto → solução → aceite

### P0 — Controle e segurança do Control Tower

**Problema:** escopo wildcard, SQL privilegiado, bindings cross-project e sucesso sem readback podem permitir escalada ou estado falso.  
**Causa verificável:** GDB-NEW-01, GDB-NEW-02, GDB-NEW-04 e GDB-NEW-07 da auditoria local.  
**Impacto:** o Agency poderia acreditar que provisionou algo que não existe ou permitir alteração fora do projeto.  
**Solução:** allowlist server-side de scopes; exigir `ct:sql:execute` + tenant/ownership; rejeitar `*` na criação não-admin; derivar namespace do projeto; tratar sempre `{ error }`; readback estrutural obrigatório antes de `success`; transação/compensação.  
**Aceite:** testes negativos para privilege escalation, SQL sem scope, namespace cross-project e RPC error; nenhum job retorna `success/active` sem schema, audit, artifact e readback persistidos.

### P0 — Fonte operacional relacional do Authority

**Problema:** o código já falha fechado, mas o runtime relacional real não foi conectado.  
**Causa verificável:** receipt `RECEIPT-AUTH-RELATIONAL-RUNTIME-2026-09-19.md` informa referências ausentes.  
**Impacto:** Authority público/remoto não pode ser fonte de leitura para o Agency.  
**Solução:** disponibilizar referências seguras no runtime autorizado; confirmar schema/RLS/owner; executar criação, aprovação, GET, restart e GET novamente; atualizar STATUS para refletir o estado real.  
**Aceite:** Persona aprovada sobrevive a restart/redeploy, com `persona_id`, `persona_version_id`, hash e approval readback; `/health` identifica persistência real sem afirmar JSON.

### P0 — Contrato de integração Agency-led

**Problema:** existem slices locais, mas não o caminho serviço-a-serviço completo.  
**Causa verificável:** Flux `persona-approved` declara local-only; Blogs tem token simples local; Authority/Blogs/Control Tower não têm delivery/readback remoto comprovado.  
**Impacto:** o Agency não controla um fluxo real; apenas simula etapas isoladas.  
**Solução:** fechar envelope v1, assinatura/autenticação, endpoint de inbox, idempotency key, correlation/causation, response metadata-only, retry/dead-letter e readback por target.  
**Aceite:** um evento real ou homologação autorizada percorre Authority outbox → Agency inbox → job → Control Tower/Blogs → receipts → readback, sem duplicar efeito em replay.

### P1 — Recuperar a suíte relacional/E2E do Flux

**Problema:** três testes falham.  
**Causa verificável:** tabela `flux_cards` ausente, fixture de tenant não isolada e cleanup `EBUSY`.  
**Impacto:** orquestração e persistência não têm gate local completo.  
**Solução:** preflight de schema no teste; fixture com IDs/slugs únicos e teardown idempotente; fechar clientes/processos antes de remover diretório; usar isolamento sem mascarar erro de negócio.  
**Aceite:** 168/168 testes; testes relacionais confirmam tabelas reais; E2E conclui e deixa evidência persistida; nenhum arquivo temporário fica aberto.

### P1 — Persistência derivada dos Blogs

**Problema:** binding/editorial/inbox/readback não estão comprovados no repository relacional.  
**Causa verificável:** auditoria independente classificou essas entidades como schema local sem métodos Supabase/readback remoto.  
**Impacto:** Blogs pode aceitar um pacote e perder a prova de qual Persona foi herdada.  
**Solução:** escolher inbox exclusivamente do Agency; Blogs persiste binding, configuração editorial, planos e receipts; migration additive; endpoints GET de readback.  
**Aceite:** binding contém Persona/version/hash/event/correlation/status e sobrevive a restart; GET metadata-only coincide com o pacote aprovado.

### P1 — DNS, domínio e namespace canônicos

**Problema:** namespace diverge entre Developer Doc, configuração e Blogs; DNS lifecycle não está persistido transversalmente.  
**Causa verificável:** GDB-NEW-08 e AUD-09.  
**Impacto:** runtimes procuram secrets/configuração em caminho diferente do provisionado; aprovação de DNS pode avançar indevidamente.  
**Solução:** um helper canônico por `business_type`; manter `blog_id`; versionar name/domain; separar manual confirmation de technical verification.  
**Aceite:** mesmo input produz o mesmo namespace em CT, Blogs e handoffs; `dns_verified` exige DNS + health readback.

### P1 — Estado e documentação

**Problema:** STATUSs misturam histórico, estado local e intenção futura.  
**Causa verificável:** Authority ainda registra JSON local junto do novo runtime relacional; Blogs usa `production-readiness-slice` embora a auditoria diga produção bloqueada.  
**Impacto:** agentes podem operar sobre uma falsa fonte de verdade.  
**Solução:** cada repositório manter `STATUS.md` com `implemented`, `local_verified`, `remote_verified`, `public_readback`, `blocked`, `nextAction`, owner e evidence; histórico fica separado.  
**Aceite:** nenhum STATUS chama staging/produção pronta sem readback; diffs/commits servidos são identificados.

## 8. Backlog executável sob Agency como dono do fluxo

### Fase A — Contrato e segurança

| ID | Owner | Dependência | Ação | Evidência | Aceite | Gate |
|---|---|---|---|---|---|---|
| A-01 | Flux + Authority + Blogs + CT | decisão arquitetural | congelar envelope v1, IDs, assinatura, consumer e readback | contrato versionado | todos os campos e estados têm dono | Sergio aprova contrato |
| A-02 | Control Tower | A-01 | corrigir GDB-NEW-01/02/03/04/05/06/07/08 | diff + testes negativos | P0/P1 de segurança/integridade fechados | revisão de segurança |
| A-03 | Authority | A-01 | produzir migration/adapter relacional canônico | SQL/testes/local readback | entidades globais sem sobrescrever legado | Gate de schema |
| A-04 | Blogs | A-01 | implementar persistência e GETs do binding/editorial | migration + testes | binding aprovado e hash verificável | Gate de integração |

### Fase B — Durabilidade do Agency

| ID | Owner | Dependência | Ação | Evidência | Aceite |
|---|---|---|---|---|---|
| B-01 | Flux QA | nenhuma | corrigir `flux_cards`, fixture duplicate key e `EBUSY` | log da suíte | 168/168 local |
| B-02 | Flux | A-01 | implementar inbox/outbox/delivery/readback no schema canônico | migration + receipts | replay não duplica e retry é observável |
| B-03 | Flux | B-01/B-02 | conectar adapter Authority → Flux → Blogs/CT | contrato test + harness | jobs e gates só avançam com readback |
| B-04 | Flux | B-03 | worker/heartbeat/recovery contínuos | processo + logs sanitizados | stalled job vira blocker com next check |

### Fase C — Runtime autorizado

| ID | Owner | Dependência | Ação | Evidência | Aceite |
|---|---|---|---|---|---|
| C-01 | Sergio/infra | A-03 | fornecer referências seguras de banco/runtimes | receipt sanitizado | sem secrets no chat/Git |
| C-02 | David/owner DB | C-01 | aplicar migrations aprovadas na ordem oficial | receipt de migration | backup, rollback e readback antes/depois |
| C-03 | David + owners | C-02/B-03 | executar E2E Authority-led pelo Agency | correlation IDs, responses, readbacks | criação → aprovação → jobs → CT → Blogs |
| C-04 | Flux | C-03 | validar restart/redeploy e replay | readback pós-restart | estado e receipts sobrevivem |

### Fase D — Publicação controlada

| ID | Owner | Dependência | Ação | Evidência | Aceite |
|---|---|---|---|---|---|
| D-01 | Control Tower/infra | C-03 | validar DNS/health/namespace do piloto | DNS + health timestamped | `dns_verified` sem atalho |
| D-02 | Blogs | C-03 | validar configuração editorial derivada | GET metadata-only | persona/version/hash corretos |
| D-03 | Sergio | C-04/D-01/D-02 | revisar pacote G6 | approval versionado | todos os IDs/versões/readbacks presentes |
| D-04 | Flux | D-03 | publicar piloto autorizado e ler receipt | receipt final | estado `published` somente após readback |

## 9. Gates operacionais

### Autônomo pelo Agency

- receber eventos válidos;
- deduplicar e registrar inbox;
- criar jobs;
- chamar adapters autorizados;
- retryar falhas transitórias;
- abrir blockers;
- atualizar next check;
- consolidar receipts e readbacks;
- impedir avanço quando o contrato não está satisfeito;
- manter publicação bloqueada sem Gate.

### Exige Gate de Sergio

- aprovar Persona, nome e pacote de publicação;
- aprovar migrations, schema e alteração estrutural;
- autorizar runtime/secret binding e readback remoto;
- provisionar DNS quando responsabilidade humana;
- publicar, gastar, criar contas ou executar ação irreversível;
- flexibilizar uma regra fail-closed.

## 10. Decisões que precisam ficar explícitas

1. **Agency é o dono do fluxo, não da Persona.**
2. **Control Tower é executor técnico, não orquestrador global.**
3. **Blogs não deve ter inbox duplicado se o inbox canônico é do Agency.** Blogs deve persistir binding e receipt do consumo.
4. **A aprovação pertence a uma versão e a um escopo.** Qualquer mudança de snapshot, nome, domínio, config ou artifact invalida o pacote correspondente.
5. **`success` é um estado verificável, não uma resposta otimista.** Sem readback, usar `waiting_external`, `blocked` ou `failed`.
6. **O legado do Authority não deve ser mapeado silenciosamente para Persona.** Deve existir adapter explícito e IDs de correlação.
7. **A infraestrutura não pode ser atualizada por ordem lexical de arquivos.** O registry de migrations é canônico e versionado.
8. **O sistema precisa suportar N blogs por Persona.** O piloto pode usar um blog, mas não pode esconder uma suposição de blog único.

## 11. Critério de pronto global

O sistema só poderá ser declarado pronto quando todos os itens abaixo forem verdadeiros:

- Authority conectado a persistência relacional autorizada e lido de volta após restart.
- Persona, versão, Bibles, approval package e outbox persistidos com RLS/ownership verificados.
- Agency Flux com suíte local verde, schema relacional presente, inbox/outbox/delivery/readbacks persistentes e worker operacional.
- Control Tower sem os achados críticos/altos da auditoria, com idempotência, scopes, transações/compensações e readback estrutural.
- Blogs com binding/editorial persistidos, API serviço-a-serviço autenticada e readback metadata-only.
- Namespace único e documentado para cada tipo de projeto.
- DNS/health verificados tecnicamente e não apenas marcados manualmente.
- E2E real ou homologação autorizada executada com correlation ID e evidência em cada etapa.
- Restart/redeploy/replay não perdem decisões nem duplicam efeitos.
- G6/G7 aprovados por Sergio antes da publicação.

## 12. Handoff atual

**Status:** revisão completa entregue; arquitetura Agency-led definida; implementação transversal ainda bloqueada.  

**FATOS:** quatro repositórios foram inspecionados; Authority 49/49, Control Tower 50/50, Blogs 30/30; Flux 165/168 com três falhas reproduzidas; contratos locais e blockers documentados.  

**HIPÓTESES:** o impacto de privilege escalation do Control Tower depende da exposição efetiva dos endpoints e principals no runtime servido; deve ser confirmado somente em ambiente controlado.  

**BLOQUEIOS:** runtime relacional do Authority sem referências; schema/fixtures/cleanup do Flux; Control Tower com gaps críticos/altos; persistência/adapter/readback remoto do Blogs; DNS/namespace; ausência de E2E transversal e readback pós-restart.  

**DECISÃO:** Agency Flux passa a ser formalmente o controlador de todo o fluxo operacional; nenhum sistema executor avança estado global sozinho; nenhuma publicação ou migration remota é autorizada por este relatório.  

**Próxima ação:** executar Fase A, começando por fechar segurança/idempotência/readback do Control Tower e recuperar a suíte do Flux; somente depois iniciar o E2E pelo Authority.
