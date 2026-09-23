export type ContractErrorCode = 'CONTRACT_INVALID' | 'TENANT_REQUIRED' | 'ID_REQUIRED' | 'FIELD_REQUIRED';

export class ContractError extends Error {
  readonly code: ContractErrorCode;
  readonly field: string | undefined;
  constructor(code: ContractErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.field = field;
  }
}

export type UiViewState =
  | 'loading' | 'empty' | 'success' | 'recoverable_error' | 'blocking_error'
  | 'unauthorized' | 'forbidden' | 'insufficient_data' | 'awaiting_gate'
  | 'awaiting_owner' | 'job_running' | 'last_readback' | 'next_action';

export interface RequestContext { tenantId: string; ownerId: string; actorId: string; correlationId: string; }
export interface ApiErrorResponse { error: string; detail?: string; field?: string; correlationId?: string; }
export interface ApiResponse<T> { data: T; correlationId: string; }

export interface ResearchBriefRequest { opportunityId: string; focus?: string[]; constraints?: string[]; }
export interface EvidenceRequest { source: string; accessedAt: string; observation: string; kind: 'fact' | 'hypothesis' | 'recommendation' | 'risk' | 'blocker'; limitation?: string; }
export interface OpportunityDossierResponse { id: string; opportunityId: string; recommendation: 'advance' | 'advance_with_constraints' | 'review' | 'block'; evidence: EvidenceRequest[]; blockers: string[]; handoff: { target: 'influencer-seeds-creator'; ready: boolean; inputs: string[] }; }
export interface SeedGenerateRequest { researchId: string; taxonomyVersion?: string; }
export interface SeedResponse { id: string; opportunityId: string; name: string; status: 'proposed' | 'selected' | 'blocked' | 'invalid'; score: number; }
export interface PersonaRequest { seedId: string; selectedThemes?: string[]; }
export interface ApprovalPackResponse { id: string; personaId: string; personaVersionId: string; status: string; ownerId: string; }
export interface ContentBriefRequest { profileId: string; topic: string; pillar: string; format: string; channel: string; objective: string; sources: EvidenceRequest[]; }
export interface ContentDraftResponse { id: string; briefId: string; version: string; status: 'draft' | 'review' | 'awaiting_human_approval' | 'published' | 'blocked'; disclosure?: string; }
export interface ReviewDecisionRequest { targetId: string; targetVersion: string; decision: 'approve' | 'reject' | 'request_revision'; reason?: string; }
export interface MetricRequest { briefId: string; version: string; channel: string; period: { from: string; to: string }; source: string; sufficient: boolean; limitation?: string; }
export interface FeedbackResponse { id: string; metricId: string; briefId: string; signals: string[]; questions: string[]; recommendation: string; }
export interface PartnerRequest { id: string; name: string; program: string; status?: 'planned' | 'configured' | 'verified' | 'blocked' | 'disabled'; limitations?: string; }
export interface SourceRequest { id: string; partnerId: string; origin: string; contractVersion: string; scope: string; limits: string; status?: 'planned' | 'configured' | 'verified' | 'blocked' | 'disabled'; credentialRef?: string; limitation?: string; }
export interface LlmRunRequest { model: string; promptVersion: string; schemaVersion: string; schema: { required?: string[] }; input: Record<string, unknown>; budgetCents: number; centsPerToken?: number; }
export interface LlmRunResponse { id: string; tenantId: string; status: 'completed' | 'failed' | 'blocked'; model: string; promptVersion: string; schemaVersion: string; output?: Record<string, unknown>; usage?: { inputTokens: number; outputTokens: number; costCents: number; latencyMs: number }; errorCode?: string; }

export interface LlmPromptVersionEnvelope {
  provider: string;
  model: string;
  promptVersion: string;
  promptHash?: string;
  schemaVersion: string;
  budgetCents: number;
  costCents?: number;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  limitations?: string[];
}

export interface SetupStateRequest {
  organizationName: string;
  editorialGoal: string;
  partners: string[];
  sources: string[];
  llmLimitCents: number;
  members: Array<{ email: string; role: string }>;
  brandName: string;
}

export interface SetupStateResponse {
  id: string;
  tenantId: string;
  status: 'setup_incomplete' | 'ready_for_research' | 'blocked';
  checklist: Record<string, boolean>;
  nextAction: string;
  updatedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const requiredString = (value: Record<string, unknown>, field: string): string => {
  const candidate = value[field];
  if (typeof candidate !== 'string' || candidate.trim() === '') throw new ContractError('FIELD_REQUIRED', `${field}_required`, field);
  return candidate;
};
const requiredRecord = (value: Record<string, unknown>, field: string): Record<string, unknown> => {
  const candidate = value[field];
  if (!isRecord(candidate)) throw new ContractError('CONTRACT_INVALID', `${field}_must_be_object`, field);
  return candidate;
};

export function validateRequest<T>(name: string, input: unknown): T {
  if (!isRecord(input)) throw new ContractError('CONTRACT_INVALID', `${name}_must_be_object`);
  const required: Record<string, string[]> = {
    researchBrief: ['opportunityId'], seedGenerate: ['researchId'], persona: ['seedId'],
    contentBrief: ['profileId', 'topic', 'pillar', 'format', 'channel', 'objective'],
    partner: ['id', 'name', 'program'], source: ['id', 'partnerId', 'origin', 'contractVersion', 'scope', 'limits'],
    llmRun: ['model', 'promptVersion', 'schemaVersion', 'schema', 'input'],
  };
  for (const field of required[name] ?? []) {
    if (field === 'schema' || field === 'input') requiredRecord(input, field);
    else requiredString(input, field);
  }
  if (name === 'llmRun' && (typeof input.budgetCents !== 'number' || input.budgetCents < 0)) throw new ContractError('CONTRACT_INVALID', 'budgetCents_must_be_non_negative_number', 'budgetCents');
  return input as T;
}

export function assertRequestContext(context: Partial<RequestContext>): asserts context is RequestContext {
  for (const field of ['tenantId', 'ownerId', 'actorId', 'correlationId'] as const) {
    if (typeof context[field] !== 'string' || context[field].trim() === '') throw new ContractError(field === 'tenantId' ? 'TENANT_REQUIRED' : 'FIELD_REQUIRED', `${field}_required`, field);
  }
}

export function errorResponse(error: unknown, correlationId?: string): ApiErrorResponse {
  const contract = error instanceof ContractError ? error : undefined;
  return { error: contract ? contract.message : 'contract_invalid', ...(contract?.field ? { field: contract.field } : {}), ...(correlationId ? { correlationId } : {}) };
}

export const contractExamples = {
  researchBriefRequest: { opportunityId: 'opp_1', focus: ['audience'], constraints: ['fixture-only'] } satisfies ResearchBriefRequest,
  researchBriefResponse: { id: 'research_1', opportunityId: 'opp_1', recommendation: 'review', evidence: [], blockers: [], handoff: { target: 'influencer-seeds-creator', ready: false, inputs: [] } } satisfies OpportunityDossierResponse,
  partnerRequest: { id: 'amazon-seller', name: 'Amazon Seller', program: 'amazon-seller', status: 'planned' } satisfies PartnerRequest,
  llmRunRequest: { model: 'local-fake', promptVersion: 'p1', schemaVersion: 'v1', schema: { required: ['seeds'] }, input: { dossierId: 'd1' }, budgetCents: 0 } satisfies LlmRunRequest,
} as const;
