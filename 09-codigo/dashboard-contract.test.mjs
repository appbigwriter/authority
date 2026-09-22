import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./public/dashboard.html', import.meta.url), 'utf8');

assert.equal((html.match(/\$\('runPM'\)/g) ?? []).length, 0, 'Post Machine must use #runPM selectors');
assert.match(html, /\$\('#runPM'\)\.disabled=true/, 'Post Machine must disable the real button');
assert.match(html, /researchSelect[^\n]*addEventListener\(['"]change['"]/, 'researchSelect must have a change listener');
assert.doesNotMatch(html, /function loadSeedsForResearch\([\s\S]*?openSeedsModal\(\)/, 'seed generation must not reopen modal without researchId');
assert.match(html, /(?:function|const) apiFetch/, 'dashboard must centralize authenticated API calls');
assert.match(html, /AUTH_STORAGE_KEY=['"]authority_engine_token['"]/); assert.match(html, /sessionStorage\.getItem\(AUTH_STORAGE_KEY\)/, 'dashboard auth must be session-scoped');
assert.equal((html.match(/\bfetch\(/g) ?? []).length, 1, 'only apiFetch may call fetch directly');

assert.match(html, /const FIXTURE_STATE=/, 'dashboard must expose deterministic local fixture fallback');
assert.match(html, /mode==='fake'\?'DEMO \/ FAKE':'LIVE'/, 'fixture/live mode must be visible');
for (const view of ['pipeline','radar','briefs','research','evidence','dossier','comparisons','farmer','postmachine','approvals','metrics','jobs','audit','settings']) {
  assert.match(html, new RegExp(`data-view="${view}"`), `${view} must be reachable from the preserved left navigation`);
}
assert.match(html, /data-testid="audit-view"/, 'audit view must expose append-only history');
assert.match(html, /data-testid="settings-view"/, 'settings view must expose governance context');
assert.match(html, /data-testid="view-blocked"/, 'settings must expose blocked integration state');
assert.match(html, /tenant_id|Tenant ativo/, 'tenant context must be visible in the UI contract');
assert.match(html, /Owner/, 'owner context must be visible in the UI contract');
assert.match(html, /Gate/, 'Gate context must be visible in the UI contract');
assert.match(html, /disabled>Publicar<|Publicar<[^>]*disabled/, 'publication must not have an enabled UI path');
assert.doesNotMatch(html, /onclick="[^"]*Publicar/, 'publication must not have a click bypass');
assert.match(html, /function tableView\(title,rows,columns\)/, 'transversal UI must have a tabular contract renderer');
assert.doesNotMatch(html, /if\(targetView && titles\[targetView\]\)/, 'direct routes must not reference render-local titles');

console.log('dashboard contract: PASS');
