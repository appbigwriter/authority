import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeMarketplaceAdapter, createOpportunity } from '../opportunity-radar.js';
import { MENTOR_ARCHETYPES, createComparisonPackage, createSeeds, selectSeed, validateSeed } from '../influencer-seeds.js';

test('S2 gera a taxonomia completa e seis seeds Mentor redondas', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  assert.equal(opportunity.status, 'qualified');
  const seeds = createSeeds(opportunity);
  assert.equal(MENTOR_ARCHETYPES.length, 6);
  assert.equal(seeds.length, 6);
  for (const seed of seeds) {
    assert.equal(seed.opportunityId, opportunity.id);
    assert.equal(seed.mentorRole, 'mentor');
    assert.equal(seed.taxonomyVersion, 'fbr-mentor-taxonomy-1.0.0');
    assert.equal(seed.traits.length >= 3, true);
    assert.ok(seed.thesis && seed.promise && seed.decisionCompass);
    assert.match(seed.backstory, /IA/);
    assert.equal(seed.differentiationMatrix.length, 4);
    assert.deepEqual(validateSeed(seed), { valid: true, errors: [] });
  }
});

test('pacote comparativo cobre referências, score explicado e não seleciona sozinho', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const seeds = createSeeds(opportunity);
  const pack = createComparisonPackage(seeds);
  assert.equal(pack.alternatives.length, 6);
  assert.equal(pack.decision, 'pending_human_selection');
  assert.equal(pack.handoffToS3, null);
  assert.ok(pack.recommendation.seedId);
  assert.equal(Object.keys(pack.recommendation.argumentsAgainst).length, 6);
  assert.deepEqual(pack.alternatives[0]!.differentiationMatrix.map((x) => x.reference), ['SharpEye', 'TheThirties', 'After Forty', 'Game Style']);
  assert.ok(pack.alternatives.every((s) => s.scoreBreakdown.total === s.score));
});

test('risco crítico bloqueia seed e impede seleção', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const critical = { ...opportunity, scores: { ...opportunity.scores, risk: 90 }, risks: ['critical claims risk'] };
  const seeds = createSeeds(critical);
  assert.ok(seeds.every((seed) => seed.status === 'blocked'));
  assert.throws(() => selectSeed(seeds, seeds[0]!.id), /seed_not_selectable/);
  assert.equal(createComparisonPackage(seeds).recommendation.seedId, null);
});

test('seed incompleta é inválida explicitamente', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const seed = createSeeds(opportunity)[0]!;
  const invalid = { ...seed, traits: ['flat'], differentiationMatrix: [], status: 'invalid' as const };
  const result = validateSeed(invalid);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['three_tension_traits_required', 'differentiation_matrix_required', 'seed_invalid']);
});

test('oportunidade qualificada incompleta produz seeds invalid, não aprovação silenciosa', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const seeds = createSeeds({ ...opportunity, problem: '' });
  assert.equal(seeds.length, 6);
  assert.ok(seeds.every((seed) => seed.status === 'invalid' && seed.score === 0));
});
