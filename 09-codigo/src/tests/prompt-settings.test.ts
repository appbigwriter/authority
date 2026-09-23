import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PromptRegistry, DEFAULT_PROMPTS } from '../prompt-registry.js';
import { JsonStore } from '../repository.js';
import { createAuthorityServer } from '../server.js';

test('PromptRegistry: initializes with defaults and supports update/reset lifecycle', () => {
  const registry = new PromptRegistry();
  const list = registry.list();

  assert.equal(list.length, Object.keys(DEFAULT_PROMPTS).length);
  assert.ok(list.some(p => p.key === 'seeds_creator'));
  assert.ok(list.some(p => p.key === 'opportunity_research'));
  assert.ok(list.some(p => p.key === 'character_bible'));
  assert.ok(list.some(p => p.key === 'post_machine_draft'));

  const initialSeed = registry.get('seeds_creator');
  assert.equal(initialSeed.version, 1);
  assert.equal(initialSeed.isDefault, true);
  assert.equal(initialSeed.model, 'gpt-4o-mini');

  const updated = registry.update('seeds_creator', {
    model: 'gpt-4o',
    temperature: 0.8,
    promptTemplate: 'Customizado para foco em autoridade científica.',
  }, 'sergio-operator');

  assert.equal(updated.version, 2);
  assert.equal(updated.isDefault, false);
  assert.equal(updated.model, 'gpt-4o');
  assert.equal(updated.temperature, 0.8);
  assert.equal(updated.updatedBy, 'sergio-operator');

  const fetched = registry.get('seeds_creator');
  assert.equal(fetched.version, 2);
  assert.equal(fetched.promptTemplate, 'Customizado para foco em autoridade científica.');

  const reset = registry.reset('seeds_creator');
  assert.equal(reset.version, 1);
  assert.equal(reset.isDefault, true);
  assert.equal(reset.model, 'gpt-4o-mini');
});

test('HTTP API: /api/settings/prompts endpoints with audit events', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'prompts-test-'));
  const filePath = join(tempDir, 'store.json');
  const store = new JsonStore(filePath);

  const server = createAuthorityServer(store, {
    auth: {
      tokens: { 'test-operator-token': { id: 'usr-sergio', ownerId: 'usr-sergio', role: 'operator', tenantId: 'fbr-agency' } },
    },
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;
  const authHeaders = {
    authorization: 'Bearer test-operator-token',
    'x-tenant-id': 'fbr-agency',
    'content-type': 'application/json',
  };

  try {
    // 1. GET /api/settings/prompts
    const listRes = await fetch(`${baseUrl}/api/settings/prompts`, { headers: authHeaders });
    assert.equal(listRes.status, 200);
    const prompts = (await listRes.json()) as any[];
    assert.ok(Array.isArray(prompts));
    assert.ok(prompts.length >= 6);

    // 2. GET /api/settings/prompts/:key
    const getRes = await fetch(`${baseUrl}/api/settings/prompts/character_bible`, { headers: authHeaders });
    assert.equal(getRes.status, 200);
    const bible = (await getRes.json()) as any;
    assert.equal(bible.key, 'character_bible');
    assert.equal(bible.category, 'farmer');
    assert.ok(Array.isArray(bible.availableVariables));

    // 3. PUT /api/settings/prompts/:key
    const updateRes = await fetch(`${baseUrl}/api/settings/prompts/character_bible`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet',
        temperature: 0.55,
        maxTokens: 4000,
        promptTemplate: 'Prompt refinado com ênfase em autoridade e ética.',
      }),
    });
    assert.equal(updateRes.status, 200);
    const updated = (await updateRes.json()) as any;
    assert.equal(updated.version, 2);
    assert.equal(updated.model, 'claude-3-5-sonnet');
    assert.equal(updated.temperature, 0.55);
    assert.equal(updated.isDefault, false);

    // 4. Check audit events
    const auditRes = await fetch(`${baseUrl}/api/audit-events`, { headers: authHeaders });
    const events = (await auditRes.json()) as any[];
    const promptUpdateEvent = events.find(e => e.type === 'settings.prompt_updated' && e.targetId === 'character_bible');
    assert.ok(promptUpdateEvent, 'Deve registrar evento de auditoria ao atualizar prompt');
    assert.equal(promptUpdateEvent.payload.version, 2);

    // 5. POST /api/settings/prompts/:key/reset
    const resetRes = await fetch(`${baseUrl}/api/settings/prompts/character_bible/reset`, {
      method: 'POST',
      headers: authHeaders,
    });
    assert.equal(resetRes.status, 200);
    const resetBible = (await resetRes.json()) as any;
    assert.equal(resetBible.version, 1);
    assert.equal(resetBible.isDefault, true);
    assert.equal(resetBible.model, 'gpt-4o-mini');

    // 6. Check reset audit event
    const auditRes2 = await fetch(`${baseUrl}/api/audit-events`, { headers: authHeaders });
    const events2 = (await auditRes2.json()) as any[];
    const promptResetEvent = events2.find(e => e.type === 'settings.prompt_reset' && e.targetId === 'character_bible');
    assert.ok(promptResetEvent, 'Deve registrar evento de auditoria ao resetar prompt');
  } finally {
    server.close();
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});
