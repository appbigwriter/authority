import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';

test('API expõe health, persiste oportunidade e exige aprovação explícita', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'authority-engine-'));
  const server = createAuthorityServer(new JsonStore(join(dir, 'state.json')));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${base}/health`); assert.equal(health.status, 200); assert.equal((await health.json()).service, 'authority-engine');
  const created = await fetch(`${base}/api/opportunities`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ niche: 'gear', subniche: 'displays' }) });
  assert.equal(created.status, 201);
  const denied = await fetch(`${base}/api/approvals`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approved: false }) });
  assert.equal(denied.status, 422);
  const state = await fetch(`${base}/api/state`); assert.equal((await state.json()).opportunities.length, 1);
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await rm(dir, { recursive: true, force: true });
});
