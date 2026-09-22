import type {
  Approval,
  ContentBrief,
  ContentDraft,
  MetricRecord,
  Opportunity,
  Profile,
  PublicationReceipt,
  RadarFeedback,
} from '../types.js';
import type {
  FarmerProfile,
  OpportunityResearch,
  PostMachineOutput,
} from '../types-extended.js';
import type {
  Persona,
  PersonaVersion,
  PersonaVersionTransition,
} from '../persona-domain.js';

export interface AssetRecord {
  id: string;
  briefId?: string;
  profileId?: string;
  kind?: string;
  uri?: string;
  payload?: Record<string, unknown>;
}

export interface EventRecord {
  id: string;
  type: string;
  actor?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  createdAt?: string;
}

export interface OutboxEventRecord { id: string; eventId: string; eventType: string; aggregateId: string; payload: Record<string, unknown>; status: 'pending' | 'retrying' | 'delivered' | 'dead_letter'; attempts: number; maxAttempts: number; lastError?: string; nextRetryAt?: string; deadLetteredAt?: string; createdAt: string; envelope?: Record<string, unknown>; }
export interface OutboxReceiptRecord { id: string; receiptId: string; eventId: string; consumer: string; response: unknown; createdAt: string; }

export interface StoreData {
  outbox_events: OutboxEventRecord[];
  outbox_receipts: OutboxReceiptRecord[];
  personas: Persona[];
  persona_versions: PersonaVersion[];
  persona_version_transitions: PersonaVersionTransition[];
  opportunities: Opportunity[];
  seeds: unknown[];
  profiles: Profile[];
  content: ContentDraft[];
  briefs: ContentBrief[];
  assets: AssetRecord[];
  approvals: Approval[];
  receipts: PublicationReceipt[];
  metrics: MetricRecord[];
  feedback: RadarFeedback[];
  events: EventRecord[];
  research: OpportunityResearch[];
  farmer_profiles: FarmerProfile[];
  post_machine: PostMachineOutput[];
  partners: Record<string, unknown>[];
  sources: Record<string, unknown>[];
  llm_runs: Record<string, unknown>[];
}

export type StoreCollection = keyof StoreData;

export const operationalCollections = [
  'opportunities',
  'seeds',
  'profiles',
  'content',
  'briefs',
  'assets',
  'approvals',
  'receipts',
  'metrics',
  'feedback',
  'events',
  'research',
  'farmer_profiles',
  'post_machine',
] as const satisfies readonly StoreCollection[];

export const emptyStoreData = Object.freeze({
  outbox_events: [],
  outbox_receipts: [],
  personas: [],
  persona_versions: [],
  persona_version_transitions: [],
  opportunities: [],
  seeds: [],
  profiles: [],
  content: [],
  briefs: [],
  assets: [],
  approvals: [],
  receipts: [],
  metrics: [],
  feedback: [],
  events: [],
  research: [],
  farmer_profiles: [],
  post_machine: [],
  partners: [],
  sources: [],
  llm_runs: [],
} satisfies StoreData);

export interface PersistenceContext {
  projectId: string;
  ownerId: string;
}

export interface PersistenceStore {
  readonly kind: 'fake-json' | 'relational-postgres';
  read(context?: Partial<PersistenceContext>): Promise<StoreData>;
  append<C extends StoreCollection>(collection: C, value: StoreData[C][number], context?: Partial<PersistenceContext>): Promise<StoreData[C][number]>;
  replace<C extends StoreCollection>(collection: C, id: string, value: StoreData[C][number], context?: Partial<PersistenceContext>): Promise<StoreData[C][number]>;
}

export interface SqlQueryResult<Row = unknown> {
  rows: Row[];
}

export interface SqlClient {
  query<Row = unknown>(sql: string, params?: readonly unknown[]): Promise<SqlQueryResult<Row>>;
}
