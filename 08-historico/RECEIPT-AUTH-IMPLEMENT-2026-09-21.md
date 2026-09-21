# Receipt — Implementação relacional especializada do Authority Engine

**Data:** 2026-09-21 16:56:37 -03:00
**Owner:** David
**Task:** AUTH-IMPLEMENT-20260921-001
**Estado:** implementação local verificada; integração remota bloqueada por Gate/runtime

## Entrega

Corrigido o `RelationalAuthorityStore` para respeitar o schema SQL real nas coleções especializadas:

- `events`: grava e atualiza `type` e `target_id`, sem tentar usar a coluna inexistente `status`.
- `authority_outbox_events`: grava/atualiza tipo/agregado, status, tentativas, retry/dead-letter e payload.
- `outbox_receipts`: grava/atualiza receipt, evento, consumer e response, sem coluna `status`.
- Campos obrigatórios de eventos/outbox falham fechado quando ausentes.
- O contrato público de `replace` foi preservado; a validação interna permanece especializada.

## Arquivos

- `09-codigo/src/repository.ts`
- `09-codigo/src/tests/auth-003-persistence.test.ts`

## Verificação executada

Diretório: `F:/Projetos/_FBR/AuthorityEngine/09-codigo`

- `npm run check` — PASS; build TypeScript e **50/50 testes**.
- `node dashboard-contract.test.mjs` — PASS.
- `node dashboard-check.mjs` — PASS.
- `git diff --check` — PASS; apenas warnings de normalização LF/CRLF.

O novo teste confirma o SQL gerado para as três tabelas especializadas e confirma que `events`/`outbox_receipts` não recebem a coluna inválida `status`.

## Limitações e Gate

- Não foi executada migration remota.
- Não houve conexão, escrita ou readback em Postgres/Supabase remoto.
- O runtime continua exigindo `DATABASE_URL`, `AUTHORITY_PROJECT_ID` e `AUTHORITY_OWNER_ID` seguros.
- O fake `RecordingSqlClient` comprova o contrato local do adapter; não comprova schema remoto aplicado nem RLS remoto.

## Aprendizado operacional

Testes que verificam somente a interface genérica do repositório não detectam incompatibilidades entre tabelas com colunas obrigatórias distintas. A regra aplicada daqui em diante é testar cada tabela especializada contra o SQL efetivo antes de classificar a persistência relacional como pronta.

## Próximo passo

Com Gate específico e referências seguras disponíveis: aplicar/validar o schema no runtime autorizado, executar escrita/readback por projeto e owner, reiniciar e repetir o readback. Até lá, manter classificação `localmente verificado / remoto não verificado`.
