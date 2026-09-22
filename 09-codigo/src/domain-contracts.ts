export type DomainErrorCode =
  | 'TENANT_REQUIRED' | 'VERSION_INVALID' | 'ID_REQUIRED' | 'TIMESTAMP_INVALID'
  | 'TRANSITION_NOT_ALLOWED' | 'GATE_REQUIRED' | 'SOURCE_REQUIRED' | 'DISCLOSURE_REQUIRED';

export class AuthorityError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string = code, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'AuthorityError';
  }
}

export interface TenantRecord {
  id: string;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
}

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isoTimestamp = (value: string): boolean => !Number.isNaN(Date.parse(value));

export function validateTenantRecord(value: unknown): value is TenantRecord {
  if (!value || typeof value !== 'object') throw new AuthorityError('ID_REQUIRED', 'record_required');
  const record = value as Partial<TenantRecord>;
  if (!nonEmpty(record.id)) throw new AuthorityError('ID_REQUIRED', 'record_id_required');
  if (!nonEmpty(record.tenantId)) throw new AuthorityError('TENANT_REQUIRED', 'tenant_id_required');
  const version = record.version;
  if (!Number.isInteger(version) || (version as number) < 1) throw new AuthorityError('VERSION_INVALID', 'version_must_be_positive_integer');
  if (!nonEmpty(record.createdAt) || !isoTimestamp(record.createdAt)) throw new AuthorityError('TIMESTAMP_INVALID', 'created_at_must_be_iso_timestamp');
  if (record.updatedAt !== undefined && (!nonEmpty(record.updatedAt) || !isoTimestamp(record.updatedAt))) throw new AuthorityError('TIMESTAMP_INVALID', 'updated_at_must_be_iso_timestamp');
  return true;
}

export type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>;
export function transition<S extends string>(from: S, to: S, allowed: TransitionMap<S>): S {
  if (!allowed[from]?.includes(to)) throw new AuthorityError('TRANSITION_NOT_ALLOWED', `TRANSITION_NOT_ALLOWED:${from}->${to}`, { from, to });
  return to;
}

export interface DomainEvent {
  type: string;
  aggregateType: string;
  aggregateId: string;
  tenantId: string;
  actorId: string;
  version: number;
  correlationId: string;
  causationId?: string;
  occurredAt?: string;
  payload: Record<string, unknown>;
}

export interface EventEnvelope extends DomainEvent {
  id: string;
  idempotencyKey: string;
  occurredAt: string;
  schemaVersion: string;
}

export function createEventEnvelope(event: DomainEvent, id: string, schemaVersion = 'authority-engine.events.v1'): EventEnvelope {
  validateTenantRecord({ id: event.aggregateId, tenantId: event.tenantId, version: event.version, createdAt: event.occurredAt ?? new Date().toISOString() });
  if (!nonEmpty(event.type) || !nonEmpty(event.aggregateType) || !nonEmpty(event.actorId) || !nonEmpty(event.correlationId)) throw new AuthorityError('ID_REQUIRED', 'event_metadata_required');
  if (!nonEmpty(id)) throw new AuthorityError('ID_REQUIRED', 'event_id_required');
  return { ...event, id, occurredAt: event.occurredAt ?? new Date().toISOString(), schemaVersion, idempotencyKey: `${event.tenantId}:${event.aggregateType}:${event.aggregateId}:${event.version}:${event.type}`, payload: structuredClone(event.payload) };
}

export function requireGate(approved: boolean, gate = 'human_approval'): void {
  if (!approved) throw new AuthorityError('GATE_REQUIRED', gate);
}

export function requireDisclosure(disclosure: unknown): asserts disclosure is string {
  if (!nonEmpty(disclosure)) throw new AuthorityError('DISCLOSURE_REQUIRED', 'disclosure_required');
}
