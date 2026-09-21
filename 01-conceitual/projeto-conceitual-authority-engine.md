# Projeto Conceitual — FBR Authority Engine

**Sistema de descoberta, criação e operação sistematizada de Personas de Autoridade**

| Campo | Definição |
|---|---|
| Projeto | FBR Authority Engine |
| Organização | FBR |
| Coordenação operacional | FBR Agency Flux |
| Estado | proposta conceitual em validação |
| Versão | v03 — processo sistematizado |
| Código autorizado nesta fase | não; somente planejamento |
| Publicação automática | não no MVP |
| Unidade canônica | Persona + Marca Editorial |
| Piloto | SharpEye · by Nadia Volkova |

---

## 1. Visão

O Authority Engine é o sistema estratégico da FBR para descobrir oportunidades de mercado, criar Personas de Autoridade, desenvolver Marcas Editoriais e estabelecer uma audiência orgânica e nichada ao redor delas.

O sistema transforma um processo que poderia depender de decisões dispersas, prompts isolados e execução manual em um pipeline rastreável, versionado e governado por Gates:

```text
briefing
→ pesquisa de mercado
→ oportunidade qualificada
→ seed comparável
→ seleção humana
→ Persona de Autoridade
→ Marca Editorial
→ sistema de conteúdo
→ drafts revisados
→ audiência
→ métricas
→ aprendizado
→ novas oportunidades
```

O Authority Engine é responsável pela criação estratégica e editorial da Persona. O FBR Agency Flux mantém o processo criativo e a gestão geral junto aos agentes especializados, coordenando jobs, owners, dependências, handoffs, Gates e acompanhamento.

---

## 2. Tese de negócio

A FBR pretende construir um portfólio próprio de Personas de Autoridade e Marcas Editoriais capazes de formar audiência orgânica, gerar confiança e distribuir produtos próprios e produtos afiliados relevantes.

O ativo estratégico não é apenas a imagem da Persona. É a combinação de:

- audiência orgânica;
- confiança temática;
- conteúdo útil;
- blog e ativos próprios;
- conhecimento acumulado do nicho;
- capacidade de recomendação;
- dados de engajamento;
- dados de conversão;
- formatos editoriais proprietários;
- capacidade de operar várias marcas com processo replicável.

A monetização não inicia o raciocínio. Primeiro vem a oportunidade, depois a autoridade, depois a audiência e, somente quando houver encaixe legítimo, a recomendação comercial.

---

## 3. Objetivos do sistema

1. Sistematizar a descoberta de nichos, subnichos, produtos e contextos correlatos.
2. Transformar sinais em oportunidades comparáveis e rastreáveis.
3. Criar Seeds de Influencers por LLM com estrutura, evidência e diferenciação.
4. Permitir seleção humana consciente antes de desenvolver uma Persona.
5. Desenvolver integralmente a Persona e sua Marca Editorial.
6. Criar um sistema de produção editorial confiável e constante.
7. Manter toda produção em draft até revisão humana no primeiro momento.
8. Organizar produtos próprios e afiliados sem deixar comissão dominar a recomendação.
9. Registrar métricas e aprendizados para alimentar novas oportunidades.
10. Replicar o método para outras marcas depois que o piloto for validado.

---

## 4. Não objetivos

- Não é uma fábrica de avatares em lote.
- Não é um gerador de contas para evasão de banimento.
- Não é antidetect ou fingerprint spoofing.
- Não publica automaticamente no MVP.
- Não inventa credenciais, clientes, experiências, depoimentos ou resultados.
- Não transforma seguidores em prova automática de vendas.
- Não força ClickBank ou qualquer parceiro quando não houver encaixe.
- Não inicia programação antes da aprovação dos PRDs.
- Não executa APIs externas, cria contas, gasta verba ou aplica migrations sem Gate específico.

---

## 5. Arquitetura modular

O produto possui três módulos, sendo o terceiro composto por duas fases sequenciais:

### Módulo 1 — Opportunity Radar

Objetivo canônico:

> Buscar nichos, subnichos e produtos em alta, trazendo contextos e assuntos correlatos que possam indicar bons caminhos de monetização de produtos próprios ou afiliados.

O Radar registra fontes, contexto, período, limitações, produtos, problemas, concorrência, intenção, riscos e score. “Em alta” nunca pode ser declarado sem evidência suficiente.

### Módulo 2 — Influencer Seeds Creator

Transforma uma oportunidade qualificada em alternativas comparáveis de arquétipo, função, posicionamento, voz, formatos e modelo de perfil.

A geração será feita por OpenAI API, com prompts, schema, versão e avaliação registrados. A saída nunca seleciona uma Seed sozinha.

### Módulo 3 — Profile Building

Módulo único com duas fases:

#### Fase Farmer

Desenvolve integralmente a Persona de Autoridade e a Marca Editorial:

- identidade narrativa;
- caráter;
- arquétipo;
- voz;
- identidade visual;
- Character Kit;
- posicionamento;
- público;
- promessa;
- temas;
- pilares;
- sistema editorial;
- guardrails;
- matriz de claims;
- disclosure;
- monetização;
- blog;
- critérios de revisão e produção.

#### Fase Post Machine

Recebe uma Persona aprovada para produção e:

- recebe pauta;
- valida contexto;
- produz draft;
- confere voz;
- confere fonte;
- valida claims;
- aplica disclosure;
- adapta o conteúdo;
- envia para revisão de Sergio;
- registra métricas e feedback.

No MVP, a Post Machine não publica. Ela prepara drafts para aprovação.

---

## 6. Pipeline sistematizado

### Fase 0 — Configuração da operação

- cadastrar tenant;
- cadastrar parceiros e programas;
- cadastrar marcas e Personas;
- configurar fontes;
- configurar guardrails;
- configurar papéis e owners;
- registrar modelo OpenAI e limites;
- configurar blog e domínio quando aplicável.

### Fase 1 — Intake de oportunidade

Entrada mínima:

- mercado;
- país/idioma;
- nicho ou pergunta inicial;
- público;
- objetivo de negócio;
- produtos próprios relacionados;
- parceiros desejados;
- restrições;
- prazo de pesquisa;
- owner.

Saída: Research Brief versionado.

### Fase 2 — Pesquisa do Radar

- consultar fontes autorizadas;
- registrar resultados brutos;
- normalizar produtos;
- identificar tendências e assuntos correlatos;
- separar fato, hipótese, risco e bloqueio;
- registrar data, fonte, período e limitação.

Saída: Research Dataset + Evidence Ledger.

### Fase 3 — Qualificação da oportunidade

- avaliar demanda;
- avaliar intenção;
- avaliar espaço editorial;
- avaliar produto próprio;
- avaliar afiliados;
- avaliar autoridade possível;
- avaliar risco de plataforma e claims;
- gerar score explicável;
- produzir Opportunity Dossier.

Saída: `candidate`, `qualified`, `blocked` ou `archived`.

### Fase 4 — Criação de Seeds

- enviar Opportunity Dossier ao LLM;
- gerar arquétipos e funções;
- criar alternativas de Persona;
- comparar com portfólio existente;
- verificar clonagem;
- pontuar adequação;
- gerar argumentos contra;
- manter decisão pendente.

Saída: Seed Comparison Pack.

### Fase 5 — Seleção humana

Sergio seleciona uma Seed ou rejeita todas.

A decisão registra:

- ator;
- data;
- Seed e versão;
- escopo;
- justificativa;
- riscos aceitos;
- próximo Gate;
- owner.

### Fase 6 — Profile Building / Farmer

- gerar Persona;
- criar Character Kit;
- criar Marca Editorial;
- definir blog;
- definir promessa;
- definir temas e pilares;
- criar matriz de claims;
- criar disclosure;
- criar identidade visual;
- criar prompts consistentes;
- definir produtos e limites;
- criar plano editorial;
- montar Approval Pack.

Saída: Persona + Marca Editorial pronta para revisão.

### Fase 7 — Aprovação da Persona

Sergio aprova, solicita revisão ou rejeita.

Sem aprovação, a Persona não entra na Post Machine.

### Fase 8 — Profile Building / Post Machine

- selecionar pauta;
- criar briefing de conteúdo;
- gerar draft via OpenAI;
- validar voz;
- validar fontes;
- validar claims;
- validar produto;
- aplicar disclosure;
- adaptar formato;
- submeter para revisão.

Saída: Draft pronto para aprovação.

### Fase 9 — Revisão humana

No primeiro momento, Sergio revisa todos os drafts.

A revisão pode resultar em:

- aprovado;
- revisão solicitada;
- bloqueado;
- rejeitado;
- arquivado.

### Fase 10 — Publicação futura

Fora do MVP. Somente será habilitada após critérios de estabilidade, compliance, qualidade, adapter oficial e Gate explícito.

### Fase 11 — Métricas e aprendizado

Registrar:

- seguidores;
- visualizações;
- audiência recorrente;
- engajamento;
- salvamentos;
- compartilhamentos;
- tráfego para o blog;
- cliques em produtos;
- leads quando habilitados;
- conversões;
- receita;
- qualidade editorial;
- esforço de produção.

O primeiro indicador será seguidores, mas nenhum resultado comercial deve ser inferido somente por essa métrica.

---

## 7. Piloto SharpEye

### Marca

- Assinatura: `SharpEye · by Nadia Volkova`.
- Domínio previsto: `sharpeye.fbr.news`.
- Tagline: `The eye that makes small brands look big.`
- Tese: `O espaço é a primeira coisa que uma marca diz em voz alta.`
- Arquétipo editorial: Consultora-visionária.
- Modo de atuação: Pragmatic Creator.

### Público

- empresas;
- empresários;
- expositores;
- lojistas;
- organizadores de eventos;
- pequenas e médias marcas;
- equipes de marketing.

### Categoria inicial

`Store Signs & Displays`.

### Produtos

- rollups;
- banners;
- backdrops;
- sinalização;
- displays;
- stands;
- backlights;
- acessórios e materiais correlatos.

### Monetização

- principal: produtos próprios FBRSigns;
- secundária: Amazon Associates e parceiros relevantes;
- ClickBank: não forçar, pois não há encaixe natural confirmado.

### Formato central

`The Teardown`: diagnóstico editorial de booths, vitrines e espaços, sempre para ajudar e nunca humilhar.

### Guardrail de credencial

Nadia pode ter “olho de arquiteta”, mas não deve ser apresentada como arquiteta licenciada prestando serviço, nem inventar projetos, clientes ou instalações reais.

---

## 8. Gates

- **G0 — Escopo:** nicho, público, problema e finalidade definidos.
- **G1 — Oportunidade:** evidência de demanda/intenção e caminho de monetização.
- **G2 — Diferenciação:** Seed não é clone do portfólio.
- **G3 — Autoridade:** Persona pode falar honestamente sobre o tema.
- **G4 — Viabilidade editorial:** conteúdo sustentável.
- **G5 — Monetização:** produto pertinente e recomendação íntegra.
- **G6 — Identidade:** Persona, IA, visual e disclosure coerentes.
- **G7 — Seleção:** Sergio seleciona Seed/Persona.
- **G8 — Produção:** Persona aprovada para Post Machine.
- **G9 — Draft:** conteúdo aprovado por Sergio.
- **G10 — Publicação futura:** canal e adapter aprovados; fora do MVP.

---

## 9. Princípios de governança

- Fato, hipótese, recomendação, risco, bloqueio e decisão são estados distintos.
- Nenhuma integração real é declarada por causa de fake, fixture ou adapter configurável.
- LLM gera opções; não toma decisões estratégicas sozinho.
- O Flux coordena; o Authority Engine é dono da Persona e da estratégia de autoridade.
- Estado operacional é relacional e multi-tenant.
- Todos os artefatos têm versão, autor, data e origem.
- Todo evento possui identidade, correlação e idempotência.
- Nenhum segredo aparece em código, logs ou frontend.
- Saúde e suplementos ficam bloqueados até política de claims aprovada.
- E-mail fica para versão posterior; blog entra no MVP.

---

## 10. Critério para iniciar execução

A programação só começa após:

- aprovação deste Projeto Conceitual;
- reconciliação do MP-000;
- aprovação do PRD do Opportunity Radar;
- aprovação do PRD do Influencer Seeds Creator;
- aprovação do PRD do Profile Building;
- fechamento do briefing Sharpeye/Nadia;
- definição dos critérios do piloto;
- definição das fontes e limites do Radar;
- confirmação do orçamento OpenAI;
- aprovação explícita de Sergio para sair do planejamento.
