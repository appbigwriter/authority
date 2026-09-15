import type { MarketplaceAdapter, Opportunity, Evidence } from './types.js';

const now = () => new Date().toISOString();

export async function createOpportunity(
  adapter: MarketplaceAdapter,
  input: { niche: string; subniche: string; problem: string; audience: string },
): Promise<Opportunity> {
  if (!input.niche.trim() || !input.subniche.trim() || !input.problem.trim() || !input.audience.trim()) {
    throw new Error('invalid_opportunity_input');
  }
  const result = await adapter.search({ niche: input.niche, subniche: input.subniche });
  const evidence: Evidence[] = [...result.products.flatMap((p) => p.evidence), ...result.trends.flatMap((t) => t.evidence)];
  const demand = Math.min(100, result.trends.reduce((n, t) => n + t.strength, 0));
  const intent = Math.min(100, result.products.length * 20);
  const productFit = result.products.length ? 80 : 0;
  const content = result.trends.length ? 75 : 0;
  const risk = result.products.some((p) => /supplement|fertility|pregnancy|mental health/i.test(p.category)) ? 70 : 10;
  const authority = input.problem.length >= 20 ? 75 : 45;
  const total = Math.round((demand * .2 + intent * .2 + content * .2 + productFit * .15 + authority * .15 + (100 - risk) * .1));
  const status = evidence.length >= 2 && total >= 55 && risk < 70 ? 'qualified' : 'blocked';
  return { id: `opp_${Date.now()}`, niche: input.niche, subniche: input.subniche, problem: input.problem, audience: input.audience, products: result.products, trends: result.trends, scores: { demand, intent, content, productFit, authority, risk, total }, risks: risk >= 50 ? ['claims_sensitive'] : [], evidence, status };
}

export class FakeMarketplaceAdapter implements MarketplaceAdapter {
  name = 'fake-marketplace';
  async search(input: { niche: string; subniche?: string }) {
    const observedAt = now();
    const category = /health|fertility|pregnancy|mental health/i.test(input.niche) ? 'supplement' : 'gear';
    return {
      products: [{ id: 'fake-1', marketplace: this.name, title: `${input.subniche ?? input.niche} demonstrator`, category, niche: input.niche, subniche: input.subniche ?? input.niche, price: 49.99, currency: 'USD', availability: 'in_stock' as const, observedAt, evidence: [{ source: 'fake://marketplace', accessedAt: observedAt, observation: 'Synthetic product fixture for isolated tests', kind: 'hypothesis' as const }] }],
      trends: [{ id: 'trend-1', niche: input.niche, subniche: input.subniche ?? input.niche, query: `best ${input.subniche ?? input.niche}`, strength: 70, period: 'fixture', evidence: [{ source: 'fake://trend', accessedAt: observedAt, observation: 'Synthetic trend fixture for isolated tests', kind: 'hypothesis' as const }] }],
    };
  }
}
