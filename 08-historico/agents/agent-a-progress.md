# Agent A — backend/domain progress

- Updated: 2026-09-21T21:16:42-03:00 (UTC-03)
- Track: backend/domain; fallback worker GPT-5.6-luna-900k
- Scope respected: `09-codigo/src`, `04-database`, backend/domain tests, this progress file. No dashboard, STATUS, PENDING_TASKLIST, Agent B progress, remote migration, deploy, publication, spend, or secrets.

## Evidence

- `npm run check` in `F:/Projetos/_FBR/AuthorityEngine/09-codigo`: **57 tests passed, 0 failed**; TypeScript build passed.
- New/verified backend slices: tenant/version domain metadata validation, fail-closed state transitions, deterministic idempotent event envelopes, tenant-isolated Partner/Source registries, source health fail-closed without credential reference, structured OpenAI gateway with schema/budget checks, append-only tenant-scoped audit ledger, metric period/source/limitation validation.
- Local SQL artifact added: `04-database/002-registry-gateway-audit.sql`; explicitly local-only and not applied remotely.

## Story receipts

### S0-T02 — partially implemented (backend/domain slice)
- Done: IDs/version/timestamps/tenant validation, state transitions, error codes, event envelope/idempotency key, contract tests.
- Not done: complete request/response schemas for every PRD entity and coordinator-approved S0 gate.
- Limitation: this track cannot mark S0 verified; coordinator review required.

### S2-T01 — partially implemented (backend/domain slice)
- Done: tenant-scoped PartnerRegistry with planned/configured/verified/blocked/disabled statuses and duplicate protection.
- Not done: HTTP/UI registry routes and full partner catalog persistence wiring.

### S2-T02 — partially implemented (backend/domain slice)
- Done: SourceRegistry metadata, credential reference (never secret), tenant isolation and fail-closed health behavior.
- Not done: HTTP/UI routes and relational adapter wiring for the new source table.

### S2-T03 — partially implemented (backend/domain slice)
- Done: server-side transport abstraction, tenant context, required-key structured-output validation, usage/cost/latency metadata, per-tenant budget fail-closed behavior.
- Not done: real provider integration, retry policy, persistent llm_runs adapter, or SharpEye eval dataset. Real provider remains intentionally blocked.

## Active HOLDs

1. `S0-GATE`: owner coordinator/reviewer; nextAction review contracts against full PRD and approve/adjust canonical schema; nextCheck at coordinator Sprint S0 review; closure requires explicit gate decision.
2. `S2-INTEGRATION`: owner runtime/infrastructure; nextAction define approved relational/API wiring and credential reference contract; nextCheck before S2 gate; fallback is local/fake tests only.
3. `S1-HTTP-TENANT`: owner backend track; nextAction wire explicit tenant_id through HTTP context (current runtime uses project/owner isolation); nextCheck before S3/S9 E2E; closure requires positive/negative tenant API tests.

## Handoff

Input: approved execution authorization plus PRD/backlog/story catalog; existing local implementation and 50 passing tests.
Output: backend/domain contracts, registries, gateway, audit/metric guards, local SQL, tests, and this receipt. All provider/integration claims are local/fake only. Coordinator must review/correct at the Sprint boundary and must not treat this handoff as auto-verification.
Next owner: coordinator GPT-5.6-luna-900k for review, then backend track for HTTP/persistence wiring and remaining eligible stories.

## Reabertura — backend/domain (2026-09-21)

### Entrega desta passagem

- **S0-T02 — parcialmente implementada:** preservados os contratos existentes e corrigida a criação de envelopes idempotentes para usar um único `occurredAt`; o conjunto completo de request/response do PRD e a aprovação do Gate S0 continuam pendentes.
- **S1-T01/S1-T02 — parcialmente implementadas:** principal agora carrega `tenantId`, o HTTP aceita contexto explícito por `x-tenant-id`, rejeita override contra principal tenant-bound, aplica role/ownership e grava `tenantId` nos novos registros; cobertura positiva/negativa adicionada.
- **S2-T01 — parcialmente implementada:** rotas locais `GET/POST /api/partners` (e alias `/api/registries/partners`) e mudança de status persistem no `PersistenceStore`, com isolamento por tenant/owner.
- **S2-T02 — parcialmente implementada:** rotas locais `GET/POST /api/sources` (e alias) e health check persistem metadados sem segredo e falham fechado sem `credentialRef` ou com fonte bloqueada.
- **S2-T03 — parcialmente implementada:** `POST/GET /api/llm/runs` usa `OpenAIGateway` server-side com output mockável, schema/budget/context checks e persistência de `llm_runs`; nenhum provider real, secret ou chamada externa foi introduzido.
- **Regressão corrigida:** `createEventEnvelope` não gera timestamps diferentes entre validação e resposta.

### Evidência

- `npm run check` em `F:/Projetos/_FBR/AuthorityEngine/09-codigo`: **59 testes passaram, 0 falharam**; build TypeScript passou.
- `git diff --check`: passou; apenas avisos de conversão LF/CRLF do Git.
- Testes novos: isolamento HTTP explícito de tenant, rotas/persistência dos registries, health fail-closed e persistência do gateway mock.
- `04-database/002-registry-gateway-audit.sql`: wiring relacional local dos registries/gateway continua local-only; nenhuma migration remota foi executada.

### Próximo estado e bloqueios

- **S0-T02, S1-T01, S1-T02, S2-T01, S2-T02, S2-T03:** `partial`; não marcar Sprint como concluído.
- **Bloqueios:** Gate S0/coordenador; provider OpenAI real, credencial segura, retry/evals SharpEye e readback relacional real permanecem fora desta passagem; S2 precisa revisão do coordenador antes de verificação.
- **Próxima Story elegível:** S3-T01 (Research Brief) permanece a próxima fatia local elegível após revisão do contrato S0/S1/S2; este agente não a promove a concluída sem critérios e evidência próprios.

### Handoff ao coordenador

Revisar diffs e contratos HTTP/persistência, confirmar o formato canônico de `tenantId`/contexto e decidir o Gate S0/S2. A entrega é local/fake; não há claim de provider real, migration, deploy, publicação, gasto ou Sprint concluído.

## Reabertura — duplicate protection e revisão de elegibilidade (2026-09-21)

### Entrega desta passagem

- **S2-T01/S2-T02 — ainda parciais, com gap corrigido:** o boundary HTTP não confia em registries instanciados por request para duplicidade; `JsonStoreFake` agora serializa writes e rejeita duplicata de partner/source por tenant e id. O adapter relacional valida status, tenant/owner presentes e owner compatível com o contexto antes de persistir.
- **Validação de contrato:** status inválido é rejeitado em runtime; payload não consegue substituir `tenantId`/`ownerId` derivados do principal; source não pode apontar para partner de outro tenant.
- **S3-T01:** não iniciado/promovido. Os contratos e Gates S0/S1/S2 continuam sem liberação coordenada, portanto não há avanço honesto para Research Brief.

### Evidência

- `npm run check` em `F:/Projetos/_FBR/AuthorityEngine/09-codigo`: build TypeScript passou; **59 testes passaram, 0 falharam**.
- `09-codigo/src/tests/registry-http.test.ts`: duas chamadas consecutivas para partner/source, status inválido, payload tenant/owner negativo e partner cross-tenant.
- `git diff --check`: passou; avisos observados são apenas conversão LF/CRLF do Git.
- Receipt detalhado: `08-historico/RECEIPT-AUTH-EXEC-S2-DUPLICATE-2026-09-21.md`.

### Bloqueios mantidos

- S0-T02, S1-T01, S1-T02, S1-T03, S2-T01, S2-T02 e S2-T03 permanecem `partial`; nenhum Sprint foi concluído.
- Gate S0/coordenador, readback relacional real, provider OpenAI real, retry/evals SharpEye, credenciais e integrações externas permanecem fora desta passagem.
- Nenhuma migration remota, deploy, publicação, gasto ou secret foi usado.

### Handoff ao coordenador

Revisar o diff e o receipt, confirmar os contratos canônicos e decidir os Gates S0/S1/S2. Só depois dessa liberação avaliar S3-T01; a proteção local/fake não é evidência de runtime relacional ou provider real.

## Passagem local verificável — S0/S1/S2 (2026-09-21)

- **S0-T02:** `09-codigo/src/contracts.ts` adiciona contratos canônicos de request/response, validação runtime fail-closed, contexto tenant/owner/actor/correlation, erros e exemplos. `contracts.test.ts` cobre válidos e inválidos.
- **S0-T02:** `createEventEnvelope` mantém `occurredAt` estável para replay do mesmo idempotency key sem timestamp explícito.
- **S1-T03:** `JsonStoreFake` serializa append/replace de todas as coleções; `persistence-restart.test.ts` cobre 25 writes concorrentes, restart/readback e ausência de segredo.
- **Evidência:** `npm run check` passou com **62 testes, 0 falhas**; `git diff --check` passou.
- **Receipt:** `08-historico/RECEIPT-AUTH-LOCAL-S0-S2-2026-09-21.md`.

### Estado e handoff

S0-T02, S1-T01, S1-T02, S1-T03, S2-T01, S2-T02 e S2-T03 permanecem `partial`; nenhum Sprint foi concluído. Owner do próximo passo: coordenador/revisor GPT-5.6-luna-900k. `nextAction`: revisar `contracts.ts` contra o PRD e decidir Gates S0/S1/S2. `nextCheck`: revisão formal de Sprint/Gate. Runtime relacional real, provider, credenciais, migration remota, deploy e integrações continuam HOLD.

