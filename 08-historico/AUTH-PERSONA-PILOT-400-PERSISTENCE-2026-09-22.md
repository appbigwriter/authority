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

## Correções implementadas localmente

- `GET /api/state` agora retorna `503 persistence_unavailable` quando a leitura relacional falha, registrando a mensagem sanitizada no log.
- `POST /api/opportunities` classifica falhas de banco/schema/conexão como `503`, não como `400` de formulário.
- `GET /api/readiness` agora executa `store.read()` antes de declarar readiness.
- Dashboard não substitui falha live por fixture fake; exibe o erro relacional e mantém `DEMO / FAKE` fora do estado de erro.
- Formulário de oportunidade mostra `detail/error` retornado pelo backend.

## Verificação local

```text
npm run check
build: PASS
65 tests: PASS
0 failed

git diff --check: PASS
```

## Tentativa de aplicação da migration

- DDL oficial: `001-custom-authorityengine-operational.sql` + `002-registry-gateway-audit.sql`.
- Execução preparada em transação via driver `pg`, com readback de 21 tabelas e policies.
- Resultado: **rollback automático**, sem alteração no banco.
- Causa: `DATABASE_URL` local contém referência/placeholder de Secret Manager; a conexão tentou resolver host literal `base` e falhou com `getaddrinfo ENOTFOUND base`.
- `POSTGRES_PASS` não faz parte do contrato do Authority e não é lida pelo código; a credencial PostgreSQL é transportada exclusivamente em `DATABASE_URL` como DSN completa.
## Bloqueio remoto confirmado

A aplicação remota alcança um PostgreSQL, mas a relação não existe. O ambiente precisa receber uma DSN real e acessível, não `<secret-manager:...>`/placeholder. O documento de Control Tower define a infraestrutura esperada como Supabase VPS, database `postgres`, host `76.13.168.223`, porta `15432`, com credencial resolvida server-side.

## Próxima ação operacional

1. No serviço `authority` do EasyPanel, corrigir a referência/injeção `DATABASE_URL` pelo Secret Manager.
2. Fazer readback sem expor valor: host/porta/database não-placeholder e schema `custom_authorityengine`.
3. Executar `001` e `002` por executor autorizado/SQL Editor, em transação.
4. Confirmar 21 tabelas + policies e reiniciar o Authority.
5. Repetir `/api/readiness` e `/api/state` com Bearer.
