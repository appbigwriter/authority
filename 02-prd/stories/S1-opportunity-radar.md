# SPRINT 1 — Opportunity Radar

## Objetivo do sprint
Criar a capacidade de pesquisar nichos, subnichos, tendências e produtos em Amazon e outros marketplaces autorizados e transformar sinais brutos em opções qualificadas de oportunidade.

## Resultado esperado
Um dossiê comparável de oportunidades, com fontes, datas, dados normalizados, score, riscos, limitações e recomendação. O sprint não escolhe uma oportunidade para execução.

## Dependências
- MP-000 aprovado;
- contratos das APIs autorizadas;
- credenciais em ambiente seguro;
- política de uso dos dados;
- schema de oportunidade definido.

## Stories

### OPR-001 — Registrar fontes e credenciais de APIs
**Como** responsável pelo Radar, **quero** cadastrar marketplaces, endpoints, escopos, limites e referências de credenciais **para** pesquisar sem inventar integrações ou expor secrets.

**Entregáveis:** catálogo de fontes, adaptador por fonte, configuração server-side, health check e registro de limitações.

**Aceite:**
- [ ] Cada fonte possui nome, versão/endpoint confirmado, escopo, data e limitação.
- [ ] Secrets não aparecem em código, logs, cards ou respostas.
- [ ] Ausência ou expiração de credencial bloqueia a fonte com erro explícito.
- [ ] Um fake adapter permite testar sem API real.

### OPR-002 — Normalizar dados de marketplaces
**Como** Radar, **quero** converter respostas diferentes em um modelo comum **para** comparar categorias e produtos.

**Entregáveis:** contrato normalizado para nicho, produto, preço, disponibilidade, categoria, marketplace, fonte e timestamp.

**Aceite:**
- [ ] Dados de duas fontes diferentes podem ser representados pelo mesmo contrato.
- [ ] Campos ausentes são marcados como ausentes, nunca inventados.
- [ ] Preço, moeda, disponibilidade e timestamp preservam a origem.
- [ ] Duplicatas são identificadas sem apagar registros de fontes diferentes.

### OPR-003 — Detectar tendências e oportunidades
**Como** analista, **quero** detectar mudanças e sinais recorrentes em nichos e produtos **para** gerar candidatos de oportunidade.

**Entregáveis:** rotina/fluxo de detecção, evidências, período de observação e explicação do sinal.

**Aceite:**
- [ ] Toda tendência tem fonte, data, período e descrição factual.
- [ ] O sistema diferencia tendência observada de hipótese interpretativa.
- [ ] Dados insuficientes geram `insufficient_evidence`, não tendência afirmada.
- [ ] O resultado inclui nicho, subnicho, problema e produtos relacionados.

### OPR-004 — Pontuar oportunidade com risco ajustado
**Como** Sergio, **quero** comparar oportunidades por uma régua explícita **para** não priorizar apenas volume ou comissão.

**Entregáveis:** modelo de score versionado com demanda, intenção, espaço, conteúdo, produto, risco e confiança.

**Aceite:**
- [ ] Cada fator possui definição, escala e justificativa.
- [ ] Risco de claim/plataforma reduz o score ou bloqueia a oportunidade.
- [ ] Comissão não pode compensar sozinha risco alto ou ausência de autoridade.
- [ ] O score mostra os fatores que o produziram e sua versão.

### OPR-005 — Gerar dossiê comparável de oportunidade
**Como** decisor, **quero** receber opções padronizadas **para** comparar e selecionar conscientemente.

**Entregáveis:** dossiê no template de opção de oportunidade, fontes, score, hipóteses, riscos e decisão pendente.

**Aceite:**
- [ ] O dossiê identifica fatos, hipóteses, recomendações, riscos e bloqueios.
- [ ] Apresenta alternativas gratuitas ou não comerciais quando aplicável.
- [ ] Não abre projeto nem altera estado externo.
- [ ] É suficiente para o S2 gerar seeds sem reconstruir a pesquisa.

## Gate de saída S1
S1 só pode avançar quando existir pelo menos uma oportunidade qualificada, com evidências verificáveis, score explicado e handoff completo para o Influencer Seeds Creator.
