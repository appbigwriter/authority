import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeMarketplaceAdapter, createOpportunity } from '../opportunity-radar.js';
import { createSeeds, selectSeed } from '../influencer-seeds.js';
import { farmProfile, validatePersonaForReview } from '../influencer-farmer.js';
import { produceDraft, publishAfterApproval, requestHumanApproval, submitForReview } from '../post-machine.js';

test('pipeline completo com fake adapter respeita estados e gates', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  assert.equal(opportunity.status, 'qualified');
  const seed = selectSeed(createSeeds(opportunity), `seed_${opportunity.id}_curator`);
  const profile = farmProfile(seed);
  const approved = { ...profile, status: 'approved' as const };
  assert.throws(() => produceDraft(approved, { id: 'b1', profileId: approved.id, topic: 'lighting', pillar: approved.pillars[0]!, format: approved.formats[0]!, channel: 'short-video', objective: 'educate', sources: [], status: 'draft' }), /invalid_content_brief/);
  const brief = { id: 'b1', profileId: approved.id, topic: 'trade show lighting', pillar: approved.pillars[0]!, format: approved.formats[0]!, channel: 'short-video', objective: 'help choose', sources: opportunity.evidence, status: 'draft' as const };
  const draft = produceDraft(approved, brief);
  assert.equal(draft.status, 'draft');
  const awaiting = requestHumanApproval(submitForReview(draft));
  assert.equal(awaiting.status, 'awaiting_human_approval');
  assert.equal(publishAfterApproval(awaiting, true).status, 'published');
});

test('não permite criar seed de oportunidade bloqueada', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'health', subniche: 'supplement fertility', problem: 'x', audience: 'y' });
  assert.equal(opportunity.status, 'blocked');
  assert.throws(() => createSeeds(opportunity), /opportunity_not_qualified/);
});

test('não permite publicar sem aprovação humana', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const seed = selectSeed(createSeeds(opportunity), `seed_${opportunity.id}_analyst`);
  const profile = { ...farmProfile(seed), status: 'approved' as const };
  const draft = produceDraft(profile, { id: 'b2', profileId: profile.id, topic: 'lighting', pillar: profile.pillars[0]!, format: profile.formats[0]!, channel: 'blog', objective: 'educate', sources: opportunity.evidence, status: 'draft' });
  assert.throws(() => publishAfterApproval(draft, true), /human_approval_required/);
});

test('Farmer gera persona redonda, Mentor e com disclosure', async () => {
  const opportunity = await createOpportunity(new FakeMarketplaceAdapter(), { niche: 'business displays', subniche: 'trade show lighting', problem: 'small businesses need their booth to be visible in a crowded aisle', audience: 'small business exhibitors' });
  const seed = selectSeed(createSeeds(opportunity), `seed_${opportunity.id}_curator`);
  const profile = farmProfile(seed);
  const validation = validatePersonaForReview(profile);
  assert.equal(validation.valid, true);
  assert.equal(profile.mentorRole, 'mentor');
  assert.equal(profile.traits.length >= 3, true);
  assert.match(profile.disclosure, /inteligência artificial/);
  assert.match(profile.visual.style, /fotorrealista/);
});
