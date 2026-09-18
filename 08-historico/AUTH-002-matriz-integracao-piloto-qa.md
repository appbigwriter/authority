# AUTH-002 — Matriz de integração, piloto e QA

## Status da entrega

`BACKLOG_EXECUTAVEL_VERIFICAVEL` — matriz criada a partir de README, STATUS, MP-000, documentação dos quatro módulos, contratos de arquitetura e testes locais.

## Escopo e limites

- Esta entrega organiza pendências para integração, piloto manual e QA formal.
- Não cria contas, não conecta marketplaces reais, não publica conteúdo e não gasta verba.
- Nenhuma capacidade externa deve ser considerada pronta por existir adapter, fake, contrato em rascunho ou variável de ambiente vazia.
- Toda ação externa exige contrato, credencial segura, health check, evidência sanitizada e aprovação específica.

## Fontes lidas

| Fonte | Evidência usada |
|---|---|
| `README.md` | Propósito, quatro módulos, relação com FBR Agency Flux e ordem de trabalho. |
| `STATUS.md` | Estado `IMPLEMENTACAO_PARCIAL`, 26 testes passando, integrações e QA pendentes, nenhuma Sprint concluída. |
| `02-prd/MP-000-foundation.md` | Gates G0–G7, limites anti-impulso, pipeline obrigatório e critérios de fundação. |
| `02-prd/stories/S1-opportunity-radar.md` | Dependências e gate de saída do Opportunity Radar. |
| `02-prd/stories/S2-influencer-seeds-creator.md` | Dependências e gate de saída do Seeds Creator. |
| `02-prd/stories/S3-influencer-farmer.md` | Dependências e gate de saída do Farmer. |
| `02-prd/stories/S4-post-machine.md` | Dependências e gate de saída do Post Machine. |
| `03-arquitetura/four-core-modules.md` | Contratos mínimos entre módulos, estados e critérios de base. |
| `03-arquitetura/integrations.md` | Variáveis pendentes, requisitos para S1 integrado e regra de não declarar integração por fake. |
| `03-arquitetura/api-contract-v0.1.md` | Endpoints locais, limitações de auth, JsonStore e integrações externas. |
| `04-database/schema-foundation.sql.md` | Schema base em rascunho e bloqueios para migration externa. |
| `08-historico/qa-handoff.md` | QA bloqueado para formal final até resolver credenciais, Postgres/RLS, canais, assets e observabilidade. |
| `09-codigo/src/*` e testes | Implementação local dos módulos, adapters, servidor, JsonStore, gates e serviços. |

## Evidência verificada nesta execução

- Comando: `npm run check`
- Diretório: `F:/Projetos/_FBR/AuthorityEngine/09-codigo`
- Resultado: build TypeScript passou; 26 testes passaram; 0 falhas.
- Cobertura observada pelos nomes dos testes: API health/persistência/aprovação explícita, pipeline fake com gates, bloqueio de seed de oportunidade bloqueada, bloqueio de publicação sem aprovação, S1 adapters fail-closed, normalização/deduplicação, evidência insuficiente, score/dossiê, S2 taxonomia/seeds/pacote comparativo/bloqueios, S3 Character Bible/plano editorial/matriz de claims/handoff, S4 fila/draft/adaptação/assets/revisão/receipt fake/métricas/feedback.

## Separação de estado

### Implementado localmente

| Área | Implementado | Limite |
|---|---|---|
| Quatro módulos | Código local para Radar, Seeds, Farmer e Post Machine. | Implementação local não conclui Sprint sem contratos externos e gates humanos. |
| API local | `/health`, `/api/state`, criação de oportunidades/seeds/perfis/conteúdo/aprovações e rotas específicas de S1–S4. | Sem autenticação; sem autorização; sem RLS. |
| Persistência | `JsonStore` local com coleções de oportunidades, seeds, perfis, conteúdo, assets, approvals, receipts, métricas e feedback. | Não é Postgres/Supabase produtivo. |
| Marketplaces | `ConfiguredMarketplaceAdapter` e `FakeMarketplaceAdapter`; adapters falham fechado sem credencial. | Não há contrato/endpoint real validado da Amazon ou marketplace secundário. |
| Geração editorial | Post Machine gera drafts, adapta canais, controla aprovação e registra métricas/feedback. | Canais reais e publicação assistida produtiva não configurados. |
| Assets | Estruturas/nomes versionados e validações em testes de adaptação por canal. | Sem geração visual real, storage, licença/receipt real ou CDN. |

### Verificado

| Item | Evidência | Resultado |
|---|---|---|
| Build TypeScript | `npm run check` | Passou. |
| Testes locais | `node --test dist/tests/*.test.js` via script `npm test` | 26/26 passaram. |
| Fail-closed de integrações | Testes OPR-001 e código de adapter | Ausência de credencial bloqueia; fake não declara integração real. |
| Gate de publicação | Testes PMA-004/API approvals | Aprovação específica é exigida; sem aprovação falha fechado. |
| Pipeline local | Teste pipeline completo com fake adapter | Funciona para simulação isolada, não produção. |

### Configurado

| Item | Configuração atual | Estado |
|---|---|---|
| Control Tower | Projeto `Authority Engine`, ID `dfb080ea-5fa2-4924-bccd-8f121c637e6e`, schema `custom_authorityengine`, provider `easypanel`, namespace `fbr/blogs/dfb080ea-5fa2-4924-bccd-8f121c637e6e/`. | Provisionado/ativo conforme STATUS. |
| Runtime vars documentadas | `PORT`, `AUTHORITY_STORE`, `AMAZON_API_URL`, `AMAZON_API_KEY`, `SECONDARY_MARKETPLACE_API_URL`, `SECONDARY_MARKETPLACE_API_KEY`. | Documentadas; chaves reais não preenchidas nesta entrega. |
| API contract | Contrato v0.1 documentado. | Útil para QA local e próximo backend, com limitações declaradas. |
| Schema base | SQL de fundação documentado. | Rascunho; não aplicado em banco externo. |

### Bloqueado

| Bloqueio | Impacto | Owner único | Próximo check |
|---|---|---|---|
| MP-000 ainda em validação/aprovação explícita | G0–G7 não podem ser considerados liberados para execução comercial/piloto real. | Sergio | Registrar decisão datada no card/fundação. |
| Schema `custom_authorityengine` não exposto no PostgREST da VPS (`PGRST106`) | App não pode usar REST produtivo do schema. | DevOps/Control Tower | Health check de PostgREST com schema exposto. |
| Sem contrato/credencial Amazon | S1 não pode ser integrado nem gerar evidência real de marketplace. | Owner Integrações Marketplace | Contrato oficial + credencial segura + smoke sanitizado. |
| Sem marketplace adicional definido/contratado | OPR-002 não prova normalização entre duas fontes reais. | Owner Integrações Marketplace | Seleção do provider secundário + contrato + política de uso. |
| Sem auth/RLS | QA formal de segurança bloqueado; risco de dados multi-tenant. | Owner Backend/Supabase | Migration idempotente + policies + testes de acesso negado. |
| Sem geração visual/storage de assets | S3/S4 não têm identidade visual fotorrealista operável nem versionamento produtivo. | Owner Assets/Brand | Provedor, storage, política de licença e receipts. |
| Sem canais/fila reais | S4 não conclui ciclo com publicação assistida e receipt real. | Owner Editorial Ops | Canal aprovado + fila + modo assistido + receipt. |
| Sem QA formal externo | Não há `READY_FOR_FORMAL_QA`. | Owner QA | Plano de QA, matriz de testes, evidências anexadas. |
| Sem piloto manual definido/aprovado | Aprendizado real e critérios de sucesso não existem. | Sergio | Aprovação do nicho/persona piloto, escopo e métricas. |

### Roadmap

| Horizonte | Resultado esperado | Observação |
|---|---|---|
| R0 — Fundação congelada | MP-000 aprovado, gates aceitos, runtime remoto com health check básico. | Sem isso, integrações reais viram risco. |
| R1 — Integrações de pesquisa | Amazon + marketplace secundário com contratos, health checks e smoke tests. | Não publicar nem monetizar; só coleta/normalização autorizada. |
| R2 — Persistência segura | Postgres/Supabase com auth, RLS, audit trail e rollback. | Substitui JsonStore como fonte produtiva. |
| R3 — Assets e canais assistidos | Storage, geração visual, fila editorial e receipts de publicação assistida. | Ainda exige aprovação humana por conteúdo/canal. |
| R4 — QA formal | Suite local + integração + segurança + regressão + evidências anexadas. | Gate para piloto. |
| R5 — Piloto manual | Um nicho/persona aprovado, conteúdo em fila, métricas mínimas e aprendizado retornando ao Radar. | Não escalar sem decisão posterior. |

## Matriz completa de capacidades pendentes

| ID | Capacidade | Estado atual | Owner único | Dependências | Contratos necessários | Critérios de aceite objetivos | Evidência esperada | Gate | Próximo check |
|---|---|---|---|---|---|---|---|---|---|
| AUTH-002-AMZ-01 | Integração Amazon — contrato e fonte | Bloqueado | Owner Integrações Marketplace | MP-000 aprovado; conta/API autorizada; política de uso de dados; secrets via namespace seguro. | Endpoint oficial, método, payload, escopos, limites, TOS/política, erros/rate limit, modelo de produto/categoria. | Dado contrato oficial aprovado, a fonte Amazon deve ter nome, versão/endpoint, escopo, data, limitação e credencial referenciada sem secret em código/log. | Documento de contrato sanitizado + configuração por referência + health check sem expor secret. | G1 Oportunidade + Gate de credenciais seguras | Confirmar provider/API Amazon permitido e responsável pelo acesso. |
| AUTH-002-AMZ-02 | Integração Amazon — adapter produtivo | Bloqueado | Owner Backend Integrações | AMZ-01; credencial válida; ambiente de teste; tratamento de timeout/rate limit. | Interface `MarketplaceAdapter`, mapeamento para contrato normalizado, erros esperados, retry/backoff, sanitização de logs. | Dada uma busca de teste autorizada, adapter deve retornar produtos/tendências normalizados ou erro explícito; ausência/expiração de credencial deve falhar fechado. | Teste de integração com resposta sanitizada, log sem secret, fixture da resposta real reduzida, relatório de rate limit. | G1 + QA integração | Implementar somente após contrato/credencial. |
| AUTH-002-AMZ-03 | Amazon — smoke e evidência | Bloqueado | Owner QA Integrações | AMZ-02; ambiente remoto com env vars; observabilidade mínima. | Roteiro de smoke, payload permitido, dados esperados, critérios de falha. | Dado runtime configurado, `/health` ou endpoint dedicado deve refletir Amazon configurada somente após smoke real passar. | Timestamp, comando, status HTTP, payload sanitizado, fonte/data/limitação registrada. | Gate QA formal | Rodar sem persistir dado proibido. |
| AUTH-002-MKT-01 | Marketplace adicional — seleção | Bloqueado | Owner Estratégia Marketplace | Critério de nicho piloto; alternativa autorizada; avaliação legal/comercial. | Critérios de escolha, política de API, escopo, limites, modelo de dados. | Dada a seleção, deve existir justificativa factual do provider, uso permitido e campos comparáveis com Amazon. | Decisão registrada com fonte, data, limitação e owner. | G1 Oportunidade | Escolher marketplace secundário antes de adapter real. |
| AUTH-002-MKT-02 | Marketplace adicional — adapter produtivo | Bloqueado | Owner Backend Integrações | MKT-01; credencial segura; endpoint de teste. | Mesmo contrato `MarketplaceAdapter`, mapeamento normalizado, rate limit, erros, duplicidade cross-source. | Dadas duas fontes reais, o sistema deve representar produto/categoria/timestamp sem inventar campos e deduplicar sem apagar origem. | Teste de integração com Amazon + secundário, fixture sanitizada e diff de normalização. | G1 + OPR-002 | Implementar depois de AMZ-01/MKT-01 para comparar. |
| AUTH-002-ASSET-01 | Política de assets e storage | Bloqueado | Owner Assets/Brand | Character Bible aprovado; política visual; storage escolhido; regras de licença. | Contrato de asset: id, origem, prompt, licença, versão, pessoa/persona, canal, disclosure, storage URI, hash/receipt. | Dado um asset gerado/importado, deve haver versão, fonte/licença, vínculo com perfil/conteúdo e proibição de uso sem disclosure quando aplicável. | Registro de asset com hash, caminho, licença, prompt sanitizado e aprovação. | G6 Identidade/transparência | Definir storage e política antes de gerar imagens reais. |
| AUTH-002-ASSET-02 | Geração visual da persona | Bloqueado | Owner Visual/IA | ASSET-01; provedor aprovado; budget aprovado se houver custo; guardrails de IA. | Prompt contract, negative prompts, continuity, disclosure, avaliação de consistência, restrições de sexualização/credenciais. | Dado Character Bible, geração deve produzir variações consistentes, rotuladas como IA e rejeitar imagens fora dos guardrails. | Lote de teste com thumbnails/paths, checklist de consistência, aprovações e rejeições. | G6 + Gate verba se pago | Não gastar nem chamar provedor pago sem aprovação. |
| AUTH-002-AUTH-01 | Autenticação do app | Bloqueado | Owner Backend/Supabase | Runtime VPS; Supabase/Postgres acessível; estratégia de usuários internos. | Modelo de usuário, sessão/token, roles, escopos, auditoria, política de convite. | Dado usuário não autenticado, rotas protegidas devem negar acesso; dado usuário autenticado, acesso deve obedecer role. | Testes automatizados 401/403/200, configuração sem secrets e audit log. | Gate segurança | Definir roles mínimas antes de RLS. |
| AUTH-002-RLS-01 | Postgres/Supabase + RLS | Bloqueado | Owner Backend/Supabase | AUTH-01; schema exposto no PostgREST; migration revisada; backup/rollback. | SQL idempotente, policies por tabela, service role/server-only, tenant/owner, audit trail. | Dadas duas identidades/roles, uma não deve ler/escrever dados fora do escopo; migrations devem rodar idempotentes e rollback definido. | Logs de migration, testes RLS positivos/negativos, print/log PostgREST com schema ativo, backup/rollback registrado. | Gate segurança + aprovação Sergio para mutation externa | Resolver `PGRST106` antes de qualquer app produtivo. |
| AUTH-002-DATA-01 | Migração JsonStore → Postgres | Bloqueado | Owner Backend Dados | RLS-01; contrato de dados congelado; estratégia de migração. | Mapeamento de coleções JsonStore para tabelas, ids, status, timestamps, payload JSONB, integridade referencial. | Dado dataset local de teste, migração deve preservar contagem, ids, status e relações; falhas devem não corromper destino. | Relatório de contagem antes/depois, checksums/export, rollback testado. | Gate dados | Não migrar produção sem backup/aprovação. |
| AUTH-002-QUEUE-01 | Fila editorial/canais | Bloqueado | Owner Editorial Ops | S3 perfil aprovado; Character Bible; canais autorizados; política de publicação. | Contrato de fila: brief, canal, formato, asset, versão, prioridade, owner, status, gate, scheduled_at, receipt. | Dada pauta aprovada, item deve entrar em `draft/review/awaiting_human_approval`; ausência de fonte/guardrail deve bloquear. | Registro de fila com estados e próximo gate; teste de bloqueio de pauta sem fonte. | G4/G7 + PMA-001 | Primeiro operar com canal simulado/assistido. |
| AUTH-002-CHANNEL-01 | Publicação assistida com receipt real | Bloqueado | Owner Canais | QUEUE-01; conta/canal autorizado; aprovação por conteúdo; adaptador de canal. | API/canal, escopos, limites, formato, rollback/delete, receipt, métricas disponíveis. | Dada aprovação específica, publicação assistida deve registrar canal, versão, horário, responsável e receipt; sem aprovação deve falhar fechado. | Receipt do canal ou confirmação manual anexada, log sanitizado, item publicado versionado. | Gate publicação/mutação | Não conectar ou publicar nesta story. |
| AUTH-002-METRICS-01 | Métricas e feedback Radar | Parcial local; bloqueado real | Owner Analytics | CHANNEL-01; contrato de métricas por canal; período de observação. | Modelo de métricas: atenção, confiança, tráfego, leads, conversão, fonte, período, versão de conteúdo. | Dado período definido, métricas devem separar dimensões, marcar dado insuficiente e gerar pergunta/sinal para o Radar. | Relatório de métricas com fonte/período e feedback associado a oportunidade. | G4/G5 + PMA-005 | Usar dados simulados só como teste, nunca como resultado. |
| AUTH-002-QA-01 | Plano de QA formal | Bloqueado | Owner QA | Backlog priorizado; contratos de API; integrações definidas; ambiente remoto. | Matriz de testes local, integração, segurança, dados, canais, assets, regressão e smoke. | Dada a matriz, cada requisito do STATUS deve mapear para teste/evidência ou blocker; severidade e owner definidos. | Plano QA versionado + checklist por gate + links de evidência. | Gate QA formal | Atualizar `qa-handoff` quando pronto. |
| AUTH-002-QA-02 | Suite de integração externa | Bloqueado | Owner QA Integrações | AMZ-02; MKT-02; AUTH/RLS; env seguro; fixtures sanitizadas. | Test contract para marketplaces, Postgres, auth, fila e canais fake/assistidos. | Dado ambiente de teste, suite deve passar sem secrets, sem gasto e com falhas claras para credencial ausente/expirada. | Output de CI/local, fixtures sanitizadas, relatório de falhas. | Gate QA formal | Rodar só após integrações. |
| AUTH-002-PILOT-01 | Definição do piloto manual | Bloqueado | Sergio | MP-000 aprovado; nicho/persona candidato; métricas mínimas; capacidade operacional. | Briefing do piloto: nicho, público, problema, persona, canal, conteúdo mínimo, critérios de sucesso, stop criteria, riscos. | Dado piloto proposto, deve responder às 8 perguntas do MP-000 e permanecer `draft` sem SIM explícito datado. | Documento de piloto aprovado/rejeitado, decisão datada, critérios mensuráveis. | G7 Aprovação do piloto | Sergio escolhe ou rejeita direção. |
| AUTH-002-PILOT-02 | Execução manual controlada do piloto | Roadmap bloqueado | Owner Piloto/PM | PILOT-01; QA formal mínimo; fila; assets/canais; aprovação publicação. | Plano de execução, calendário, RACI, evidências por conteúdo, métrica e aprendizado. | Dado piloto aprovado, cada item publicado deve ter aprovação, receipt, métrica/período e feedback para Radar; qualquer blocker volta ao card. | Pasta de evidências, relatório semanal, métricas, decisões continuar/ajustar/pausar/encerrar. | G7 + Gate publicação | Só após QA e aprovação explícita. |

## Backlog priorizado

### P0 — Bloqueadores de fundação e segurança

1. Aprovar ou devolver MP-000 com decisão datada de Sergio.
2. Resolver exposição do schema `custom_authorityengine` no PostgREST e confirmar health check remoto.
3. Definir auth, roles e RLS antes de qualquer dado real.
4. Produzir plano formal de QA com matriz requisito → teste → evidência.

### P1 — Integrações de pesquisa para S1

1. Contrato Amazon oficial e credencial por referência segura.
2. Seleção/contrato de marketplace secundário.
3. Adapters produtivos com fail-closed, rate limit e fixtures sanitizadas.
4. Smoke remoto com evidência sanitizada.

### P2 — Assets e Post Machine operável

1. Contrato de asset/storage/licença/hash/receipt.
2. Provedor visual aprovado e testado sem violar guardrails.
3. Fila editorial com estados e gates.
4. Canais assistidos com receipt real, sem blast automático.

### P3 — Piloto manual

1. Definir nicho/persona e critérios de sucesso.
2. Rodar conteúdo mínimo com aprovação humana.
3. Coletar métricas por período.
4. Retroalimentar Radar e decidir continuar/ajustar/encerrar.

## Caminho crítico

```text
MP-000 aprovado por Sergio
→ runtime remoto saudável + schema exposto
→ auth/RLS e audit trail
→ QA plan formal
→ contratos Amazon + marketplace secundário
→ adapters reais + smoke sanitizado
→ S1 com evidência real
→ S2/S3 com decisão humana e Character Bible aprovado
→ assets/storage com disclosure
→ fila/canais assistidos
→ QA formal completo
→ aprovação G7 do piloto
→ piloto manual controlado
```

Qualquer falha em MP-000, schema/PostgREST, auth/RLS ou contratos de marketplace bloqueia a cadeia inteira para produção/piloto real.

## Tracks paralelas permitidas

| Track | Pode avançar em paralelo? | Condição | Não pode |
|---|---:|---|---|
| Integrações marketplace | Sim | Trabalhar em contratos, mapeamentos e testes fake/fixture. | Chamar API real sem credencial/aprovação. |
| Auth/RLS/Postgres | Sim | Desenhar migration, policies e testes locais/idempotentes. | Aplicar mutation externa sem aprovação e rollback. |
| Assets/Brand | Sim | Definir contrato de assets, nomenclatura, política visual e checklist. | Gerar imagem paga ou usar pessoa real/asset sem licença. |
| QA | Sim | Montar matriz e suites locais baseadas em contratos. | Declarar QA final sem integrações e ambiente. |
| Piloto | Parcial | Especificar briefing, métricas e stop criteria. | Executar publicação, gasto ou criação de conta. |
| Canais/fila | Sim | Modelar fila, estados, adapters fake e receipts simulados. | Conectar/publish em canal real. |

## Gates aplicáveis

| Gate | Exigência nesta matriz | Bloqueia |
|---|---|---|
| G0 Escopo | Nicho, público, problema e finalidade editorial definidos. | Piloto/persona sem briefing. |
| G1 Oportunidade | Fontes reais, datas, sinais, concorrentes/referências e score explicado. | S1 integrado, S2 real. |
| G2 Diferenciação | Ângulo, público, formato e distinção verificável. | Seleção de seed. |
| G3 Autoridade e ética | Claims, limites, disclosure e proibições. | Character Bible e conteúdo. |
| G4 Viabilidade editorial | 3 pilares, 2 formatos, 10 pautas e fontes/produtos relevantes. | Post Machine/piloto. |
| G5 Monetização sustentável | Produto pertinente; comissão não aprova sozinha. | Recomendações comerciais. |
| G6 Identidade e transparência | Character Bible, política visual, disclosure e regras de imagem. | Assets/canais públicos. |
| G7 Aprovação do piloto | SIM explícito e datado de Sergio. | Piloto real, publicação, gasto ou criação de conta. |
| Gate Segurança | Auth/RLS, secrets por referência, logs sanitizados, audit trail. | Dados reais/ambiente produtivo. |
| Gate QA Formal | Plano + suites + evidências externas e locais. | Mudança de status para pronto. |
| Gate Publicação/Mutação | Aprovação específica por ação irreversível. | Publicar, conectar marketplace, aplicar migration, gastar. |

## Validação contra `02-prd/stories/AUTH-002-integracao-piloto-qa.md`

| Critério da story | Status | Evidência nesta entrega |
|---|---|---|
| Ler README, STATUS, MP-000, quatro módulos e testes existentes. | Atendido | Seções “Fontes lidas” e “Evidência verificada nesta execução”; `npm run check` executado com 26 testes passando. |
| Criar matriz de capacidade: Amazon, marketplace adicional, assets, autenticação/RLS, canais/fila, QA e piloto. | Atendido | Seção “Matriz completa de capacidades pendentes” cobre AMZ, MKT, ASSET, AUTH/RLS/DATA, QUEUE/CHANNEL/METRICS, QA e PILOT. |
| Para cada item, registrar owner, dependência, contrato necessário, critério de aceite, evidência e Gate. | Atendido | Cada linha da matriz possui owner único, dependências, contratos, aceite, evidência, gate e próximo check. |
| Separar implementado, verificado, configurado, bloqueado e roadmap. | Atendido | Seção “Separação de estado”. |
| Todas as pendências do STATUS cobertas por story ou blocker. | Atendido | Amazon, marketplace adicional, Postgres/Supabase/auth/RLS, assets, canais/fila/publicação, QA, congelamento/aprovação e piloto aparecem como blockers/backlog. |
| Cada item possui owner único, dependências e próximo check. | Atendido | Colunas `Owner único`, `Dependências` e `Próximo check`. |
| Critérios de aceite objetivos e evidência esperada. | Atendido | Colunas `Critérios de aceite objetivos` e `Evidência esperada`. |
| Gates humanos e bloqueios externos explícitos. | Atendido | Colunas `Gate`, seção “Gates aplicáveis” e “Bloqueado”. |
| Fora do escopo respeitado. | Atendido | Nenhuma conta criada, nenhuma integração real conectada, nenhuma publicação ou gasto executado. |

## Riscos e decisões pendentes

| Tipo | Item | Owner único | Severidade | Ação necessária |
|---|---|---|---|---|
| BLOQUEIO | MP-000 sem aprovação explícita. | Sergio | Alta | Aprovar/devolver fundação com data. |
| BLOQUEIO | PostgREST não expõe schema `custom_authorityengine`. | DevOps/Control Tower | Alta | Corrigir exposição do schema e comprovar via health check. |
| BLOQUEIO | Amazon e marketplace secundário sem contrato/credencial. | Owner Integrações Marketplace | Alta | Obter contratos e credenciais por referência. |
| BLOQUEIO | Sem auth/RLS. | Owner Backend/Supabase | Alta | Implementar e testar segurança antes de dados reais. |
| BLOQUEIO | Sem canal/publicação assistida e receipts reais. | Owner Editorial Ops | Média | Definir canal e contrato de receipt após QA. |
| HIPÓTESE | SharpEye/Nadia pode ser primeiro caso de teste. | Sergio | Média | Confirmar ou substituir nicho/persona piloto. |
| DECISÃO | Núcleo local é suficiente para backlog, não para produção. | AUTH-002 | Média | Manter status como implementação parcial até evidências externas. |

## Handoff completo

```yaml
de: "subagent AUTH-002"
para: "Íris / próximo owner de execução Authority Engine"
card: "AUTH-002 — Matriz de integração, piloto e QA"
objetivo do job: "Transformar pendências atuais do Authority Engine em backlog executável e verificável para integração, piloto manual e QA formal."
entregável: "F:/Projetos/_FBR/AuthorityEngine/08-historico/AUTH-002-matriz-integracao-piloto-qa.md"
decisões/suposições:
  - "FATO: Núcleo local dos quatro módulos existe e foi verificado com npm run check; 26 testes passaram; 0 falhas."
  - "FATO: Persistência atual é JsonStore local; Postgres/Supabase/RLS ainda não estão aplicados ao app."
  - "FATO: Control Tower está provisionado conforme STATUS, mas schema custom_authorityengine ainda não está exposto no PostgREST segundo STATUS."
  - "FATO: Amazon e marketplace adicional não têm contrato/credencial/smoke real registrados."
  - "HIPÓTESE: SharpEye/Nadia pode ser o piloto, mas depende de confirmação explícita de Sergio."
  - "DECISÃO: Esta entrega não cria conta, não conecta API real, não publica e não gasta verba."
pendências/blockers:
  - "MP-000: severidade alta; owner Sergio; depende de aprovação explícita e datada."
  - "PostgREST/schema: severidade alta; owner DevOps/Control Tower; depende de exposição do schema e health check."
  - "Amazon/marketplace: severidade alta; owner Integrações Marketplace; depende de contrato oficial, credenciais seguras e smoke sanitizado."
  - "Auth/RLS: severidade alta; owner Backend/Supabase; depende de roles, policies, migration, backup e rollback."
  - "Assets/storage: severidade média; owner Assets/Brand; depende de política visual, provider/storage e licença."
  - "Canais/fila: severidade média; owner Editorial Ops; depende de canal autorizado, fila, aprovação e receipt."
  - "QA formal: severidade alta; owner QA; depende de plano, suites e ambiente integrado."
  - "Piloto: severidade alta; owner Sergio; depende de G7 com SIM explícito e critérios de sucesso."
gate: "revisão"
critérios de aceite/evidência:
  - "Todas as pendências do STATUS cobertas: ver matriz e validação AUTH-002."
  - "Cada item com owner único, dependências e próximo check: ver colunas da matriz."
  - "Critérios objetivos e evidência esperada: ver colunas de aceite/evidência."
  - "Gates humanos e bloqueios externos explícitos: ver gates aplicáveis e bloqueios."
  - "Testes existentes executados: npm run check em 09-codigo, 26/26 passaram."
```

## Próxima ação recomendada

1. Sergio aprova/devolve MP-000 e define se SharpEye/Nadia é o piloto.
2. DevOps corrige/verifica exposição do schema no PostgREST e health remoto.
3. Backend desenha auth/RLS/migration idempotente sem aplicar externamente até aprovação.
4. Integrações obtêm contratos Amazon + marketplace secundário e preparam smoke sanitizado.
5. QA transforma esta matriz em plano de testes formal com evidências anexáveis ao card.
