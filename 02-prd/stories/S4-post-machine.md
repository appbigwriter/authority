# SPRINT 4 — Post Machine

## Objetivo do sprint
Transformar perfis desenvolvidos e planos editoriais aprovados em produção de conteúdo organizada, versionada, revisável e mensurável.

## Resultado esperado
Uma fila de conteúdo pronta para revisão humana, com fontes, disclosures, produto relevante, versão, canal, responsável e métricas posteriormente registradas.

## Dependências
- S3 concluído;
- perfil e Character Bible aprovados para produção;
- plano editorial;
- fontes e matriz de claims;
- contas/canais autorizados, quando houver;
- gate de publicação do FBR Agency Flux.

## Stories

### PMA-001 — Receber pauta e briefing aprovado
**Como** Post Machine, **quero** validar entradas antes de produzir **para** não criar conteúdo sem contexto ou autorização.

**Entregáveis:** contrato de entrada, validador e fila de produção.

**Aceite:**
- [ ] Pauta referencia persona, versão, pilar, formato e objetivo.
- [ ] Ausência de Character Bible ou guardrail bloqueia a produção.
- [ ] Pauta sem fonte exigida fica `blocked`.
- [ ] O sistema registra owner, prioridade e próximo gate.

### PMA-002 — Produzir conteúdo na voz da persona
**Como** editor, **quero** gerar rascunhos coerentes **para** testar formatos e construir autoridade.

**Entregáveis:** roteiro, legenda, artigo ou e-mail conforme briefing, com fontes e CTA.

**Aceite:**
- [ ] O conteúdo corresponde ao pilar e ao formato aprovados.
- [ ] A voz segue o Character Bible.
- [ ] Claims são verificados contra a matriz.
- [ ] Não há testemunho inventado, promessa proibida ou disclosure ausente.
- [ ] O resultado permanece `draft` até revisão.

### PMA-003 — Adaptar conteúdo para canais e assets
**Como** operador editorial, **quero** adaptar uma ideia para canais diferentes **para** preservar a estratégia sem duplicação mecânica.

**Entregáveis:** versões por canal, especificações de asset, nome versionado e vínculo com original.

**Aceite:**
- [ ] Cada adaptação respeita limite e formato do canal.
- [ ] A versão mantém sentido, fontes, disclosure e CTA adequado.
- [ ] Assets seguem nomenclatura e licença/fonte registradas.
- [ ] A rede não publica o mesmo asset/cadência de modo sincronizado sem decisão.

### PMA-004 — Controlar revisão, aprovação e publicação assistida
**Como** Sergio, **quero** revisar a fila antes de ações públicas **para** manter controle sobre reputação e conformidade.

**Entregáveis:** fila de revisão, estados, checklist, registro de aprovação e publicação assistida.

**Aceite:**
- [ ] O conteúdo transita por `draft`, `review`, `awaiting_human_approval` e `published`.
- [ ] Publicação pública exige aprovação específica registrada.
- [ ] Conteúdo bloqueado não pode ser publicado por atalho.
- [ ] O sistema registra versão publicada, canal, horário e responsável.
- [ ] Não existe blast automático multi-conta sem gate.

### PMA-005 — Registrar métricas e retroalimentar o Radar
**Como** estrategista, **quero** devolver resultados ao Radar **para** melhorar futuras opções.

**Entregáveis:** registro de métricas, feedback qualitativo, relatório de aprendizado e sinal para nova pesquisa.

**Aceite:**
- [ ] Métricas possuem período, canal, conteúdo, versão e fonte.
- [ ] O registro separa atenção, confiança, tráfego, leads e conversão.
- [ ] Dados insuficientes são marcados como insuficientes.
- [ ] O feedback gera perguntas ou sinais para o Opportunity Radar.
- [ ] Métrica ruim não é escondida nem substituída por contagem de seguidores.

## Gate de saída S4
S4 só pode concluir um ciclo quando o conteúdo publicado tiver aprovação e receipt/evidência, e as métricas ou limitações estiverem registradas para retroalimentação.
