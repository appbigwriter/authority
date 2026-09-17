import type { Opportunity, OpportunityResearch } from './types.js';
import type { OpportunityResearch as ExtResearch } from './types-extended.js';

const RESEARCH_PROMPT = `
Você é um analista de mercado especializado em descobrir oportunidades de nicho para criação de personas de autoridade.
Dados de entrada: nicho, subnicho, problema e audiência.

Sua tarefa: realizar pesquisa profunda e retornar um relatório estruturado em JSON válido com exatamente estes campos:
{
  "marketSize": "string - tamanho estimado do mercado e potencial",
  "trends": ["string - lista de tendências atuais"],
  "competitors": ["string - principais referências/concidentes no nicho"],
  "keywords": ["string - palavras-chave de busca com intenção"],
  "audienceInsights": ["string - dores, desejos e comportamentos da audiência"],
  "contentGaps": ["string - lacunas de conteúdo não atendidas"],
  "monetizationPaths": ["string - caminhos viáveis de monetização"],
  "sources": [{"title": "string", "url": "string", "type": "web|marketplace|social"}]
}

Regras:
- Seja específico, não genérico.
- Se não houver dados reais, marque como "hipótese: ...".
- Não invente métricas falsas.
- Foque em produtos físicos demonstráveis, não suplementos/claims de saúde.
`

export async function researchOpportunityWithLLM(opportunity: Opportunity): Promise<ExtResearch> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY_NOT_CONFIGURED');
  }

  const prompt = `${RESEARCH_PROMPT}\n\nDados:\n- Nicho: ${opportunity.niche}\n- Subnicho: ${opportunity.subniche}\n- Problema: ${opportunity.problem}\n- Audiência: ${opportunity.audience}\n\nRetorne APENAS o JSON válido.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RESEARCH_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM_API_ERROR: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('EMPTY_LLM_RESPONSE');

    const parsed = JSON.parse(content);
    return {
      id: `research_${Date.now()}`,
      opportunityId: opportunity.id,
      research: parsed,
      sources: parsed.sources || [],
      createdAt: new Date().toISOString(),
      status: 'completed',
    };
  } catch (error) {
    return {
      id: `research_${Date.now()}`,
      opportunityId: opportunity.id,
      research: {
        marketSize: `hipótese: erro na pesquisa - ${error}`,
        trends: [],
        competitors: [],
        keywords: [],
        audienceInsights: [],
        contentGaps: [],
        monetizationPaths: [],
      },
      sources: [],
      createdAt: new Date().toISOString(),
      status: 'failed',
    };
  }
}

export function createResearchRecord(store: any, research: ExtResearch) {
  return store.append('research', research);
}