import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';
import { authConfigForTests, type RuntimePrincipal } from '../auth.js';

const principals: RuntimePrincipal[] = [
  { id: 'a', role: 'operator', ownerId: 'owner-a', tenantId: 'tenant-a' },
  { id: 'b', role: 'operator', ownerId: 'owner-b', tenantId: 'tenant-b' },
];

test('HTTP registry wiring persists and isolates explicit tenant context', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'authority-registry-http-'));
  const { config, tokens } = authConfigForTests(principals);
  const store = new JsonStore(join(dir, 'state.json'));
  const server = createAuthorityServer(store, { auth: config });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, token: string, init: RequestInit = {}) => fetch(`${base}${path}`, { ...init, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
  try {
    const created = await request('/api/partners', tokens.a!, { method: 'POST', body: JSON.stringify({ id: 'amazon', name: 'Amazon Seller', program: 'seller', tenantId: 'tenant-b', ownerId: 'owner-b' }) });
    assert.equal(created.status, 201);
    const partner = await created.json(); assert.equal(partner.tenantId, 'tenant-a'); assert.equal(partner.ownerId, 'owner-a');
    const duplicatePartner = await request('/api/partners', tokens.a!, { method: 'POST', body: JSON.stringify({ id: 'amazon', name: 'Amazon Seller', program: 'seller' }) });
    assert.equal(duplicatePartner.status, 409); assert.equal((await duplicatePartner.json()).error, 'partner_already_exists');
    const invalidStatus = await request('/api/partners', tokens.a!, { method: 'POST', body: JSON.stringify({ id: 'invalid-status', name: 'Invalid', program: 'fixture', status: 'unknown' }) });
    assert.equal(invalidStatus.status, 422); assert.equal((await invalidStatus.json()).error, 'status_invalid');
    const other = await request('/api/partners', tokens.b!); assert.equal(other.status, 200); assert.deepEqual(await other.json(), []);
    const crossTenantSource = await request('/api/sources', tokens.b!, { method: 'POST', body: JSON.stringify({ id: 'cross-tenant', partnerId: 'amazon', origin: 'fixture://cross', contractVersion: 'v1', scope: 'catalog', limits: 'fixture only' }) });
    assert.equal(crossTenantSource.status, 404); assert.equal((await crossTenantSource.json()).error, 'partner_not_found');
    const own = await request('/api/partners', tokens.a!); assert.equal((await own.json()).length, 1);

    const source = await request('/api/sources', tokens.a!, { method: 'POST', body: JSON.stringify({ id: 'amazon-fixture', partnerId: 'amazon', origin: 'fixture://amazon', contractVersion: 'v1', scope: 'catalog', limits: 'fixture only' }) });
    assert.equal(source.status, 201);
    const duplicateSource = await request('/api/sources', tokens.a!, { method: 'POST', body: JSON.stringify({ id: 'amazon-fixture', partnerId: 'amazon', origin: 'fixture://amazon', contractVersion: 'v1', scope: 'catalog', limits: 'fixture only' }) });
    assert.equal(duplicateSource.status, 409); assert.equal((await duplicateSource.json()).error, 'source_already_exists');
    const invalidTransition = await request('/api/partners/amazon/status', tokens.a!, { method: 'POST', body: JSON.stringify({ status: 'unknown' }) });
    assert.equal(invalidTransition.status, 422); assert.equal((await invalidTransition.json()).error, 'status_invalid');
    const health = await request('/api/sources/amazon-fixture/health', tokens.a!, { method: 'POST' });
    assert.equal(health.status, 422); assert.equal((await health.json()).error, 'credential_not_configured');

    const llm = await request('/api/llm/runs', tokens.a!, { method: 'POST', body: JSON.stringify({ schema: { required: ['seeds'] }, mockOutput: { seeds: [] }, model: 'local-fake', promptVersion: 'p1', schemaVersion: 's1', budgetCents: 1 }) });
    assert.equal(llm.status, 201); const run = await llm.json(); assert.equal(run.tenantId, 'tenant-a');
    const runsOther = await request('/api/llm/runs', tokens.b!); assert.deepEqual(await runsOther.json(), []);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP tenant header cannot override a tenant-bound principal', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'authority-tenant-http-'));
  const { config, tokens } = authConfigForTests([principals[0]!]);
  const server = createAuthorityServer(new JsonStore(join(dir, 'state.json')), { auth: config });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/partners`, { headers: { authorization: `Bearer ${tokens.a!}`, 'x-tenant-id': 'tenant-b' } });
    assert.equal(response.status, 403); assert.equal((await response.json()).error, 'tenant_forbidden');
  } finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); await rm(dir, { recursive: true, force: true }); }
});
