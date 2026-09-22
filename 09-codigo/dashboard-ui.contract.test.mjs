import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./public/dashboard.html', import.meta.url), 'utf8');

const mustContain = (pattern, message) => assert.match(html, pattern, message);

// S1-T04: the existing left navigation and visual language remain the shell.
mustContain(/class="app"[\s\S]*class="side"[\s\S]*id="nav"/, 'authenticated shell must keep the left navigation');
mustContain(/id="tenantSwitcher"/, 'shell must expose the active tenant');
mustContain(/id="globalSearch"/, 'shell must expose global search');
mustContain(/id="notificationsBtn"/, 'shell must expose notifications');
mustContain(/data-testid="breadcrumb"/, 'shell must expose a breadcrumb');
mustContain(/data-testid="view-loading"/, 'shell must expose loading state');
mustContain(/data-testid="view-error"/, 'shell must expose error state');
mustContain(/data-testid="view-empty"/, 'shell must expose empty state');
mustContain(/function setViewState\(/, 'shell state transitions must be explicit');
mustContain(/class="nav-group"/, 'navigation must group items into sections');
mustContain(/data-nav-toggle/, 'navigation groups must expose a collapse toggle');
mustContain(/toggleNavGroup\(/, 'navigation groups must have collapse behavior');
mustContain(/is-collapsed/, 'navigation groups must expose collapsed state');
mustContain(/onkeydown/, 'navigation group collapse must be keyboard accessible');
mustContain(/matchMedia\(['"]\(max-width: 900px\)['"]\)/, 'shell must verify responsive navigation behavior');

// S7-T01: dashboard/control-room contract is visible and fixture-safe.
for (const marker of [
  'dashboard-metrics', 'dashboard-pipeline', 'approval-queue', 'active-jobs',
  'blocker-panel', 'recent-activity', 'add-contextual'
]) mustContain(new RegExp(`data-testid="${marker}"`), `${marker} must be rendered`);
mustContain(/DEMO \/ FAKE/, 'fixture state must remain clearly labelled');
mustContain(/Continua[r]? pipeline|Ver pendências/, 'dashboard must offer contextual next actions');

// S7-T02: pipeline/activity must have stage cards and resource history.
mustContain(/function pipelineBoardView\(/, 'pipeline board renderer must exist');
mustContain(/data-testid="pipeline-board"/, 'pipeline board must be addressable');
mustContain(/const stages=\[\['research'.*'review'/, 'pipeline must define ordered stages');
mustContain(/data-testid="resource-history"/, 'resource history must be visible');
mustContain(/heartbeat/, 'job heartbeat must be part of the UI contract');
mustContain(/blocker|bloqueio/, 'blocker state must be part of the UI contract');

// S3-T06/S4-T05/S5-T06/S6 UI surfaces: each fixture is explicit and gate-safe.
for (const marker of ['research-briefs','research-run','evidence-ledger','opportunity-dossier','farmer-workspace','post-machine-workspace']) {
  mustContain(new RegExp(`data-testid="${marker}"`), `${marker} surface must have a browser-addressable contract`);
}
for (const marker of ['Research Briefs','Research Run','Evidence Ledger','Opportunity Dossier','Comparison Pack','Workspace Farmer','Post Machine']) {
  mustContain(new RegExp(marker), `${marker} must be represented in the dashboard`);
}
mustContain(/DEMO \/ FAKE|DEMO · NÃO LIVE/, 'new surfaces must label fixture data');
mustContain(/Gate humano|aprovação humana|não.*publica/i, 'new surfaces must preserve human gates');

