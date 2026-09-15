# Authority Engine — Quatro módulos centrais

Os quatro módulos abaixo são obrigatórios, constantes e formam a base do Authority Engine. Nenhum módulo é opcional no desenho do sistema; a implementação pode ser faseada, mas a arquitetura deve nascer com os quatro contratos definidos.

```text
Opportunity Radar
        ↓
Influencer Seeds Creator
        ↓
Influencer Farmer
        ↓
Post Machine
        ↓
feedback de audiência e mercado
        └──────────────→ Opportunity Radar
```

O fluxo é um ciclo de aprendizado. A operação de posts gera sinais de audiência, conversão e interesse que alimentam novas pesquisas de tendências, nichos, subnichos e produtos.

## 1. Opportunity Radar

### Função
Pesquisar continuamente tendências, nichos, subnichos e produtos em Amazon e outros marketplaces, identificando oportunidades potenciais para criação de personas de autoridade.

### Entradas
- categorias e sementes de pesquisa;
- APIs autorizadas da Amazon;
- APIs autorizadas de outros marketplaces;
- tendências e sinais de demanda;
- dados de produtos, categorias, preço, disponibilidade e intenção;
- histórico de oportunidades e resultados anteriores.

### Saídas
- oportunidade identificada;
- nicho, subnicho e categoria;
- problema ou desejo associado;
- sinais de demanda;
- produtos relacionados;
- concorrência e saturação;
- risco de claims e conformidade;
- nota de atratividade risco-ajustada;
- recomendação: investigar / comparar / descartar.

### Não pode fazer
- escolher automaticamente uma oportunidade para execução;
- tratar comissão alta como prova de oportunidade;
- copiar dados proibidos ou desatualizados de marketplace;
- inventar tendência sem fonte e data;
- abrir projeto sem seleção humana.

## 2. Influencer Seeds Creator

### Função
A partir de uma oportunidade qualificada, identificar o arquétipo, a função editorial e o modelo de perfil ideal para a persona de autoridade.

### Deve definir
- arquétipo;
- papel da persona perante a audiência;
- problema que ela ajuda a resolver;
- nível e tipo de autoridade;
- público primário;
- contexto de uso e canais;
- formato de relacionamento;
- diferenciação em relação às personas existentes;
- nome provisório e conceito;
- aparência e presença desejadas;
- limites de representação;
- modelo de perfil ideal;
- critérios para rejeitar a semente.

### Saída
Uma ou mais **Influencer Seeds** comparáveis, cada uma com racional, evidências, riscos, potencial editorial e hipótese de monetização — sem ainda constituir uma persona aprovada ou um projeto.

## 3. Influencer Farmer

### Função
Desenvolver uma Influencer Seed selecionada em um perfil de autoridade completo e operável.

### Deve gerar
- identidade e posicionamento;
- nome e biografia;
- Character Bible;
- voz e estilo de comunicação;
- vocabulário e limites;
- aparência fotorrealista consistente;
- disclosure visível de IA;
- pilares de autoridade;
- formatos recorrentes;
- séries e quadros;
- exemplos de posts, artigos, vídeos e e-mails;
- mapa de audiência e jornada;
- produtos próprios e afiliados potencialmente relevantes;
- matriz de claims e evidências;
- plano inicial de desenvolvimento;
- briefing mestre da opção de oportunidade.

### Regra
“Farmer” significa desenvolver o ativo ao longo do tempo: identidade, autoridade, conteúdo, audiência, confiança e sinais de conversão. Não significa gerar perfis descartáveis em lote.

## 4. Post Machine

### Função
Transformar a definição da persona e o plano editorial em produção organizada de posts para os canais aprovados.

### Deve fazer
- receber pautas e briefings aprovados;
- criar variações na voz correta;
- gerar roteiros, legendas, títulos e CTAs;
- associar fontes, disclosures e produtos relevantes;
- adaptar conteúdo por canal;
- organizar calendário e fila;
- versionar assets;
- encaminhar para revisão;
- registrar aprovação, publicação e métricas;
- aprender com saves, shares, CTR, leads e conversões.

### Limite obrigatório
O Post Machine pode automatizar preparação, adaptação, organização, agendamento assistido e análise. Não deve fazer publicação em massa multi-conta sem gate humano. Toda publicação pública, comunicação externa, gasto ou ação irreversível exige aprovação específica conforme o FBR Agency Flux.

## Contratos entre módulos

| Origem | Destino | Contrato mínimo |
|---|---|---|
| Opportunity Radar | Influencer Seeds Creator | oportunidade com fontes, data, sinais, riscos e nota |
| Influencer Seeds Creator | Influencer Farmer | seed selecionada com arquétipo, função, público e diferenciação |
| Influencer Farmer | Post Machine | perfil aprovado, Character Bible, guardrails, pilares e plano |
| Post Machine | Opportunity Radar | métricas, feedback, conversões e novas perguntas de pesquisa |

## Estados mínimos

```text
radar_candidate
→ opportunity_qualified
→ seed_proposed
→ seed_selected
→ profile_in_development
→ profile_review
→ profile_approved
→ content_planned
→ content_in_production
→ awaiting_human_approval
→ scheduled_or_published
→ metrics_recorded
```

Transições inválidas devem falhar fechado. Uma saída de módulo sem evidência, versão, responsável ou status não pode alimentar o módulo seguinte.

## Critério de base do sistema

A arquitetura do Authority Engine só está corretamente definida quando os quatro módulos possuem:

- objetivo claro;
- entradas e saídas;
- responsabilidade delimitada;
- contrato de handoff;
- estados;
- evidências exigidas;
- critérios de bloqueio;
- owner;
- integração com o FBR Agency Flux;
- gate humano onde houver impacto público ou comercial.
