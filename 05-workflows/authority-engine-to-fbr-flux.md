# Authority Engine → FBR Agency Flux

## Regra de negócio
A FBR não quer apenas contratar influencers de terceiros para cada produto. Ela quer construir e operar um portfólio próprio de influencers de autoridade, desenvolvidos para nichos específicos, que possam divulgar produtos próprios e produtos de afiliados adequados à audiência.

O Authority Engine seleciona e qualifica as oportunidades. O FBR Agency Flux desenvolve e opera as oportunidades escolhidas. Nenhuma marca deve ser criada somente para empurrar um produto: a autoridade e a utilidade editorial vêm primeiro; a recomendação comercial precisa nascer de um encaixe legítimo.

## Contrato de handoff

Este documento define quando uma **opção de oportunidade de autoridade** pode ser selecionada e encaminhada para aprofundamento dentro do FBR Agency Flux. O handoff não transforma a opção automaticamente em projeto monetizável.

## Regra principal
O Authority Engine não cria projetos monetizáveis diretamente. Ele gera e compara **opções de criação de oportunidades**. Uma opção é um objeto de decisão, não uma autorização para executar. O Flux só recebe a opção selecionada depois de Sergio decidir que vale transformá-la em projeto.

## Entrada obrigatória
- ID e versão da persona
- nicho e subnicho pesquisados
- público-alvo
- problema e intenção
- oportunidade e fontes
- diferenciação
- nome e posicionamento
- Character Bible
- identidade visual e disclosure de IA
- voz e formatos editoriais
- claims permitidos, suavizados e proibidos
- fontes e limitações
- produtos/ofertas possíveis
- riscos de conformidade
- hipótese de monetização
- métricas de sucesso
- dependências, custo estimado e próximos passos

## O Flux deve criar
- projeto com owner e tenant corretos;
- briefing comercial e editorial;
- cards de execução e dependências;
- modelo de receita;
- plano de conteúdo e audiência;
- plano de tráfego, quando aprovado;
- critérios de QA e conformidade;
- gates de publicação, gasto e alteração irreversível;
- registro de evidências e histórico de decisões.

## Gates de passagem

### P0 — Opção qualificada
A opção passou pelos gates do Authority Engine: oportunidade, diferenciação, autoridade, viabilidade, monetização, identidade e transparência.

### P1 — Seleção para aprofundamento
Sergio compara as opções e seleciona uma para aprofundamento. A seleção não aprova projeto, gasto ou publicação.

### P2 — Proposta de projeto
O pacote selecionado demonstra problema, audiência, proposta de valor, ativo a construir, modelo de receita e métricas.

### P3 — Aprovação de Sergio
Sergio aprova explicitamente a abertura do projeto e seu escopo inicial. Essa aprovação não autoriza automaticamente publicação, gasto ou contratação.

### P4 — Execução controlada
Cada ação posterior segue o FBR Agency Flux, com card, responsável, evidência e gate específico.

## Bloqueadores automáticos

O handoff deve ser bloqueado se houver:

- persona genérica ou clone de marca existente;
- nicho não pesquisado;
- autoridade baseada em credencial falsa ou experiência corporal inventada;
- claims sem fonte ou sem calibragem;
- monetização que dependa de promessa proibida;
- ausência de público ou problema claro;
- ausência de plano editorial sustentável;
- ausência de owner ou métrica de sucesso;
- tentativa de publicar, gastar ou criar contas sem aprovação.

## Estados

```text
persona_draft
→ persona_review
→ persona_approved
→ handoff_review
→ project_proposed
→ project_approved
→ execution_planned
→ operating
→ paused | blocked | archived
```

Toda transição precisa de artefato, responsável, timestamp e evidência. `project_approved` exige aprovação específica de Sergio quando houver criação de ativos públicos, gasto ou compromisso operacional.

## Critério de conclusão do handoff
O handoff está completo somente quando o Flux consegue abrir o projeto sem reconstruir contexto por conversa e consegue responder: o que será criado, para quem, por quê, como monetiza, quem executa, quanto custa, como será medido, quais riscos existem e qual aprovação falta.
