# AUTH-004 — Runtime auth e QA local

## Status
Verificado localmente em 2026-09-18 00:56:35 ESAST.

## Diff lógico
- Runtime HTTP passou a proteger rotas `/api/*` por autenticação Bearer local, mantendo públicos apenas dashboard, `/health` e `/api/info`.
- Papéis implementados: `admin`, `operator`, `reviewer`, `publisher`, `viewer`.
- Ownership local aplicado por `ownerId`/`createdBy` em criações e checado antes de leitura operacional, seleção, geração, revisão, aprovação e publicação.
- `/api/state` ficou restrito a `admin` para evitar disclosure amplo do store.
- Publicação runtime deixou de usar fake adapter por padrão: sem adapter configurado explicitamente, falha fechado com `external_channel_not_configured`.
- `publishAssisted` agora exige disclosure e fontes antes de qualquer chamada de adapter.
- Adapters Amazon/marketplace agora falham fechado quando falta credencial, endpoint, versão de contrato ou gate `*_LIVE_ENABLED=true`; não há chamada externa sem esses requisitos.
- Testes locais dedicados cobrem 401, 403 por role, 403 por ownership, credencial ausente/inválida, gates de review/aprovação, disclosure ausente e publicação bloqueada.
- Ajuste mínimo no contrato de persistência local/relacional para o `npm run check` passar com as mudanças concorrentes de AUTH-003: `PersistenceStore` preserva tipo genérico de append/replace e `RelationalAuthorityStore.read` seta contexto de projeto/owner antes das leituras.

## Arquivos criados
- `09-codigo/src/auth.ts`
- `09-codigo/src/tests/auth-runtime.test.ts`
- `08-historico/AUTH-004-runtime-auth-qa.md`

## Arquivos modificados por AUTH-004
- `09-codigo/src/server.ts`
- `09-codigo/src/marketplace-adapters.ts`
- `09-codigo/src/post-machine.ts`
- `09-codigo/src/tests/api.test.ts`
- `09-codigo/src/tests/radar.test.ts`
- `09-codigo/src/repository.ts` — ajuste mínimo de compatibilidade com check/persistência concorrente.
- `09-codigo/src/persistence/types.ts` — ajuste mínimo de tipagem do contrato `PersistenceStore`.

## Evidências

### Build e testes
Comando executado em `F:/Projetos/_FBR/AuthorityEngine/09-codigo`:

```bash
npm run check
```

Resultado:

```text
> authority-engine@0.1.0 check
> npm run build && npm test

> authority-engine@0.1.0 build
> tsc -p tsconfig.json

> authority-engine@0.1.0 test
> node --test dist/tests/*.test.js

ℹ tests 33
ℹ pass 33
ℹ fail 0
ℹ duration_ms 324.4866
```

Casos AUTH-004 verificados na suíte:
- `AUTH-004 retorna 401 para credencial ausente ou inválida em rota protegida`
- `AUTH-004 aplica 403 por role e por ownership`
- `AUTH-004 gates de review, disclosure e publicação falham fechado sem adapter externo configurado`
- `API expõe health público, protege escrita e persiste oportunidade autenticada`
- `OPR-001 adapters Amazon e secundário falham fechado sem credencial`
- `OPR-001b adapter configurado sem contrato/live gate não chama provedor`

## Limitações externas
- Nenhuma conta foi criada.
- Nenhuma credencial real foi usada.
- Nenhuma conexão Amazon/marketplace real foi feita.
- Nenhuma publicação real, gasto, deploy ou alteração de produção foi executada.
- Adapters reais continuam classificados como não verificados até existir contrato externo, credencial injetada por runtime seguro, smoke test somente leitura e readback do provedor.

## Observações de concorrência
- Havia alterações não commitadas e arquivos novos de AUTH-003/persistência no repositório durante esta implementação (`04-database/*`, `09-codigo/src/persistence/*`, `auth-003-persistence.test.ts`, entre outros).
- Não alterei migrations/schema SQL para AUTH-004. O único toque em persistência foi para manter `npm run check` verde com o contrato que já estava presente no workspace.

## Handoff
- Próximo responsável pode revisar o diff separando AUTH-004 de AUTH-003 antes de commit/PR.
- Para produção/staging, configurar tokens via runtime (`AUTHORITY_ADMIN_TOKEN`, `AUTHORITY_OPERATOR_TOKEN`, `AUTHORITY_REVIEWER_TOKEN`, `AUTHORITY_PUBLISHER_TOKEN`, `AUTHORITY_VIEWER_TOKEN`) sem registrar valores em docs/logs.
- Para liberar integração externa, exigir contrato de provider, `*_CONTRACT_VERSION`, endpoint, credencial por secret manager e gate `*_LIVE_ENABLED=true`; depois executar smoke/readback somente leitura.
- Para publicação real, injetar um `ChannelAdapter` real explicitamente e manter aprovação humana escopada por target/version/channel.
