# SPRINT 2 — Influencer Seeds Creator

## Objetivo do sprint
Transformar cada oportunidade qualificada em opções de arquétipo, função e modelo de perfil de influencer de autoridade, permitindo comparação antes de desenvolver uma persona.

## Resultado esperado
Duas ou mais seeds comparáveis quando houver alternativas plausíveis, cada uma com racional, público, função, diferenciação, formato, riscos e hipótese de desenvolvimento.

## Dependências
- S1 concluído ou oportunidade em contrato válido;
- dossiê de oportunidade;
- taxonomia de arquétipos;
- catálogo de personas existentes para comparação;
- guardrails de transparência e autoridade.

## Stories

### ISC-001 — Definir taxonomia de arquétipos e funções
**Como** Authority Engine, **quero** uma taxonomia versionada **para** escolher a função editorial adequada, e não apenas uma aparência.

**Entregáveis:** catálogo de arquétipos, funções, competências, limites e exemplos.

**Aceite:**
- [ ] Cada arquétipo possui função, público, força, limite e contexto de uso.
- [ ] A taxonomia diferencia curadora, analista, educadora, comparadora e outras funções.
- [ ] Nenhuma função exige experiência corporal inventada.
- [ ] A versão da taxonomia fica registrada na seed.

### ISC-002 — Gerar seeds a partir de oportunidade
**Como** estrategista, **quero** gerar seeds fundamentadas no dossiê **para** explorar diferentes formas de autoridade.

**Entregáveis:** gerador de seeds, prompt/skill versionado, saída estruturada e racional.

**Aceite:**
- [ ] Cada seed referencia uma oportunidade existente.
- [ ] Cada seed define arquétipo, função, público, problema e promessa editorial.
- [ ] Cada seed inclui nome provisório, voz, aparência e formatos candidatos.
- [ ] Saídas incompletas são marcadas como `invalid`, não aprovadas silenciosamente.

### ISC-003 — Verificar diferenciação e risco de clonagem
**Como** guardião de portfólio, **quero** comparar a seed com marcas existentes **para** evitar clones.

**Entregáveis:** matriz de diferenciação e análise de proximidade conceitual.

**Aceite:**
- [ ] A comparação inclui SharpEye, TheThirties, After Forty, Game Style e referências relevantes.
- [ ] A seed explicita o que é diferente em público, problema, voz, formato e visual.
- [ ] Sem diferença verificável, a seed fica bloqueada.
- [ ] A análise registra limitações e não afirma originalidade absoluta sem base.

### ISC-004 — Pontuar adequação da seed
**Como** decisor, **quero** uma nota explicada para cada seed **para** escolher pela qualidade, não por gosto visual.

**Entregáveis:** score de adequação com critérios versionados.

**Aceite:**
- [ ] Critérios incluem autoridade, audiência, diferenciação, conteúdo, conformidade e viabilidade.
- [ ] Aparência isolada não pode determinar aprovação.
- [ ] Cada nota possui justificativa e evidência/hipótese correspondente.
- [ ] Risco crítico produz bloqueio automático.

### ISC-005 — Gerar pacote comparativo para decisão
**Como** Sergio, **quero** comparar seeds em um único pacote **para** selecionar uma direção ou rejeitar todas.

**Entregáveis:** tabela comparativa, recomendação, riscos, perguntas em aberto e decisão pendente.

**Aceite:**
- [ ] O pacote apresenta alternativas lado a lado.
- [ ] Mostra recomendação e também argumentos contra cada opção.
- [ ] Não muda seed para `selected` sem decisão humana registrada.
- [ ] O handoff para S3 inclui somente a seed selecionada e sua versão.

## Gate de saída S2
S2 só pode avançar quando Sergio selecionar explicitamente uma seed, com versão e escopo de desenvolvimento registrados.
