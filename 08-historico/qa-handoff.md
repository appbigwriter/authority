# QA Handoff — Authority Engine

## Status
`BLOCKED_FOR_FORMAL_QA` — núcleo local verificado; integração externa e banco produtivo pendentes.

## Artefatos
- Código: `09-codigo`
- Contrato API: `03-arquitetura/api-contract-v0.1.md`
- Schema base: `04-database/schema-foundation.sql.md`
- Configuração de integrações: `03-arquitetura/integrations.md`
- Sprints/stories: `02-prd/stories`

## Evidência local
- `npm run check`
- build TypeScript: passou
- 5 testes: passaram
- falhas: 0
- smoke test HTTP: health `200`, persistência de oportunidade `201`, aprovação não explícita `422`, leitura de estado `200`.

## Escopo que o QA pode revisar agora
- contratos e tipos;
- gates de estado;
- bloqueios de oportunidade sensível;
- redondeza/Mentor/disclosure da persona;
- bloqueio de conteúdo sem fontes;
- aprovação humana antes de publicação;
- persistência local JSON;
- comportamento de erro da API.

## Bloqueadores para QA final
1. Não há credencial/contrato validado da API Amazon.
2. Não há credencial/contrato validado de marketplace adicional.
3. Persistência ainda é JsonStore, não Postgres/Supabase.
4. Não há autenticação, autorização ou RLS.
5. Não há canal real de publicação.
6. Não há geração visual real nem armazenamento de assets.
7. Não há dashboard nem observabilidade produtiva.

## Critério para liberar QA final
O handoff só pode mudar para `READY_FOR_FORMAL_QA` quando os bloqueadores forem resolvidos, os smoke tests externos passarem e os receipts/evidências forem anexados.
