import type { InfluencerSeed, Profile } from './types.js';

export function farmProfile(seed: InfluencerSeed): Profile {
  if (seed.status !== 'selected') throw new Error('seed_not_selected');
  return {
    id: `profile_${seed.id}`,
    seedId: seed.id,
    name: seed.name,
    brand: `${seed.name} Authority`,
    bio: `${seed.promise} por meio de pesquisa, curadoria e análise. Persona editorial criada com inteligência artificial.`,
    disclosure: 'Persona editorial criada com inteligência artificial. O responsável editorial real é a FBR. Conteúdo pode conter links de afiliado quando indicado.',
    thesis: seed.thesis,
    promise: seed.promise,
    mentorRole: 'mentor',
    archetype: seed.archetype,
    traits: seed.traits,
    decisionCompass: seed.decisionCompass,
    not: seed.not,
    backstory: seed.backstory,
    authorityMethod: 'pesquisa, comparação, fontes verificáveis, explicação do porquê e explicitação de limitações',
    voice: { tone: seed.voice, vocabulary: ['evidência', 'função', 'contexto', 'alternativa', 'limitação'], prohibited: ['cura', 'garantia', 'resultado garantido', 'eu usei', 'meu corpo'] },
    visual: { style: 'fotorrealista, editorial, --style raw; nunca ilustrativo ou passado por pessoa real', palette: 'definir em identidade própria, distinta das outras marcas da rede', continuity: 'seed/character-lock versionado a partir do retrato-âncora aprovado', anchorFace: seed.anchorFace, signatureTrait: seed.signatureTrait, prompts: ['retrato editorial frontal', 'persona em contexto do nicho', 'persona apresentando produto sem testemunho pessoal'] },
    pillars: [`fundamentos de ${seed.problem}`, 'comparações e decisões', 'tendências e contexto'],
    formats: seed.formats,
    guardrails: ['declarar IA', 'persona é Mentor e leitor é protagonista', 'núcleo estático; superfície dinâmica dentro dos valores', 'não inventar experiência pessoal', 'não fabricar credenciais', 'não sexualizar', 'não estereotipar herança', 'disclosure próximo a link comercial'],
    claims: { allowed: ['comparação de especificações verificáveis', 'opinião editorial identificada', 'curadoria baseada em fontes'], soften: ['estudos sugerem', 'pode ajudar', 'há sinais de'], prohibited: ['cura', 'garantia', 'resultado fabricado', 'testemunho corporal', 'credencial falsa'] },
    aboutPage: 'Esta é uma persona editorial ficcional criada com inteligência artificial e identificada como IA. Ela organiza pesquisa e curadoria para ajudar o leitor. A responsabilidade editorial é da FBR. Recomendações comerciais serão identificadas.',
    footerDisclaimer: 'Conteúdo editorial e informativo. Verifique fontes e especificações. Quando houver link de afiliado, isso será informado próximo ao link. Não substitui orientação profissional quando aplicável.',
    monetizationModel: ['produto próprio relevante', 'afiliado relevante', 'lista de e-mail', 'publicidade contextual'],
    status: 'review',
  };
}

export function validatePersonaForReview(profile: Profile): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (profile.traits.length < 3) reasons.push('persona_flat');
  if (profile.mentorRole !== 'mentor') reasons.push('not_mentor');
  if (!profile.visual.anchorFace || !profile.visual.signatureTrait) reasons.push('missing_visual_anchor');
  if (!profile.disclosure.includes('inteligência artificial')) reasons.push('missing_ai_disclosure');
  if (profile.pillars.length < 3 || profile.formats.length < 2) reasons.push('insufficient_editorial_system');
  if (!profile.guardrails.includes('não inventar experiência pessoal')) reasons.push('missing_body_testimonial_guardrail');
  return { valid: reasons.length === 0, reasons };
}
