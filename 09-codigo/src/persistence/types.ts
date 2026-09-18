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

export interface StoreData {
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
