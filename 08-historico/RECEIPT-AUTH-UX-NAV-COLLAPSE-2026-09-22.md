# Receipt — Menu lateral compacto e recolhível

**Task:** ajuste solicitado por Sergio
**Projeto:** FBR Authority Engine
**Estado:** concluído e verificado localmente

## Alterações

- Reduzido o espaçamento vertical entre grupos e subitens.
- Mantidas as 6 categorias do menu.
- Cada categoria pode ser expandida ou recolhida independentemente.
- O estado visual usa `aria-expanded` e classe `is-collapsed`.
- O controle funciona por clique e teclado (`Enter`/`Space`).
- A navegação das 17 views foi preservada.
- O layout responsivo continua navegável em telas menores.

## Validação

- `node dashboard-ui.contract.test.mjs` — PASS
- `node dashboard-contract.test.mjs` — PASS
- `node dashboard-browser-smoke.test.mjs` — PASS; 17 views, 4 classes de estado
- `node dashboard-check.mjs` — PASS
- `npm run check` — PASS; build e 65 testes
- `git diff --check` — PASS; somente aviso normal de LF/CRLF
