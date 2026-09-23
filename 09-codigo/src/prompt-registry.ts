import { SEED_GENERATION_PROMPT } from './services/influencer-seeds.js';

export interface PromptConfig {
  key: string;
  title: string;
  category: 'radar' | 'seeds' | 'farmer' | 'postmachine' | 'evaluation';
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  promptTemplate: string;
  availableVariables: Array<{ name: string; description: string; example: string }>;
  expectedSchema?: Record<string, unknown>;
  version: number;
  updatedAt: string;
  updatedBy: string;
  isDefault: boolean;
}

export const DEFAULT_PROMPTS: Record<string, Omit<PromptConfig, 'version' | 'updatedAt' | 'updatedBy' | 'isDefault'>> = {
  seeds_creator: {
    key: 'seeds_creator',
    title: 'Influencer Seeds Creator — Geração de Sementes',
    category: 'seeds',
    description: 'Transforma pesquisa de mercado e dores da audiência em 3 a 6 personas de autoridade Mentor estruturadas.',
    model: 'gpt-4o-mini',
    temperature: 0.65,
    maxTokens: 3000,
    promptTemplate: SEED_GENERATION_PROMPT.trim(),
    availableVariables: [
      { name: 'niche', description: 'Nicho pesquisado', example: 'Saúde & Óptica' },
      { name: 'subniche', description: 'Subnicho específico', example: 'Lentes para Luz Azul' },
      { name: 'audience', description: 'Público-alvo', example: 'Profissionais de tela' },
      { name: 'problem', description: 'Principal dor resolvida', example: 'Fadiga ocular no trabalho' },
      { name: 'marketData', description: 'Dados e evidências coletadas', example: 'Produtos mais vendidos e dúvidas frequentes' },
    ],
    expectedSchema: {
      seeds: [{
        name: 'string',
        archetype: 'string',
        thesis: 'string',
        promise: 'string',
        intellectualTraits: ['string'],
        traits: ['string'],
        physicalIdentity: { apparentAgeRange: 'string', presentation: 'string', faceAnchor: 'string', wardrobe: 'string', credibilitySettings: ['string'] },
        voice: 'string',
        contentPillars: ['string'],
        formats: ['string'],
        risks: ['string'],
        guardrails: ['string']
      }]
    },
  },

  opportunity_research: {
    key: 'opportunity_research',
    title: 'Audience Radar — Pesquisa Profunda de Oportunidades',
    category: 'radar',
    description: 'Analisa termos de busca, tendências e produtos para identificar lacunas editoriais e de mercado.',
    model: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 2500,
    promptTemplate: `Você é o pesquisador de inteligência de mercado da FBR Agency.
Analise a oportunidade de nicho fornecida e identifique:
1. Dores reais e frustrações da audiência;
2. Lacunas de conteúdo não atendidas pelos concorrentes atuais;
3. Termos de alta intenção comercial e busca informativa;
4. Produtos e soluções existentes com pontos fortes e fracos;
5. Riscos éticos, regulatórios ou de alegações sensíveis.

Classifique cada achado explicitamente como "fato" (sustentado por dados) ou "hipótese" (a validar).
Retorne SOMENTE JSON no schema solicitado.`,
    availableVariables: [
      { name: 'niche', description: 'Nicho alvo', example: 'Ergonomia para Home Office' },
      { name: 'products', description: 'Lista de produtos mapeados', example: 'Cadeiras ergonômicas, suportes articulados' },
      { name: 'trends', description: 'Sinais de busca e tendências', example: 'Crescimento de busca por dor lombar home office' },
    ],
  },

  character_bible: {
    key: 'character_bible',
    title: 'Influencer Farmer — Character Bible & Identidade Narrativa',
    category: 'farmer',
    description: 'Desenvolve o núcleo estático e a superfície dinâmica da Persona Mentor (voz, valores, tensões e bússola de decisão).',
    model: 'gpt-4o-mini',
    temperature: 0.6,
    maxTokens: 3500,
    promptTemplate: `Você é o autor do Character Bible de personas de autoridade da FBR.
Com base na Seed selecionada, desenvolva o Character Bible completo:
- Núcleo Estático: tese central, promessa imutável, valores inegociáveis, 3 tensões internas reais, o que a persona NUNCA faz;
- Superfície Dinâmica: tópicos de adaptação contemporânea, vocabulário característico, expressões proibidas;
- Tom de Voz: autoritativo, empático, didático e fundamentado em evidências;
- Regras de IA Disclosure: transparência obrigatória sobre ser uma persona sintética operada pela FBR.

A persona é estritamente MENTOR e o leitor é o PROTAGONISTA da jornada.
Retorne SOMENTE JSON.`,
    availableVariables: [
      { name: 'seedName', description: 'Nome da semente escolhida', example: 'Dra. Nadia Brandão' },
      { name: 'archetype', description: 'Arquétipo estratégico', example: 'Especialista Científica' },
      { name: 'thesis', description: 'Tese central de autoridade', example: 'Proteção visual preventiva baseada em estudos' },
    ],
  },

  physical_identity: {
    key: 'physical_identity',
    title: 'Influencer Farmer — Physical & Visual Identity Prompts',
    category: 'farmer',
    description: 'Gera prompts de imagem consistentes, paleta de cores, âncora facial e ambientes de credibilidade.',
    model: 'gpt-4o-mini',
    temperature: 0.4,
    maxTokens: 2000,
    promptTemplate: `Você é o diretor de arte e identidade visual de personas de autoridade da FBR.
Crie as diretrizes de prompt para geração de imagens consistentes e fotorrealistas:
- Estilo: fotorrealismo editorial, iluminação suave e natural, fotografia profissional de estúdio;
- Âncora Facial: traços distintivos não copiados de pessoas reais, consistência de feição;
- Vestuário: roupas condizentes com a autoridade técnica sem ostentação;
- Cenários de Credibilidade: ambientes de trabalho reais (bancada técnica, estúdio médico, biblioteca);
- Negative Prompts Obrigatórios: "overly-sexualized, cartoon, 3d render, deformed, duplicate, generic stock photo, unnatural smile".

Retorne SOMENTE JSON.`,
    availableVariables: [
      { name: 'personaName', description: 'Nome da Persona', example: 'Dra. Nadia Brandão' },
      { name: 'archetype', description: 'Arquétipo da Persona', example: 'Mentor Científico' },
    ],
  },

  post_machine_draft: {
    key: 'post_machine_draft',
    title: 'Post Machine — Redação de Draft Editorial na Voz da Persona',
    category: 'postmachine',
    description: 'Produz artigos, roteiros e posts estruturados respeitando a voz da persona, claims permitidos e disclosure de IA.',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 3000,
    promptTemplate: `Você é o redator oficial da persona {{personaName}}, da FBR Agency.
Escreva um conteúdo editorial completo para o canal {{channel}} sobre o tema: "{{topic}}".

Diretrizes obrigatórias:
1. Tom de Voz: {{voiceTone}}.
2. Fontes & Evidências: Baseie todos os argumentos nas fontes verificadas do briefing.
3. Matriz de Claims: NUNCA faça alegações proibidas (ex: curas milagrosas, promessas infundadas). Use apenas claims autorizados.
4. Estrutura: Gancho instigante -> Contexto do problema -> Critérios de decisão -> Recomendações comparativas -> CTA consciente.
5. Disclosure: Inclua sempre ao final a declaração de transparência de persona sintética e links de afiliação se aplicável.

Retorne SOMENTE JSON com título, corpo completo, resumo/legenda, CTA e fontes citadas.`,
    availableVariables: [
      { name: 'personaName', description: 'Nome da Persona', example: 'Dra. Nadia Brandão' },
      { name: 'topic', description: 'Tema ou pauta da publicação', example: 'Filtro de Luz Azul: Quando realmente vale a pena?' },
      { name: 'channel', description: 'Canal de destino', example: 'Blog / Artigo Completo' },
      { name: 'voiceTone', description: 'Tom de voz da Persona', example: 'Científico, acolhedor e direto' },
      { name: 'sources', description: 'Evidências do briefing', example: 'Estudo clínico 2025, testes laboratoriais' },
    ],
  },

  score_evaluator: {
    key: 'score_evaluator',
    title: 'Score Evaluator — Avaliação de Oportunidades e Consistência',
    category: 'evaluation',
    description: 'Calcula notas ponderadas de 0 a 10 nas 7 dimensões do PRD para qualificação de oportunidades.',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    maxTokens: 1500,
    promptTemplate: `Você é o auditor de scoring e conformidade do Authority Engine.
Avalie a oportunidade nas seguintes 7 dimensões (0.0 a 10.0):
1. autoridade (potencial de construção de marca respeitada);
2. audiência (volume de busca e dores legítimas);
3. diferenciação (espaço contra os players existentes);
4. conteúdo (profundidade de tópicos a cobrir em 90 dias);
5. conformidade (segurança jurídica e facilidade de manter claims éticos);
6. viabilidade (facilidade de monetização ética com produtos reais);
7. risco (penalidade para nichos altamente regulados ou de alto atrito).

Forneça a nota final e a justificativa para cada dimensão.
Retorne SOMENTE JSON.`,
    availableVariables: [
      { name: 'opportunityTitle', description: 'Título da oportunidade', example: 'Lentes e Cuidados Oculares' },
      { name: 'evidenceSummary', description: 'Resumo das evidências', example: 'Múltiplos produtos em alta demanda na Amazon' },
    ],
  },
};

export class PromptRegistry {
  private readonly customPrompts = new Map<string, PromptConfig>();

  constructor(initialData: PromptConfig[] = []) {
    for (const prompt of initialData) {
      this.customPrompts.set(prompt.key, prompt);
    }
  }

  list(): PromptConfig[] {
    const keys = Object.keys(DEFAULT_PROMPTS);
    return keys.map((key) => this.get(key));
  }

  get(key: string): PromptConfig {
    if (this.customPrompts.has(key)) {
      return structuredClone(this.customPrompts.get(key)!);
    }
    const defaultDef = DEFAULT_PROMPTS[key];
    if (!defaultDef) {
      throw new Error(`prompt_not_found:${key}`);
    }
    return {
      ...defaultDef,
      version: 1,
      updatedAt: '2026-09-22T00:00:00.000Z',
      updatedBy: 'system-default',
      isDefault: true,
    };
  }

  update(key: string, patch: Partial<PromptConfig>, author = 'system-user'): PromptConfig {
    const current = this.get(key);
    const updated: PromptConfig = {
      ...current,
      title: patch.title ?? current.title,
      description: patch.description ?? current.description,
      model: patch.model ?? current.model,
      temperature: typeof patch.temperature === 'number' ? Math.max(0, Math.min(1, patch.temperature)) : current.temperature,
      maxTokens: typeof patch.maxTokens === 'number' ? Math.max(100, patch.maxTokens) : current.maxTokens,
      promptTemplate: patch.promptTemplate ?? current.promptTemplate,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: author,
      isDefault: false,
    };
    this.customPrompts.set(key, updated);
    return structuredClone(updated);
  }

  reset(key: string): PromptConfig {
    this.customPrompts.delete(key);
    return this.get(key);
  }
}
