# AUTH-001 — Auditar e preparar persistência relacional/RLS

## Status
ready

## Projeto
Authority Engine — `F:/Projetos/_FBR/AuthorityEngine`

## Objetivo
Revisar o código, migrations e contratos do Authority Engine para definir o caminho verificável de saída do `JsonStore` local para Postgres/Supabase relacional com RLS, sem executar mutações externas.

## Escopo
- Auditar `04-database`, tipos, repositories e testes em `09-codigo`.
- Mapear entidades para tabelas, FKs, constraints, índices e isolamento.
- Identificar divergências entre schema provisionado e aplicação.
- Criar relatório técnico e, se seguro, testes/ajustes apenas locais em paths de persistência.

## Fora do escopo
- Não aplicar SQL remoto.
- Não usar ou expor secrets.
- Não declarar integração remota pronta sem readback.

## Entregáveis
- `08-historico/AUTH-001-persistencia-relacional.md`
- Lista de arquivos/migrations relevantes.
- Testes/checks executados com comandos e resultados.
- Handoff no formato padrão: de, para, card, objetivo, entregável, decisões/suposições, blockers, gate, critérios/evidências.

## Aceite
- [ ] Cada entidade operacional tem destino relacional identificado.
- [ ] RLS, ownership e risco de isolamento estão documentados.
- [ ] Diferenças entre local, Control Tower e runtime remoto estão separadas.
- [ ] Nenhuma integração remota é afirmada sem evidência.
