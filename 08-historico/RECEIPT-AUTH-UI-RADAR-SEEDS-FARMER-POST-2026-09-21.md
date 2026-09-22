# Receipt — Frontend/UI Radar, Seeds, Farmer e Post Machine

**Data:** 2026-09-21  
**Owner:** Agent B — frontend/UI/UX  
**Estado:** parcial; slices locais verificadas, nenhum Sprint concluído

## Escopo entregue

- `S3-T06` UI slice: Research Briefs, Research Run, Evidence Ledger, Opportunities e Opportunity Dossier.
- `S4-T05` UI slice: Seeds Creator e Comparison Pack com comparação explicável e gate humano.
- `S5-T06` UI slice: Workspace Farmer com Persona + Marca, pilares, formatos, claims, guardrails e Approval Pack.
- `S6` UI slice: Post Machine com calendário/pauta, draft, fonte, disclosure, checklist e publicação desabilitada.

## Implementação

- Preservado o design system atual e o menu lateral esquerdo.
- Criadas superfícies navegáveis com `data-testid` e rotas/views internas: `briefs`, `research`, `evidence`, `dossier`, `comparisons`, `farmer` e `postmachine`.
- Added deterministic `DEMO / FAKE` fixtures with mode, heartbeat, raw-record counts, evidence provenance, score factors, limitations, version, guardrails, disclosure, owner and next Gate.
- Comparação não seleciona Seed automaticamente; aprovação/publicação permanecem bloqueadas por Gate humano.
- Quando endpoints de geração não estão disponíveis, Seeds Creator retorna fixture local rotulada em vez de declarar integração real.

## Evidência executada

- `node dashboard-ui.contract.test.mjs` — PASS.
- `node dashboard-contract.test.mjs` — PASS.
- `node dashboard-check.mjs` — PASS.
- `git diff --check -- 09-codigo/public/dashboard.html 09-codigo/dashboard-ui.contract.test.mjs 09-codigo/dashboard-contract.test.mjs` — PASS.
- `npm run check` — PASS; build TypeScript e 59 testes backend existentes passaram.
- Browser smoke local — PASS: 15 itens de navegação; Research Briefs, Research Run, Evidence Ledger, Opportunity Dossier, Comparison Pack, Workspace Farmer e Post Machine renderizaram seus markers; DEMO/FAKE e gates visíveis.

## Limitações e blockers

- `/api/state`, geração de Seeds, Farmer e Post Machine permanecem dependentes de contratos/readback backend; nenhuma integração real foi declarada.
- Fixtures não são pesquisa de mercado, não são dados LIVE e não autorizam publicação, gasto, deploy ou abertura de projeto.
- Sprints S3–S6 continuam abertos; este receipt registra somente slices frontend/UI verificadas.

## Handoff

Agent A/coordenador deve fornecer readback autorizado para Research Brief/Run, Evidence Ledger, Dossier, Seed decision, Farmer Approval Pack e Post Machine draft/review. QA deve repetir os contratos e browser smoke antes de qualquer Gate. Próximo check: validar transições por tenant/owner e receipts reais sem substituir as marcações DEMO/FAKE.
