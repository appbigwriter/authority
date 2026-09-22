import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AuthorityError,
  createEventEnvelope,
  transition,
  validateTenantRecord,
  type DomainEvent,
} from '../domain-contracts.js';

test('domain contracts validate tenant/version metadata and reject missing fields', () => {
  const record = { id: 'opp_1', tenantId: 'tenant_a', version: 1, createdAt: new Date().toISOString() };
  assert.equal(validateTenantRecord(record), true);
  assert.throws(() => validateTenantRecord({ ...record, tenantId: '' }), (error: unknown) => error instanceof AuthorityError && error.code === 'TENANT_REQUIRED');
  assert.throws(() => validateTenantRecord({ ...record, version: 0 }), (error: unknown) => error instanceof AuthorityError && error.code === 'VERSION_INVALID');
});

test('state transitions fail closed and return immutable next state', () => {
  assert.deepEqual(transition('candidate', 'qualified', { candidate: ['qualified'] }), 'qualified');
  assert.throws(() => transition('candidate', 'approved', { candidate: ['qualified'] }), /TRANSITION_NOT_ALLOWED/);
});

test('event envelope is deterministic for replay and preserves correlation', () => {
  const event: DomainEvent = { type: 'opportunity.qualified', aggregateType: 'opportunity', aggregateId: 'opp_1', tenantId: 'tenant_a', actorId: 'user_1', version: 2, correlationId: 'corr_1', payload: { score: 70 } };
  const first = createEventEnvelope(event, 'event_1');
  const second = createEventEnvelope(event, 'event_1');
  assert.deepEqual(first, second);
  assert.equal(first.idempotencyKey, 'tenant_a:opportunity:opp_1:2:opportunity.qualified');
  assert.equal(first.payload.score, 70);
});
