import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContractError,
  assertRequestContext,
  contractExamples,
  errorResponse,
  validateRequest,
} from '../contracts.js';

test('S0-T02 canonical requests accept examples and reject malformed payloads', () => {
  assert.equal((validateRequest('researchBrief', contractExamples.researchBriefRequest) as { opportunityId: string }).opportunityId, 'opp_1');
  assert.equal((validateRequest('partner', contractExamples.partnerRequest) as { program: string }).program, 'amazon-seller');
  assert.equal((validateRequest('llmRun', contractExamples.llmRunRequest) as { schemaVersion: string }).schemaVersion, 'v1');
  assert.throws(() => validateRequest('researchBrief', {}), (error: unknown) => error instanceof ContractError && error.code === 'FIELD_REQUIRED' && error.field === 'opportunityId');
  assert.throws(() => validateRequest('llmRun', { ...contractExamples.llmRunRequest, budgetCents: -1 }), /budgetCents_must_be_non_negative_number/);
});

test('S0-T02 context and error response contracts fail closed', () => {
  assertRequestContext({ tenantId: 'tenant-a', ownerId: 'owner-a', actorId: 'actor-a', correlationId: 'corr-a' });
  assert.throws(() => assertRequestContext({ tenantId: '', ownerId: 'owner-a', actorId: 'actor-a', correlationId: 'corr-a' }), (error: unknown) => error instanceof ContractError && error.code === 'TENANT_REQUIRED');
  assert.deepEqual(errorResponse(new ContractError('FIELD_REQUIRED', 'topic_required', 'topic'), 'corr-a'), { error: 'topic_required', field: 'topic', correlationId: 'corr-a' });
});
