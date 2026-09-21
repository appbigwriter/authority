# Receipt — Estrutura tela por tela e fluxo de informação do PRD

**Task:** AUTH-UX-PRD-20260921-004
**Owner:** David
**Estado:** planejamento entregue; aguardando revisão de Sergio

## Entrega

Adicionada ao PRD `PRD-AUTHORITY-ENGINE-IMPLEMENTACAO.md` a seção **11 — Estrutura do Projeto — Tela por Tela**, com:

- shell autenticado;
- login;
- seleção de tenant;
- onboarding;
- Dashboard/Control Room;
- Pipeline visual;
- Partner Registry;
- fontes de pesquisa;
- Research Briefs;
- Research Run;
- Evidence Ledger;
- oportunidades;
- Opportunity Dossier;
- Seeds Creator;
- Comparison Pack;
- decisão humana de Seed;
- Personas;
- Workspace Farmer;
- Marca Editorial e Blog;
- Approval Pack;
- Calendário Editorial;
- briefing de conteúdo;
- editor de Draft;
- fila de revisão humana;
- Métricas/Feedback;
- Jobs/Atividade;
- Auditoria/Histórico;
- Configurações;
- About/PRD/Ajuda;
- botão global Adicionar;
- estados visuais obrigatórios.

## Fluxos demonstrados

A seção documenta os fluxos:

```text
Login → Tenant → Dashboard → Research Brief → Research Run
→ Evidence Ledger → Opportunity Dossier → Seeds
→ Decisão humana → Farmer → Approval Pack
→ Calendário → Briefing → Draft → Validação
→ Revisão humana → Métricas → Feedback → Radar
```

Também documenta o fluxo de dados por responsabilidade, permissões, estados, Gates, origem/destino dos dados e regra de que o menu principal de produto será lateral direito, sujeito ao Design Gate. O protótipo local atual usa menu esquerdo e foi classificado como referência histórica/protótipo, não como contrato final.

## Verificação

- `git diff --check` — PASS; somente warnings de normalização LF/CRLF do Git.
- Nenhum código, migration, integração, publicação ou deploy executado.
- PRD permanece `draft` e bloqueado para execução até aprovação de Sergio.
- Menu principal preserva o design system atual e permanece na lateral esquerda, conforme o dashboard local.
- A seção amplia a navegação e as telas sem alterar a identidade visual, posição do menu ou linguagem de componentes.
