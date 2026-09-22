import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_GENERATION_PROMPT, buildSeedGenerationPrompt } from '../services/influencer-seeds.js';

test('seed prompt is explicit about audience fit, archetypes and physical/intellectual traits', () => {
  const prompt = buildSeedGenerationPrompt({
    opportunityId: 'opp-1',
    niche: 'retail displays',
    subniche: 'trade show lighting',
    audience: 'small exhibit teams',
    problem: 'decidir sinalização sem desperdício',
    research: {
      audienceInsights: ['precisam decidir rápido'],
      contentGaps: ['comparações práticas'],
      trends: ['compras orientadas por checklist'],
      keywords: ['trade show lighting'],
      sources: [{ title: 'Fonte', url: 'https://example.com', type: 'web' }],
    },
  });
  assert.match(SEED_GENERATION_PROMPT, /arquet|arquét/i);
  assert.match(SEED_GENERATION_PROMPT, /físic/i);
  assert.match(SEED_GENERATION_PROMPT, /intelect/i);
  assert.match(SEED_GENERATION_PROMPT, /JSON/i);
  assert.match(prompt, /retail displays/);
  assert.match(prompt, /small exhibit teams/);
  assert.match(prompt, /comparações práticas/);
});
