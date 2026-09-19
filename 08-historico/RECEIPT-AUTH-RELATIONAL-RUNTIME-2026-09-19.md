# Receipt — fiação relacional obrigatória do Authority Engine

**Data:** 2026-09-19
**Owner:** David
**Estado:** parcialmente implementado; conexão real bloqueada por referências de banco ausentes.

## Regra aplicada

JSON local, snapshot em arquivo e fallback de filesystem não são fonte de estado. O runtime foi alterado para usar `RelationalAuthorityStore` e falhar fechado quando a configuração de banco não existir.

## Alterações verificadas

- `09-codigo/src/start.ts` agora usa `pg.Pool` + `RelationalAuthorityStore`.
- O processo exige `DATABASE_URL`, `AUTHORITY_PROJECT_ID` e `AUTHORITY_OWNER_ID`.
- O processo executa preflight `select 1` antes de abrir a porta HTTP.
- Não existe fallback para `JsonStoreFake` no runtime.
- `/health` reporta `store.kind` em vez de declarar JSON fixo.
- `pg` e `@types/pg` foram adicionados ao projeto.
- `.env.example` documenta runtime relacional obrigatório e mantém uma única referência de `DATABASE_URL`.

## Verificação local

- `npm run check`: PASS — build e 49 testes.
- `git diff --check`: PASS; somente warnings de normalização LF/CRLF do Git.
- Com `DATABASE_URL` ausente, `npm run dev` encerra com `missing_required_runtime_config:DATABASE_URL`.
- Nenhum servidor JSON permanece ativo.

## Bloqueio real

O `.env.local` ainda não possui `DATABASE_URL`, `AUTHORITY_PROJECT_ID` ou `AUTHORITY_OWNER_ID`. Portanto, ainda não foram executados:

- conexão real;
- validação de schema/tabelas/RLS/ownership no banco;
- escrita real;
- readback pré-restart;
- restart com estado persistido;
- readback pós-restart.

Nenhuma migration, deploy ou mutação remota foi executada.

## Próximo gate

Disponibilizar as referências seguras do banco e o contexto autorizado; iniciar o runtime relacional; validar schema/RLS/ownership; executar escrita/readback; reiniciar; repetir readback; somente então abrir o input da oportunidade.
