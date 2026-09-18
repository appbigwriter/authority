import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';
import { authConfigForTests } from '../auth.js';

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'authority-f1-003-'));
  const { config, tokens } = authConfigForTests([
    { id: 'operator-a', role: 'operator', ownerId: 'owner-a' },
    { id: 'reviewer-a', role: 'reviewer', ownerId: 'owner-a' },
    { id: 'viewer-a', role: 'viewer', ownerId: 'owner-a' },
    { id: 'operator-b', role: 'operator', ownerId: 'owner-b' },
  ]);
  const store = new JsonStore(join(dir, 'state.json'));
  const server = createAuthorityServer(store, { auth: config });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, token: string | undefined, init: RequestInit = {}) => fetch(`${base}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  const close = async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); await rm(dir, { recursive: true, force: true }); };
  return { request, tokens, close };
}

test('AUTH-F1-003 cria Persona versionada, expõe bibles/runs e faz readback do pacote', async () => {
  const fx = await fixture();
  try {
    const created = await fx.request('/api/personas', fx.tokens['operator-a'], { method: 'POST', body: JSON.stringify({ name: 'Mara', thesis: 'evidence first' }) });
    assert.equal(created.status, 201);
    const persona = await created.json();
    const generated = await fx.request(`/api/personas/${persona.id}/generate`, fx.tokens['operator-a'], { method: 'POST', body: JSON.stringify({ characterBible: { version: 'v1' }, physicalIdentityBible: { version: 'v1' } }) });
    assert.equal(generated.status, 201);
    const version = await generated.json();
    const runs = await fx.request(`/api/persona-versions/${version.id}/module-runs`, fx.tokens['viewer-a']);
    assert.equal(runs.status, 200);
    assert.equal((await runs.json()).length, 3);
    const character = await fx.request(`/api/persona-versions/${version.id}/character-bible`, fx.tokens['viewer-a']);
    assert.equal(character.status, 200);
    assert.equal((await character.json()).version, 'v1');
    const physical = await fx.request(`/api/persona-versions/${version.id}/physical-identity-bible`, fx.tokens['viewer-a']);
    assert.equal(physical.status, 200);
    const packResponse = await fx.request(`/api/personas/${persona.id}/approval-pack`, fx.tokens['operator-a'], { method: 'POST', body: '{}' });
    assert.equal(packResponse.status, 201);
    const pack = await packResponse.json();
    const readback = await fx.request(`/api/approval-packs/${pack.id}`, fx.tokens['viewer-a']);
    assert.equal(readback.status, 200);
    assert.equal((await readback.json()).personaVersionId, version.id);
  } finally { await fx.close(); }
});

test('AUTH-F1-003 rejeita sem credencial, por role, recurso inexistente e pacote stale', async () => {
  const fx = await fixture();
  try {
    assert.equal((await fx.request('/api/personas/x', undefined)).status, 401);
    assert.equal((await fx.request('/api/personas', fx.tokens['viewer-a'], { method: 'POST', body: '{}' })).status, 403);
    assert.equal((await fx.request('/api/personas/nope/versions', fx.tokens['viewer-a'])).status, 404);
    const created = await fx.request('/api/personas', fx.tokens['operator-a'], { method: 'POST', body: JSON.stringify({ name: 'N' }) });
    const persona = await created.json();
    const generated = await fx.request(`/api/personas/${persona.id}/generate`, fx.tokens['operator-a'], { method: 'POST', body: '{}' });
    const version = await generated.json();
    const packResponse = await fx.request(`/api/personas/${persona.id}/approval-pack`, fx.tokens['operator-a'], { method: 'POST', body: '{}' });
    const pack = await packResponse.json();
    const second = await fx.request(`/api/personas/${persona.id}/generate`, fx.tokens['operator-a'], { method: 'POST', body: '{}' });
    assert.equal(second.status, 201);
    const stale = await fx.request(`/api/approval-packs/${pack.id}/approve`, fx.tokens['reviewer-a'], { method: 'POST', body: JSON.stringify({ personaVersion: version.version }) });
    assert.equal(stale.status, 409);
    assert.equal((await stale.json()).error, 'stale_approval_package');
  } finally { await fx.close(); }
});
