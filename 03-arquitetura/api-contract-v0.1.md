# Authority Engine API — Contrato v0.1

## Base
`http://127.0.0.1:${PORT}` — default `3400`

## GET /health
Retorna `200`:

```json
{"ok":true,"service":"authority-engine","persistence":"json-store","externalIntegrations":"not_configured"}
```

`externalIntegrations` só pode mudar quando adapters reais tiverem configuração, health check e smoke test comprovados.

## GET /api/state
Retorna as coleções persistidas localmente:

```json
{"opportunities":[],"seeds":[],"profiles":[],"content":[],"approvals":[]}
```

## POST /api/opportunities
Cria oportunidade em estado `candidate`.

Entrada mínima:

```json
{"niche":"business displays","subniche":"trade show lighting","problem":"booth visibility","audience":"small exhibitors"}
```

Retorna `201` com `id` e `status`.

## POST /api/seeds
Cria seed em estado `proposed`. Deve referenciar uma oportunidade existente no fluxo completo.

## POST /api/profiles
Cria perfil em estado `review`.

## POST /api/content
Cria conteúdo em estado `draft`.

## POST /api/approvals
Aprovação exige explicitamente:

```json
{"targetId":"...","approved":true,"scope":"..."}
```

`approved: false` retorna `422 explicit_approval_required`.

## Erros
- `404 not_found` para rota inexistente;
- `400 bad_request` para JSON inválido ou erro de persistência;
- `422 explicit_approval_required` para tentativa de aprovação não explícita.

## Limitações conhecidas
- autenticação ainda não implementada;
- JSON Store é persistência local de fundação, não Postgres/Supabase;
- rotas de transição ainda não validam todos os contratos de domínio;
- integração externa não configurada.
