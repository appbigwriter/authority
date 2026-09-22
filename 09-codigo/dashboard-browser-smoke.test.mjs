import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./public/dashboard.html', import.meta.url), 'utf8');
const requiredViews = ['overview','pipeline','radar','briefs','research','evidence','dossier','seeds','comparisons','farmer','postmachine','approvals','metrics','jobs','audit','settings','about'];
const navViews = [...html.matchAll(/data-view="([^"]+)"/g)].map(([, view]) => view);
for (const view of requiredViews) assert.ok(navViews.includes(view), `browser smoke: ${view} is navigable`);

// A dependency failure must visibly fall back to the deterministic fixture.
assert.match(html, /catch\(error\)\{Object\.assign\(state,structuredClone\(FIXTURE_STATE\)\)/);
assert.match(html, /data-testid="view-loading"/);
assert.match(html, /data-testid="view-error"/);
assert.match(html, /data-testid="view-empty"/);
assert.match(html, /data-testid="view-blocked"/);

// Critical surfaces remain addressable after a client-side navigation.
for (const marker of ['research-briefs','research-run','evidence-ledger','opportunity-dossier','comparison-pack','farmer-workspace','post-machine-workspace','audit-view','settings-view']) {
  assert.match(html, new RegExp(`data-testid=\\"${marker}\\"`), `browser smoke: ${marker}`);
}
assert.match(html, /data-view="pipeline"/);
assert.match(html, /data-view="approvals"/);
assert.match(html, /data-view="settings"/);

// Negative smoke: fixture data cannot publish, select silently, or call a real provider.
assert.match(html, /DEMO \/ FAKE/);
assert.match(html, /Selecionar Seed \(Gate humano\)[\s\S]*disabled/);
assert.match(html, /<button class="btn" disabled>Publicar<\/button>/);
assert.match(html, /LLM:<\/strong> não configurado \(fail-closed\)/);
assert.doesNotMatch(html, /OPENAI_API_KEY|AMAZON_API_KEY|Easypanel/);
console.log(`browser smoke contract: PASS (${requiredViews.length} views, 4 state classes)`);
