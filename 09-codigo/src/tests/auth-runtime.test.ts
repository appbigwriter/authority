import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';
import { authConfigForTests, type RuntimePrincipal } from '../auth.js';

const principals: RuntimePrincipal[] = [
  { id: 'owner-a', role: 'operator', ownerId: 'owner-a' },
  { id: 'owner-b', role: 'operator', ownerId: 'owner-b' },
  { id: 'reviewer-a', role: 'reviewer', ownerId: 'owner-a' },
  { id: 'publisher-a', role: 'publisher', ownerId: 'owner-a' },
  { id: 'viewer-a', role: 'viewer', ownerId: 'owner-a' },
  { id: 'admin', role: 'admin', ownerId: 'admin' },
];

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'authority-auth-'));
  const { config, tokens } = authConfigForTests(principals);
  const store = new JsonStore(join(dir, 'state.json'));
  const server = createAuthorityServer(store, { auth: config });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, init: RequestInit = {}, token?: string) => fetch(`${base}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  const close = async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); await rm(dir, { recursive: true, force: true }); };
  return { request, tokens, store, close };
}

test('AUTH-004 retorna 401 para credencial ausente ou inválida em rota protegida', async () => {
  const fx = await fixture();
  try {
    const missing = await fx.request('/api/opportunities', { method: 'POST', body: JSON.stringify({ niche: 'gear' }) });
    assert.equal(missing.status, 401);
    assert.equal((await missing.json()).error, 'missing_credential');
    const invalid = await fx.request('/api/opportunities', { method: 'POST', body: JSON.stringify({ niche: 'gear' }) }, 'bad-token');
    assert.equal(invalid.status, 401);
    assert.equal((await invalid.json()).error, 'invalid_credential');
  } finally { await fx.close(); }
});

test('AUTH-004 aplica 403 por role e por ownership', async () => {
  const fx = await fixture();
  try {
    const viewerDenied = await fx.request('/api/opportunities', { method: 'POST', body: JSON.stringify({ niche: 'gear', subniche: 'display', problem: 'visible booth', audience: 'exhibitors' }) }, fx.tokens['viewer-a']);
    assert.equal(viewerDenied.status, 403);

    const created = await fx.request('/api/seeds', { method: 'POST', body: JSON.stringify({ name: 'Seed A' }) }, fx.tokens['owner-a']);
    assert.equal(created.status, 201);
    const seed = await created.json();
    assert.equal(seed.ownerId, 'owner-a');

    const crossOwner = await fx.request('/api/seeds/select', { method: 'POST', body: JSON.stringify({ seedId: seed.id }) }, fx.tokens['owner-b']);
    assert.equal(crossOwner.status, 403);
    assert.equal((await crossOwner.json()).error, 'forbidden');
  } finally { await fx.close(); }
});

test('AUTH-004 gates de review, disclosure e publicação falham fechado sem adapter externo configurado', async () => {
  const fx = await fixture();
  try {
    await fx.store.append('content', { id: 'draft-1', briefId: 'brief-1', title: 't', body: 'b', caption: 'c', cta: 'cta', disclosure: 'Persona editorial de IA.', sources: [{ source: 'fixture', accessedAt: '2026-01-01T00:00:00Z', observation: 'fact', kind: 'fact' }], channel: 'short-video', format: 'script', version: 'v01', status: 'draft', ownerId: 'owner-a' } as any);
    const operatorReview = await fx.request('/api/content/draft-1/review', { method: 'POST' }, fx.tokens['owner-a']);
    assert.equal(operatorReview.status, 403);
    const reviewed = await fx.request('/api/content/draft-1/review', { method: 'POST' }, fx.tokens['reviewer-a']);
    assert.equal(reviewed.status, 200);
    assert.equal((await reviewed.json()).status, 'awaiting_human_approval');

    const approval = await fx.request('/api/approvals', { method: 'POST', body: JSON.stringify({ approved: true, scope: 'publication', targetId: 'draft-1', targetVersion: 'v01', channel: 'short-video', approver: 'Sergio' }) }, fx.tokens['reviewer-a']);
    assert.equal(approval.status, 201);

    const blocked = await fx.request('/api/content/draft-1/publish', { method: 'POST' }, fx.tokens['publisher-a']);
    assert.equal(blocked.status, 422);
    assert.equal((await blocked.json()).error, 'external_channel_not_configured');

    await fx.store.append('content', { id: 'draft-2', briefId: 'brief-2', title: 't', body: 'b', caption: 'c', cta: 'cta', sources: [{ source: 'fixture', accessedAt: '2026-01-01T00:00:00Z', observation: 'fact', kind: 'fact' }], channel: 'short-video', format: 'script', version: 'v01', status: 'awaiting_human_approval', ownerId: 'owner-a' } as any);
    await fx.store.append('approvals', { id: 'approval-2', targetId: 'draft-2', targetVersion: 'v01', channel: 'short-video', scope: 'publication', approved: true, approver: 'Sergio', approvedAt: '2026-01-01T00:00:00Z', ownerId: 'owner-a' } as any);
    const noDisclosure = await fx.request('/api/content/draft-2/publish', { method: 'POST' }, fx.tokens['publisher-a']);
    assert.equal(noDisclosure.status, 422);
    assert.equal((await noDisclosure.json()).error, 'disclosure_required');
  } finally { await fx.close(); }
});
