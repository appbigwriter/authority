import type { Opportunity } from './types.js';
import type { OpportunityResearch } from './types-extended.js';
import type { Evidence } from './types.js';

export interface LocalResearchBrief {
  id: string; tenantId: string; ownerId: string; market: string; language: string; niche: string;
  subniche: string; audience: string; problem: string; objective: string; status: 'created' | 'researching' | 'analyzed' | 'blocked';
  createdAt: string;
}
export interface LocalResearchRun extends OpportunityResearch {
  briefId: string; tenantId: string; ownerId: string; mode: 'DEMO' | 'MANUAL' | 'MIXED';
  limitations: string[]; heartbeatAt: string;
}

const now = () => new Date().toISOString();
const evidence = (source: string, observation: string, kind: Evidence['kind'] = 'fact'): Evidence => ({ source, accessedAt: now(), observation, kind, limitation: 'Deterministic local fixture; not live market evidence.' });

export function createLocalBrief(input: Omit<LocalResearchBrief, 'id' | 'createdAt' | 'status'>): LocalResearchBrief {
  for (const key of ['tenantId', 'ownerId', 'market', 'language', 'niche', 'subniche', 'audience', 'problem', 'objective'] as const) if (!input[key].trim()) throw new Error(`${key}_required`);
  return { ...input, id: `brief_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: now(), status: 'created' };
}

export function runLocalResearch(brief: LocalResearchBrief, opportunity: Opportunity): { run: LocalResearchRun; dossier: Record<string, unknown> } {
  const run: LocalResearchRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, briefId: brief.id, opportunityId: opportunity.id,
    tenantId: brief.tenantId, ownerId: brief.ownerId, mode: 'DEMO', status: 'completed', createdAt: now(), heartbeatAt: now(),
    limitations: ['DEMO fixture only', 'No external provider, spend, credentials or live claims'],
    research: { marketSize: 'hipótese: mercado local de teste', trends: ['clareza visual no ponto de venda'], competitors: ['referências não coletadas no modo DEMO'], keywords: [brief.niche, brief.subniche], audienceInsights: [brief.audience], contentGaps: [brief.problem], monetizationPaths: ['conteúdo editorial e produto próprio, sujeito a validação'], },
    sources: [{ title: 'SharpEye local fixture', url: 'fixture://sharpeye/store-signs', type: 'marketplace' }],
  };
  const facts = [evidence(run.sources[0]!.url, 'Fixture local contém registros demonstrativos para pesquisa.')];
  const hypotheses = [evidence('local-analysis', `Hipótese de lacuna: ${brief.problem}`, 'hypothesis')];
  const dossier = { id: `dossier_${opportunity.id}`, tenantId: brief.tenantId, ownerId: brief.ownerId, opportunityId: opportunity.id, generatedAt: now(), recommendation: 'review', facts, hypotheses, recommendations: [evidence('local-analysis', 'Validar com fonte autorizada antes de qualquer decisão.', 'recommendation')], risks: [evidence('local-analysis', 'DEMO não prova demanda real.', 'risk')], blockers: [], evidence: [...facts, ...hypotheses], freeAlternatives: ['Pesquisa manual documentada'], pendingDecision: 'Revisão humana necessária', score: opportunity.scores, handoff: { target: 'influencer-seeds-creator', ready: false, inputs: [run.id] } };
  return { run, dossier };
}
