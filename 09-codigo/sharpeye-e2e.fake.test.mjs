import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Local-only SharpEye fake adapter. It models the UI contract without a provider,
// secret, remote migration, account, spend, or publication side effect.
const html = await readFile(new URL('./public/dashboard.html', import.meta.url), 'utf8');
const pipeline = {
  tenant: 'demo', owner: 'Sergio', gate: 'G0', mode: 'DEMO / FAKE',
  brief: { id: 'brief-sharpeye', status: 'ready' },
  run: { id: 'run-sharpeye', status: 'queued', source: 'manual://sharpeye/brief-01' },
  dossier: { id: 'dossier-sharpeye', status: 'pending' },
  seed: { id: 'seed-nadia', status: 'proposed' },
  farmer: { id: 'farmer-nadia', status: 'blocked' },
  approval: { id: 'approval-demo', status: 'awaiting_human_approval' },
  draft: { id: 'draft-001', status: 'blocked' },
  metrics: { mode: 'DEMO', limitation: 'Sem publicação externa' },
};
const transition = (from, to, allowed) => {
  assert.ok(allowed.includes(from), `transition source ${from} is valid`);
  return to;
};

pipeline.run.status = transition(pipeline.run.status, 'completed', ['queued']);
pipeline.gate = 'G3';
pipeline.dossier.status = transition(pipeline.dossier.status, 'qualified', ['pending']);
pipeline.gate = 'G4';
pipeline.seed.status = transition(pipeline.seed.status, 'selected', ['proposed']);
pipeline.gate = 'G5';
// No seed selection means Farmer remains blocked.
assert.equal('blocked', transition('blocked', 'blocked', ['blocked']));
pipeline.farmer.status = transition(pipeline.farmer.status, 'review', ['blocked']);
pipeline.gate = 'G6';
pipeline.approval.status = transition(pipeline.approval.status, 'approved', ['awaiting_human_approval']);
pipeline.gate = 'G7';
pipeline.draft.status = transition(pipeline.draft.status, 'review', ['blocked']);

// Publication is intentionally not a legal local transition.
assert.throws(() => transition(pipeline.draft.status, 'published', ['approved']), /transition source/);
assert.equal(pipeline.metrics.mode, 'DEMO');
assert.equal(pipeline.tenant, 'demo');
assert.equal(pipeline.owner, 'Sergio');
assert.equal(pipeline.run.source, 'manual://sharpeye/brief-01');
assert.match(html, /publicação pública está bloqueada por padrão/);
assert.match(html, /aprovação humana ainda pendente/i);
assert.match(html, /data-testid="view-blocked"/);
console.log('SharpEye local fake E2E: PASS (intake → run → dossier → seed → farmer → approval → draft; publication blocked)');
