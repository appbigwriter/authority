# Authority Engine

Gerador de opções de criação de oportunidades de autoridade para nichos pesquisados.

## Propósito
O Authority Engine pesquisa nichos e gera opções qualificadas de oportunidades de autoridade. Cada opção pode incluir uma persona de IA, uma marca editorial, um problema de audiência, um ângulo de diferenciação e caminhos possíveis de conteúdo e monetização — mas não constitui um projeto aprovado nem uma ordem de execução.

Ele não é um gerador genérico de avatares, uma fábrica de perfis ou um criador automático de projetos monetizáveis. A unidade de valor é uma **opção de oportunidade coerente, diferenciada, verificável e suficientemente desenvolvida para permitir uma decisão de qualidade**.

## Tese de negócio
Empresas contratam influencers já bem-sucedidos para alavancar seus produtos. A FBR seguirá uma lógica complementar: **desenvolver e operar um portfólio próprio de influencers de autoridade**, criados para nichos específicos, capazes de divulgar produtos próprios e produtos de afiliados relevantes.

No vocabulário interno, Sergio chama esse processo de “farmar influencers”. Na documentação formal, usamos **construir, desenvolver e operar um portfólio de influencers de autoridade**. O valor não está apenas na persona, mas na audiência, na confiança, nos formatos proprietários, nos dados de conversão e nos ativos editoriais acumulados ao longo do tempo.

## Os quatro módulos centrais

O Authority Engine é baseado em quatro módulos permanentes e obrigatórios:

- **Opportunity Radar:** encontra oportunidades em nichos, subnichos e produtos.
- **Influencer Seeds Creator:** define qual tipo de persona pode exercer autoridade naquela oportunidade.
- **Influencer Farmer:** desenvolve a persona, sua autoridade e seu universo de conteúdo.
- **Post Machine:** transforma o perfil desenvolvido em produção editorial recorrente e publicação assistida.

Esses módulos formam um ciclo, não uma linha de produção cega. O desempenho do conteúdo e da monetização retroalimenta a pesquisa de oportunidades. A arquitetura completa está documentada em `03-arquitetura/four-core-modules.md`.

## Relação com o FBR Agency Flux
O Authority Engine é a camada de pesquisa e geração de opções. Ele entrega alternativas de oportunidades com qualidade suficiente para comparação e decisão. O **FBR Agency Flux** só entra depois, quando Sergio escolhe uma opção e autoriza sua transformação em projeto. O Engine não cria projetos por impulso nem abre execução comercial; o Flux exige seleção, briefing, cards, ownership, evidências, gates e aprovação específica.

## Estado
Fundação em validação. Nenhum código ou publicação está autorizado nesta fase.

## Ordem de trabalho
1. Validar a fundação e os critérios de decisão.
2. Rodar o método manualmente em um nicho-piloto.
3. Registrar evidências e aprendizados.
4. Só então especificar e construir automações.

## Estrutura
- `01-conceitual/` — visão, princípios e limites
- `02-prd/` — requisitos, gates e critérios de aceite
- `03-arquitetura/` — arquitetura futura
- `04-database/` — schema futuro
- `05-workflows/` — processos e prompts
- `06-design/` — identidade e sistema visual
- `07-marketing/` — posicionamento e distribuição
- `08-historico/` — decisões e mudanças
- `09-codigo/` — implementação futura
