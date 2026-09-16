import type { MarketplaceAdapter, MarketplaceProduct, MarketplaceSearchResult, MarketplaceSource, TrendSignal } from './types.js';

const checkedAt = () => new Date().toISOString();

export interface ExternalSearchConfig {
  baseUrl: string;
  apiKey: string;
  name: string;
  version?: string;
  scope?: string;
  limitation?: string;
}

export function sourceFromConfig(config: ExternalSearchConfig): MarketplaceSource {
  const configured = Boolean(config.baseUrl && config.apiKey);
  return {
    name: config.name,
    endpoint: config.baseUrl || 'not_configured',
    version: config.version ?? 'unconfirmed',
    scope: config.scope ?? 'search products and trends',
    configured,
    credentialStatus: configured ? 'configured' : 'missing',
    checkedAt: checkedAt(),
    limitation: config.limitation ?? 'Provider contract and smoke test must be supplied before production use.',
  };
}

export class ConfiguredMarketplaceAdapter implements MarketplaceAdapter {
  readonly name: string;
  readonly source: MarketplaceSource;
  constructor(private readonly config: ExternalSearchConfig) {
    this.name = config.name;
    this.source = sourceFromConfig(config);
  }
  async healthCheck(): Promise<MarketplaceSource> {
    if (!this.source.configured) return { ...this.source, checkedAt: checkedAt() };
    return { ...this.source, limitation: `${this.source.limitation} Health is only verifiable against the configured endpoint.` };
  }
  async search(input: { niche: string; subniche?: string }): Promise<MarketplaceSearchResult> {
    if (!this.config.baseUrl || !this.config.apiKey) throw new Error(`${this.config.name}_integration_not_configured`);
    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.config.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`${this.config.name}_http_${response.status}`);
    const data = await response.json() as MarketplaceSearchResult;
    return { products: data.products ?? [], trends: data.trends ?? [], sources: [this.source] };
  }
}

export function amazonAdapterFromEnv(): ConfiguredMarketplaceAdapter {
  return new ConfiguredMarketplaceAdapter({ name: 'amazon', baseUrl: process.env.AMAZON_API_URL ?? '', apiKey: process.env.AMAZON_API_KEY ?? '', version: 'unconfirmed', scope: 'configured endpoint only' });
}
export function marketplaceAdapterFromEnv(): ConfiguredMarketplaceAdapter {
  return new ConfiguredMarketplaceAdapter({ name: 'marketplace-secondary', baseUrl: process.env.SECONDARY_MARKETPLACE_API_URL ?? '', apiKey: process.env.SECONDARY_MARKETPLACE_API_KEY ?? '', version: 'unconfirmed', scope: 'configured endpoint only' });
}

export class FakeMarketplaceAdapter implements MarketplaceAdapter {
  readonly name = 'fake-marketplace';
  readonly source: MarketplaceSource = { name: this.name, endpoint: 'fake://marketplace', version: 'fixture-1', scope: 'synthetic isolated tests', configured: true, credentialStatus: 'unknown', checkedAt: checkedAt(), limitation: 'Synthetic data; does not prove provider integration.' };
  async search(input: { niche: string; subniche?: string }): Promise<MarketplaceSearchResult> {
    const observedAt = checkedAt();
    const subniche = input.subniche ?? input.niche;
    const category = /health|fertility|pregnancy|mental health|medical|weight loss/i.test(`${input.niche} ${subniche}`) ? 'supplement' : 'gear';
    return {
      sources: [this.source],
      products: [{ id: 'fake-1', sourceRecordId: 'fake-1', marketplace: this.name, title: `${subniche} demonstrator`, category, niche: input.niche, subniche, price: 49.99, currency: 'USD', availability: 'in_stock', observedAt, evidence: [{ source: this.source.endpoint, accessedAt: observedAt, observation: 'Synthetic product fixture for isolated tests', kind: 'hypothesis', limitation: this.source.limitation }] }],
      trends: [{ id: 'trend-1', niche: input.niche, subniche, query: `best ${subniche}`, strength: 70, period: 'fixture', status: 'observed', evidence: [{ source: 'fake://trend', accessedAt: observedAt, observation: 'Synthetic trend fixture for isolated tests', kind: 'hypothesis', limitation: this.source.limitation }] }],
    };
  }
}
