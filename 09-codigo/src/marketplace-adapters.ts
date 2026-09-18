import type { MarketplaceAdapter, MarketplaceSearchResult, MarketplaceSource } from './types.js';

const checkedAt = () => new Date().toISOString();

export interface ExternalSearchConfig {
  baseUrl: string;
  apiKey: string;
  name: string;
  version?: string;
  scope?: string;
  limitation?: string;
  contractVersion?: string;
  liveEnabled?: boolean;
}

function readiness(config: ExternalSearchConfig): { configured: boolean; credentialStatus: MarketplaceSource['credentialStatus']; limitation: string } {
  if (!config.apiKey) {
    return { configured: false, credentialStatus: 'missing', limitation: 'Credential is missing; adapter fails closed and does not call provider.' };
  }
  if (!config.baseUrl) {
    return { configured: false, credentialStatus: 'configured', limitation: 'Endpoint is missing; adapter fails closed and does not call provider.' };
  }
  if (!config.contractVersion) {
    return { configured: false, credentialStatus: 'configured', limitation: 'Provider contract version is missing; adapter fails closed until contract is documented and tested.' };
  }
  if (config.liveEnabled !== true) {
    return { configured: false, credentialStatus: 'configured', limitation: 'Live provider calls are disabled by runtime gate; adapter fails closed.' };
  }
  return { configured: true, credentialStatus: 'configured', limitation: config.limitation ?? 'Provider contract supplied; smoke/readback still required before production use.' };
}

export function sourceFromConfig(config: ExternalSearchConfig): MarketplaceSource {
  const state = readiness(config);
  return {
    name: config.name,
    endpoint: config.baseUrl || 'not_configured',
    version: config.contractVersion ?? config.version ?? 'unconfirmed',
    scope: config.scope ?? 'search products and trends',
    configured: state.configured,
    credentialStatus: state.credentialStatus,
    checkedAt: checkedAt(),
    limitation: state.limitation,
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
    return { ...sourceFromConfig(this.config), checkedAt: checkedAt() };
  }
  async search(input: { niche: string; subniche?: string }): Promise<MarketplaceSearchResult> {
    const source = sourceFromConfig(this.config);
    if (!this.config.apiKey) throw new Error(`${this.config.name}_credential_missing`);
    if (!this.config.baseUrl) throw new Error(`${this.config.name}_endpoint_missing`);
    if (!this.config.contractVersion) throw new Error(`${this.config.name}_contract_unverified`);
    if (this.config.liveEnabled !== true) throw new Error(`${this.config.name}_live_gate_closed`);
    if (!source.configured) throw new Error(`${this.config.name}_integration_not_configured`);
    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.config.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`${this.config.name}_http_${response.status}`);
    const data = await response.json() as MarketplaceSearchResult;
    return { products: data.products ?? [], trends: data.trends ?? [], sources: [source] };
  }
}

export function amazonAdapterFromEnv(): ConfiguredMarketplaceAdapter {
  return new ConfiguredMarketplaceAdapter({
    name: 'amazon',
    baseUrl: process.env.AMAZON_API_URL ?? '',
    apiKey: process.env.AMAZON_API_KEY ?? '',
    contractVersion: process.env.AMAZON_CONTRACT_VERSION ?? '',
    liveEnabled: process.env.AMAZON_LIVE_ENABLED === 'true',
    version: 'unconfirmed',
    scope: 'configured endpoint only',
  });
}

export function marketplaceAdapterFromEnv(): ConfiguredMarketplaceAdapter {
  return new ConfiguredMarketplaceAdapter({
    name: 'marketplace-secondary',
    baseUrl: process.env.SECONDARY_MARKETPLACE_API_URL ?? '',
    apiKey: process.env.SECONDARY_MARKETPLACE_API_KEY ?? '',
    contractVersion: process.env.SECONDARY_MARKETPLACE_CONTRACT_VERSION ?? '',
    liveEnabled: process.env.SECONDARY_MARKETPLACE_LIVE_ENABLED === 'true',
    version: 'unconfirmed',
    scope: 'configured endpoint only',
  });
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
