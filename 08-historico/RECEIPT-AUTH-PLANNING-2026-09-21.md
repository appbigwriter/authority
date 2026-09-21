# Receipt — Reorganização conceitual do Authority Engine

**Data:** 2026-09-21
**Task:** AUTH-PLANNING-20260921-002
**Owner:** David
**Estado:** planejamento entregue; aguardando revisão e decisões de Sergio

## Decisão estrutural registrada

O Authority Engine terá três módulos de produto:

1. Opportunity Radar
2. Influencer Seeds Creator
3. Profile Building

O Profile Building é um único módulo com duas fases sequenciais e distintas:

- Fase Farmer: desenvolve a seed selecionada em perfil de autoridade completo.
- Fase Post Machine: recebe o perfil aprovado para produção e prepara, adapta, revisa e publica conteúdo de forma assistida.

Farmer e Post Machine não são módulos independentes nem subdomínios paralelos.

## Auditoria factual do estado atual

### Opportunity Radar

**Implementado localmente:**

- contrato normalizado para produtos, fontes, tendências e evidências;
- fake adapter determinístico;
- adapter configurável para Amazon e marketplace secundário;
- bloqueio por ausência de credencial, endpoint, contrato ou live gate;
- normalização e deduplicação por fonte;
- detecção de evidência insuficiente;
- score de oportunidade com risco e versão;
- dossiê comparável;
- testes locais OPR-001 a OPR-005.

**Não comprovado/não implementado como integração real:**

- API Amazon autorizada em ambiente real;
- contrato vivo confirmado com provider;
- credencial segura disponível e validada;
- readback de produtos/tendências de marketplace real;
- operação contínua de coleta e histórico temporal.

**Classificação:** núcleo de domínio local implementado; integração real pendente.

### Influencer Seeds Creator

**Implementado localmente:**

- taxonomia versionada de arquétipos;
- funções editoriais e limites;
- geração de múltiplas seeds;
- diferenciação contra referências;
- score composto com racional;
- bloqueio por risco crítico ou saída incompleta;
- pacote comparativo sem seleção automática;
- seleção humana representada no domínio;
- testes locais de S2.

**Gaps identificados:**

- existem duas implementações conceituais próximas (`src/influencer-seeds.ts` e `src/services/influencer-seeds.ts`) que deverão ser reconciliadas no PRD;
- não há ainda decisão final sobre regra determinística versus LLM versionado;
- catálogo de referências e método de diferenciação ainda são heurísticos locais;
- persistência/contrato final depende da fundação aprovada.

**Classificação:** domínio local avançado/protótipo funcional; contrato final pendente.

### Profile Building — Fase Farmer

**Existente:**

- lógica local de desenvolvimento de perfil, Character Bible, plano editorial, claims, disclosure e handoff;
- testes locais de S3 cobrem perfil, conteúdo, guardrails e handoff.

**Ainda não fechado:**

- PRD unificado do Profile Building;
- fronteira formal entre saída do Farmer e entrada do Post Machine;
- unidade canônica Persona + Marca + Perfil/Canais;
- geração visual real e armazenamento de assets;
- primeiro piloto e critérios de aprovação.

**Classificação:** base local existente; fase ainda não especificada/validada como parte do módulo unificado.

### Profile Building — Fase Post Machine

**Existente:**

- criação de briefing, draft, revisão, aprovação humana, adaptação de formatos, disclosure, receipt fake e métricas locais;
- testes locais de S4.

**Ainda não fechado:**

- PRD como segunda fase do Profile Building;
- adapters reais de canais;
- scheduler/worker real;
- fila durável, idempotência externa e readback;
- regras finais por plataforma e monetização;
- integração de métricas com o Radar.

**Classificação:** núcleo local/fake implementado; operação real e contrato final pendentes.

## Arquivo principal atualizado

`F:\Projetos\_FBR\AuthorityEngine\01-conceitual\projeto-conceitual-authority-engine.md`

O documento agora contém a estrutura de três módulos, as duas fases sequenciais do Profile Building, contratos, estados, Gates, perguntas abertas e features recomendadas.

## Regra de execução

Nenhuma programação nova deve começar até que:

1. este conceito seja revisado;
2. o MP-000 seja reconciliado;
3. os PRDs de Radar, Seeds Creator e Profile Building sejam fechados;
4. as decisões abertas sejam registradas;
5. Sergio aprove explicitamente a passagem para execução.

## Decisões adicionais de Sergio — 2026-09-21

- Confirmado o objetivo canônico do Opportunity Radar: buscar nichos, subnichos e produtos em alta, além de contextos correlatos que indiquem caminhos de monetização próprios ou afiliados.
- Confirmado o nome `Profile Building`.
- Authority Engine é responsável por criar Personas de Autoridade e desenvolver audiência orgânica nichada.
- Agency Flux mantém o processo criativo e a gestão geral com os agentes especializados.
- Deve existir cadastro de múltiplos parceiros; Amazon será a primeira integração prevista.
- Parceiros previstos: Amazon Seller/Associates, TikTok Shop, ClickBank, BuyGoods, MaxWeb, Digistore24, SellHealth, MarketHealth, NutriProfits e MoreNiche.
- Seeds serão geradas sempre por LLM.
- Farmer desenvolverá integralmente a Persona.
- Post Machine produzirá somente drafts inicialmente.
- Sergio revisará todos os drafts antes de qualquer publicação.
- Monetização inicial será 100% por venda comissionada de produtos próprios e afiliados.
- Blog entra no escopo inicial; e-mail fica para versão posterior.
- Piloto e nicho continuam TBD.

O Projeto Conceitual foi atualizado com essas decisões. O MP-000 e os PRDs permanecem aguardando reconciliação e aprovação; não há autorização de implementação.

## Decisões adicionais — Sharpeye e piloto

- Piloto inicial: Sharpeye, para empresas e empresários que necessitam de rollups, banners, backdrops e materiais correlatos.
- Base de oportunidade: categoria `Store Signs & Displays` da Amazon.
- SharpEye/Nadia confirmado como hipótese de Persona/Marca Editorial do piloto.
- Primeiro indicador: seguidores; o documento registra a limitação de que seguidores não provam vendas isoladamente.
- Amazon Seller/Associates permanece TBD por cadastro ainda indisponível.
- Multi-tenant confirmado desde a fundação.
- LLM confirmado: OpenAI API.
- Unidade: `Persona + Marca Editorial`, com blog pessoal e assuntos transversais ao nicho.
- Post Machine produzirá drafts; Sergio revisará todos antes de qualquer publicação.
- Métricas complementares: visualizações do blog/posts/YouTube, engajamento, tráfego, leads e conversão quando disponíveis.
- Meta operacional inicial: fluxo de produção confiável e constante.
- Critérios específicos para suplementos e saúde permanecem TBD, sujeitos a compliance.

## Aprendizado

Farmer e Post Machine devem permanecer como fases do mesmo módulo, porque operam sobre a mesma Persona versionada e a saída do Farmer é a pré-condição da Post Machine. Separá-las como módulos independentes criaria contratos e fontes canônicas duplicados.