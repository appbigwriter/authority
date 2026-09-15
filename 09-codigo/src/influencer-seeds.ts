import type { InfluencerSeed, Opportunity } from './types.js';

const ARCHETYPES = {
  curator: { name: 'The Curator', archetype: 'curadora/testadora', function: 'curadoria e comparação', voice: 'assertiva, prática e transparente', formats: ['teardown', 'comparativo'], traits: ['criteriosa', 'acolhedora', 'incisiva'], not: ['alarmista', 'salesy', 'arrogante'] },
  analyst: { name: 'The Analyst', archetype: 'sábio-explicador', function: 'análise de tendências e soluções', voice: 'analítica, direta e didática', formats: ['breakdown', 'trend report'], traits: ['curiosa', 'rigorosa', 'acessível'], not: ['obscura', 'dogmática', 'sensacionalista'] },
} as const;

export function createSeeds(opportunity: Opportunity): InfluencerSeed[] {
  if (opportunity.status !== 'qualified') throw new Error('opportunity_not_qualified');
  const base = { opportunityId: opportunity.id, mentorRole: 'mentor' as const, audience: opportunity.audience, problem: opportunity.problem, thesis: `Boas decisões em ${opportunity.subniche} começam por contexto, função e evidência.`, promise: `ajudar ${opportunity.audience} a decidir melhor sobre ${opportunity.subniche}`, visualDirection: 'fotorrealista, editorial, identidade consistente e disclosure visível de IA', anchorFace: 'definir depois do caráter: pessoa adulta, expressão inteligente e presença natural', signatureTrait: 'olhar atento e expressão de discernimento', monetizationPaths: ['produto próprio relevante', 'afiliado relevante'], risks: opportunity.risks };
  const seeds: InfluencerSeed[] = Object.entries(ARCHETYPES).map(([key, archetype]) => ({
    id: `seed_${opportunity.id}_${key}`,
    ...base,
    name: archetype.name,
    archetype: archetype.archetype,
    function: archetype.function,
    traits: [...archetype.traits],
    decisionCompass: 'Esta recomendação ajuda o leitor a decidir melhor sem exagerar a evidência?',
    not: [...archetype.not],
    backstory: 'Construída como uma voz editorial de pesquisa, curadoria e serviço ao leitor.',
    differentiation: key === 'curator' ? 'faz a triagem honesta para poupar tempo e dinheiro' : 'explica o porquê das escolhas e explicita limitações',
    voice: archetype.voice,
    formats: [...archetype.formats],
    antiNetwork: ['não copiar rosto', 'não copiar bordões', 'não copiar cadência', 'não repetir a mesma paleta das demais marcas'],
    score: 0,
    status: 'proposed',
  }));
  return seeds.map((seed): InfluencerSeed => ({ ...seed, score: scoreSeed(seed, opportunity) }));
}

function scoreSeed(seed: InfluencerSeed, opportunity: Opportunity): number {
  const round = seed.traits.length >= 3 ? 20 : 0;
  const fit = seed.formats.length >= 2 ? 20 : 0;
  const authority = seed.differentiation.length > 30 ? 30 : 10;
  const product = opportunity.products.length ? 20 : 0;
  const risk = opportunity.scores.risk > 60 ? 20 : 0;
  return Math.max(0, Math.min(100, 10 + round + fit + authority + product - risk));
}

export function selectSeed(seeds: InfluencerSeed[], id: string): InfluencerSeed {
  const seed = seeds.find((s) => s.id === id);
  if (!seed) throw new Error('seed_not_found');
  return { ...seed, status: 'selected' };
}
