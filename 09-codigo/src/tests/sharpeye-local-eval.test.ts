import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalBrief, runLocalResearch } from '../local-research.js';
import type { Opportunity } from '../types.js';

const opportunity = { id: 'opp-sharpeye-eval', niche: 'store signs', subniche: 'retail displays', problem: 'clearer signage', audience: 'small retailers', products: [], trends: [], scores: { demand: 0, intent: 0, content: 0, productFit: 0, authority: 0, risk: 0, confidence: 0, total: 0, factors: {} as any, version: 'eval' }, risks: [], blockers: [], evidence: [], status: 'candidate' } satisfies Opportunity;

test('SharpEye local eval keeps DEMO provenance and epistemic labels', () => {
  const brief = createLocalBrief({ tenantId: 'tenant-eval', ownerId: 'owner-eval', market: 'US', language: 'en', niche: 'store signs', subniche: 'retail displays', audience: 'small retailers', problem: 'clearer signage', objective: 'evaluate fixture' });
  const { run, dossier } = runLocalResearch(brief, opportunity);
  assert.equal(run.mode, 'DEMO');
  assert.ok(run.limitations.some((item) => item.includes('DEMO')));
  assert.ok(run.research.marketSize.startsWith('hipótese:'));
  assert.ok(Array.isArray(dossier.hypotheses) && dossier.hypotheses.length > 0);
  assert.equal((dossier.handoff as { ready: boolean }).ready, false);
});
