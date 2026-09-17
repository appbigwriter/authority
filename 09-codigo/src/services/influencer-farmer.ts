import type { InfluencerSeedFull, FarmerProfile } from '../types-extended.js';

const CREDIBILITY_SETTINGS = [
  'bancada de testes com equipamentos visíveis',
  'escritório com certificados/prêmios discretos',
  'biblioteca técnica visível ao fundo',
  'bancada de trabalho com ferramentas do nicho',
  'setup de demonstração de produtos',
  'quadro de planejamento/roadmap visível',
  'certificações/credenciais em moldura discreta',
  'equipamento de medição/teste à mão',
];

const CREDIBILITY_LOCATIONS = [
  'home office organizado com iluminação profissional',
  'estúdio compacto com fundo neutro',
  'bancada de laboratório/testes',
  'escritório minimalista com biblioteca técnica',
  'setup de demonstração em ambiente real',
  'cozinha/atelier para nichos lifestyle',
  'garagem/oficina para nichos técnicos',
  'espaço ao ar livre para nichos outdoor',
];

const CROSS_CUTTING_THEMES = [
  'decisão baseada em critério, não impulso',
  'qualidade vs preço: o que realmente importa',
  'armadilhas de marketing vs realidade técnica',
  'critério de rejeição: o que NÃO comprar',
  'setup ideal vs setup realista',
  'manutenção e longevidade do investimento',
  'alternativas gratuitas ou de menor custo',
  'critério de upgrade: quando realmente trocar',
  'verificação de claims: o que o fabricante omite',
  'checklist pré-compra para evitar arrependimento',
];

export function createFarmerProfile(
  seed: InfluencerSeedFull,
  selectedThemes: string[] = []
): FarmerProfile {
  const credibilitySettings = selectCredibilitySettings(seed.archetype, 3);
  const credibilityLocations = selectCredibilityLocations(seed.archetype, 2);
  const themes = selectedThemes.length ? selectedThemes : selectCrossCuttingThemes(seed, 5);

  return {
    id: `profile_${seed.id}`,
    seedId: seed.id,
    name: seed.name,
    brand: `${seed.name} Authority`,
    bio: `${seed.promise} por meio de ${seed.function.toLowerCase()}. Persona editorial criada com inteligência artificial.`,
    disclosure: 'Persona editorial criada com inteligência artificial. O responsável editorial real é a FBR. Conteúdo pode conter links de afiliado quando indicado.',
    thesis: seed.thesis,
    promise: seed.promise,
    mentorRole: 'mentor',
    archetype: seed.archetype,
    traits: seed.traits,
    decisionCompass: seed.decisionCompass,
    not: seed.not,
    backstory: seed.backstory,
    authorityMethod: `pesquisa, ${seed.function.toLowerCase()}, fontes verificáveis, explicação do porquê e explicitação de limitações`,
    voice: {
      tone: seed.voice,
      vocabulary: ['evidência', 'função', 'contexto', 'alternativa', 'limitação', 'critério', 'decisão'],
      prohibited: ['cura', 'garantia', 'resultado garantido', 'eu usei', 'meu corpo', 'testei por semanas'],
    },
    visual: {
      style: 'fotorrealista, editorial, --style raw; nunca ilustrativo ou passado por pessoa real',
      palette: 'definir em identidade própria, distinta das outras marcas da rede',
      continuity: 'seed/character-lock versionado a partir do retrato-âncora aprovado',
      anchorFace: seed.anchorFace,
      signatureTrait: seed.signatureTrait,
      prompts: [
        'retrato editorial frontal',
        'persona em contexto do nicho',
        'persona apresentando produto sem testemunho pessoal',
        'close-up demonstrando ferramenta/produto',
        'ambiente de credibilidade: ' + credibilityLocations[0],
      ],
      credibilitySettings,
      credibilityLocations,
    },
    pillars: seed.formats.map(f => f.charAt(0).toUpperCase() + f.slice(1)),
    formats: seed.formats,
    guardrails: [
      'declarar IA',
      'persona é Mentor e leitor é protagonista',
      'núcleo estático; superfície dinâmica dentro dos valores',
      'não inventar experiência pessoal',
      'não fabricar credenciais',
      'não sexualizar',
      'não estereotipar herança',
      'disclosure próximo a link comercial',
      'claims apenas com fonte e data',
      'alternativa gratuita sempre que possível',
    ],
    claims: {
      allowed: ['comparação de especificações verificáveis', 'opinião editorial identificada', 'curadoria baseada em fontes'],
      soften: ['estudos sugerem', 'pode ajudar', 'há sinais de', 'indicações preliminares'],
      prohibited: ['cura', 'garantia', 'resultado fabricado', 'testemunho corporal', 'credencial falsa', 'elimina em X dias'],
    },
    aboutPage: `Esta é uma persona editorial ficcional criada com inteligência artificial e identificada como IA. Ela organiza pesquisa e ${seed.function.toLowerCase()} para ajudar o leitor. A responsabilidade editorial é da FBR. Recomendações comerciais serão identificadas.`,
    footerDisclaimer: 'Conteúdo editorial e informativo. Verifique fontes e especificações. Quando houver link de afiliado, isso será informado próximo ao link. Não substitui orientação profissional quando aplicável.',
    monetizationModel: ['produto próprio relevante', 'afiliado relevante', 'lista de e-mail', 'publicidade contextual'],
    crossCuttingThemes: themes,
    socialContentIdeas: generateSocialIdeas(seed),
    weeklyContentPlan: generateWeeklyPlan(seed),
    status: 'development',
    createdAt: new Date().toISOString(),
  };
}

function selectCredibilitySettings(archetype: string, count: number): string[] {
  const mapping: Record<string, string[]> = {
    'curadora/testadora': ['bancada de testes com equipamentos visíveis', 'setup de demonstração de produtos', 'equipamento de medição/teste à mão'],
    'especialista-próxima': ['bancada de trabalho com ferramentas do nicho', 'certificações/credenciais em moldura discreta', 'bancada de testes com equipamentos visíveis'],
    'consultora-visionária': ['quadro de planejamento/roadmap visível', 'escritório com certificados/prêmios discretos', 'biblioteca técnica visível ao fundo'],
    'amiga-que-faz-a-lição': ['cozinha/atelier para nichos lifestyle', 'escritório minimalista com biblioteca técnica', 'setup de demonstração em ambiente real'],
    'sábio-explicador': ['biblioteca técnica visível ao fundo', 'escritório com certificados/prêmios discretos', 'quadro de planejamento/roadmap visível'],
    'guardião-protetor': ['equipamento de medição/teste à mão', 'bancada de testes com equipamentos visíveis', 'certificações/credenciais em moldura discreta'],
  };
  const list = mapping[archetype] || CREDIBILITY_SETTINGS;
  return list.slice(0, count);
}

function selectCredibilityLocations(archetype: string, count: number): string[] {
  const mapping: Record<string, string[]> = {
    'curadora/testadora': ['bancada de laboratório/testes', 'setup de demonstração em ambiente real'],
    'especialista-próxima': ['garagem/oficina para nichos técnicos', 'bancada de laboratório/testes'],
    'consultora-visionária': ['escritório minimalista com biblioteca técnica', 'home office organizado com iluminação profissional'],
    'amiga-que-faz-a-lição': ['cozinha/atelier para nichos lifestyle', 'home office organizado com iluminação profissional'],
    'sábio-explicador': ['biblioteca técnica visível ao fundo', 'escritório minimalista com biblioteca técnica'],
    'guardião-protetor': ['bancada de laboratório/testes', 'setup de demonstração em ambiente real'],
  };
  const list = mapping[archetype] || CREDIBILITY_LOCATIONS;
  return list.slice(0, count);
}

function selectCrossCuttingThemes(seed: InfluencerSeedFull, count: number): string[] {
  const relevant = CROSS_CUTTING_THEMES.filter(t => {
    const text = `${seed.problem} ${seed.archetype} ${seed.formats.join(' ')}`.toLowerCase();
    return t.split(' ').some(w => text.includes(w.toLowerCase()));
  });
  return [...new Set([...relevant, ...CROSS_CUTTING_THEMES])].slice(0, count);
}

function generateSocialIdeas(seed: InfluencerSeedFull) {
  const base = seed.problem;
  return {
    blog: [
      `Por que seu ${base} não funciona mais (e o que fazer)`,
      `Comparativo: as 3 melhores opções para ${base} em 2024`,
      `O que ninguém te conta sobre ${base}`,
      `Checklist: ${base} - o que verificar antes de comprar`,
    ],
    video: [
      `Teardown: testei 5 soluções para ${base}`,
      `Por que seu ${base} parou de funcionar`,
      `Setup ideal vs realista para ${base}`,
    ],
    shorts: [
      `Erro #1 ao escolher ${base}`,
      `30 segundos: o critério que muda tudo`,
      `Alternativa grátis para ${base}`,
    ],
    stories: [
      `Enquete: qual seu maior problema com ${base}?`,
      `Bastidores: como testamos ${base}`,
      `Dica rápida: sinal de alerta em ${base}`,
    ],
  };
}

function generateWeeklyPlan(seed: InfluencerSeedFull) {
  const baseTopics = seed.formats;
  const weeks = 4;
  return Array.from({ length: weeks }, (_, i) => {
    const week = i + 1;
    return {
      week,
      themes: [`Fundamentos semana ${week}`, `Aplicação prática ${week}`, `Decisão avançada ${week}`],
      blogTopics: [
        `${seed.problem}: fundamentos semana ${week}`,
        `Comparativo prático: ${seed.formats[i % seed.formats.length]}`,
      ],
      videoTopics: [
        `Teardown semana ${week}: ${baseTopics[i % baseTopics.length]}`,
      ],
      shortsTopics: [
        `Dica rápida ${week}: critério de escolha`,
        `Erro comum ${week}: o que evitar`,
      ],
      storiesTopics: [
        `Enquete semana ${week}`,
        `Bastidores: teste da semana ${week}`,
      ],
    };
  });
}