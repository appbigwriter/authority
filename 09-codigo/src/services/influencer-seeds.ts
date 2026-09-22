import type { OpportunityResearch as ExtResearch, InfluencerSeedFull, SeedArchetype } from '../types-extended.js';
export const SEED_GENERATION_PROMPT = `
Você é o estrategista de personas de autoridade da FBR Agency.
Sua tarefa é transformar uma pesquisa profunda de audiência em sementes de personas exploráveis, não em personagens genéricos.

Para cada semente, descreva:
- o encaixe com o público, problema e lacunas da pesquisa;
- arquétipo, tese, promessa, função editorial e diferenciação;
- características intelectuais: modo de raciocinar, repertório, critérios, tensões e limites epistemológicos;
- características físicas e visuais: faixa aparente, apresentação, âncora facial não-identificável, silhueta, guarda-roupa, ambientes de credibilidade e elementos de continuidade;
- voz, pilares, formatos, riscos, claims proibidos e disclosure de persona sintética.

Regras:
- gere de 3 a 6 sementes realmente diferentes entre si;
- não use experiência pessoal, credenciais, testemunhos corporais ou autoridade inventada;
- não clone pessoas reais e não determine etnia/ancestralidade como atalho de autoridade;
- características físicas devem servir à continuidade visual e à linguagem editorial, nunca a estereótipos;
- se a pesquisa não sustentar uma afirmação, escreva "hipótese";
- responda SOMENTE JSON válido, sem markdown.

Schema obrigatório:
{
  "seeds": [{
    "name": "string",
    "archetype": "string",
    "audienceFit": "string",
    "positioning": "string",
    "function": "string",
    "thesis": "string",
    "promise": "string",
    "intellectualTraits": ["string"],
    "traits": ["string"],
    "physicalIdentity": {"apparentAgeRange":"string","presentation":"string","faceAnchor":"string","silhouette":"string","wardrobe":"string","credibilitySettings":["string"],"credibilityLocations":["string"]},
    "voice": "string",
    "contentPillars": ["string"],
    "formats": ["string"],
    "differentiation": "string",
    "risks": ["string"],
    "guardrails": ["string"]
  }]
}`;

export function buildSeedGenerationPrompt(input: any): string {
  return `${SEED_GENERATION_PROMPT}\n\nCONTEXTO DA OPORTUNIDADE:\n${JSON.stringify(input, null, 2)}\n\nRetorne apenas o JSON do schema obrigatório.`;
}

function seedIdPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'seed';
}

export async function generateSeedProfilesWithLLM(input: any): Promise<any[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('LLM_API_KEY_NOT_CONFIGURED');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.AUTHORITY_SEED_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: SEED_GENERATION_PROMPT }, { role: 'user', content: buildSeedGenerationPrompt(input) }],
      temperature: 0.65,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) throw new Error(`LLM_SEED_API_ERROR:${response.status}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('EMPTY_LLM_SEED_RESPONSE');
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.seeds) || parsed.seeds.length < 3) throw new Error('LLM_SEED_SCHEMA_INVALID');
  const opportunityId = input.opportunity?.id || input.opportunityId;
  const researchId = input.research?.id || input.researchId;
  return parsed.seeds.slice(0, 6).map((seed: any, index: number) => {
    const physical = seed.physicalIdentity || {};
    return {
      ...seed,
      id: `seed_${opportunityId}_${seedIdPart(seed.name || `seed-${index + 1}`)}`,
      opportunityId,
      researchRef: researchId,
      name: seed.name || `Seed ${index + 1}`,
      function: seed.function || seed.positioning || 'Traduz pesquisa em decisão editorial.',
      audience: input.opportunity?.audience || '',
      problem: input.opportunity?.problem || '',
      visualDirection: physical.credibilityLocations?.join(', ') || physical.presentation || '',
      anchorFace: physical.faceAnchor || 'âncora visual abstrata e consistente',
      signatureTrait: physical.silhouette || 'presença editorial reconhecível',
      formats: seed.formats || seed.contentPillars || [],
      status: 'proposed',
    };
  });
}


const ARCHETYPES: SeedArchetype[] = [
  {
    id: 'curator',
    name: 'Curadora/Testadora',
    archetype: 'curadora/testadora',
    description: 'Analisa e compara opções honestamente para poupar tempo e dinheiro do leitor.',
    approach: 'Triagem honesta: testa, compara e recomenda apenas o que passa no crivo.',
    strengths: ['Credibilidade por isenção', 'Economiza tempo do leitor', 'Comparação lado a lado'],
    tone: 'Assertiva, prática, transparente, sem hype',
    visualDirection: 'Ambiente de teste, bancada, ferramentas, iluminacao neutra',
    contentPillars: ['Teardown/Comparativo', 'Guia de decisão', 'Alertas de armadilhas'],
    whyThisWorks: 'O leitor confia em quem faz o trabalho pesado de filtrar o ruído.',
  },
  {
    id: 'specialist',
    name: 'Especialista-próxima',
    archetype: 'especialista-próxima',
    description: 'Competência técnica real, sem gatekeeping; a amiga que por acaso é especialista.',
    approach: 'Traduz complexidade técnica em decisão prática, com calor e rigor.',
    strengths: ['Autoridade técnica', 'Linguagem acessível', 'Confiança por proximidade'],
    tone: 'Direta, calorosa, didática, sem jargão desnecessário',
    visualDirection: 'Ambiente de trabalho real, detalhes técnicos visíveis',
    contentPillars: ['Breakdown técnico', 'Mitos vs fatos', 'Setup ideal'],
    whyThisWorks: 'Autoridade genuína sem arrogância cria conexão imediata.',
  },
  {
    id: 'visionary',
    name: 'Consultora-visionária',
    archetype: 'consultora-visionária',
    description: 'Vê o que o leitor não vê, traduz visão em resultado tangível.',
    approach: 'Diagnóstico do invisível + plano de ação claro.',
    strengths: ['Visão estratégica', 'Transforma confusão em clareza', 'Foco no resultado'],
    tone: 'Analítica, visionária, direta, sem floreios',
    visualDirection: 'Escritório minimalista, quadros de planejamento, luz natural',
    contentPillars: ['Diagnóstico estratégico', 'Roadmap de implementação', 'Métricas que importam'],
    whyThisWorks: 'Quem não sabe por onde começar segue quem já mapeou o caminho.',
  },
  {
    id: 'friend',
    name: 'Amiga-que-faz-a-lição',
    archetype: 'amiga-que-faz-a-lição',
    description: 'Calor + rigor; trata tema difícil com calma, evidência e empatia.',
    approach: 'Faz a pesquisa chata e entrega o resumo acionável com carinho.',
    strengths: ['Empatia genuína', 'Evidência sem frieza', 'Lealdade ao leitor'],
    tone: 'Acolhedora, wry, incisiva quando preciso, nunca alarmista',
    visualDirection: 'Cozinha/escritório caseiro, elementos pessoais sutis, luz quente',
    contentPillars: ['Guia prático', 'Decisões de vida', 'O que eu faria no seu lugar'],
    whyThisWorks: 'Autoridade que cuida, não que impõe.',
  },
  {
    id: 'sage',
    name: 'Sábio-explicador',
    archetype: 'sábio-explicador',
    description: 'Desmistifica o complexo, ensina o "porquê" por trás do "o quê".',
    approach: 'Explicação profunda + aplicação prática imediata.',
    strengths: ['Clareza pedagógica', 'Fundamentação sólida', 'Remove confusão'],
    tone: 'Didática, paciente, precisa, sem condescendência',
    visualDirection: 'Biblioteca/estúdio, livros, quadro branco, iluminação focada',
    contentPillars: ['Fundamentos', 'Por que funciona', 'Erros comuns'],
    whyThisWorks: 'Quem entende o "porquê" decide com autonomia.',
  },
  {
    id: 'guardian',
    name: 'Guardião-protetor',
    archetype: 'guardião-protetor',
    description: 'Ajuda o leitor a evitar erro caro, golpe ou compra arrependida.',
    approach: 'Alerta vermelho + alternativa segura + critério de decisão.',
    strengths: ['Proteção financeira', 'Alerta precoce', 'Critério de rejeição claro'],
    tone: 'Vigilante, firme, sem sensacionalismo, focado no prejuízo evitado',
    visualDirection: 'Escritório blindado, documentos, selos de verificação, tons sóbrios',
    contentPillars: ['Armadihas do mercado', 'Checklist de segurança', 'Alternativas à prova de falha'],
    whyThisWorks: 'O medo de perder dinheiro é motivador mais forte que a promessa de ganhar.',
  },
];

export function generateSeedArchetypes(research: any): SeedArchetype[] {
  const relevant = selectRelevantArchetypes(research);
  return relevant.map(a => ({ ...a }));
}

function selectRelevantArchetypes(research: any): SeedArchetype[] {
  const results: SeedArchetype[] = [];
  const researchData = research?.research || {};
  const monetization = (researchData.monetizationPaths || []).join(' ').toLowerCase();
  const problem = (researchData.contentGaps || []).join(' ').toLowerCase();
  const audience = (researchData.audienceInsights || []).join(' ').toLowerCase();

  // Sempre incluir curator como base
  const curator = ARCHETYPES.find(a => a.id === 'curator');
  if (curator) results.push(curator);

  // Lógica de seleção baseada no nicho/problema
  if (monetization.includes('caro') || monetization.includes('investimento') || problem.includes('risco') || problem.includes('golpe')) {
    const g = ARCHETYPES.find(a => a.id === 'guardian');
    if (g) results.push(g);
  }
  if (monetization.includes('técnico') || problem.includes('complexo') || audience.includes('técnico')) {
    const s = ARCHETYPES.find(a => a.id === 'specialist');
    if (s) results.push(s);
  }
  if (problem.includes('decisão') || problem.includes('escolha') || monetization.includes('estratégia')) {
    const v = ARCHETYPES.find(a => a.id === 'visionary');
    if (v) results.push(v);
  }
  if (audience.includes('vida') || audience.includes('pessoal') || problem.includes('cotidiano')) {
    const f = ARCHETYPES.find(a => a.id === 'friend');
    if (f) results.push(f);
  }
  if (problem.includes('entender') || audience.includes('iniciante') || monetization.includes('educação')) {
    const s2 = ARCHETYPES.find(a => a.id === 'sage');
    if (s2) results.push(s2);
  }

  // Garantir pelo menos 3, no máximo 5
  const unique = Array.from(new Map(results.map(r => [r.id, r])).values());
  return unique.slice(0, 5);
}

export function createSeedProfiles(
  opportunityId: string,
  opportunity: any,
  archetypes: SeedArchetype[],
  researchRef: string
): InfluencerSeedFull[] {
  return archetypes.map(arch => ({
    id: `seed_${opportunityId}_${arch.id}`,
    opportunityId,
    name: arch.name,
    archetype: arch.archetype,
    function: arch.description,
    mentorRole: 'mentor' as const,
    audience: opportunity.audience || '',
    problem: opportunity.problem || '',
    thesis: `A autoridade em ${opportunity.subniche || opportunity.niche} nasce de ${arch.approach.toLowerCase()}.`,
    promise: arch.description,
    traits: [arch.tone?.split(',')[0]?.trim() || 'assertiva', 'baseada em evidência', 'focada no leitor'],
    decisionCompass: `Esta recomendação ajuda ${opportunity.audience || 'o leitor'} a decidir melhor sem exagerar a evidência?`,
    not: ['alarmista', 'salesy', 'arrogante', 'promete resultado garantido'],
    backstory: `Construída como voz editorial de ${arch.approach.toLowerCase()} para ${opportunity.audience || 'a audiência'}.`,
    differentiation: arch.whyThisWorks,
    voice: arch.tone,
    visualDirection: arch.visualDirection,
    anchorFace: `definir: ${arch.visualDirection?.split(',')[0]?.trim() || ''}`,
    signatureTrait: arch.visualDirection?.split(',').pop()?.trim() || 'expressão de discernimento',
    formats: arch.contentPillars,
    monetizationPaths: opportunity.products?.map((p: any) => p.title) || ['produto próprio relevante', 'afiliado relevante'],
    risks: opportunity.risks || [],
    antiNetwork: ['não copia rosto', 'não copia bordões', 'não copia cadência', 'não repete paleta'],
    score: calculateSeedScore(arch, opportunity),
    status: 'proposed' as const,
    researchRef,
  }));
}

function calculateSeedScore(arch: SeedArchetype, opportunity: any): number {
  let score = 50;
  if (arch.contentPillars.length >= 3) score += 10;
  if (arch.strengths.length >= 3) score += 10;
  if (opportunity.products?.length) score += 15;
  if (opportunity.scores?.risk && opportunity.scores.risk < 40) score += 10;
  return Math.min(100, score);
}