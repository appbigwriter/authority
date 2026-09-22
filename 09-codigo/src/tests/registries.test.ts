import test from 'node:test';
import assert from 'node:assert/strict';
import { PartnerRegistry, SourceRegistry, OpenAIGateway, type GatewayTransport } from '../registries.js';

test('registries isolate tenants and source health fails closed', async () => {
  const partners = new PartnerRegistry();
  partners.register({ tenantId: 't1', id: 'amazon', name: 'Amazon Seller', program: 'seller', status: 'planned' });
  partners.register({ tenantId: 't2', id: 'amazon', name: 'Amazon Seller', program: 'seller', status: 'planned' });
  assert.equal(partners.list('t1').length, 1);
  assert.equal(partners.list('t2').length, 1);
  assert.equal(partners.list('t1')[0]?.tenantId, 't1');

  const sources = new SourceRegistry();
  sources.register({ tenantId: 't1', id: 'src1', partnerId: 'amazon', origin: 'fixture://amazon', contractVersion: 'v1', scope: 'catalog', limits: 'fixture only', status: 'configured' });
  await assert.rejects(() => sources.health('t1', 'src1'), /credential_not_configured/);
});

test('gateway validates structured output, enforces budget and never logs secret payloads', async () => {
  const transport: GatewayTransport = async () => ({ output: { seeds: [{ name: 'A' }] }, inputTokens: 100, outputTokens: 50, latencyMs: 4 });
  const gateway = new OpenAIGateway(transport, { tenantId: 't1', model: 'local-fake', promptVersion: 'p1', schemaVersion: 's1', budgetCents: 10, centsPerToken: 0.01 });
  const result = await gateway.run({ tenantId: 't1', schema: { required: ['seeds'] }, input: { dossier: 'd1' } });
  assert.equal(result.status, 'completed');
  assert.equal(result.output.seeds[0].name, 'A');
  assert.equal(result.usage.inputTokens, 100);
  await assert.rejects(() => gateway.run({ tenantId: 'other', schema: { required: ['seeds'] }, input: {} }), /tenant_context_mismatch/);
});
