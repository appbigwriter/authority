import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStoreFake } from '../repository.js';
import { PersonaEventOutbox, type PersonaOutboxEvent } from '../persona-outbox.js';

const context = { projectId: 'project-a', ownerId: 'owner-a' };

async function withOutbox(run: (outbox: PersonaEventOutbox, store: JsonStoreFake) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), 'authority-outbox-'));
  const store = new JsonStoreFake(join(directory, 'store.json'));
  try {
    await run(new PersonaEventOutbox(store, context), store);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function transition() {
  return {
    id: 'version-1:transition:1',
    personaVersionId: 'version-1',
    from: 'generated' as const,
    to: 'pending_approval' as const,
    actor: 'operator-1',
    reason: 'ready for review',
    createdAt: '2026-09-18T12:00:00.000Z',
  };
}

test('transition and persona event are persisted in the same local persistence architecture', async () => {
  await withOutbox(async (outbox, store) => {
    const event = await outbox.recordTransition(transition(), {
      eventType: 'persona.pending_approval',
      payload: { personaVersionId: 'version-1', status: 'pending_approval' },
    });
    const data = await store.read(context);
    assert.equal(data.persona_version_transitions.length, 1);
    assert.equal(data.persona_version_transitions[0]?.id, transition().id);
    assert.equal(data.outbox_events.length, 1);
    assert.equal(data.outbox_events[0]?.eventId, event.eventId);
    assert.equal(data.outbox_events[0]?.aggregateId, 'version-1');
  });
});

test('duplicate consumer replay returns the stored receipt without invoking the handler twice', async () => {
  await withOutbox(async (outbox) => {
    const event = await outbox.recordTransition(transition(), {
      eventType: 'persona.pending_approval',
      payload: { personaVersionId: 'version-1' },
    });
    let calls = 0;
    const handler = async () => { calls += 1; return { accepted: true }; };
    const first = await outbox.consume(event.eventId, 'agency-flux', handler);
    const replay = await outbox.consume(event.eventId, 'agency-flux', handler);
    assert.equal(calls, 1);
    assert.equal(first.duplicate, false);
    assert.equal(replay.duplicate, true);
    assert.equal(replay.receipt.receiptId, first.receipt.receiptId);
  });
});

test('consumer failures record attempts, retry metadata, and dead-letter after the limit', async () => {
  await withOutbox(async (outbox, store) => {
    const event = await outbox.recordTransition(transition(), {
      eventType: 'persona.pending_approval',
      payload: { personaVersionId: 'version-1' },
      maxAttempts: 2,
    });
    const fail = async () => { throw new Error('downstream unavailable'); };
    await assert.rejects(() => outbox.consume(event.eventId, 'agency-flux', fail), /downstream unavailable/);
    let stored = (await store.read(context)).outbox_events[0] as PersonaOutboxEvent;
    assert.equal(stored.attempts, 1);
    assert.equal(stored.status, 'retrying');
    assert.equal(stored.lastError, 'downstream unavailable');
    assert.ok(stored.nextRetryAt);
    await assert.rejects(() => outbox.consume(event.eventId, 'agency-flux', fail), /downstream unavailable/);
    stored = (await store.read(context)).outbox_events[0] as PersonaOutboxEvent;
    assert.equal(stored.attempts, 2);
    assert.equal(stored.status, 'dead_letter');
    assert.ok(stored.deadLetteredAt);
  });
});

test('outbox payload is sanitized and contains no secret-bearing fields', async () => {
  await withOutbox(async (outbox, store) => {
    const event = await outbox.recordTransition(transition(), {
      eventType: 'persona.pending_approval',
      payload: {
        safe: 'visible',
        password: 'do-not-store',
        nested: { access_token: 'do-not-store', ok: true },
        authorization: 'Bearer do-not-store',
      },
    });
    const data = await store.read(context);
    assert.deepEqual(data.outbox_events[0]?.payload, { safe: 'visible', nested: { ok: true } });
    assert.equal(event.payload.safe, 'visible');
    assert.equal(JSON.stringify(data.outbox_events).includes('do-not-store'), false);
  });
});
