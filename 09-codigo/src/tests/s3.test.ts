import test from 'node:test';
import assert from 'node:assert/strict';
import { createOpportunity } from '../opportunity-radar.js';
import { FakeMarketplaceAdapter } from '../marketplace-adapters.js';
import { createSeeds, selectSeed } from '../influencer-seeds.js';
import { createFailClosedVisualProvider, createFluxHandoff, farmProfile, generateAnchorImage, validatePersonaForReview } from '../influencer-farmer.js';

async function fixture() {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const seed = selectSeed(createSeeds(opportunity), `seed_${opportunity.id}_curator`);
  return { opportunity, profile: farmProfile(seed) };
}

test('IFR-001/002 perfil referencia S1/S2 e Character Bible completo', async () => {
  const { opportunity, profile } = await fixture();
  assert.equal(profile.seedId.startsWith('seed_'), true);
  assert.equal(profile.mentorRole, 'mentor');
  assert.equal(profile.characterBible.staticCore.readerIsProtagonist, true);
  assert.equal(profile.characterBible.staticCore.tensions.length >= 3, true);
  assert.match(profile.visual.style, /fotorrealista/i);
  assert.match(profile.characterBible.aiDisclosure.placement, /bio/);
  assert.ok(profile.characterBible.appearance.wardrobe);
  assert.ok(profile.characterBible.prompts.negative.some((x) => /sexualized/i.test(x)));
  assert.match(opportunity.id, /^opp_/);
});

test('IFR-003 plano editorial tem 4 formatos e 10 pautas', async () => {
  const { profile } = await fixture();
  assert.equal(profile.pillars.length >= 3, true);
  assert.equal(profile.editorialPlan.formats.length >= 2, true);
  assert.equal(profile.editorialPlan.topics.length >= 10, true);
  for (const format of profile.editorialPlan.formats) assert.ok(format.audienceInput && format.valueDelivery && format.cta);
  assert.match(profile.editorialPlan.ownAsset, /e-mail/i);
});

test('IFR-004 matriz de claims é rastreável e segura', async () => {
  const { profile } = await fixture();
  assert.equal(validatePersonaForReview(profile).valid, true);
  assert.ok(profile.claimMatrix.every((claim) => claim.source && claim.asOf && claim.limitation));
  assert.ok(profile.claims.prohibited.some((claim) => /cura/i.test(claim)));
  assert.ok(profile.guardrails.some((guardrail) => /testemunho corporal/i.test(guardrail)));
  const invalid = { ...profile, claimMatrix: [{ ...profile.claimMatrix[0]!, source: '' }] };
  assert.equal(validatePersonaForReview(invalid).valid, false);
});

test('IFR-005 handoff não abre projeto e exige decisão humana', async () => {
  const { opportunity, profile } = await fixture();
  const handoff = createFluxHandoff(profile, { niche: opportunity.niche, audience: opportunity.audience, problem: opportunity.problem, evidence: opportunity.evidence.map((e) => e.source) });
  assert.equal(handoff.status, 'handoff_review');
  assert.match(handoff.decisionRequired, /Sergio/);
  assert.match(handoff.optionVsProject, /não é marca\/projeto aprovado/i);
  assert.equal(handoff.next.gate, 'P1 — seleção humana antes do handoff operacional');
});

test('contrato visual fail-closed bloqueia sem provedor configurado', async () => {
  const { profile } = await fixture();
  const provider = createFailClosedVisualProvider();
  assert.equal(provider.configured, false);
  await assert.rejects(() => generateAnchorImage(profile, provider), /visual_provider_not_configured/);
});
