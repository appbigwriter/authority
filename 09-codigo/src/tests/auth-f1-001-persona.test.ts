import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonStoreFake } from '../repository.js';
import {
  AuthorityPersonaRepository,
  assertPersonaVersionComplete,
  checkPersonaVersionCompleteness,
  createPersonaVersion,
  detectCriticalAttributeChanges,
  transitionPersonaVersion,
  type PersonaVersionSnapshot,
} from '../persona-domain.js';

const snapshot = (): PersonaVersionSnapshot => ({
  characterBible: {
    identity: { name: 'Lia', archetype: 'mentor', mentorRole: 'mentor', thesis: 'decisions with evidence', promise: 'clarity', values: ['honesty'], tensions: ['speed vs rigor'], backstory: 'researcher' },
    voice: { tone: 'clear', rhythm: 'measured', vocabulary: ['plain'], humor: 'dry', preferredPhrases: ['evidence first'], prohibitedPhrases: ['guaranteed'], assertiveness: 'firm', cta: 'consider' },
    guardrails: { allowedClaims: ['education'], softenedClaims: ['results'], prohibitedClaims: ['certainty'], disclosure: 'AI-assisted', boundaries: ['no medical claims'] },
    prompts: { system: 'system', base: 'portrait', positive: ['consistent'], negative: ['extra fingers'] },
  },
  physicalIdentityBible: {
    subject: { presentation: 'androgynous', apparentAge: '35', ageRange: '30-40', ancestry: 'Brazilian', ethnicity: 'mixed', nationality: 'Brazilian', genderExpression: 'androgynous', pronouns: 'ela/dela' },
    body: { height: '1.70m', build: 'athletic', bodyShape: 'rectangle', posture: 'upright', proportions: 'balanced', skinTone: 'medium brown', undertone: 'warm', skinTexture: 'natural', distinguishingMarks: ['mole right cheek'], tattoos: [], scars: [], birthmarks: [] },
    head: { faceShape: 'oval', forehead: 'medium', jawline: 'soft', cheekbones: 'defined', chin: 'rounded', ears: 'small', nose: 'straight', lips: 'full', teeth: 'natural', smile: 'subtle' },
    eyes: { color: 'hazel', shape: 'almond', size: 'medium', spacing: 'average', brows: 'full', lashes: 'natural', gaze: 'direct', eyewear: 'none' },
    hair: { color: 'dark brown', texture: 'curly', density: 'thick', length: 'shoulder', cut: 'layered bob', parting: 'side', facialHair: 'none', styling: 'natural', allowedVariations: ['tied back'] },
    wardrobe: { silhouette: 'structured relaxed', staples: ['linen shirt'], colors: ['earth tones'], materials: ['linen'], accessories: ['watch'], footwear: 'loafers', prohibitedElements: ['logos'] },
    presentation: { makeup: 'minimal', nails: 'short natural', expression: 'calm', gestures: ['open hands'], postureInFrame: 'three-quarter', lightingResponse: 'soft' },
    invariants: { critical: ['hazel eyes', 'mole right cheek'], allowedVariations: ['background'], prohibitedChanges: ['eye color'] },
    generation: { positivePrompt: 'consistent portrait', negativePrompt: 'identity drift', referenceAssetIds: ['asset-1'], modelIndependentNotes: ['preserve face'] },
  },
  visualConsistencyProfile: { faceAnchor: 'oval face, hazel eyes, cheek mole', bodyAnchor: 'athletic 1.70m', silhouetteAnchor: 'structured relaxed', palette: ['earth tones'], lighting: 'soft', cameraLanguage: 'editorial', compositionRules: ['subject clear'], continuityRules: ['preserve anchors'], referenceAssetIds: ['asset-1'] },
  editorialProfile: { positioning: 'evidence-led mentor', audience: 'independent professionals', pillars: ['clarity', 'trust'], formats: ['essay'], cadence: 'weekly', qualityCriteria: ['cited'], topics: { allowed: ['work'], prohibited: ['medical'] }, disclosure: 'AI-assisted' },
  channelPlans: [
    { channel: 'blog', objective: 'depth', audience: 'professionals', formats: ['essay'], cadence: 'weekly', pillars: ['clarity'], disclosure: 'AI-assisted', constraints: [], plan: 'one essay weekly' },
    { channel: 'social', objective: 'reach', audience: 'professionals', formats: ['carousel'], cadence: '3x weekly', pillars: ['trust'], disclosure: 'AI-assisted', constraints: [], plan: 'three posts weekly' },
    { channel: 'youtube', objective: 'explain', audience: 'professionals', formats: ['video'], cadence: 'monthly', pillars: ['clarity'], disclosure: 'AI-assisted', constraints: [], plan: 'one video monthly' },
  ],
});

const version = () => createPersonaVersion({ id: 'pv-1', personaId: 'p-1', projectId: 'project-1', ownerId: 'owner-1', version: 1, sourceRunIds: [], snapshot: snapshot() });

test('AUTH-F1-001 completeness requires physical and channel contracts', () => {
  const complete = checkPersonaVersionCompleteness(snapshot());
  assert.equal(complete.complete, true);
  const incomplete = snapshot();
  incomplete.physicalIdentityBible.hair.color = '';
  incomplete.channelPlans = incomplete.channelPlans.filter((plan) => plan.channel !== 'youtube');
  const result = checkPersonaVersionCompleteness(incomplete);
  assert.equal(result.complete, false);
  assert.ok(result.missingPaths.includes('physicalIdentityBible.hair.color'));
  assert.ok(result.missingPaths.includes('channelPlans[youtube]'));
  assert.throws(() => assertPersonaVersionComplete(incomplete), /persona_version_incomplete/);
});

test('AUTH-F1-001 detects critical changes and emits invalidation metadata', () => {
  const next = snapshot(); next.physicalIdentityBible.eyes.color = 'green'; next.visualConsistencyProfile.faceAnchor = 'round face';
  const result = detectCriticalAttributeChanges(snapshot(), next);
  assert.equal(result.criticalChanged, true);
  assert.deepEqual(result.changedPaths, ['physicalIdentityBible.eyes.color', 'visualConsistencyProfile.faceAnchor']);
  assert.deepEqual(result.invalidates, ['visual_consistency', 'channel_plans', 'editorial_profile', 'approval', 'generated_assets']);
});

test('AUTH-F1-001 uses append-only versions and separate status transitions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'authority-f1-'));
  try {
    const store = new JsonStoreFake(join(directory, 'store.json'));
    const repository = new AuthorityPersonaRepository(store, { projectId: 'project-1', ownerId: 'owner-1' });
    const persona = { id: 'p-1', projectId: 'project-1', ownerId: 'owner-1', name: 'Lia', currentVersionId: 'pv-1', status: 'draft' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await repository.savePersona(persona);
    const first = version();
    await repository.appendVersion(first);
    const transition = transitionPersonaVersion(first, 'generated', 'tester', 'local fixture complete');
    await repository.appendTransition(transition);
    assert.equal((await repository.getVersion('pv-1'))?.status, 'generated');
    await assert.rejects(() => repository.appendVersion(first), /persona_version_immutable/);
    await assert.rejects(() => repository.appendTransition({ ...transition, id: 'stale', from: 'draft', to: 'approved' }), /persona_version_transition_stale/);
    assert.equal((await repository.listVersions('p-1')).length, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
