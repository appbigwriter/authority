export type PersonaStatus = 'draft' | 'profile_generating' | 'profile_generated' | 'pending_approval' | 'approved' | 'generation_blocked';
export type ModuleRunStatus = 'pending' | 'running' | 'retrying' | 'success' | 'failed' | 'blocked' | 'cancelled';
export type GenerationJobStatus = 'pending' | 'running' | 'retrying' | 'success' | 'failed' | 'blocked' | 'cancelled';
export type ApprovalPackageStatus = 'assembled' | 'pending' | 'approved' | 'rejected' | 'superseded';

export interface GenerationMetadata { provider: string; model: string; modelVersion?: string; promptVersion: string; }
export interface PersonaModuleContext { personaId: string; personaVersionId: string; input: Record<string, unknown>; previousOutputs: Record<string, unknown>; metadata: GenerationMetadata; }
export interface PersonaModule { key: string; version: string; required: boolean; generate(context: PersonaModuleContext): Promise<unknown> | unknown; }
export interface ModuleRun { id: string; personaVersionId: string; moduleKey: string; moduleVersion: string; required: boolean; status: ModuleRunStatus; input: Record<string, unknown>; output?: unknown; metadata: GenerationMetadata; generationJobId: string; attemptCount: number; lastError?: string; createdAt: string; updatedAt: string; }
export interface GenerationJob { id: string; targetId: string; targetType: 'persona_module'; personaVersionId: string; moduleKey: string; provider: string; model: string; promptVersion: string; idempotencyKey: string; status: GenerationJobStatus; attemptCount: number; lastError?: string; createdAt: string; updatedAt: string; }
export interface ConsistencyReview { status: 'passed' | 'failed'; checkedModuleKeys: string[]; issues: string[]; checkedAt: string; }
export interface PersonaVersion { id: string; personaId: string; version: number; status: 'generating' | 'generated' | 'pending_approval' | 'approved' | 'superseded'; input: Record<string, unknown>; outputs: Record<string, unknown>; sourceRunIds: string[]; consistencyReview?: ConsistencyReview; createdAt: string; }
export interface Persona { id: string; status: PersonaStatus; currentVersionId?: string; input: Record<string, unknown>; createdAt: string; }
export interface ApprovalPackage { id: string; personaId: string; personaVersionId: string; personaVersion: number; moduleRunIds: string[]; outputKeys: string[]; consistencyReview: ConsistencyReview; status: ApprovalPackageStatus; createdAt: string; }
export interface FormationSnapshot { personas: Persona[]; versions: PersonaVersion[]; moduleRuns: ModuleRun[]; jobs: GenerationJob[]; approvalPackages: ApprovalPackage[]; }

const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const errorText = (error: unknown) => error instanceof Error ? error.message : 'generation_failed';

export class LocalPersonaFormationPipeline {
  readonly state: FormationSnapshot;
  private readonly modules: PersonaModule[];
  private readonly metadata: GenerationMetadata;

  constructor(modules: PersonaModule[], metadata: GenerationMetadata, snapshot?: FormationSnapshot) {
    if (modules.length === 0) throw new Error('required_modules_missing');
    this.modules = modules;
    this.metadata = metadata;
    this.state = snapshot ?? { personas: [], versions: [], moduleRuns: [], jobs: [], approvalPackages: [] };
  }

  createPersona(input: Record<string, unknown>, personaId = makeId('persona')): Persona {
    if (Object.keys(input).length === 0) throw new Error('persona_input_required');
    const persona: Persona = { id: personaId, status: 'draft', input, createdAt: now() };
    this.state.personas.push(persona);
    return persona;
  }

  async generate(personaId: string, versionId?: string): Promise<PersonaVersion> {
    const persona = this.requirePersona(personaId);
    const version = this.state.versions.filter((item) => item.personaId === personaId).reduce((max, item) => Math.max(max, item.version), 0) + 1;
    const versionRecord: PersonaVersion = { id: versionId ?? makeId('persona_version'), personaId, version, status: 'generating', input: persona.input, outputs: {}, sourceRunIds: [], createdAt: now() };
    this.state.versions.push(versionRecord);
    persona.currentVersionId = versionRecord.id;
    persona.status = 'profile_generating';

    const outputs: Record<string, unknown> = {};
    let blocked = false;
    for (const definition of this.modules) {
      const run = this.newRun(versionRecord, definition, outputs);
      versionRecord.sourceRunIds.push(run.id);
      try {
        run.status = 'running'; run.updatedAt = now();
        const output = await definition.generate({ personaId, personaVersionId: versionRecord.id, input: persona.input, previousOutputs: outputs, metadata: this.metadata });
        if (output === undefined || output === null) throw new Error('missing_required_output');
        run.output = output; run.status = 'success'; run.updatedAt = now();
        outputs[definition.key] = output;
        this.finishJob(run.generationJobId, 'success');
      } catch (error: unknown) {
        run.status = 'failed'; run.lastError = errorText(error); run.updatedAt = now();
        this.finishJob(run.generationJobId, 'failed', run.lastError ?? 'generation_failed');
        if (definition.required) blocked = true;
      }
    }
    versionRecord.outputs = outputs;
    const required = this.modules.filter((module) => module.required);
    const missing = required.filter((module) => !Object.prototype.hasOwnProperty.call(outputs, module.key)).map((module) => module.key);
    const review: ConsistencyReview = { status: blocked || missing.length > 0 ? 'failed' : 'passed', checkedModuleKeys: Object.keys(outputs), issues: missing.map((key) => `${key}:missing_output`), checkedAt: now() };
    versionRecord.consistencyReview = review;
    if (blocked || missing.length > 0) { persona.status = 'generation_blocked'; versionRecord.status = 'generating'; }
    else { persona.status = 'profile_generated'; versionRecord.status = 'generated'; }
    return versionRecord;
  }

  async retryModule(runId: string): Promise<ModuleRun> {
    const run = this.state.moduleRuns.find((item) => item.id === runId);
    if (!run) throw new Error('module_run_not_found');
    const definition = this.modules.find((item) => item.key === run.moduleKey);
    if (!definition) throw new Error('module_not_configured');
    const version = this.state.versions.find((item) => item.id === run.personaVersionId)!;
    const persona = this.requirePersona(version.personaId);
    run.status = 'retrying'; run.attemptCount += 1; run.updatedAt = now();
    const job = this.state.jobs.find((item) => item.id === run.generationJobId)!;
    job.status = 'retrying'; job.attemptCount += 1; job.updatedAt = now();
    try {
      run.status = 'running'; job.status = 'running';
      const output = await definition.generate({ personaId: persona.id, personaVersionId: version.id, input: persona.input, previousOutputs: version.outputs, metadata: this.metadata });
      if (output === undefined || output === null) throw new Error('missing_required_output');
      run.output = output; run.status = 'success'; delete run.lastError; run.updatedAt = now();
      job.status = 'success'; delete job.lastError; job.updatedAt = now();
      version.outputs[run.moduleKey] = output;
      const required = this.modules.filter((item) => item.required);
      const missing = required.filter((item) => version.outputs[item.key] === undefined);
      if (missing.length === 0 && this.state.moduleRuns.filter((item) => item.personaVersionId === version.id && item.required).every((item) => item.status === 'success')) {
        version.status = 'generated'; version.consistencyReview = { status: 'passed', checkedModuleKeys: Object.keys(version.outputs), issues: [], checkedAt: now() }; persona.status = 'profile_generated';
      }
    } catch (error: unknown) { run.status = 'failed'; run.lastError = errorText(error); run.updatedAt = now(); job.status = 'failed'; job.lastError = run.lastError ?? 'generation_failed'; job.updatedAt = now(); }
    return run;
  }

  createApprovalPackage(personaId: string): ApprovalPackage {
    const persona = this.requirePersona(personaId);
    if (persona.status !== 'profile_generated' || !persona.currentVersionId) throw new Error('profile_not_generated');
    const version = this.state.versions.find((item) => item.id === persona.currentVersionId)!;
    if (version.consistencyReview?.status !== 'passed') throw new Error('consistency_review_failed');
    const runs = this.state.moduleRuns.filter((item) => item.personaVersionId === version.id);
    const pack: ApprovalPackage = { id: makeId('approval_pack'), personaId, personaVersionId: version.id, personaVersion: version.version, moduleRunIds: runs.map((item) => item.id), outputKeys: Object.keys(version.outputs), consistencyReview: version.consistencyReview, status: 'pending', createdAt: now() };
    this.state.approvalPackages.push(pack); persona.status = 'pending_approval'; version.status = 'pending_approval';
    return pack;
  }

  approvePackage(packageId: string, expectedVersion: number): ApprovalPackage {
    const pack = this.state.approvalPackages.find((item) => item.id === packageId);
    if (!pack) throw new Error('approval_package_not_found');
    const persona = this.requirePersona(pack.personaId);
    const current = this.state.versions.filter((item) => item.personaId === persona.id).sort((a, b) => b.version - a.version)[0];
    if (!current || current.id !== pack.personaVersionId || current.version !== expectedVersion) throw new Error('stale_approval_package');
    pack.status = 'approved'; persona.status = 'approved'; current.status = 'approved';
    return pack;
  }

  private newRun(version: PersonaVersion, definition: PersonaModule, outputs: Record<string, unknown>): ModuleRun {
    const timestamp = now(); const jobId = makeId('generation_job');
    const job: GenerationJob = { id: jobId, targetId: version.id, targetType: 'persona_module', personaVersionId: version.id, moduleKey: definition.key, provider: this.metadata.provider, model: this.metadata.model, promptVersion: this.metadata.promptVersion, idempotencyKey: `${version.id}:${definition.key}`, status: 'pending', attemptCount: 1, createdAt: timestamp, updatedAt: timestamp };
    const run: ModuleRun = { id: makeId('module_run'), personaVersionId: version.id, moduleKey: definition.key, moduleVersion: definition.version, required: definition.required, status: 'pending', input: { ...version.input, previousOutputs: outputs }, metadata: this.metadata, generationJobId: jobId, attemptCount: 1, createdAt: timestamp, updatedAt: timestamp };
    this.state.jobs.push(job); this.state.moduleRuns.push(run); return run;
  }
  private finishJob(id: string, status: GenerationJobStatus, error?: string) { const job = this.state.jobs.find((item) => item.id === id); if (job) { job.status = status; if (error === undefined) delete job.lastError; else job.lastError = error; job.updatedAt = now(); } }
  private requirePersona(id: string) { const persona = this.state.personas.find((item) => item.id === id); if (!persona) throw new Error('persona_not_found'); return persona; }
}

export const defaultPersonaModules = (): PersonaModule[] => [
  { key: 'identity', version: '1.0.0', required: true, generate: ({ input }) => ({ name: input.name ?? 'local-persona', thesis: input.thesis ?? 'authority through useful evidence' }) },
  { key: 'voice', version: '1.0.0', required: true, generate: ({ previousOutputs }) => ({ tone: 'clear', identity: previousOutputs.identity }) },
  { key: 'consistency', version: '1.0.0', required: true, generate: ({ previousOutputs }) => ({ checks: Object.keys(previousOutputs) }) },
];
