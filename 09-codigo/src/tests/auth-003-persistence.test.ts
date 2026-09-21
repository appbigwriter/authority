import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  RelationalAuthorityStore,
  relationalTableForCollection,
  type SqlClient,
  type StoreCollection,
} from '../repository.js';
import { operationalCollections } from '../persistence/types.js';

const root = resolve(process.cwd(), '..');
const sqlPath = resolve(root, '04-database', '001-custom-authorityengine-operational.sql');

class RecordingSqlClient implements SqlClient {
  calls: { sql: string; params: readonly unknown[] }[] = [];
  rowsByTable = new Map<string, unknown[]>();

  async query<Row = unknown>(sql: string, params: readonly unknown[] = []) {
    this.calls.push({ sql, params });
    const table = [...this.rowsByTable.keys()].find((key) => sql.includes(key));
    return { rows: (table ? this.rowsByTable.get(table) : []) as Row[] };
  }
}

test('AUTH-003 SQL cobre todas as coleções operacionais com schema qualificado, RLS e índices', async () => {
  const sql = await readFile(sqlPath, 'utf8');

  assert.match(sql, /create schema if not exists custom_authorityengine;/);
  assert.doesNotMatch(sql, /create table if not exists (?!custom_authorityengine\.)/i);

  const expectedTables = new Map<StoreCollection, string>([
    ['opportunities', 'opportunities'],
    ['seeds', 'influencer_seeds'],
    ['profiles', 'profiles'],
    ['content', 'content_items'],
    ['briefs', 'briefs'],
    ['assets', 'assets'],
    ['approvals', 'approvals'],
    ['receipts', 'receipts'],
    ['metrics', 'metrics'],
    ['feedback', 'feedback'],
    ['events', 'events'],
    ['research', 'research'],
    ['farmer_profiles', 'farmer_profiles'],
    ['post_machine', 'post_machine_outputs'],
  ]);

  for (const collection of operationalCollections) {
    const table = expectedTables.get(collection);
    assert.ok(table, `sem tabela esperada para ${collection}`);
    assert.match(sql, new RegExp(`create table if not exists custom_authorityengine\\.${table} \\(`), `${collection} sem tabela qualificada`);
    assert.match(sql, new RegExp(`alter table custom_authorityengine\\.${table} enable row level security;`), `${collection} sem RLS enable`);
    assert.match(sql, new RegExp(`alter table custom_authorityengine\\.${table} force row level security;`), `${collection} sem RLS force`);
    assert.match(sql, new RegExp(`create policy .* on custom_authorityengine\\.${table}.*current_project_id\\(\\).*current_owner_id\\(\\)`, 's'), `${collection} sem policy ownership fail-closed`);
  }

  assert.match(sql, /project_id text not null references custom_authorityengine\.projects\(id\)/);
  assert.match(sql, /owner_id text not null/);
  assert.match(sql, /references custom_authorityengine\.opportunities\(id\)/);
  assert.match(sql, /references custom_authorityengine\.influencer_seeds\(id\)/);
  assert.match(sql, /references custom_authorityengine\.briefs\(id\)/);
  assert.match(sql, /create index if not exists idx_ae_metrics_project_brief/);
});

test('adapter relacional exige project/owner e consulta isolada por ownership', async () => {
  const client = new RecordingSqlClient();
  const store = new RelationalAuthorityStore(client);

  await assert.rejects(() => store.read(), /persistence_context_required/);

  client.rowsByTable.set('custom_authorityengine.opportunities', [
    { id: 'opp1', payload: { id: 'opp1', niche: 'n', status: 'candidate' } },
  ]);

  const data = await store.read({ projectId: 'project-a', ownerId: 'owner-a' });
  assert.equal(data.opportunities.length, 1);
  assert.equal(data.opportunities[0]?.id, 'opp1');
  assert.equal(client.calls.length, operationalCollections.length + 1);

  for (const call of client.calls.slice(1)) {
    assert.match(call.sql, /where project_id = \$1 and owner_id = \$2/);
    assert.deepEqual(call.params, ['project-a', 'owner-a']);
  }
});

test('adapter relacional grava atrás da interface sem usar JsonStore fake', async () => {
  const client = new RecordingSqlClient();
  const store = new RelationalAuthorityStore(client, { projectId: 'project-a', ownerId: 'owner-a' });

  const inserted = await store.append('opportunities', {
    id: 'opp1',
    niche: 'home office',
    subniche: 'ergonomia',
    problem: 'dor lombar',
    audience: 'freelancers',
    products: [],
    trends: [],
    scores: { demand: 1, intent: 1, content: 1, productFit: 1, authority: 1, risk: 1, confidence: 1, total: 6, factors: {} as never, version: 'test' },
    risks: [],
    blockers: [],
    evidence: [],
    status: 'candidate',
  }) as { id: string };

  assert.equal(inserted.id, 'opp1');
  assert.match(client.calls[0]?.sql ?? '', new RegExp(`insert into ${relationalTableForCollection('opportunities').replace('.', '\\.')}`));
  assert.deepEqual(client.calls[0]?.params.slice(0, 4), ['opp1', 'project-a', 'owner-a', 'candidate']);

  await assert.rejects(
    () => store.replace('opportunities', 'missing', inserted),
    /not_found/,
    'update sem returning precisa falhar fechado',
  );
});

test('adapter relacional mapeia events e outbox para o schema especializado, sem coluna status inválida', async () => {
  const client = new RecordingSqlClient();
  const store = new RelationalAuthorityStore(client, { projectId: 'project-a', ownerId: 'owner-a' });

  await store.append('events', { id: 'event-1', type: 'persona.pending_approval', targetId: 'persona-1', payload: { safe: true } } as any);
  await store.append('outbox_events', { id: 'outbox-1', eventId: 'outbox-1', eventType: 'persona.pending_approval', aggregateType: 'persona', aggregateId: 'persona-1', payload: { safe: true }, status: 'pending', attempts: 0, maxAttempts: 3, createdAt: '2026-09-21T00:00:00.000Z' } as any);
  await store.append('outbox_receipts', { id: 'receipt-1', receiptId: 'receipt-1', eventId: 'outbox-1', consumer: 'agency-flux', response: { accepted: true }, createdAt: '2026-09-21T00:00:00.000Z' } as any);

  assert.match(client.calls[0]?.sql ?? '', /insert into custom_authorityengine\.events .*type, target_id, payload/);
  assert.match(client.calls[1]?.sql ?? '', /insert into custom_authorityengine\.authority_outbox_events .*event_type, aggregate_type, aggregate_id/);
  assert.match(client.calls[2]?.sql ?? '', /insert into custom_authorityengine\.outbox_receipts .*receipt_id, event_id, consumer, response/);
  assert.doesNotMatch(client.calls[0]?.sql ?? '', /status/);
  assert.doesNotMatch(client.calls[2]?.sql ?? '', /status/);
});
