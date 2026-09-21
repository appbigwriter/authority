import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  emptyStoreData,
  operationalCollections,
  type PersistenceContext,
  type PersistenceStore,
  type SqlClient,
  type StoreCollection,
  type StoreData,
} from './persistence/types.js';

export type {
  AssetRecord,
  EventRecord,
  PersistenceContext,
  PersistenceStore,
  SqlClient,
  StoreCollection,
  StoreData,
} from './persistence/types.js';

const cloneEmpty = (): StoreData => structuredClone(emptyStoreData) as StoreData;

const isObjectWithId = (item: unknown): item is { id: string } => (
  typeof item === 'object' && item !== null && 'id' in item && typeof (item as { id?: unknown }).id === 'string'
);

const requireContext = (context?: Partial<PersistenceContext>): PersistenceContext => {
  if (!context?.projectId || !context.ownerId) {
    throw new Error('persistence_context_required');
  }
  return { projectId: context.projectId, ownerId: context.ownerId };
};

const collectionTables = {
  outbox_events: 'custom_authorityengine.authority_outbox_events',
  outbox_receipts: 'custom_authorityengine.outbox_receipts',
  personas: 'custom_authorityengine.personas',
  persona_versions: 'custom_authorityengine.persona_versions',
  persona_version_transitions: 'custom_authorityengine.persona_version_transitions',
  opportunities: 'custom_authorityengine.opportunities',
  seeds: 'custom_authorityengine.influencer_seeds',
  profiles: 'custom_authorityengine.profiles',
  content: 'custom_authorityengine.content_items',
  briefs: 'custom_authorityengine.briefs',
  assets: 'custom_authorityengine.assets',
  approvals: 'custom_authorityengine.approvals',
  receipts: 'custom_authorityengine.receipts',
  metrics: 'custom_authorityengine.metrics',
  feedback: 'custom_authorityengine.feedback',
  events: 'custom_authorityengine.events',
  research: 'custom_authorityengine.research',
  farmer_profiles: 'custom_authorityengine.farmer_profiles',
  post_machine: 'custom_authorityengine.post_machine_outputs',
} as const satisfies Record<StoreCollection, string>;

type PersistedRow = { id: string; payload: unknown };

type UnknownRecord = Record<string, unknown>;

const readProperty = (value: unknown, key: string): unknown => (
  typeof value === 'object' && value !== null ? (value as UnknownRecord)[key] : undefined
);

const pickStatus = (value: unknown): string | null => {
  const status = readProperty(value, 'status');
  return typeof status === 'string' ? status : null;
};

const pickOptionalString = (value: unknown, key: string): string | null => {
  const item = readProperty(value, key);
  return typeof item === 'string' && item.length > 0 ? item : null;
};

const pickRequiredString = (value: unknown, key: string): string => {
  const item = pickOptionalString(value, key);
  if (!item) throw new Error(`payload_${key}_required`);
  return item;
};

const pickNumber = (value: unknown, key: string, fallback: number): number => {
  const item = readProperty(value, key);
  return typeof item === 'number' && Number.isFinite(item) ? item : fallback;
};

const requirePayloadId = (value: unknown): string => {
  if (!isObjectWithId(value)) throw new Error('payload_id_required');
  return value.id;
};

/**
 * Fake JSON persistence for local smoke tests only. Production/runtime relational
 * persistence must depend on PersistenceStore instead of this concrete fake.
 */
export class JsonStoreFake implements PersistenceStore {
  readonly kind = 'fake-json' as const;

  constructor(private readonly file: string) {}

  async read(_context?: Partial<PersistenceContext>): Promise<StoreData> {
    try {
      return { ...cloneEmpty(), ...JSON.parse(await readFile(this.file, 'utf8')) as Partial<StoreData> };
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return cloneEmpty();
      throw error;
    }
  }

  async append<C extends StoreCollection>(collection: C, value: unknown): Promise<unknown> {
    const data = await this.read();
    data[collection].push(value as never);
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(data, null, 2));
    return value;
  }

  async replace<C extends StoreCollection>(collection: C, id: string, value: unknown): Promise<unknown> {
    const data = await this.read();
    const items = data[collection] as unknown[];
    const index = items.findIndex((item) => isObjectWithId(item) && item.id === id);
    if (index < 0) throw new Error('not_found');
    items[index] = value;
    await mkdir(dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(data, null, 2));
    return value;
  }
}

/** @deprecated Use JsonStoreFake in tests or RelationalAuthorityStore in runtime wiring. */
export { JsonStoreFake as JsonStore };

export class RelationalAuthorityStore implements PersistenceStore {
  readonly kind = 'relational-postgres' as const;

  constructor(private readonly client: SqlClient, private readonly defaultContext?: Partial<PersistenceContext>) {}

  private context(context?: Partial<PersistenceContext>): PersistenceContext {
    return requireContext({ ...this.defaultContext, ...context });
  }

  async read(context?: Partial<PersistenceContext>): Promise<StoreData> {
    const { projectId, ownerId } = this.context(context);
    const data = cloneEmpty();

    await this.client.query(
      `select set_config('app.current_project_id', $1, true), set_config('app.current_owner_id', $2, true)`,
      [projectId, ownerId],
    );

    for (const collection of operationalCollections) {
      const table = collectionTables[collection];
      const result = await this.client.query<PersistedRow>(
        `select id, payload from ${table} where project_id = $1 and owner_id = $2 order by created_at asc, id asc`,
        [projectId, ownerId],
      );
      data[collection] = result.rows.map((row) => ({ ...(row.payload as object), id: row.id })) as never;
    }

    return data;
  }

  async append<C extends StoreCollection>(collection: C, value: StoreData[C][number], context?: Partial<PersistenceContext>): Promise<StoreData[C][number]> {
    const { projectId, ownerId } = this.context(context);
    const id = requirePayloadId(value);
    const table = collectionTables[collection];

    if (collection === 'events') {
      await this.client.query(
        `insert into ${table} (id, project_id, owner_id, type, target_id, payload) values ($1, $2, $3, $4, $5, $6::jsonb)`,
        [id, projectId, ownerId, pickRequiredString(value, 'type'), pickOptionalString(value, 'targetId'), JSON.stringify(value)],
      );
      return value;
    }

    if (collection === 'outbox_events') {
      await this.client.query(
        `insert into ${table} (id, project_id, owner_id, event_type, aggregate_type, aggregate_id, status, attempts, max_attempts, next_retry_at, last_error, dead_lettered_at, payload) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)`,
        [id, projectId, ownerId, pickRequiredString(value, 'eventType'), pickOptionalString(value, 'aggregateType') ?? 'unknown', pickRequiredString(value, 'aggregateId'), pickStatus(value) ?? 'pending', pickNumber(value, 'attempts', 0), pickNumber(value, 'maxAttempts', 3), pickOptionalString(value, 'nextRetryAt'), pickOptionalString(value, 'lastError'), pickOptionalString(value, 'deadLetteredAt'), JSON.stringify(value)],
      );
      return value;
    }

    if (collection === 'outbox_receipts') {
      await this.client.query(
        `insert into ${table} (id, project_id, owner_id, receipt_id, event_id, consumer, response) values ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
        [id, projectId, ownerId, pickRequiredString(value, 'receiptId'), pickRequiredString(value, 'eventId'), pickRequiredString(value, 'consumer'), JSON.stringify(readProperty(value, 'response') ?? null)],
      );
      return value;
    }

    await this.client.query(
      `insert into ${table} (id, project_id, owner_id, status, payload) values ($1, $2, $3, $4, $5::jsonb)`,
      [id, projectId, ownerId, pickStatus(value), JSON.stringify(value)],
    );
    return value;
  }

  async replace<C extends StoreCollection>(collection: C, id: string, value: unknown, context?: Partial<PersistenceContext>): Promise<StoreData[C][number]> {
    const { projectId, ownerId } = this.context(context);
    const table = collectionTables[collection];

    let result;
    if (collection === 'events') {
      result = await this.client.query<{ id: string }>(
        `update ${table} set type = $1, target_id = $2, payload = $3::jsonb where id = $4 and project_id = $5 and owner_id = $6 returning id`,
        [pickRequiredString(value, 'type'), pickOptionalString(value, 'targetId'), JSON.stringify(value), id, projectId, ownerId],
      );
    } else if (collection === 'outbox_events') {
      result = await this.client.query<{ id: string }>(
        `update ${table} set event_type = $1, aggregate_type = $2, aggregate_id = $3, status = $4, attempts = $5, max_attempts = $6, next_retry_at = $7, last_error = $8, dead_lettered_at = $9, payload = $10::jsonb, updated_at = now() where id = $11 and project_id = $12 and owner_id = $13 returning id`,
        [pickRequiredString(value, 'eventType'), pickOptionalString(value, 'aggregateType') ?? 'unknown', pickRequiredString(value, 'aggregateId'), pickStatus(value) ?? 'pending', pickNumber(value, 'attempts', 0), pickNumber(value, 'maxAttempts', 3), pickOptionalString(value, 'nextRetryAt'), pickOptionalString(value, 'lastError'), pickOptionalString(value, 'deadLetteredAt'), JSON.stringify(value), id, projectId, ownerId],
      );
    } else if (collection === 'outbox_receipts') {
      result = await this.client.query<{ id: string }>(
        `update ${table} set receipt_id = $1, event_id = $2, consumer = $3, response = $4::jsonb where id = $5 and project_id = $6 and owner_id = $7 returning id`,
        [pickRequiredString(value, 'receiptId'), pickRequiredString(value, 'eventId'), pickRequiredString(value, 'consumer'), JSON.stringify(readProperty(value, 'response') ?? null), id, projectId, ownerId],
      );
    } else {
      result = await this.client.query<{ id: string }>(
        `update ${table} set status = $1, payload = $2::jsonb, updated_at = now() where id = $3 and project_id = $4 and owner_id = $5 returning id`,
        [pickStatus(value), JSON.stringify(value), id, projectId, ownerId],
      );
    }
    if (result.rows.length === 0) throw new Error('not_found');
    return value;
  }
}

export const relationalTableForCollection = (collection: StoreCollection): string => collectionTables[collection];
export const persistenceForeignKeys = {
  research: { column: 'opportunity_id', collection: 'opportunities', value: (record: unknown) => pickOptionalString(record, 'opportunityId') },
  seeds: { column: 'opportunity_id', collection: 'opportunities', value: (record: unknown) => pickOptionalString(record, 'opportunityId') },
  profiles: { column: 'seed_id', collection: 'seeds', value: (record: unknown) => pickOptionalString(record, 'seedId') },
  farmer_profiles: { column: 'seed_id', collection: 'seeds', value: (record: unknown) => pickOptionalString(record, 'seedId') },
  briefs: { column: 'profile_id', collection: 'profiles', value: (record: unknown) => pickOptionalString(record, 'profileId') },
  content: { column: 'brief_id', collection: 'briefs', value: (record: unknown) => pickOptionalString(record, 'briefId') },
  receipts: { column: 'brief_id', collection: 'briefs', value: (record: unknown) => pickOptionalString(record, 'briefId') },
  metrics: { column: 'brief_id', collection: 'briefs', value: (record: unknown) => pickOptionalString(record, 'briefId') },
  feedback: { column: 'brief_id', collection: 'briefs', value: (record: unknown) => pickOptionalString(record, 'briefId') },
  assets: { column: 'brief_id', collection: 'briefs', value: (record: unknown) => pickOptionalString(record, 'briefId') },
  post_machine: { column: 'profile_id', collection: 'farmer_profiles', value: (record: unknown) => pickOptionalString(record, 'profileId') },
} as const;
