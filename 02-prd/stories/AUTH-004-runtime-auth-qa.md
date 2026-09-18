# AUTH-004 — Implementar runtime, autenticação e QA local

## Status
ready

## Objetivo
Implementar o que puder ser concluído localmente para autenticação/ownership, contratos de integração e QA dos quatro módulos, sem depender de credenciais externas.

## Escopo
- Implementar autenticação/roles/ownership no runtime local conforme MP-000.
- Atualizar contratos e adapters Amazon/marketplace para fail-closed, sem inventar endpoint real.
- Criar testes de 401/403, ausência de credencial, gates, disclosure e publicação bloqueada.
- Corrigir documentação e STATUS somente com evidência.

## Fora do escopo
Contas, credenciais, APIs reais, publicação, gasto, deploy ou migration remota.

## Ownership de paths
`09-codigo/src/server*`, auth/middleware/rotas, adapters e testes dedicados; relatório em `08-historico/`.

## Aceite
- [ ] `npm run check` passa.
- [ ] Rotas protegidas negam acesso sem autenticação e respeitam role/ownership.
- [ ] Adapters externos falham fechado sem credencial/contrato.
- [ ] QA local cobre gates e casos inválidos.
- [ ] Pendências externas ficam registradas, não mascaradas.
