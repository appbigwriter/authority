import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditLedger, validateMetricInput } from '../audit.js';

test('audit ledger is append-only and tenant scoped', () => {
  const ledger = new AuditLedger();
  ledger.append({ id: 'evt1', tenantId: 't1', actorId: 'u1', action: 'seed.selected', resourceId: 's1', resourceVersion: 1, correlationId: 'c1', occurredAt: new Date().toISOString(), payload: { reason: 'fit' } });
  assert.equal(ledger.list('t1').length, 1);
  assert.equal(ledger.list('t2').length, 0);
  assert.throws(() => ledger.append({ id: 'evt1', tenantId: 't1', actorId: 'u1', action: 'replay', resourceId: 's1', resourceVersion: 1, correlationId: 'c1', occurredAt: new Date().toISOString(), payload: {} }), /audit_event_already_exists/);
  assert.throws(() => ledger.update('evt1', {}), /audit_immutable/);
});

test('metrics require source, period and limitation when insufficient', () => {
  assert.equal(validateMetricInput({ tenantId: 't1', source: 'manual', period: { from: '2026-01-01', to: '2026-01-07' }, sufficient: false, limitation: 'small sample' }), true);
  assert.throws(() => validateMetricInput({ tenantId: 't1', source: 'manual', period: { from: '2026-01-01', to: '2026-01-07' }, sufficient: false }), /metric_limitation_required/);
});
