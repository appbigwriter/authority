# Receipt — Frontend/integration QA local — SharpEye — 2026-09-21

**Owner:** frontend/integration QA track  
**Scope:** `09-codigo/public/dashboard.html`, UI contracts/browser smoke, fake E2E, fixtures and QA receipts.  
**Mode:** local only; `DEMO / FAKE`; no provider, secret, remote migration, deploy, publication, account or spend.

## Executed slices

| Story / slice | Result | Evidence |
|---|---|---|
| S1-T04 shell visual | local slice verified | preserved left navigation, tenant, search, notifications, breadcrumb, responsive rule |
| S3-T06 Radar surfaces | local slice verified | Research Briefs, Research Run, Evidence Ledger, Opportunity Dossier markers and fixture |
| S4-T05 Seeds | local slice verified | Comparison Pack, explicit human decision gate, no automatic selection |
| S5-T06 Farmer | local slice verified | Persona + Marca, pillars, formats, claims, guardrails, Approval Pack |
| S6 Post Machine | local slice verified | calendar/draft/disclosure/checklist; `Publicar` disabled |
| S7-T01 dashboard | local slice verified | metrics, pipeline, approvals, jobs, blockers, contextual actions |
| S7-T02 pipeline/activity | local slice verified | five-stage board, owner/status/Gate, heartbeat, blocker panel, resource history |
| S7-T03 settings/governance | local slice verified | new Settings view: tenant/owner/role, limits, sources, fail-closed blocked state |
| S8-T01 audit | local UI slice verified | dedicated append-only/read-only Audit view with actor/tenant/resource/timestamp |
| S8-T02 metrics | local UI slice verified | source, period and limitation remain visible in Metrics view |
| S8-T04 observability | local UI slice verified | Jobs view with status, progress, heartbeat and local-only mode |
| S9-T01 fixture | verified | deterministic SharpEye manual dataset and source limitation |
| S9-T02 E2E pipeline | verified locally | fake harness covers intake → run → dossier → seed → farmer → approval → draft |
| S9-T03 negative QA | verified at UI contract level | loading/empty/error/blocked, tenant/owner/Gate, no publication bypass |
| S9-T04 QA receipt | verified | complete commands below, browser readback, diff check |

## Tests and browser evidence

- `node dashboard-ui.contract.test.mjs` — PASS.
- `node dashboard-contract.test.mjs` — PASS.
- `node dashboard-browser-smoke.test.mjs` — PASS (17 views, 4 state classes).
- `node sharpeye-e2e.fake.test.mjs` — PASS (publication blocked).
- `node dashboard-check.mjs` — PASS.
- `git diff --check -- public/dashboard.html dashboard-contract.test.mjs dashboard-browser-smoke.test.mjs sharpeye-e2e.fake.test.mjs` — PASS.
- `npm run check` — PASS; TypeScript build and 65 backend tests passed, 0 failed.
- Real local browser readback via `http://127.0.0.1:4173/dashboard.html`: 17 nav views rendered; Radar, Seeds, Farmer, Post Machine, approvals, metrics, jobs, audit and settings navigated; Settings exposed `settings-view` and `view-blocked`; Post Machine exposed `Publicar` with `disabled=true`.

## Limits / blockers

- Full Story Gates remain blocked where server-side auth, tenant context, owner authorization, RLS, persistence readback or human approval are required. UI labels do not replace server authorization.
- `/api/state` and mutation endpoints were not declared real by this track; static server browser run intentionally fell back to fixture.
- No live provider, external partner, OpenAI, Easypanel, remote database, deploy, publication or spend was used.
- S10 real integrations/publication remain out of scope and blocked by missing authorized contracts, credentials and external readback.

## Handoff

Coordinator/Agent A must reconcile the UI fixture fields with authorized backend readback for tenant/owner/role/Gates and preserve fail-closed mutation behavior. Sergio remains the human owner for approval Gates. Next check: rerun the four UI commands plus browser readback after backend contracts are exposed; closure requires exact readback and no enabled publication path.
