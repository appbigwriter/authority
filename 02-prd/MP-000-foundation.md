# MP-000 — Fundação do Projeto: Authority Engine

## Status
`FUNDACAO` | em_revisao_estrutural

## Tese de negócio
Empresas normalmente contratam influencers de sucesso para promover produtos. A FBR pretende construir um portfólio próprio de influencers de autoridade para criar distribuição proprietária dos produtos FBR e de afiliados relevantes.

O Authority Engine não executa essa operação. Sua função é aumentar a qualidade da seleção: encontrar nichos, gerar opções de influencers de autoridade e fornecer informação suficiente para decidir quais merecem investimento de desenvolvimento. O FBR Agency Flux é a camada que, após aprovação, coordena a construção, operação e monetização de cada marca.

## Modelo de criação de valor
- **Entrada:** nichos, problemas, sinais de demanda e categorias de produtos.
- **Saída do Authority Engine:** opções qualificadas de influencers/marcas de autoridade.
- **Decisão:** comparação, priorização e seleção humana.
- **Execução no Flux:** desenvolvimento da marca, audiência, conteúdo, distribuição e ofertas.
- **Retorno:** audiência própria, vendas de produtos próprios, comissões de afiliados, leads, dados e ativos editoriais.

O ativo estratégico não é somente o rosto gerado. É a combinação de confiança temática, audiência recorrente, conteúdo, lista, distribuição e capacidade de recomendação.

## Decisões de Arquitetura
- Stack futuro: Next.js/TypeScript/Tailwind, Postgres/Supabase, conforme padrão FBR.
- Fase atual: estruturar o pipeline de geração e aprovação da Persona antes do provisionamento.
- Padrão futuro: monólito modular orientado a Personas, projetos editoriais e versões, com trilha de auditoria.
- Unidades principais: nicho, oportunidade, persona, Character Bible, Physical Identity Bible, evidência, claim, pacote editorial, blog derivado, aprovação e Gate.
- Pipeline formador: Brief Interpreter, Niche & Audience Analyst, Authority Strategist, Persona Architect, Physical Identity Designer, Visual Consistency Designer, Editorial Strategist, Channel Planner, Consistency Reviewer e Approval Packager.
- Geração: usar o modelo/provider principal configurado no Hermes; registrar provider, modelo, versão, prompt version e generation job.
- Integrações: Agency Flux por API/eventos assinados; pesquisa web, catálogo Amazon/produtos, geração de imagem, armazenamento de assets e canais editoriais por adaptadores internos.
- Fonte canônica: Authority Engine mantém Persona e versões; módulos consumidores não leem tabelas internas diretamente.
- Publicação: sempre manual ou assistida, com aprovação integral de Sergio na primeira fase.
- Domínio: derivado inicialmente de `<slug>.fbr.news`, versionável e editável; DNS confirmado manual e automaticamente.
- Suposições a validar: primeiro usuário é a operação interna da FBR; SharpEye/Nadia será o primeiro caso de teste; uma Persona pode sustentar vários blogs.

## Modelo de decisão
Uma persona só avança quando a oportunidade do nicho é demonstrada, a diferenciação é clara, a autoridade é plausível, os riscos são aceitáveis e existe um plano de conteúdo sustentável. Beleza visual, potencial de viralização ou comissão alta isoladamente não aprovam uma persona.

## Relação com o FBR Agency Flux
O Authority Engine é o upstream estratégico do FBR Agency Flux:

- **Authority Engine:** recebe dados-base, executa o pipeline modular, gera Persona completa, Character Bible, Physical Identity Bible, planos editoriais e pacote de aprovação.
- **Sergio:** revisa e aprova Persona, nome do blog e publicação na Central de Aprovações do Agency Flux.
- **FBR Agency Flux:** recebe eventos assinados após aprovação, coordena jobs, provisionamento, blockers, readbacks e publicação.
- **FBR Blogs:** consome a Persona aprovada por API/evento e cria os projetos editoriais derivados.

Uma opção ou Persona em `draft`, `generation_blocked`, `rejected` ou `blocked` não pode abrir execução comercial. O handoff para o Flux ocorre somente após a aprovação registrada e deve conter: nicho, oportunidade, Persona versionada, Character Bible, Physical Identity Bible, público, problema, diferenciação, guardrails, claims, fontes, canais planejados, riscos, critérios de validação e decisão aprovada.

A comunicação entre módulos ocorre por APIs oficiais e eventos assinados. Nenhum módulo acessa diretamente as tabelas internas de outro módulo.

### Critério de passagem para aprofundamento de oportunidade
A passagem não é aprovação de projeto. Ela só pode ser proposta quando existir uma opção `qualified` e um pacote que responda objetivamente:

1. Quem é a audiência e qual problema recorrente ela quer resolver?
2. Por que essa persona é uma autoridade adequada para esse problema?
3. Qual ativo será construído — blog, rede social, lista, produto, afiliado ou combinação?
4. Como o projeto gera valor antes de pedir compra?
5. Qual é a fonte de receita e quais claims são permitidos?
6. Quais recursos, custos, agentes e dependências são necessários?
7. Quais métricas determinam continuar, ajustar ou encerrar?
8. Qual gate humano ainda precisa ser aprovado?

Se qualquer resposta for hipótese sem evidência ou decisão, o pacote permanece em `review` e não vira execução.

## Pipeline obrigatório

A base constante do sistema é formada por quatro módulos:

1. **Opportunity Radar:** busca tendências em nichos, subnichos e produtos por meio das APIs autorizadas da Amazon e de outros marketplaces.
2. **Influencer Seeds Creator:** identifica o arquétipo, a função e o modelo de perfil ideal para cada oportunidade.
3. **Influencer Farmer:** desenvolve a seed selecionada em um perfil de autoridade completo, com conteúdo, identidade, guardrails e caminhos de monetização.
4. **Post Machine:** automatiza a preparação, adaptação, organização e publicação assistida dos posts, sempre respeitando os gates humanos.

Fluxo:

```text
Opportunity Radar
→ Influencer Seeds Creator
→ Influencer Farmer
→ Post Machine
→ métricas e feedback
→ Opportunity Radar
```

A implementação pode ser faseada, mas os quatro contratos devem existir na arquitetura desde o início. O ciclo de feedback é obrigatório: dados de audiência, conteúdo e conversão devem alimentar novas pesquisas e decisões.

## Gates anti-impulso

### G0 — Escopo
**Pergunta:** estamos gerando uma persona de autoridade para um nicho pesquisado, ou apenas uma imagem/personagem?
- Avança somente se houver nicho, público, problema e finalidade editorial definidos.
- Se não houver, retorna para briefing.

### G1 — Oportunidade
**Pergunta:** há demanda e espaço real para essa autoridade?
- Exige fontes, sinais de intenção, concorrentes/referências e nota de oportunidade.
- “Parece um nicho bom” não é evidência suficiente.

### G2 — Diferenciação
**Pergunta:** por que essa persona deveria existir?
- Exige ângulo próprio, público específico, formato recorrente e distinção das marcas existentes.
- Persona genérica ou clone é bloqueada.

### G3 — Autoridade e ética
**Pergunta:** a persona pode falar legitimamente sobre o tema?
- Define o que ela sabe, o que apenas cura/analisa e o que não pode afirmar.
- Proíbe testemunho corporal inventado, credenciais falsas, cura, garantia e resultado fabricado.

### G4 — Viabilidade editorial
**Pergunta:** é possível produzir conteúdo útil por pelo menos 90 dias?
- Exige pelo menos 3 pilares, 2 formatos recorrentes, 10 pautas iniciais e fontes/produtos relevantes.

### G5 — Monetização sustentável
**Pergunta:** existe monetização relevante sem distorcer a recomendação?
- Produto deve ser pertinente e, preferencialmente, de função demonstrável.
- Comissão não pode ser o motivo para aprovar uma recomendação.

### G6 — Identidade e transparência
**Pergunta:** a persona é visualmente consistente e claramente identificada como IA?
- Exige Character Bible, política visual, disclosure e regras de uso de imagem.

### G7 — Aprovação do piloto
**Pergunta:** Sergio aprova transformar a proposta em piloto?
- Sem “SIM” explícito e datado, a saída permanece `draft`.
- Aprovação não autoriza automaticamente publicação, gasto ou criação de novas personas.

## Critérios de aceite da fundação
- [ ] O escopo diferencia gerador de personas de gerador de avatares.
- [ ] O pipeline possui gates G0–G7 e estados `draft`, `blocked`, `approved` e `pilot`.
- [ ] Toda recomendação relevante possui fonte, data e limitação.
- [ ] Toda persona possui diferenciação verificável e limites de autoridade.
- [ ] Claims de saúde/beleza têm matriz de evidência e disclosure aplicável.
- [ ] Nenhuma ação externa irreversível ocorre sem aprovação específica de Sergio.
- [ ] O primeiro piloto e seus critérios de sucesso estão definidos antes de construir software.
- [ ] O MP-000 foi revisado e aprovado explicitamente por Sergio.

## Riscos e Perguntas em Aberto
- Definir o nicho exato do piloto SharpEye/Nadia.
- Definir a escala de pontuação da oportunidade.
- Definir provedores de pesquisa, imagem e armazenamento somente após validar o fluxo manual.
- Definir métricas mínimas do piloto: qualidade, utilidade, produção, CTR, e-mail e sinais de confiança.
- Confirmar se a unidade de gestão será “persona”, “marca” ou ambas — recomendação: persona vinculada a uma marca editorial.
