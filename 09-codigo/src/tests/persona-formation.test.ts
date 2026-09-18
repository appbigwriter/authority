import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalPersonaFormationPipeline, type PersonaModule } from '../persona-formation.js';

const metadata = { provider: 'test-provider', model: 'test-model', promptVersion: 'test-prompt.v1' };
const modules = (failVoice = false): PersonaModule[] => [
  { key: 'identity', version: '1.0.0', required: true, generate: () => ({ name: 'Ada' }) },
  { key: 'voice', version: '1.0.0', required: true, generate: () => { if (failVoice) throw new Error('mock_failure'); return { tone: 'clear' }; } },
  { key: 'visual', version: '1.0.0', required: true, generate: ({ previousOutputs }) => ({ anchor: previousOutputs.identity }) },
];

test('success produces profile_generated, runs, jobs, metadata and consistency review', async () => {
  const pipeline = new LocalPersonaFormationPipeline(modules(), metadata);
  const persona = pipeline.createPersona({ niche: 'displays' });
  const version = await pipeline.generate(persona.id);
  assert.equal(persona.status, 'profile_generated');
  assert.equal(version.status, 'generated');
  assert.equal(version.consistencyReview?.status, 'passed');
  assert.equal(pipeline.state.moduleRuns.length, 3);
  assert.ok(pipeline.state.moduleRuns.every((run) => run.status === 'success' && run.metadata.provider === 'test-provider'));
  assert.ok(pipeline.state.jobs.every((job) => job.status === 'success' && job.promptVersion === 'test-prompt.v1'));
});

test('required module failure blocks generation and does not generate profile', async () => {
  const pipeline = new LocalPersonaFormationPipeline(modules(true), metadata);
  const persona = pipeline.createPersona({ niche: 'displays' });
  const version = await pipeline.generate(persona.id);
  assert.equal(persona.status, 'generation_blocked');
  assert.equal(version.consistencyReview?.status, 'failed');
  assert.equal(pipeline.state.moduleRuns.find((run) => run.moduleKey === 'voice')?.status, 'failed');
});

test('failed module can be retried and unblocks the profile', async () => {
  let attempts = 0;
  const retryModules: PersonaModule[] = modules().map((module) => module.key === 'voice' ? { ...module, generate: () => { attempts += 1; if (attempts === 1) throw new Error('transient'); return { tone: 'clear' }; } } : module);
  const pipeline = new LocalPersonaFormationPipeline(retryModules, metadata);
  const persona = pipeline.createPersona({ niche: 'displays' });
  await pipeline.generate(persona.id);
  const failed = pipeline.state.moduleRuns.find((run) => run.moduleKey === 'voice')!;
  const retried = await pipeline.retryModule(failed.id);
  assert.equal(retried.status, 'success');
  assert.equal(retried.attemptCount, 2);
  assert.equal(persona.status, 'profile_generated');
});

test('approval package rejects stale persona version', async () => {
  const pipeline = new LocalPersonaFormationPipeline(modules(), metadata);
  const persona = pipeline.createPersona({ niche: 'displays' });
  await pipeline.generate(persona.id);
  const pack = pipeline.createApprovalPackage(persona.id);
  await pipeline.generate(persona.id);
  assert.throws(() => pipeline.approvePackage(pack.id, pack.personaVersion), /stale_approval_package/);
});

test('missing required output blocks generation', async () => {
  const missing: PersonaModule[] = modules().map((module) => module.key === 'visual' ? { ...module, generate: () => undefined } : module);
  const pipeline = new LocalPersonaFormationPipeline(missing, metadata);
  const persona = pipeline.createPersona({ niche: 'displays' });
  const version = await pipeline.generate(persona.id);
  assert.equal(persona.status, 'generation_blocked');
  assert.equal(version.consistencyReview?.status, 'failed');
  assert.match(pipeline.state.moduleRuns.find((run) => run.moduleKey === 'visual')?.lastError ?? '', /missing_required_output/);
});
