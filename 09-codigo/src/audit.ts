export interface AuditEvent {
  id: string; tenantId: string; actorId: string; action: string; resourceId: string; resourceVersion: number; correlationId: string; occurredAt: string; payload: Record<string, unknown>;
}
export interface MetricInput { tenantId: string; source: string; period: { from: string; to: string }; sufficient: boolean; limitation?: string; }
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const validDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

export class AuditLedger {
  private readonly events = new Map<string, AuditEvent>();
  append(event: AuditEvent): AuditEvent {
    if (!nonEmpty(event.tenantId) || !nonEmpty(event.actorId) || !nonEmpty(event.action) || !nonEmpty(event.resourceId) || !nonEmpty(event.correlationId)) throw new Error('audit_metadata_required');
    if (this.events.has(`${event.tenantId}:${event.id}`)) throw new Error('audit_event_already_exists');
    const copy = structuredClone(event); this.events.set(`${event.tenantId}:${event.id}`, copy); return structuredClone(copy);
  }
  list(tenantId: string): AuditEvent[] { return [...this.events.values()].filter((event) => event.tenantId === tenantId).map((event) => structuredClone(event)); }
  update(_id: string, _patch: Partial<AuditEvent>): never { throw new Error('audit_immutable'); }
}

export function validateMetricInput(input: MetricInput): true {
  if (!nonEmpty(input.tenantId) || !nonEmpty(input.source)) throw new Error('metric_metadata_required');
  if (!validDate(input.period?.from) || !validDate(input.period?.to) || input.period.from > input.period.to) throw new Error('metric_period_invalid');
  if (!input.sufficient && !nonEmpty(input.limitation)) throw new Error('metric_limitation_required');
  return true;
}
