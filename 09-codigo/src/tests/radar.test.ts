import test from 'node:test';
import assert from 'node:assert/strict';
import { amazonAdapterFromEnv, marketplaceAdapterFromEnv, FakeMarketplaceAdapter } from '../marketplace-adapters.js';
import { createOpportunity, createOpportunityDossier, deduplicateProducts, detectTrends } from '../opportunity-radar.js';

test('OPR-001 adapters Amazon e secundário falham fechado sem credencial', async () => {
  for (const adapter of [amazonAdapterFromEnv(), marketplaceAdapterFromEnv()]) {
    assert.equal(adapter.source.configured, false);
    await assert.rejects(adapter.search({ niche: 'gear' }), new RegExp(`${adapter.name}_integration_not_configured`));
  }
});

test('OPR-002 normaliza e deduplica apenas dentro da mesma fonte', () => {
  const evidence = [{ source: 'fixture', accessedAt: '2026-01-01T00:00:00Z', observation: 'x', kind: 'fact' as const }];
  const product = (marketplace: string, id: string) => ({ id, sourceRecordId: id, marketplace, title: '  item  ', category: 'gear', niche: 'n', subniche: 's', price: 10, currency: 'USD', availability: 'in_stock' as const, observedAt: '2026-01-01T00:00:00Z', evidence });
  const result = deduplicateProducts([product('amazon', '1'), product('amazon', '1'), product('secondary', '1')]);
  assert.equal(result.length, 2); assert.equal(result[0]?.title, 'item');
});

test('OPR-003 marca evidência insuficiente sem afirmar tendência', () => {
  const [signal] = detectTrends([{ niche: 'n', subniche: 's', query: 'q', strength: 80, observedAt: '2026-01-01', source: 'fake://one' }]);
  assert.equal(signal?.status, 'insufficient_evidence'); assert.equal(signal?.strength, 0); assert.match(signal?.evidence[0]?.limitation ?? '', /minimum/);
});

test('OPR-004 risco sensível bloqueia e OPR-005 gera dossiê comparável', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'health', subniche: 'fertility supplement', problem: 'people need to compare claims safely', audience: 'adults researching options' });
  assert.equal(opportunity.status, 'blocked'); assert.ok(opportunity.scores.factors.risk!.value >= 80); assert.equal(opportunity.scores.version, 'risk-adjusted-v1');
  const dossier = createOpportunityDossier(opportunity);
  assert.equal(dossier.recommendation, 'block'); assert.ok(dossier.blockers.length > 0); assert.ok(dossier.freeAlternatives.length > 0); assert.equal(dossier.handoff.ready, false);
});

test('fake produz uma oportunidade qualificável sem declarar integração real', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  assert.equal(opportunity.status, 'qualified'); assert.ok(opportunity.evidence.some((item) => item.source.startsWith('fake://')));
});
