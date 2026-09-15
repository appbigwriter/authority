# Authority Engine — Sprints e Stories

## Status
`BACKLOG_PRD` | pendente de validação do MP-000

Este documento desmembra o Authority Engine em quatro sprints estruturais, correspondentes aos quatro módulos centrais. As stories são especificações de trabalho, não autorização para desenvolvimento.

## Regra de execução
Nenhuma story deve ser iniciada enquanto:

1. o MP-000 não estiver aprovado;
2. o sprint não tiver sido priorizado;
3. a story não tiver sido aceita como unidade executável;
4. o responsável e os critérios de aceite estiverem definidos;
5. dependências e contratos estiverem disponíveis.

## Ordem dos sprints

```text
S1 — Opportunity Radar
        ↓
S2 — Influencer Seeds Creator
        ↓
S3 — Influencer Farmer
        ↓
S4 — Post Machine
        ↓
feedback e métricas → S1
```

A execução pode usar mocks para permitir testes isolados, mas não pode mascarar integração inexistente como concluída.

## Quadro mestre

| Sprint | Módulo | Objetivo | Depende de | Status |
|---|---|---|---|---|
| S1 | Opportunity Radar | detectar e qualificar oportunidades | MP-000 aprovado | pendente |
| S2 | Influencer Seeds Creator | gerar opções de personas comparáveis | S1 | pendente |
| S3 | Influencer Farmer | desenvolver a opção escolhida em perfil de autoridade | S2 | pendente |
| S4 | Post Machine | produzir conteúdo e publicação assistida | S3 | pendente |

## Critério de conclusão de um sprint

Um sprint só pode ser concluído quando todas as stories tiverem critérios de aceite atendidos, evidências registradas, handoff produzido e nenhum blocker crítico aberto.

## Stories por sprint

### S1 — Opportunity Radar
- `OPR-001` — Registrar fontes e credenciais de APIs
- `OPR-002` — Normalizar dados de marketplaces
- `OPR-003` — Detectar tendências e oportunidades
- `OPR-004` — Pontuar oportunidade com risco ajustado
- `OPR-005` — Gerar dossiê comparável de oportunidade

### S2 — Influencer Seeds Creator
- `ISC-001` — Definir taxonomia de arquétipos e funções
- `ISC-002` — Gerar seeds a partir de oportunidade
- `ISC-003` — Verificar diferenciação e risco de clonagem
- `ISC-004` — Pontuar adequação da seed
- `ISC-005` — Gerar pacote comparativo para decisão

### S3 — Influencer Farmer
- `IFR-001` — Criar perfil-base da persona
- `IFR-002` — Desenvolver Character Bible e identidade visual
- `IFR-003` — Definir sistema de autoridade e conteúdo
- `IFR-004` — Criar guardrails, claims e disclosures
- `IFR-005` — Gerar briefing mestre e handoff para o Flux

### S4 — Post Machine
- `PMA-001` — Receber pauta e briefing aprovado
- `PMA-002` — Produzir conteúdo na voz da persona
- `PMA-003` — Adaptar conteúdo para canais e assets
- `PMA-004` — Controlar revisão, aprovação e publicação assistida
- `PMA-005` — Registrar métricas e retroalimentar o Radar

## Handoffs

- S1 entrega oportunidades qualificadas ao S2.
- S2 entrega seeds selecionadas ao S3.
- S3 entrega perfil aprovado e plano editorial ao S4.
- S4 entrega métricas, feedback e sinais de mercado ao S1.

## Gates globais

- `G0`: escopo e fonte de verdade confirmados.
- `G1`: oportunidade possui evidência.
- `G2`: seed é distinta e adequada.
- `G3`: persona possui autoridade e guardrails.
- `G4`: conteúdo é útil, rastreável e conforme.
- `G5`: publicação ou ação comercial tem aprovação específica.
