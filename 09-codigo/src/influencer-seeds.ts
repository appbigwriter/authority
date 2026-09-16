import type { InfluencerSeed, Opportunity, ReferenceComparison, ScoreBreakdown, SeedComparisonPackage } from './types.js';

export const SEED_TAXONOMY_VERSION = 'fbr-mentor-taxonomy-1.0.0';

export interface MentorArchetype {
  key: string; name: string; function: string; audience: string; strength: string; limit: string;
  useWhen: string; editorialFunctions: string[]; voice: string; formats: string[]; traits: string[]; not: string[];
}

/** Versioned catalog from persona-creation-algorithm.md; appearance is intentionally absent. */
export const MENTOR_ARCHETYPES: readonly MentorArchetype[] = [
  { key: 'curator', name: 'Curadora/Testadora', function: 'curadoria e triagem honesta', audience: 'pessoas que precisam reduzir opções e decidir com contexto', strength: 'separa sinal, função, trade-off e evidência', limit: 'não transforma preferência em verdade universal', useWhen: 'há excesso de opções e custo de escolha', editorialFunctions: ['curadora', 'comparadora', 'guia de decisão'], voice: 'assertiva, prática e transparente', formats: ['comparativo', 'teardown', 'checklist'], traits: ['criteriosa', 'acolhedora', 'incisiva'], not: ['alarmista', 'salesy', 'arrogante'] },
  { key: 'specialist', name: 'Especialista-próxima', function: 'competência acessível sem gatekeeping', audience: 'iniciantes e praticantes que querem avançar sem jargão', strength: 'ensina método aplicável e traduz linguagem técnica', limit: 'não inventa credencial nem experiência de uso', useWhen: 'o problema exige orientação técnica compreensível', editorialFunctions: ['educadora', 'guia de decisão'], voice: 'competente, calorosa e clara', formats: ['passo a passo', 'mitos e fatos', 'checklist'], traits: ['precisa', 'generosa', 'exigente'], not: ['pedante', 'prescritiva', 'onisciente'] },
  { key: 'visionary', name: 'Consultora-visionária', function: 'traduzir visão em resultado possível', audience: 'pessoas e equipes que precisam priorizar uma direção', strength: 'conecta contexto, futuro plausível e próxima decisão', limit: 'não promete tendência, retorno ou transformação', useWhen: 'há ambiguidade estratégica e necessidade de rumo', editorialFunctions: ['estrategista', 'anfitriã', 'guia de decisão'], voice: 'visionária, pragmática e provocadora', formats: ['cenário', 'framework', 'roadmap'], traits: ['imaginativa', 'pragmática', 'impaciente com desperdício'], not: ['guru', 'futurista vaga', 'promesseira'] },
  { key: 'friend', name: 'Amiga-que-faz-a-lição', function: 'calor com rigor e evidência', audience: 'pessoas ocupadas que querem uma explicação confiável e humana', strength: 'faz a pesquisa e devolve o essencial sem encenação', limit: 'não simula intimidade, vivência ou testemunho', useWhen: 'o tema é intimidante e a adesão depende de acolhimento', editorialFunctions: ['educadora', 'anfitriã', 'curadora'], voice: 'calorosa, curiosa e honesta', formats: ['perguntas e respostas', 'resumo comentado', 'diário de pesquisa'], traits: ['curiosa', 'afetuosa', 'desconfiada'], not: ['fofoqueira', 'influenciadora de rotina', 'testemunhal'] },
  { key: 'analyst', name: 'Sábio-explicador', function: 'desmistificação e análise de contexto', audience: 'leitores que querem entender o porquê antes de agir', strength: 'organiza sistemas complexos em modelos verificáveis', limit: 'não usa complexidade para esconder incerteza', useWhen: 'há confusão, jargão ou claims difíceis de avaliar', editorialFunctions: ['analista', 'educadora', 'crítica'], voice: 'analítica, direta e didática', formats: ['breakdown', 'relatório de tendência', 'mapa de decisão'], traits: ['curiosa', 'rigorosa', 'acessível'], not: ['obscura', 'dogmática', 'sensacionalista'] },
  { key: 'guardian', name: 'Guardião-protetor', function: 'prevenção de erro caro ou engano', audience: 'pessoas expostas a risco, desperdício ou claims frágeis', strength: 'torna limites, sinais de alerta e alternativas visíveis', limit: 'não pratica alarmismo nem substitui profissional habilitado', useWhen: 'o custo de uma decisão ruim é alto', editorialFunctions: ['crítica', 'comparadora', 'guia de decisão'], voice: 'firme, cuidadosa e proporcional', formats: ['alerta contextualizado', 'auditoria', 'antes de decidir'], traits: ['vigilante', 'empática', 'proporcional'], not: ['alarmista', 'paternalista', 'acusatória'] },
];

const REFERENCES = [
  { reference: 'SharpEye', focus: 'sinalização e presença visual para negócios', function: 'analista/curadora estratégica', format: 'teardown' },
  { reference: 'TheThirties', focus: 'vida, decisões e estilo aos 30', function: 'curadora editorial', format: 'recomendações contextualizadas' },
  { reference: 'After Forty', focus: 'presença, bem-estar e escolhas maduras', function: 'curadora de autoridade', format: 'diagnóstico e orientação' },
  { reference: 'Game Style', focus: 'setups e estética gamer', function: 'analista de setups', format: 'Battlestation Breakdown' },
] as const;

function comparison(archetype: MentorArchetype, opportunity: Opportunity): ReferenceComparison[] {
  return REFERENCES.map((ref) => ({
    reference: ref.reference,
    proximity: ref.focus.includes(opportunity.niche) || ref.function.includes(archetype.function.split(' ')[0] ?? '') ? 35 : 15,
    differences: [`público é ${opportunity.audience}, não ${ref.focus}`, `problema é ${opportunity.problem}`, `função ${archetype.function}; formato ${archetype.formats[0]}` , `visual: âncora própria, sem copiar identidade da referência`],
    limitation: 'Proximidade conceitual estimada por regras textuais; não é auditoria de portfólio nem prova de originalidade absoluta.',
  }));
}

function scoreSeed(seed: InfluencerSeed, opportunity: Opportunity): ScoreBreakdown {
  const authority = Math.min(20, 10 + opportunity.scores.authority / 10);
  const audience = opportunity.audience.trim().length >= 10 ? 15 : 5;
  const differentiation = Math.min(20, 10 + (seed.differentiationMatrix ?? []).reduce((m, x) => Math.max(m, 100 - x.proximity), 0) / 10);
  const content = seed.formats.length >= 3 && (seed.editorialFunctionCount ?? 0) >= 3 ? 15 : 8;
  const compliance = seed.not.length >= 3 && seed.mentorRole === 'mentor' ? 15 : 0;
  const viability = opportunity.products.length > 0 ? 10 : 5;
  const riskPenalty = opportunity.scores.risk >= 60 ? 15 : opportunity.scores.risk >= 30 ? 7 : 0;
  const total = Math.max(0, Math.min(100, Math.round(authority + audience + differentiation + content + compliance + viability - riskPenalty)));
  return { authority, audience, differentiation, content, compliance, viability, riskPenalty, total, rationale: { authority: 'Adequação baseada no score de autoridade da oportunidade; hipótese do dossiê.', audience: 'Audiência explícita e específica no dossiê.', differentiation: 'Distância textual máxima contra referências e combinação própria de função/formato.', content: 'Três formatos e pelo menos três funções editoriais operáveis.', compliance: 'Mentor, limites explícitos e ausência de testemunho corporal/credencial inventada.', viability: 'Produtos existentes são hipótese de monetização relevante, não aprovação comercial.', riskPenalty: 'Penalidade proporcional ao risco informado pela oportunidade.' } };
}

// Internal helper kept out of the public contract to avoid duplicating function data.
function withFunctionCount(seed: Omit<InfluencerSeed, 'editorialFunctionCount'> & Partial<Pick<InfluencerSeed, 'editorialFunctionCount'>>, count: number): InfluencerSeed { return Object.assign(seed, { editorialFunctionCount: count }); }

export function createSeeds(opportunity: Opportunity): InfluencerSeed[] {
  if (opportunity.status !== 'qualified') throw new Error('opportunity_not_qualified');
  const incomplete = !opportunity.id || !opportunity.audience?.trim() || !opportunity.problem?.trim() || !opportunity.subniche?.trim();
  return MENTOR_ARCHETYPES.map((archetype) => {
    const seed = withFunctionCount({
      id: `seed_${opportunity.id}_${archetype.key}`, opportunityId: opportunity.id, name: `The ${archetype.name.split('/')[0]}`, archetype: archetype.name, archetypeKey: archetype.key, taxonomyVersion: SEED_TAXONOMY_VERSION,
      function: archetype.function, editorialFunctionCount: archetype.editorialFunctions.length, mentorRole: 'mentor', audience: opportunity.audience, problem: opportunity.problem,
      thesis: `Decisões melhores em ${opportunity.subniche} começam por contexto, função, trade-offs e evidência — não por aparência.`,
      promise: `ajudar ${opportunity.audience} a entender ${opportunity.subniche} e escolher um próximo passo proporcional ao seu contexto`, traits: [...archetype.traits], decisionCompass: 'Isto aumenta a capacidade do leitor de decidir por si, com evidência proporcional, alternativas e limites explícitos?', not: [...archetype.not], backstory: 'Voz editorial ficcional criada como IA para pesquisar, organizar e servir decisões do leitor; não possui vivências ou credenciais humanas.', differentiation: `${archetype.function} para ${opportunity.audience}, com foco em ${opportunity.problem}; usa ${archetype.formats.join(', ')} e uma identidade visual própria.`, voice: archetype.voice, visualDirection: 'fotorrealista, editorial e consistente; disclosure visível de IA; identidade própria, não derivada das referências', anchorFace: 'pessoa adulta ficcional, expressão atenta e natural, sem copiar pessoa real', signatureTrait: 'gesto visual de pausa antes de separar evidência, hipótese e escolha', formats: [...archetype.formats], monetizationPaths: ['produto próprio relevante', 'afiliado relevante, sujeito a validação'], risks: [...opportunity.risks], antiNetwork: ['não copiar rosto ou styling', 'não copiar bordões ou cadência', 'não repetir paleta, cenário ou formato proprietário', 'não importar público/problema das referências'], rationale: `Hipótese: ${archetype.useWhen}; força: ${archetype.strength}; limite: ${archetype.limit}. O leitor permanece protagonista e a persona atua como Mentor.`, roundness: [`força: ${archetype.strength}`, `tensão: ${archetype.traits.join(' × ')}`, `limite: ${archetype.limit}`, 'papel: Mentor; leitor: protagonista'], differentiationMatrix: comparison(archetype, opportunity), scoreBreakdown: {} as ScoreBreakdown, score: 0, status: 'proposed',
    }, archetype.editorialFunctions.length);
    const breakdown = scoreSeed(seed, opportunity);
    const critical = opportunity.scores.risk >= 80 || opportunity.risks.some((risk) => /critical|crítico/i.test(risk));
    return { ...seed, scoreBreakdown: breakdown, score: incomplete ? 0 : breakdown.total, status: incomplete ? 'invalid' : critical ? 'blocked' : 'proposed' };
  });
}

export function createComparisonPackage(seeds: InfluencerSeed[]): SeedComparisonPackage {
  if (seeds.length < 2) throw new Error('comparison_requires_alternatives');
  const viable = seeds.filter((seed) => seed.status === 'proposed');
  const recommended = viable.slice().sort((a, b) => b.score - a.score)[0] ?? null;
  return { opportunityId: seeds[0]!.opportunityId, taxonomyVersion: seeds[0]!.taxonomyVersion ?? 'unknown', generatedAt: new Date().toISOString(), alternatives: seeds.map((seed) => ({ ...seed, differentiationMatrix: (seed.differentiationMatrix ?? []).map((item) => ({ ...item })) })), recommendation: { seedId: recommended?.id ?? null, rationale: recommended ? `Maior score composto (${recommended.score}/100) sem substituir decisão humana; comparar também risco e capacidade editorial.` : 'Nenhuma alternativa está liberada.', argumentsAgainst: Object.fromEntries(seeds.map((seed) => [seed.id, [`limite: ${seed.not.join(', ')}`, `risco: ${seed.risks.join('; ') || 'não informado'}`, 'score é hipótese e não aprovação']])) }, openQuestions: ['Sergio seleciona uma seed ou rejeita todas?', 'Qual escopo e métrica de desenvolvimento serão aprovados?', 'A hipótese de produto permanece editorialmente relevante após validação?'], decision: 'pending_human_selection', handoffToS3: null };
}

export function selectSeed(seeds: InfluencerSeed[], id: string): InfluencerSeed {
  const seed = seeds.find((candidate) => candidate.id === id);
  if (!seed) throw new Error('seed_not_found');
  if (seed.status !== 'proposed') throw new Error('seed_not_selectable');
  return { ...seed, status: 'selected' };
}

export function validateSeed(seed: InfluencerSeed): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (seed.mentorRole !== 'mentor') errors.push('mentor_role_required');
  if (seed.traits.length < 3) errors.push('three_tension_traits_required');
  if (!seed.thesis || !seed.promise || !seed.decisionCompass) errors.push('core_narrative_incomplete');
  if (!seed.taxonomyVersion) errors.push('taxonomy_version_required');
  if (!(seed.differentiationMatrix ?? []).length) errors.push('differentiation_matrix_required');
  if (seed.status === 'invalid') errors.push('seed_invalid');
  return { valid: errors.length === 0, errors };
}
