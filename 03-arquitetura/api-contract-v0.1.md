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

## Authenticated Persona read model

The following endpoints require `Authorization: Bearer <runtime-token>` and are local-only contract slices. They do not call external services.

### GET /api/personas/:personaId/read-model

Returns `200` only for the current approved Persona version. The response is a stable, versioned read model:

```json
{
  "persona_id": "persona-1",
  "persona_version_id": "persona-version-1",
  "persona_version": 1,
  "status": "approved",
  "content_hash": "sha256-hex",
  "snapshot": { "input": {}, "outputs": {}, "source_run_ids": [] }
}
```

Draft, generated, pending-approval, stale, or missing versions return `422`/`404`; cross-owner access returns `403`.

### POST /api/personas/:personaId/approved-event

Creates one local outbox record after approval. Required input: `blogId`, `blogNameVersionId`, and `correlationId`; optional `causationId`. The response is the canonical envelope from the global brief:

```json
{
  "event_id": "persona-approved:...",
  "event_type": "persona.approved",
  "event_version": 1,
  "occurred_at": "2026-09-18T12:00:00.000Z",
  "source": "authority-engine",
  "aggregate_type": "persona",
  "aggregate_id": "persona-1",
  "aggregate_version": 1,
  "correlation_id": "correlation-1",
  "causation_id": null,
  "payload": {
    "persona_id": "persona-1",
    "persona_version_id": "persona-version-1",
    "blog_id": "blog-1",
    "blog_name_version_id": "blog-name-1"
  }
}
```

The endpoint is idempotency-safe for the same event identity (`409 approved_event_already_exists` on replay). No tokens or secret values are accepted in the envelope.

### GET /api/outbox-events/:eventId

Authenticated readback of the persisted envelope. This is local persistence verification only; it is not delivery to Agency Flux or any other external consumer.

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
- autenticação runtime é exigida nas rotas `/api` protegidas, incluindo o read model e o outbox de Persona;
- JSON Store é persistência local de fundação, não Postgres/Supabase;
- rotas de transição ainda não validam todos os contratos de domínio;
- integração externa não configurada.
