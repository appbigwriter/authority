# AUTH-003 — Implementação local de persistência relacional e RLS

## Status
ready

## Objetivo
Implementar no código e nas migrations locais o contrato relacional completo do Authority Engine, substituindo o pressuposto de JsonStore como caminho futuro, sem aplicar nada remotamente.

## Escopo de implementação
- Completar o modelo para `research`, `farmer_profiles`, `briefs`, `post_machine`, `receipts`, `metrics`, `feedback`, `assets` e `events`, além das entidades existentes.
- Qualificar tabelas, índices e FKs para `custom_authorityengine`.
- Definir `project_id`/ownership e policies RLS fail-closed.
- Criar adapter relacional atrás de interface, mantendo JsonStore apenas como fake/teste explícito.
- Criar testes de contrato, isolamento e migração idempotente local.

## Fora do escopo
Migration remota, PostgREST, secrets, deploy, produção ou alteração irreversível.

## Ownership de paths
`04-database/`, `09-codigo/src/repository*`, `09-codigo/src/persistence*`, `09-codigo/src/types*`, testes novos dedicados e relatório em `08-historico/`.

## Aceite
- [ ] `npm run check` passa.
- [ ] Todas as coleções de `StoreData` possuem destino documentado e testado.
- [ ] SQL local é qualificado, idempotente e contém RLS/ownership.
- [ ] Testes negativos demonstram isolamento entre projetos/owners.
- [ ] Fakes não são classificados como integração real.
- [ ] Handoff lista arquivos, comandos, blockers e Gate remoto pendente.
