import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';
import { authConfigForTests } from '../auth.js';

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'authority-local-track-'));
  const { config, tokens } = authConfigForTests([
    { id: 'operator-a', role: 'operator', ownerId: 'owner-a', tenantId: 'tenant-a' },
    { id: 'operator-b', role: 'operator', ownerId: 'owner-b', tenantId: 'tenant-b' },
    { id: 'reviewer-a', role: 'reviewer', ownerId: 'owner-a', tenantId: 'tenant-a' },
    { id: 'admin', role: 'admin', ownerId: 'admin', tenantId: 'tenant-a' },
  ]);
  const store = new JsonStore(join(dir, 'state.json'));
  const server = createAuthorityServer(store, { auth: config });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, token: string, init: RequestInit = {}) => fetch(`${base}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  const close = async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); await rm(dir, { recursive: true, force: true }); };
  return { request, tokens, store, close };
}

const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) });

test('local backend exposes research brief, fake run, dossier, qualification and tenant isolation', async () => {
  const fx = await fixture();
  try {
    const created = await fx.request('/api/opportunities', fx.tokens['operator-a']!, post({ niche: 'retail displays', subniche: 'store signs', problem: 'buyers need clearer signage', audience: 'small retailers' }));
    assert.equal(created.status, 201); const opportunity = await created.json();
    const brief = await fx.request('/api/research-briefs', fx.tokens['operator-a']!, post({ market: 'US', language: 'en', niche: 'retail displays', subniche: 'store signs', audience: 'small retailers', problem: 'clearer signage', objective: 'find editorial gaps' }));
    assert.equal(brief.status, 201); const briefBody = await brief.json();
    const run = await fx.request(`/api/research-briefs/${briefBody.id}/run`, fx.tokens['operator-a']!, post({ opportunityId: opportunity.id }));
    assert.equal(run.status, 201); const runBody = await run.json(); assert.equal(runBody.mode, 'DEMO'); assert.equal(runBody.status, 'completed');
    const readRun = await fx.request(`/api/research-runs/${runBody.id}`, fx.tokens['operator-a']!); assert.equal(readRun.status, 200);
    const dossier = await fx.request(`/api/opportunities/${opportunity.id}/dossier`, fx.tokens['operator-a']!);
    assert.equal(dossier.status, 200); const dossierBody = await dossier.json(); assert.ok(dossierBody.evidence.length > 0);
    const qualified = await fx.request(`/api/opportunities/${opportunity.id}/qualify`, fx.tokens['operator-a']!, post({ reason: 'local fixture has evidence' }));
    assert.equal(qualified.status, 200); assert.equal((await qualified.json()).status, 'qualified');
    const crossTenant = await fx.request(`/api/research-briefs/${briefBody.id}`, fx.tokens['operator-b']!); assert.equal(crossTenant.status, 404);
  } finally { await fx.close(); }
});

test('local backend records metrics, feedback and immutable audit readback with fail-closed validation', async () => {
  const fx = await fixture();
  try {
    const invalid = await fx.request('/api/metrics', fx.tokens['operator-a']!, post({ briefId: 'brief-x', version: 'v01', channel: 'blog', source: 'fixture', sufficient: false, period: { from: '2026-01-02', to: '2026-01-01' } }));
    assert.equal(invalid.status, 422);
    const metric = await fx.request('/api/metrics', fx.tokens['operator-a']!, post({ briefId: 'brief-x', version: 'v01', channel: 'blog', source: 'fixture', sufficient: false, limitation: 'fixture has no publication data', period: { from: '2026-01-01', to: '2026-01-02' }, attention: {}, trust: {}, traffic: {}, leads: {}, conversion: {} }));
    assert.equal(metric.status, 201); const body = await metric.json(); assert.equal(body.feedback.metricId, body.metric.id);
    const feedback = await fx.request('/api/feedback', fx.tokens['operator-a']!); assert.equal(feedback.status, 200); assert.equal((await feedback.json()).length, 1);
    const audit = await fx.request('/api/audit-events', fx.tokens['operator-a']!); assert.equal(audit.status, 200); assert.ok(Array.isArray(await audit.json()));
    const readiness = await fx.request('/api/readiness', fx.tokens['operator-a']!); assert.equal(readiness.status, 200); assert.equal((await readiness.json()).publication, 'blocked');
  } finally { await fx.close(); }
});
