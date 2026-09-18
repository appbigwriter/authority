import type { PersistenceStore, StoreData } from './persistence/types.js';

export type PersonaStatus = 'draft' | 'profile_generating' | 'profile_generated' | 'pending_approval' | 'revision_requested' | 'approved' | 'rejected' | 'generation_blocked' | 'archived';
export type PersonaVersionStatus = 'draft' | 'generating' | 'generated' | 'pending_approval' | 'approved' | 'superseded' | 'rejected' | 'archived';
export type BibleStatus = 'draft' | 'generated' | 'pending_approval' | 'approved' | 'superseded' | 'blocked';
export type ChannelKey = 'blog' | 'social' | 'youtube';

export interface CharacterBible {
  identity: { name: string; archetype: string; mentorRole: 'mentor'; thesis: string; promise: string; values: string[]; tensions: string[]; backstory: string };
  voice: { tone: string; rhythm: string; vocabulary: string[]; humor: string; preferredPhrases: string[]; prohibitedPhrases: string[]; assertiveness: string; cta: string };
  guardrails: { allowedClaims: string[]; softenedClaims: string[]; prohibitedClaims: string[]; disclosure: string; boundaries: string[] };
  prompts: { system: string; base: string; positive: string[]; negative: string[] };
}

/** The physical identity is deliberately explicit: these are continuity anchors, not free-form prose. */
export interface PhysicalIdentityBible {
  subject: { presentation: string; apparentAge: string; ageRange: string; ancestry: string; ethnicity: string; nationality: string; genderExpression: string; pronouns: string };
  body: { height: string; build: string; bodyShape: string; posture: string; proportions: string; skinTone: string; undertone: string; skinTexture: string; distinguishingMarks: string[]; tattoos: string[]; scars: string[]; birthmarks: string[] };
  head: { faceShape: string; forehead: string; jawline: string; cheekbones: string; chin: string; ears: string; nose: string; lips: string; teeth: string; smile: string };
  eyes: { color: string; shape: string; size: string; spacing: string; brows: string; lashes: string; gaze: string; eyewear: string };
  hair: { color: string; texture: string; density: string; length: string; cut: string; parting: string; facialHair: string; styling: string; allowedVariations: string[] };
  wardrobe: { silhouette: string; staples: string[]; colors: string[]; materials: string[]; accessories: string[]; footwear: string; prohibitedElements: string[] };
  presentation: { makeup: string; nails: string; expression: string; gestures: string[]; postureInFrame: string; lightingResponse: string };
  invariants: { critical: string[]; allowedVariations: string[]; prohibitedChanges: string[] };
  generation: { positivePrompt: string; negativePrompt: string; referenceAssetIds: string[]; modelIndependentNotes: string[] };
}

export interface VisualConsistencyProfile {
  faceAnchor: string; bodyAnchor: string; silhouetteAnchor: string; palette: string[]; lighting: string; cameraLanguage: string; compositionRules: string[]; continuityRules: string[]; referenceAssetIds: string[];
}

export interface EditorialProfile {
  positioning: string; audience: string; pillars: string[]; formats: string[]; cadence: string; qualityCriteria: string[]; topics: { allowed: string[]; prohibited: string[] }; disclosure: string;
}

export interface ChannelPlan {
  channel: ChannelKey; objective: string; audience: string; formats: string[]; cadence: string; pillars: string[]; disclosure: string; constraints: string[]; plan: string;
}

export interface PersonaVersionSnapshot {
  characterBible: CharacterBible;
  physicalIdentityBible: PhysicalIdentityBible;
  visualConsistencyProfile: VisualConsistencyProfile;
  editorialProfile: EditorialProfile;
  channelPlans: ChannelPlan[];
}

export interface Persona {
  id: string; projectId: string; ownerId: string; name: string; currentVersionId: string | null; status: PersonaStatus; createdAt: string; updatedAt: string;
}

export interface PersonaVersion {
  id: string; personaId: string; projectId: string; ownerId: string; version: number; status: PersonaVersionStatus; snapshot: PersonaVersionSnapshot; sourceRunIds: string[]; contentHash?: string; createdAt: string;
}

export interface PersonaVersionTransition {
  id: string; personaVersionId: string; from: PersonaVersionStatus; to: PersonaVersionStatus; actor: string; reason: string; createdAt: string; invalidation?: InvalidationMetadata;
}

export interface InvalidationMetadata { criticalChanged: boolean; changedPaths: string[]; invalidates: Array<'visual_consistency' | 'channel_plans' | 'editorial_profile' | 'approval' | 'generated_assets'>; reason: string; }
export interface CompletenessResult { complete: boolean; missingPaths: string[]; }
export interface CriticalChangeResult extends InvalidationMetadata { }

const requiredPaths = [
  'characterBible.identity.name', 'characterBible.identity.thesis', 'characterBible.identity.promise', 'characterBible.voice.tone',
  'physicalIdentityBible.subject.apparentAge', 'physicalIdentityBible.subject.genderExpression', 'physicalIdentityBible.body.build',
  'physicalIdentityBible.body.skinTone', 'physicalIdentityBible.head.faceShape', 'physicalIdentityBible.eyes.color',
  'physicalIdentityBible.hair.color', 'physicalIdentityBible.hair.texture', 'physicalIdentityBible.wardrobe.silhouette',
  'physicalIdentityBible.invariants.critical', 'visualConsistencyProfile.faceAnchor', 'visualConsistencyProfile.bodyAnchor',
  'editorialProfile.positioning', 'editorialProfile.audience', 'editorialProfile.pillars',
] as const;

const criticalPaths = [
  'physicalIdentityBible.subject.apparentAge', 'physicalIdentityBible.subject.ancestry', 'physicalIdentityBible.subject.ethnicity',
  'physicalIdentityBible.subject.genderExpression', 'physicalIdentityBible.body.skinTone', 'physicalIdentityBible.body.build',
  'physicalIdentityBible.body.bodyShape', 'physicalIdentityBible.body.distinguishingMarks', 'physicalIdentityBible.head.faceShape',
  'physicalIdentityBible.eyes.color', 'physicalIdentityBible.hair.color', 'physicalIdentityBible.hair.texture',
  'physicalIdentityBible.hair.cut', 'physicalIdentityBible.invariants.critical', 'visualConsistencyProfile.faceAnchor',
  'visualConsistencyProfile.bodyAnchor',
] as const;

const get = (value: unknown, path: string): unknown => path.split('.').reduce<unknown>((current, key) => (typeof current === 'object' && current !== null ? (current as Record<string, unknown>)[key] : undefined), value);
const isBlank = (value: unknown): boolean => value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);

export function checkPersonaVersionCompleteness(snapshot: PersonaVersionSnapshot): CompletenessResult {
  const missingPaths = requiredPaths.filter((path) => isBlank(get(snapshot, path)));
  const plans = snapshot.channelPlans ?? [];
  if (plans.length === 0) missingPaths.push('channelPlans' as never);
  for (const channel of ['blog', 'social', 'youtube'] as const) if (!plans.some((plan) => plan.channel === channel)) missingPaths.push(`channelPlans[${channel}]` as never);
  return { complete: missingPaths.length === 0, missingPaths: [...missingPaths] };
}

export function assertPersonaVersionComplete(snapshot: PersonaVersionSnapshot): void {
  const result = checkPersonaVersionCompleteness(snapshot);
  if (!result.complete) throw new Error(`persona_version_incomplete:${result.missingPaths.join(',')}`);
}

const stable = (value: unknown): string => JSON.stringify(value, Object.keys(value as object).sort());
export function detectCriticalAttributeChanges(previous: PersonaVersionSnapshot, next: PersonaVersionSnapshot): CriticalChangeResult {
  const changedPaths = criticalPaths.filter((path) => stable(get(previous, path)) !== stable(get(next, path)));
  const criticalChanged = changedPaths.length > 0;
  return { criticalChanged, changedPaths: [...changedPaths], invalidates: criticalChanged ? ['visual_consistency', 'channel_plans', 'editorial_profile', 'approval', 'generated_assets'] : [], reason: criticalChanged ? 'critical_identity_attributes_changed' : 'no_critical_identity_change' };
}

const transitions: Record<PersonaVersionStatus, readonly PersonaVersionStatus[]> = {
  draft: ['generating', 'generated', 'rejected', 'archived'], generating: ['generated', 'rejected', 'archived'], generated: ['pending_approval', 'approved', 'superseded', 'rejected'], pending_approval: ['approved', 'rejected', 'superseded'], approved: ['superseded', 'archived'], superseded: ['archived'], rejected: ['draft', 'archived'], archived: [],
};
export function transitionPersonaVersion(version: PersonaVersion, to: PersonaVersionStatus, actor: string, reason: string, invalidation?: InvalidationMetadata): PersonaVersionTransition {
  if (!transitions[version.status].includes(to)) throw new Error(`invalid_persona_version_transition:${version.status}->${to}`);
  if (!actor.trim() || !reason.trim()) throw new Error('transition_actor_and_reason_required');
  return { id: `${version.id}:transition:${Date.now()}`, personaVersionId: version.id, from: version.status, to, actor, reason, createdAt: new Date().toISOString(), ...(invalidation ? { invalidation } : {}) };
}

export function createPersonaVersion(input: Omit<PersonaVersion, 'status' | 'contentHash' | 'createdAt'> & { status?: PersonaVersionStatus; createdAt?: string }): PersonaVersion {
  assertPersonaVersionComplete(input.snapshot);
  const createdAt = input.createdAt ?? new Date().toISOString();
  return Object.freeze({ ...input, status: input.status ?? 'draft', contentHash: stable(input.snapshot), createdAt });
}

export interface PersonaVersionRepository {
  savePersona(persona: Persona): Promise<Persona>;
  getPersona(id: string): Promise<Persona | undefined>;
  appendVersion(version: PersonaVersion): Promise<PersonaVersion>;
  getVersion(id: string): Promise<PersonaVersion | undefined>;
  listVersions(personaId: string): Promise<PersonaVersion[]>;
  appendTransition(transition: PersonaVersionTransition): Promise<PersonaVersionTransition>;
}

export class AuthorityPersonaRepository implements PersonaVersionRepository {
  constructor(private readonly store: PersistenceStore, private readonly context: { projectId: string; ownerId: string }) {}
  async savePersona(persona: Persona): Promise<Persona> { return await this.store.append('personas', persona) as Persona; }
  async getPersona(id: string): Promise<Persona | undefined> { return (await this.store.read(this.context)).personas.find((item) => item.id === id); }
  async appendVersion(version: PersonaVersion): Promise<PersonaVersion> { if (await this.getVersion(version.id)) throw new Error('persona_version_immutable'); return await this.store.append('persona_versions', version) as PersonaVersion; }
  async getVersion(id: string): Promise<PersonaVersion | undefined> { const data = await this.store.read(this.context); const item = data.persona_versions.find((version) => version.id === id); if (!item) return undefined; const transitionsForVersion = data.persona_version_transitions.filter((transition) => transition.personaVersionId === id); const latest = transitionsForVersion.at(-1); return latest ? { ...item, status: latest.to } : item; }
  async listVersions(personaId: string): Promise<PersonaVersion[]> { const data = await this.store.read(this.context); return data.persona_versions.filter((version) => version.personaId === personaId).map((item) => { const latest = data.persona_version_transitions.filter((transition) => transition.personaVersionId === item.id).at(-1); return latest ? { ...item, status: latest.to } : item; }); }
  async appendTransition(transition: PersonaVersionTransition): Promise<PersonaVersionTransition> { const version = await this.getVersion(transition.personaVersionId); if (!version || version.status !== transition.from) throw new Error('persona_version_transition_stale'); return await this.store.append('persona_version_transitions', transition) as PersonaVersionTransition; }
}

export type PersonaCollections = Pick<StoreData, 'personas' | 'persona_versions' | 'persona_version_transitions'>;
