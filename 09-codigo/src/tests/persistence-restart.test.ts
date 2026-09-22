import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { JsonStore } from '../repository.js';

test('S1-T03 fake persistence serializes concurrent writes and survives restart readback', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'authority-persistence-'));
  const file = join(dir, 'state.json');
  try {
    const first = new JsonStore(file);
    await Promise.all(Array.from({ length: 25 }, (_, index) => first.append('opportunities', { id: `opp-${index}`, status: 'candidate' } as any)));
    const restarted = new JsonStore(file);
    const data = await restarted.read();
    assert.equal(data.opportunities.length, 25);
    assert.deepEqual(new Set(data.opportunities.map((item) => item.id)).size, 25);
    assert.doesNotMatch(await readFile(file, 'utf8'), /token|api[_-]?key|secret/i);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
