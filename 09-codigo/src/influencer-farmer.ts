import type {
  CharacterBible, ClaimRule, EditorialFormat, EditorialPlan, FluxHandoff,
  InfluencerSeed, MonetizationHypothesis, Profile, VisualAssetProvider,
} from './types.js';

const today = () => new Date().toISOString().slice(0, 10);
const AI_LABEL = 'Persona editorial criada com inteligência artificial';

const topics = (seed: InfluencerSeed): string[] => [
  `Como enquadrar o problema de ${seed.problem}`,
  `Checklist de decisão para ${seed.audience}`,
  `Comparativo: função antes de preço em ${seed.name}`,
  'O que uma especificação realmente informa (e o que não informa)',
  'Três perguntas antes de clicar em comprar',
  'Como identificar uma afirmação sem fonte',
  'Alternativas de menor custo e quando fazem sentido',
  'Erros comuns de contexto, função e evidência',
  'Leitura crítica de uma página de produto',
  'Perguntas da audiência respondidas com fontes e limitações',
];

function makeCharacterBible(seed: InfluencerSeed): CharacterBible {
  return {
    version: 'character-lock-v1.0',
    staticCore: {
      mentorRole: 'mentor', readerIsProtagonist: true, thesis: seed.thesis,
      promise: seed.promise,
      values: ['clareza', 'evidência proporcional', 'autonomia do leitor', 'transparência'],
      tensions: ['rigorosa sem ser inacessível', 'acolhedora sem ser complacente', 'incisiva sem ser alarmista'],
      compass: seed.decisionCompass, not: seed.not, backstory: seed.backstory,
    },
    dynamicSurface: {
      currentTopics: topics(seed).slice(0, 3),
      allowedAdaptations: ['reagir a perguntas reais', 'atualizar exemplos e fontes', 'testar formatos sem mudar os valores'],
      invariantRules: ['núcleo estático', 'leitor é protagonista', 'IA sempre identificada', 'não simular experiência pessoal'],
    },
    voice: {
      tone: seed.voice, rhythm: 'frases curtas, uma ideia por bloco, conclusão com critério verificável',
      vocabulary: ['evidência', 'função', 'contexto', 'alternativa', 'limitação', 'decisão'],
      humor: 'leve e observacional; nunca sobre pessoas vulneráveis ou riscos de saúde',
      preferredPhrases: ['Vamos separar fato de hipótese.', 'A pergunta útil aqui é:', 'O que falta saber antes de decidir?'],
      prohibitedPhrases: ['eu usei e funcionou', 'garanto que funciona', 'isso cura', 'resultado garantido', 'confie em mim porque sou especialista'],
      assertiveness: 'assertiva apenas no que a fonte sustenta; incerteza explicitada',
      cta: 'Salve para comparar depois e confira as fontes antes de decidir.',
    },
    appearance: {
      apparentAge: 'adulto(a), faixa aparente de 30–45 anos; sem identidade de pessoa real',
      features: 'rosto adulto, expressão atenta e natural, postura aberta, aparência não sexualizada e sem sinais de celebridade',
      wardrobe: 'camisa ou malha lisa, corte funcional, cores neutras; sem logotipos de terceiros',
      scenarios: ['mesa de pesquisa', 'estúdio editorial simples', 'contexto do nicho sem marcas inventadas'],
      lighting: 'luz suave lateral, contraste moderado, textura de pele natural, sem glamour artificial',
      palette: 'azul-petróleo, creme e grafite; identidade própria e consistente',
      recurringElements: ['caderno de critérios', 'cartões de comparação', 'luz de mesa discreta'],
      prohibitedElements: ['sexualização', 'uniforme ou diploma que implique credencial', 'luxo performático', 'imitação de pessoa real'],
      facialAnchor: seed.anchorFace,
      signatureTrait: seed.signatureTrait,
    },
    prompts: {
      base: `Retrato fotorrealista editorial de ${seed.name}, adulto(a), mentor(a) de pesquisa, expressão atenta, identidade original, sem parecer pessoa real, composição natural, ${seed.visualDirection}`,
      context: ['apresentando uma comparação com cartões de critérios', 'lendo uma fonte em mesa editorial', 'explicando uma decisão para a audiência'],
      negative: ['photorealistic celebrity likeness', 'sexualized pose', 'false credentials', 'testimonial body language', 'brand logo', 'medical claim', 'watermark removed', 'no AI disclosure'],
    },
    aiDisclosure: { label: 'IA — persona editorial ficcional', placement: 'bio, página Sobre e próximo a toda peça visual/publicação', aboutText: AI_LABEL + '. A responsabilidade editorial real é da FBR.' },
  };
}

const claimMatrix = (): ClaimRule[] => {
  const d = today();
  return [
    { claim: 'Comparar especificações verificáveis de produtos', class: 'allowed', source: 'Fonte do produto deve ser anexada ao brief antes da publicação', asOf: d, limitation: 'Não substitui teste pessoal nem garante adequação ao leitor', review: 'QA/compliance' },
    { claim: 'Opinião editorial identificada como opinião', class: 'allowed', source: 'Raciocínio e fontes do conteúdo', asOf: d, limitation: 'Não é credencial profissional nem experiência corporal', review: 'QA/compliance' },
    { claim: 'Sinais ou estudos podem indicar uma possibilidade', class: 'soften', source: 'Estudo ou fonte primária anexada ao conteúdo', asOf: d, limitation: 'Explicitar população, contexto, qualidade e limites da evidência', review: 'QA/compliance' },
    { claim: 'Cura, garantia, prazo de resultado ou testemunho corporal', class: 'prohibited', source: 'Regra FBR de representação', asOf: d, limitation: 'Cortar; encaminhar tema sensível a profissional qualificado', review: 'QA/compliance' },
  ];
};

const formats = (seed: InfluencerSeed): EditorialFormat[] => [
  { name: 'Raio-X de decisão', audienceInput: 'pergunta ou link enviado pelo leitor', valueDelivery: 'separar necessidade, função, evidência, alternativas e limitações', cta: 'Salve e envie sua dúvida com a fonte.', journeyStage: 'descoberta/confiança' },
  { name: 'Comparativo sem torcida', audienceInput: 'duas opções e critério prioritário', valueDelivery: 'quadro comparativo com contexto e trade-offs', cta: 'Baixe a checklist gratuita; links comerciais têm disclosure.', journeyStage: 'consideração' },
  { name: 'Boletim de contexto', audienceInput: 'pergunta recorrente ou mudança documentada', valueDelivery: 'resumo datado, fontes e o que ainda não se sabe', cta: 'Assine a lista para receber a atualização documentada.', journeyStage: 'retenção' },
  { name: `Pergunte à ${seed.name}`, audienceInput: 'comentários e respostas anonimizadas', valueDelivery: 'explicação didática sem inventar vivência', cta: 'Comente o critério que você quer entender.', journeyStage: 'comunidade' },
];

export function farmProfile(seed: InfluencerSeed): Profile {
  if (seed.status !== 'selected') throw new Error('seed_not_selected');
  const characterBible = makeCharacterBible(seed);
  const matrix = claimMatrix();
  const plan: EditorialPlan = {
    ninetyDays: { days1to30: 'validar perguntas e formato proprietário', days31to60: 'aprofundar séries e capturar e-mail', days61to90: 'avaliar retenção, saves, shares, CTR e qualidade da audiência', cadence: '2 peças de valor + 1 boletim por semana; ajustar após evidência' },
    topics: topics(seed), formats: formats(seed), ownAsset: 'checklist comparativa + lista de e-mail, ambos sujeitos a revisão humana',
  };
  const monetizationHypothesis: MonetizationHypothesis = {
    primary: 'afiliado ou produto próprio relevante ao problema, somente após conteúdo útil',
    secondary: ['lead magnet e lista própria', 'publicidade contextual identificada'],
    naturalMoment: 'depois de explicar critérios e alternativas, nunca como ponto de partida',
    freeValue: 'checklists, comparativos e fontes abertas',
    honestTest: 'A opção continua útil e coerente sem comissão? sim; validar com audiência.',
    risks: ['comissão pode enviesar recomendação', 'produto pode não ter fonte suficiente'],
  };
  return {
    id: `profile_${seed.id}`, seedId: seed.id, name: seed.name, brand: `${seed.name} Authority`,
    bio: `${seed.promise} por meio de pesquisa, curadoria e análise. ${AI_LABEL}.`, disclosure: `${AI_LABEL}. A responsabilidade editorial real é a FBR. Conteúdo comercial e links de afiliado serão identificados próximos à recomendação.`,
    thesis: seed.thesis, promise: seed.promise, mentorRole: 'mentor', archetype: seed.archetype, traits: seed.traits,
    decisionCompass: seed.decisionCompass, not: seed.not, backstory: seed.backstory,
    authorityMethod: 'pesquisa, comparação, fontes verificáveis, explicação do porquê e explicitação de limitações; sem alegar uso pessoal, corpo ou credencial.',
    voice: { tone: seed.voice, vocabulary: characterBible.voice.vocabulary, prohibited: characterBible.voice.prohibitedPhrases },
    visual: { style: 'fotorrealista editorial; identidade original; nunca likeness de pessoa real', palette: characterBible.appearance.palette, continuity: 'character-lock versionado; núcleo estático e superfície dinâmica', anchorFace: characterBible.appearance.facialAnchor, signatureTrait: characterBible.appearance.signatureTrait, prompts: [characterBible.prompts.base, ...characterBible.prompts.context] },
    pillars: [`fundamentos de ${seed.problem}`, 'comparações e decisões', 'tendências e contexto', 'alfabetização de evidência'], formats: [...new Set([...seed.formats, ...plan.formats.map((f) => f.name)])],
    guardrails: ['declarar IA', 'persona é Mentor e leitor é protagonista', 'núcleo estático; superfície dinâmica dentro dos valores', 'não inventar experiência pessoal ou testemunho corporal', 'não fabricar credenciais', 'não sexualizar nem estereotipar herança', 'não difamar', 'disclosure próximo a link comercial', 'tema sensível encaminha a profissional qualificado'],
    claims: { allowed: matrix.filter((c) => c.class === 'allowed').map((c) => c.claim), soften: matrix.filter((c) => c.class === 'soften').map((c) => c.claim), prohibited: matrix.filter((c) => c.class === 'prohibited').map((c) => c.claim) },
    aboutPage: `${AI_LABEL}. ${seed.name} é um Mentor editorial ficcional: organiza pesquisa para que o leitor seja o protagonista da decisão. Não é uma pessoa real, não possui experiência corporal, credencial ou testemunho próprio. A responsabilidade editorial é da FBR; recomendações comerciais e afiliadas serão identificadas.`,
    footerDisclaimer: 'Conteúdo editorial e informativo. Verifique fontes, datas e especificações. Não é aconselhamento profissional. Quando aplicável, procure profissional qualificado. Links comerciais/afiliados serão informados próximos ao link.',
    monetizationModel: monetizationHypothesis.secondary.concat([monetizationHypothesis.primary]), status: 'review', characterBible, claimMatrix: matrix, editorialPlan: plan, monetizationHypothesis,
  };
}

export function validatePersonaForReview(profile: Profile): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!profile.seedId || !profile.id.startsWith('profile_')) reasons.push('missing_seed_reference');
  if (profile.mentorRole !== 'mentor' || !profile.characterBible.staticCore.readerIsProtagonist) reasons.push('mentor_reader_contract');
  if (profile.traits.length < 3 || profile.characterBible.staticCore.tensions.length < 3) reasons.push('persona_flat');
  if (!profile.promise || /garant|cura|prazo/i.test(profile.promise)) reasons.push('unsafe_promise');
  if (!profile.visual.anchorFace || !profile.visual.signatureTrait || !/fotorrealista/i.test(profile.visual.style)) reasons.push('missing_visual_contract');
  if (!profile.disclosure.includes('inteligência artificial') || !profile.characterBible.aiDisclosure.label.includes('IA')) reasons.push('missing_ai_disclosure');
  if (profile.pillars.length < 3 || profile.editorialPlan.topics.length < 10 || profile.editorialPlan.formats.length < 2) reasons.push('insufficient_editorial_system');
  if (!profile.guardrails.includes('não inventar experiência pessoal ou testemunho corporal')) reasons.push('missing_body_testimonial_guardrail');
  if (profile.claimMatrix.some((c) => !c.source || !c.asOf || !c.limitation)) reasons.push('claim_without_traceability');
  if (!profile.claims.prohibited.some((c) => /cura/i.test(c)) || !profile.claims.prohibited.some((c) => /garantia/i.test(c))) reasons.push('missing_prohibited_claims');
  return { valid: reasons.length === 0, reasons };
}

export function createFluxHandoff(profile: Profile, context: { niche: string; audience: string; problem: string; evidence?: string[] }): FluxHandoff {
  const validation = validatePersonaForReview(profile);
  const evidence = context.evidence ?? ['S2 seed e evidências da oportunidade devem ser anexados pelo Flux'];
  return {
    id: `handoff_${profile.id}`, version: 's3-handoff-v1.0', status: validation.valid ? 'handoff_review' : 'blocked',
    decisionRequired: 'Sergio deve selecionar esta opção para aprofundamento; isto não abre projeto, publicação, gasto ou conta.',
    optionVsProject: 'Opção de oportunidade + persona + briefing; não é marca/projeto aprovado nem autorização operacional.',
    input: { profileId: profile.id, seedId: profile.seedId, niche: context.niche, audience: context.audience, problem: context.problem },
    done: ['perfil-base', 'Character Bible versionado', 'plano editorial de 90 dias', 'matriz de claims e disclosures', 'hipótese de monetização'],
    artifacts: ['Profile', 'CharacterBible', 'claimMatrix', 'editorialPlan', 'monetizationHypothesis'],
    risks: ['imagem real bloqueada sem provedor configurado', 'fontes e decisão de Sergio pendentes', ...profile.monetizationHypothesis.risks],
    hypotheses: ['a audiência responderá às séries propostas', 'checklist aumentará captura de ativo próprio', 'oferta relevante converterá sem promessa agressiva'],
    metrics: ['saves por peça', 'shares por peça', 'CTR', 'inscrições de e-mail', 'qualidade das perguntas', 'conversão por recomendação; seguidores não são critério único'],
    owner: 'Flux (a definir após seleção humana)', next: { agent: 'Sergio', task: 'selecionar, ajustar ou arquivar a opção', gate: 'P1 — seleção humana antes do handoff operacional' }, evidence,
  };
}

export function createFailClosedVisualProvider(): VisualAssetProvider {
  return { name: 'unconfigured-visual-provider', configured: false, async generate() { throw new Error('visual_provider_not_configured'); } };
}

export async function generateAnchorImage(profile: Profile, provider: VisualAssetProvider = createFailClosedVisualProvider()): Promise<{ assetId: string; uri: string }> {
  if (!provider.configured) throw new Error('visual_provider_not_configured');
  return provider.generate({ profileId: profile.id, prompt: profile.characterBible.prompts.base });
}
