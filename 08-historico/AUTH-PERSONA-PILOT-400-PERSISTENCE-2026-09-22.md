# Receipt — Diagnóstico do erro 400 ao criar oportunidade no Authority

- **Task:** AUTH-PERSONA-PILOT-20260922-001
- **Data:** 2026-09-22
- **Estado:** bloqueado por persistência relacional/readback; sem mutação externa

## Sintoma reproduzido pelo usuário

- UI autenticada do runtime `sistemas-authority.pojxaz.easypanel.host`.
- `GET /api/state` retorna HTTP `400`.
- `POST /api/opportunities` retorna HTTP `400`.
- UI mostra somente “Não foi possível criar a opção”.
- Warning DOM do campo password não é causal.

## O que o código prova

1. `POST /api/opportunities` não usa OpenAI; ele depende de `store.append('opportunities', ...)`.
2. Antes dele, a UI carrega `/api/state`; se essa leitura falha, o pipeline já está quebrado.
3. O runtime relacional consulta:

```text
custom_authorityengine.opportunities
custom_authorityengine.research
custom_authorityengine.influencer_seeds
custom_authorityengine.profiles
custom_authorityengine.events
custom_authorityengine.authority_outbox_events
... outras coleções
```

4. O `RelationalAuthorityStore` exige `projectId` e `ownerId` e executa queries diretas no PostgreSQL.
5. O health confirma apenas `relationalConfigured=true`; não confirma tabelas, migrations, permissões, RLS ou contexto.
6. O DDL `04-database/001-custom-authorityengine-operational.sql` está marcado como `local-only` e cria as tabelas no schema `custom_authorityengine`.

## Diagnóstico

A hipótese principal é que o processo está configurado para Postgres, mas o schema/tabelas/contexto do `custom_authorityengine` não estão disponíveis de forma compatível no runtime remoto. Possibilidades a confirmar nos logs/readback:

- tabela `custom_authorityengine.opportunities` ou outra tabela ausente;
- schema não acessível pelo usuário da `DATABASE_URL`;
- `AUTHORITY_PROJECT_ID`/`AUTHORITY_OWNER_ID` divergentes do estado esperado;
- RLS bloqueando a query após `set_config`;
- migration local não aplicada no banco real.

A API converte a exceção não classificada em HTTP 400, ocultando a causa no frontend.

## Correção necessária

1. Ler o corpo JSON real de `/api/state` ou o primeiro erro dos logs do serviço.
2. Fazer readback SQL sanitizado de schema/tabelas/permissions/RLS/contexto.
3. Aplicar o DDL/migration somente com Gate de Sergio, backup e rollback.
4. Melhorar o tratamento da API para classificar falha de persistência como `503 persistence_unavailable`, não `400 bad_request`.
5. Repetir `/api/state`, depois `POST /api/opportunities`.
6. Só então configurar/usar a chave OpenAI para pesquisa profunda.

## Não executado

- Nenhum SQL remoto;
- nenhuma migration remota;
- nenhuma alteração de secret;
- nenhuma criação de Persona/opportunity real;
- nenhuma chamada OpenAI real confirmada.
