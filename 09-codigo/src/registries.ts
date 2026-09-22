export type RegistryStatus = 'planned' | 'configured' | 'verified' | 'blocked' | 'disabled';
const registryStatuses: readonly RegistryStatus[] = ['planned', 'configured', 'verified', 'blocked', 'disabled'];
export const isRegistryStatus = (value: unknown): value is RegistryStatus => typeof value === 'string' && registryStatuses.includes(value as RegistryStatus);
export interface Partner { tenantId: string; id: string; name: string; program: string; status: RegistryStatus; limitations?: string; updatedAt: string; }
export interface Source { tenantId: string; id: string; partnerId: string; origin: string; contractVersion: string; scope: string; credentialRef?: string; limits: string; status: RegistryStatus; lastCheckedAt?: string; limitation?: string; }

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const now = () => new Date().toISOString();
function requireTenant(tenantId: string): void { if (!nonEmpty(tenantId)) throw new Error('tenant_required'); }
function requireStatus(status: unknown): asserts status is RegistryStatus { if (!isRegistryStatus(status)) throw new Error('status_invalid'); }

export class PartnerRegistry {
  private readonly entries = new Map<string, Partner>();
  register(input: Omit<Partner, 'updatedAt'>): Partner {
    requireTenant(input.tenantId);
    if (!nonEmpty(input.id) || !nonEmpty(input.name) || !nonEmpty(input.program)) throw new Error('partner_metadata_required');
    requireStatus(input.status);
    const key = `${input.tenantId}:${input.id}`;
    if (this.entries.has(key)) throw new Error('partner_already_exists');
    const entry = { ...input, updatedAt: now() };
    this.entries.set(key, entry);
    return structuredClone(entry);
  }
  list(tenantId: string): Partner[] { requireTenant(tenantId); return [...this.entries.values()].filter((item) => item.tenantId === tenantId).map((item) => structuredClone(item)); }
  updateStatus(tenantId: string, id: string, status: RegistryStatus): Partner { requireTenant(tenantId); requireStatus(status); const key = `${tenantId}:${id}`; const current = this.entries.get(key); if (!current) throw new Error('partner_not_found'); const updated = { ...current, status, updatedAt: now() }; this.entries.set(key, updated); return structuredClone(updated); }
}

export class SourceRegistry {
  private readonly entries = new Map<string, Source>();
  register(input: Source): Source {
    requireTenant(input.tenantId);
    if (!nonEmpty(input.id) || !nonEmpty(input.origin) || !nonEmpty(input.contractVersion) || !nonEmpty(input.scope) || !nonEmpty(input.limits)) throw new Error('source_metadata_required');
    requireStatus(input.status);
    const key = `${input.tenantId}:${input.id}`;
    if (this.entries.has(key)) throw new Error('source_already_exists');
    const entry = structuredClone(input);
    this.entries.set(key, entry);
    return structuredClone(entry);
  }
  list(tenantId: string): Source[] { requireTenant(tenantId); return [...this.entries.values()].filter((item) => item.tenantId === tenantId).map((item) => structuredClone(item)); }
  async health(tenantId: string, id: string): Promise<{ ok: true; checkedAt: string } | never> {
    const key = `${tenantId}:${id}`; const source = this.entries.get(key);
    if (!source) throw new Error('source_not_found');
    if (source.status === 'disabled' || source.status === 'blocked') throw new Error('source_blocked');
    if (!source.credentialRef) throw new Error('credential_not_configured');
    const checkedAt = now(); this.entries.set(key, { ...source, status: 'verified', lastCheckedAt: checkedAt }); return { ok: true, checkedAt };
  }
}

export interface GatewayRequest { tenantId: string; schema: { required?: string[] }; input: Record<string, unknown>; }
export interface GatewayResponse { status: 'completed'; output: Record<string, any>; usage: { inputTokens: number; outputTokens: number; costCents: number; latencyMs: number }; model: string; promptVersion: string; schemaVersion: string; }
export interface GatewayRunRecord extends GatewayResponse { id: string; tenantId: string; }
export interface GatewayTransportResult { output: Record<string, any>; inputTokens: number; outputTokens: number; latencyMs: number; }
export type GatewayTransport = (input: { model: string; promptVersion: string; input: Record<string, unknown> }) => Promise<GatewayTransportResult>;
export interface GatewayConfig { tenantId: string; model: string; promptVersion: string; schemaVersion: string; budgetCents: number; centsPerToken?: number; }

export class OpenAIGateway {
  constructor(private readonly transport: GatewayTransport, private readonly config: GatewayConfig) {}
  async run(request: GatewayRequest): Promise<GatewayResponse> {
    if (request.tenantId !== this.config.tenantId) throw new Error('tenant_context_mismatch');
    const result = await this.transport({ model: this.config.model, promptVersion: this.config.promptVersion, input: structuredClone(request.input) });
    if (!result.output || typeof result.output !== 'object') throw new Error('llm_output_invalid');
    for (const key of request.schema.required ?? []) if (!(key in result.output)) throw new Error(`llm_schema_missing:${key}`);
    const costCents = (result.inputTokens + result.outputTokens) * (this.config.centsPerToken ?? 0);
    if (costCents > this.config.budgetCents) throw new Error('tenant_budget_exceeded');
    return { status: 'completed', output: structuredClone(result.output), usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens, costCents, latencyMs: result.latencyMs }, model: this.config.model, promptVersion: this.config.promptVersion, schemaVersion: this.config.schemaVersion };
  }
}
