import type { Evidence, MarketplaceAdapter, MarketplaceProduct, Opportunity, OpportunityDossier, ScoreFactor, TrendObservation, TrendSignal } from './types.js';

const now = () => new Date().toISOString();
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const sensitive = /supplement|fertility|pregnancy|mental health|medical|weight loss|drug|regulated|金融|finance|loan|crypto|gambling/i;

export function normalizeProducts(products: MarketplaceProduct[]): MarketplaceProduct[] {
  return products.map((product) => ({ ...product, title: product.title.trim(), evidence: product.evidence.map((e) => ({ ...e })), sourceRecordId: product.sourceRecordId ?? product.id }));
}

export function deduplicateProducts(products: MarketplaceProduct[]): MarketplaceProduct[] {
  const seen = new Set<string>();
  return normalizeProducts(products).filter((product) => {
    const key = `${product.marketplace}|${product.sourceRecordId ?? product.id}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function detectTrends(observations: TrendObservation[], minimumObservations = 2): TrendSignal[] {
  const groups = new Map<string, TrendObservation[]>();
  for (const item of observations) { const key = `${item.niche}|${item.subniche}|${item.query}`; groups.set(key, [...(groups.get(key) ?? []), item]); }
  return [...groups.entries()].map(([key, items]) => {
    const [niche, subniche, query] = key.split('|');
    const sufficient = items.length >= minimumObservations;
    const accessedAt = items.at(-1)?.observedAt ?? now();
    return {
      id: `trend_${Buffer.from(key).toString('base64url').slice(0, 18)}`, niche: niche ?? '', subniche: subniche ?? '', query: query ?? '',
      strength: sufficient ? clamp(items.reduce((sum, i) => sum + i.strength, 0) / items.length) : 0,
      period: `${items[0]?.observedAt ?? accessedAt}/${accessedAt}`,
      status: sufficient ? 'observed' : 'insufficient_evidence',
      evidence: items.map((item) => ({ source: item.source, accessedAt: item.observedAt, observation: `Observed signal strength ${item.strength} for query '${item.query}'.`, kind: 'fact' as const, limitation: sufficient ? undefined : `Only ${items.length} observation(s); minimum is ${minimumObservations}.` })),
    };
  });
}

function factor(value: number, definition: string, justification: string): ScoreFactor { return { value: clamp(value), definition, justification }; }

export async function createOpportunity(adapter: MarketplaceAdapter, input: { niche: string; subniche: string; problem: string; audience: string }): Promise<Opportunity> {
  if (![input.niche, input.subniche, input.problem, input.audience].every((value) => value.trim())) throw new Error('invalid_opportunity_input');
  const result = await adapter.search({ niche: input.niche, subniche: input.subniche });
  const products = deduplicateProducts(result.products);
  const trends = result.trends;
  const evidence: Evidence[] = [...products.flatMap((p) => p.evidence), ...trends.flatMap((t) => t.evidence), ...(result.sources ?? [adapter.source]).map((s) => ({ source: s.endpoint, accessedAt: s.checkedAt, observation: `${s.name}: ${s.scope}; credential status ${s.credentialStatus}.`, kind: 'fact' as const, limitation: s.limitation }))];
  const demand = clamp(trends.filter((t) => t.status !== 'insufficient_evidence').reduce((n, t) => n + t.strength, 0));
  const intent = clamp(products.length * 20);
  const productFit = products.length ? 80 : 0;
  const content = trends.some((t) => t.status === 'observed') ? 75 : 0;
  const risk = sensitive.test(`${input.niche} ${input.subniche} ${products.map((p) => p.category).join(' ')}`) ? 85 : 10;
  const authority = input.problem.length >= 20 ? 75 : 45;
  const confidence = clamp(evidence.filter((e) => e.kind === 'fact').length * 15);
  const factors = { demand: factor(demand, 'observed trend strength, 0–100', 'Sum of observed trend signals, capped at 100.'), intent: factor(intent, 'product presence, 0–100', `${products.length} normalized product(s).`), content: factor(content, 'content signal, 0–100', 'Observed trend enables editorial angle.'), productFit: factor(productFit, 'problem/product fit, 0–100', products.length ? 'At least one product is related to the query.' : 'No related product found.'), authority: factor(authority, 'ability to address problem, 0–100', input.problem.length >= 20 ? 'Problem statement is specific.' : 'Problem statement is underspecified.'), risk: factor(risk, 'claims/platform risk, 0–100', sensitive.test(`${input.niche} ${input.subniche}`) ? 'Sensitive category requires specialist/compliance review.' : 'No sensitive-category keyword detected.'), confidence: factor(confidence, 'evidence confidence, 0–100', `${evidence.filter((e) => e.kind === 'fact').length} factual evidence item(s).`) };
  const total = clamp(demand * .2 + intent * .2 + content * .15 + productFit * .15 + authority * .15 + (100 - risk) * .1 + confidence * .05);
  const blockers = risk >= 80 ? ['sensitive_category_review_required'] : trends.some((t) => t.status === 'insufficient_evidence') ? ['insufficient_trend_evidence'] : [];
  const risks = risk >= 50 ? ['claims_or_platform_risk'] : [];
  const status = blockers.length ? 'blocked' : evidence.length >= 2 && total >= 55 ? 'qualified' : 'candidate';
  return { id: `opp_${Date.now()}`, niche: input.niche, subniche: input.subniche, problem: input.problem, audience: input.audience, products, trends, scores: { demand: factors.demand.value, intent: factors.intent.value, content: factors.content.value, productFit: factors.productFit.value, authority: factors.authority.value, risk: factors.risk.value, confidence: factors.confidence.value, total, factors, version: 'risk-adjusted-v1' }, risks, blockers, evidence, status };
}

export function createOpportunityDossier(opportunity: Opportunity): OpportunityDossier {
  const facts = opportunity.evidence.filter((e) => e.kind === 'fact');
  const hypotheses = opportunity.evidence.filter((e) => e.kind === 'hypothesis');
  const risks = opportunity.evidence.filter((e) => e.kind === 'risk').concat(opportunity.risks.map((r) => ({ source: 'risk-engine', accessedAt: now(), observation: r, kind: 'risk' as const })));
  const blockers = opportunity.evidence.filter((e) => e.kind === 'blocker').concat(opportunity.blockers.map((b) => ({ source: 'risk-engine', accessedAt: now(), observation: b, kind: 'blocker' as const })));
  const recommendations: Evidence[] = [{ source: 'opportunity-radar', accessedAt: now(), observation: opportunity.status === 'qualified' ? 'Advance to human review; do not open a project automatically.' : 'Do not advance until blockers and evidence gaps are resolved.', kind: 'recommendation' }];
  const recommendation = opportunity.status === 'blocked' ? 'block' : opportunity.scores.confidence < 50 ? 'review' : opportunity.risks.length ? 'advance_with_constraints' : 'advance';
  return { id: `dossier_${opportunity.id}`, opportunity, generatedAt: now(), recommendation, facts, hypotheses, recommendations, risks, blockers, freeAlternatives: ['Conteúdo educativo baseado em fontes públicas', 'Checklist ou comparação sem link comercial'], pendingDecision: 'Seleção humana: continuar pesquisa, aprovar desenvolvimento de seed ou arquivar.', handoff: { target: 'influencer-seeds-creator', ready: opportunity.status === 'qualified', inputs: ['nicho', 'subnicho', 'problema', 'audiência', 'produtos normalizados', 'tendências', 'evidências', 'score e riscos'] } };
}

export { sensitive as SENSITIVE_CATEGORY_PATTERN };
export { FakeMarketplaceAdapter } from './marketplace-adapters.js';
