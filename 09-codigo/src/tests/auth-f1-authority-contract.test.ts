import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';
import { authConfigForTests } from '../auth.js';

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'authority-contract-'));
  const { config, tokens } = authConfigForTests([
    { id: 'operator-a', role: 'operator', ownerId: 'owner-a' },
    { id: 'reviewer-a', role: 'reviewer', ownerId: 'owner-a' },
    { id: 'viewer-a', role: 'viewer', ownerId: 'owner-a' },
  ]);
  const server = createAuthorityServer(new JsonStore(join(dir, 'state.json')), { auth: config });
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

test('authenticated approved Persona read model is versioned and emits the canonical outbox envelope', async () => {
  const fx = await fixture();
  try {
    const created = await fx.request('/api/personas', fx.tokens['operator-a'], { method: 'POST', body: JSON.stringify({ name: 'Mara', thesis: 'evidence first' }) });
    const persona = await created.json();
    const generated = await fx.request(`/api/personas/${persona.id}/generate`, fx.tokens['operator-a'], { method: 'POST', body: '{}' });
    const version = await generated.json();
    const packResponse = await fx.request(`/api/personas/${persona.id}/approval-pack`, fx.tokens['operator-a'], { method: 'POST', body: '{}' });
    const pack = await packResponse.json();
    const approved = await fx.request(`/api/approval-packs/${pack.id}/approve`, fx.tokens['reviewer-a'], { method: 'POST', body: JSON.stringify({ personaVersion: version.version }) });
    assert.equal(approved.status, 200);

    const read = await fx.request(`/api/personas/${persona.id}/read-model`, fx.tokens['viewer-a']);
    assert.equal(read.status, 200);
    const model = await read.json();
    assert.equal(model.persona_id, persona.id);
    assert.equal(model.persona_version_id, version.id);
    assert.equal(model.persona_version, version.version);
    assert.equal(model.status, 'approved');
    assert.match(model.content_hash, /^[a-f0-9]{64}$/);
    assert.equal(JSON.stringify(model).includes('secret'), false);
    const readAgain = await fx.request(`/api/personas/${persona.id}/read-model`, fx.tokens['viewer-a']);
    assert.equal((await readAgain.json()).content_hash, model.content_hash);

    const emitted = await fx.request(`/api/personas/${persona.id}/approved-event`, fx.tokens['reviewer-a'], {
      method: 'POST',
      body: JSON.stringify({ blogId: 'blog-1', blogNameVersionId: 'blog-name-1', correlationId: 'corr-1' }),
    });
    assert.equal(emitted.status, 201);
    const envelope = await emitted.json();
    assert.equal(envelope.event_type, 'persona.approved');
    assert.equal(envelope.event_version, 1);
    assert.equal(envelope.aggregate_type, 'persona');
    assert.equal(envelope.aggregate_id, persona.id);
    assert.equal(envelope.aggregate_version, version.version);
    assert.deepEqual(envelope.payload, { persona_id: persona.id, persona_version_id: version.id, blog_id: 'blog-1', blog_name_version_id: 'blog-name-1' });

    const replay = await fx.request(`/api/personas/${persona.id}/approved-event`, fx.tokens['reviewer-a'], {
      method: 'POST',
      body: JSON.stringify({ blogId: 'blog-1', blogNameVersionId: 'blog-name-1', correlationId: 'corr-1' }),
    });
    assert.equal(replay.status, 409);
  } finally { await fx.close(); }
});

test('approved Persona read model and event require authentication and approval', async () => {
  const fx = await fixture();
  try {
    assert.equal((await fx.request('/api/personas/missing/read-model', undefined)).status, 401);
    const created = await fx.request('/api/personas', fx.tokens['operator-a'], { method: 'POST', body: JSON.stringify({ name: 'Draft' }) });
    const persona = await created.json();
    assert.equal((await fx.request(`/api/personas/${persona.id}/read-model`, fx.tokens['viewer-a'])).status, 422);
    assert.equal((await fx.request(`/api/personas/${persona.id}/approved-event`, fx.tokens['reviewer-a'], { method: 'POST', body: JSON.stringify({ blogId: 'b', blogNameVersionId: 'n' }) })).status, 422);
  } finally { await fx.close(); }
});
