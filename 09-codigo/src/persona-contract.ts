import { createHash } from 'node:crypto';
import type { Persona, PersonaVersion } from './persona-formation.js';

export interface PersonaReadModel {
  persona_id: string;
  persona_version_id: string;
  persona_version: number;
  status: 'approved';
  content_hash: string;
  snapshot: {
    input: Record<string, unknown>;
    outputs: Record<string, unknown>;
    source_run_ids: string[];
    consistency_review?: unknown;
  };
}

export interface PersonaApprovedEventEnvelope {
  event_id: string;
  event_type: 'persona.approved';
  event_version: 1;
  occurred_at: string;
  source: 'authority-engine';
  aggregate_type: 'persona';
  aggregate_id: string;
  aggregate_version: number;
  correlation_id: string;
  causation_id: string | null;
  payload: {
    persona_id: string;
    persona_version_id: string;
    blog_id: string;
    blog_name_version_id: string;
  };
}

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  return value;
};

export const contentHashForPersonaVersion = (version: PersonaVersion): string => createHash('sha256').update(JSON.stringify(canonicalize({ input: version.input, outputs: version.outputs, sourceRunIds: version.sourceRunIds, consistencyReview: version.consistencyReview }))).digest('hex');

export function createApprovedPersonaReadModel(persona: Persona, version: PersonaVersion): PersonaReadModel {
  if (persona.status !== 'approved' || version.status !== 'approved' || persona.currentVersionId !== version.id) throw new Error('persona_approval_required');
  return {
    persona_id: persona.id,
    persona_version_id: version.id,
    persona_version: version.version,
    status: 'approved',
    content_hash: contentHashForPersonaVersion(version),
    snapshot: { input: version.input, outputs: version.outputs, source_run_ids: version.sourceRunIds, consistency_review: version.consistencyReview },
  };
}

export function createPersonaApprovedEvent(input: {
  persona: Persona;
  version: PersonaVersion;
  blogId: string;
  blogNameVersionId: string;
  correlationId: string;
  causationId?: string | null;
  eventId?: string;
  occurredAt?: string;
}): PersonaApprovedEventEnvelope {
  const readModel = createApprovedPersonaReadModel(input.persona, input.version);
  if (!input.blogId.trim() || !input.blogNameVersionId.trim() || !input.correlationId.trim()) throw new Error('approved_event_identifiers_required');
  return {
    event_id: input.eventId ?? `persona-approved:${input.persona.id}:${input.version.id}:${input.blogId}:${input.blogNameVersionId}`,
    event_type: 'persona.approved',
    event_version: 1,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    source: 'authority-engine',
    aggregate_type: 'persona',
    aggregate_id: input.persona.id,
    aggregate_version: input.version.version,
    correlation_id: input.correlationId,
    causation_id: input.causationId ?? null,
    payload: { persona_id: readModel.persona_id, persona_version_id: readModel.persona_version_id, blog_id: input.blogId, blog_name_version_id: input.blogNameVersionId },
  };
}
