import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import type { PersistenceStore, StoreCollection } from './repository.js';
import { enqueueBrief, produceDraft, submitForReview, requestHumanApproval, recordMetrics, createRadarFeedback, publishAssisted, UnconfiguredPublishingAdapter } from './post-machine.js';
import type { Approval, ChannelAdapter, ContentBrief, ContentDraft, Profile, Opportunity } from './types.js';
import { researchOpportunityWithLLM, createResearchRecord } from './services/opportunity-research.js';
import { generateSeedArchetypes, createSeedProfiles, generateSeedProfilesWithLLM, SEED_GENERATION_PROMPT } from './services/influencer-seeds.js';
import { createFarmerProfile } from './services/influencer-farmer.js';
import { generatePostMachineOutput } from './services/post-machine.js';
import { assertOwnership, authConfigFromEnv, authenticate, requireRoles, stampOwner, type RuntimeAuthConfig, type RuntimePrincipal, type RuntimeRole } from './auth.js';
import { LocalPersonaFormationPipeline, defaultPersonaModules, type FormationSnapshot, type GenerationMetadata } from './persona-formation.js';
import { createApprovedPersonaReadModel, createPersonaApprovedEvent } from './persona-contract.js';
import { PartnerRegistry, SourceRegistry, OpenAIGateway, isRegistryStatus } from './registries.js';
import { createLocalBrief, runLocalResearch, type LocalResearchBrief, type LocalResearchRun } from './local-research.js';
import { validateMetricInput } from './audit.js';

interface FarmerProfile { id: string; profileId?: string; seedId: string; name: string; brand: string; bio: string; disclosure: string; thesis: string; promise: string; mentorRole: 'mentor'; archetype: string; traits: string[]; decisionCompass: string; not: string[]; backstory: string; authorityMethod: string; voice: { tone: string; vocabulary: string[]; prohibited: string[] }; visual: { style: string; palette: string; continuity: string; anchorFace: string; signatureTrait: string; prompts: string[]; credibilitySettings: string[]; credibilityLocations: string[] }; pillars: string[]; formats: string[]; guardrails: string[]; claims: { allowed: string[]; soften: string[]; prohibited: string[] }; aboutPage: string; footerDisclaimer: string; monetizationModel: string[]; crossCuttingThemes: string[]; socialContentIdeas: { blog: string[]; video: string[]; shorts: string[]; stories: string[]; }; weeklyContentPlan: any[]; status: 'development' | 'review' | 'approved'; createdAt: string; ownerId?: string; createdBy?: string; }

interface AuthorityServerOptions { auth?: RuntimeAuthConfig; publishingAdapter?: ChannelAdapter; }

const json = (res: ServerResponse, status: number, body: unknown) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
const body = async (req: IncomingMessage): Promise<any> => { let raw = ''; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; };
const id = () => `api_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

type Owned = { ownerId?: string };

const find = async (store: PersistenceStore, collection: StoreCollection): Promise<any[]> => {
  const data = await store.read();
  return (data[collection] as unknown as any[]) || [];
};

const emptyFormationSnapshot = (): FormationSnapshot => ({ personas: [], versions: [], moduleRuns: [], jobs: [], approvalPackages: [] });
const formationFromStore = async (store: PersistenceStore): Promise<FormationSnapshot> => {
  const events = await find(store, 'events');
  const latest = [...events].reverse().find((event: any) => event.type === 'persona.formation.snapshot');
  return (latest?.payload as FormationSnapshot | undefined) ?? emptyFormationSnapshot();
};
const persistFormation = async (store: PersistenceStore, snapshot: FormationSnapshot, actor: RuntimePrincipal) => {
  await store.append('events', stampOwner(actor, { id: id(), type: 'persona.formation.snapshot', actor: actor.id, payload: structuredClone(snapshot) as unknown as Record<string, unknown>, createdAt: new Date().toISOString() }));
};
const formationMetadata = (input: any): GenerationMetadata => ({ provider: input.provider ?? 'local-mock', model: input.model ?? 'local-persona-model', ...(input.modelVersion ? { modelVersion: input.modelVersion } : {}), promptVersion: input.promptVersion ?? 'persona-formation.v1' });

type FormationArtifact = { id: string; kind: 'character-bible' | 'physical-identity-bible'; personaVersionId: string; personaId: string; version: number; status: string; content: unknown; ownerId: string; createdAt: string };
const artifactsFromStore = async (store: PersistenceStore): Promise<FormationArtifact[]> => (await find(store, 'events'))
  .filter((event: any) => event.type === 'persona.formation.artifact')
  .map((event: any) => event.payload as FormationArtifact);
const persistArtifact = async (store: PersistenceStore, artifact: FormationArtifact, actor: RuntimePrincipal) => {
  await store.append('events', stampOwner(actor, { id: id(), type: 'persona.formation.artifact', actor: actor.id, payload: artifact as unknown as Record<string, unknown>, createdAt: new Date().toISOString() }));
};
const ownerOfFormationResource = (resource: any, actor: RuntimePrincipal): boolean => actor.role === 'admin' || resource?.ownerId === actor.ownerId;

function visibleTo(principal: RuntimePrincipal, items: any[]): any[] {
  if (principal.role === 'admin') return items;
  return items.filter((item) => (!item?.tenantId || item.tenantId === principal.tenantId) && (!item?.ownerId || item.ownerId === principal.ownerId));
}

function rolesFor(method: string | undefined, pathname: string): RuntimeRole[] | null {
  if (method === 'GET' && (pathname === '/api/info' || pathname === '/health' || pathname === '/' || pathname === '/dashboard')) return null;
  if (!pathname.startsWith('/api')) return null;
  if (method === 'GET' && pathname === '/api/state') return ['admin'];
  if (method === 'GET') return ['viewer'];
  if (method === 'POST' && (pathname === '/api/approvals' || /^\/api\/approval-packs\/[^/]+\/approve$/.test(pathname) || /^\/api\/personas\/[^/]+\/approved-event$/.test(pathname))) return ['reviewer'];
  if (method === 'POST' && /^\/api\/content\/[^/]+\/publish$/.test(pathname)) return ['publisher'];
  if (method === 'POST' && /^\/api\/content\/[^/]+\/review$/.test(pathname)) return ['reviewer'];
  if (method === 'POST' && pathname === '/api/farmer/profile/approve') return ['reviewer'];
  if (method === 'POST') return ['operator'];
  return ['viewer'];
}

function authorize(req: IncomingMessage, res: ServerResponse, config: RuntimeAuthConfig, roles: RuntimeRole[] | null): RuntimePrincipal | null {
  if (!roles) return null;
  const auth = authenticate(req, config);
  if (!auth.ok) { json(res, auth.failure.status, auth.failure); return null; }
  const denied = requireRoles(auth.principal, roles);
  if (denied) { json(res, denied.status, denied); return null; }
  const requestedTenant = req.headers['x-tenant-id'];
  const tenantId = typeof requestedTenant === 'string' && requestedTenant.trim() ? requestedTenant.trim() : (auth.principal.tenantId ?? `tenant:${auth.principal.ownerId}`);
  if (auth.principal.tenantId && auth.principal.tenantId !== tenantId && auth.principal.role !== 'admin') {
    json(res, 403, { error: 'tenant_forbidden', detail: 'Tenant context does not belong to this principal.' }); return null;
  }
  return { ...auth.principal, tenantId };
}

function requireOwner(res: ServerResponse, principal: RuntimePrincipal, resource: Owned | undefined): boolean {
  const denied = assertOwnership(principal, resource);
  if (!denied) return true;
  json(res, denied.status, denied);
  return false;
}

function errorStatus(message: string): number {
  if (/not_found/.test(message)) return 404;
  if (/stale|immutable|already_exists|duplicate/.test(message)) return 409;
  if (/required|missing|not_configured|status_invalid|tenant_required|partner_metadata|source_metadata|owner_context|credential|contract|disclosure|sources|incomplete|profile_not_generated|consistency_review_failed|persona_approval_required|approved_event_identifiers_required|metric_/.test(message)) return 422;
  if (/approval|forbidden|owner|human_approval/.test(message)) return 403;
  return 400;
}

function isPersistenceFailure(message: string): boolean {
  return /relation .* does not exist|schema .* does not exist|permission denied|connection|database|postgres|current_project_id|current_owner_id|persistence|could not connect/i.test(message);
}

function persistenceErrorResponse(res: ServerResponse, error: unknown) {
  const message = error instanceof Error ? error.message : 'persistence_unavailable';
  console.error(`[authority-persistence] ${message}`);
  return json(res, 503, { error: 'persistence_unavailable', detail: message.slice(0, 300) });
}

export function createAuthorityServer(store: PersistenceStore, options: AuthorityServerOptions = {}) {
  const authConfig = options.auth ?? authConfigFromEnv();
  const publishingAdapter = options.publishingAdapter ?? new UnconfiguredPublishingAdapter();
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/dashboard' || url.pathname === '/about')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(await readFile(new URL('../public/dashboard.html', import.meta.url), 'utf8')); }
      if (req.method === 'GET' && url.pathname === '/api/info') return json(res, 200, { service: 'authority-engine', status: 'running', health: '/health', state: '/api/state', version: '0.1.0' });
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'authority-engine', persistence: store.kind, relationalConfigured: store.kind === 'relational-postgres', release: process.env.BUILD_COMMIT ?? 'unknown', externalIntegrations: 'not_configured', publicationMode: 'blocked_without_configured_adapter' });

      const roles = rolesFor(req.method, url.pathname);
      const principal = authorize(req, res, authConfig, roles);
      if (roles && !principal) return;
      const actor = principal!;

      if (req.method === 'GET' && url.pathname === '/api/state') {
        try { return json(res, 200, await store.read()); }
        catch (error: unknown) { return persistenceErrorResponse(res, error); }
      }

      // S2 registries: HTTP is the only boundary allowed to choose tenant context.
      if (req.method === 'GET' && (url.pathname === '/api/partners' || url.pathname === '/api/registries/partners')) return json(res, 200, visibleTo(actor, await find(store, 'partners')));
      if (req.method === 'POST' && (url.pathname === '/api/partners' || url.pathname === '/api/registries/partners')) {
        const input = await body(req); const registry = new PartnerRegistry();
        try {
          const item = registry.register({ tenantId: actor.tenantId!, id: input.id ?? id(), name: input.name, program: input.program, status: input.status ?? 'planned', limitations: input.limitations });
          const persisted = stampOwner(actor, item); return json(res, 201, await store.append('partners', persisted as any));
        } catch (error: unknown) { const message = error instanceof Error ? error.message : 'partner_invalid'; return json(res, errorStatus(message), { error: message }); }
      }
      if (req.method === 'POST' && /^\/api\/(?:registries\/)?partners\/[^/]+\/status$/.test(url.pathname)) {
        const partnerId = url.pathname.split('/').at(-2)!; const current = (await find(store, 'partners')).find((item: any) => item.id === partnerId && item.tenantId === actor.tenantId);
        if (!current) return json(res, 404, { error: 'partner_not_found' }); if (!requireOwner(res, actor, current)) return;
        const status = (await body(req)).status; if (!isRegistryStatus(status)) return json(res, 422, { error: 'status_invalid' });
        const updated = { ...current, status, updatedAt: new Date().toISOString() }; return json(res, 200, await store.replace('partners', partnerId, updated));
      }
      if (req.method === 'GET' && (url.pathname === '/api/sources' || url.pathname === '/api/registries/sources')) return json(res, 200, visibleTo(actor, await find(store, 'sources')));
      if (req.method === 'POST' && (url.pathname === '/api/sources' || url.pathname === '/api/registries/sources')) {
        const input = await body(req); const registry = new SourceRegistry();
        try {
          const item = registry.register({ tenantId: actor.tenantId!, id: input.id ?? id(), partnerId: input.partnerId, origin: input.origin, contractVersion: input.contractVersion, scope: input.scope, credentialRef: input.credentialRef, limits: input.limits, status: input.status ?? 'planned', limitation: input.limitation });
          return json(res, 201, await store.append('sources', stampOwner(actor, item) as any));
        } catch (error: unknown) { const message = error instanceof Error ? error.message : 'source_invalid'; return json(res, errorStatus(message), { error: message }); }
      }
      if (req.method === 'POST' && /^\/api\/(?:registries\/)?sources\/[^/]+\/health$/.test(url.pathname)) {
        const sourceId = url.pathname.split('/').at(-2)!; const current: any = (await find(store, 'sources')).find((item: any) => item.id === sourceId && item.tenantId === actor.tenantId);
        if (!current) return json(res, 404, { error: 'source_not_found' }); if (!requireOwner(res, actor, current)) return;
        if (current.status === 'blocked' || current.status === 'disabled' || !current.credentialRef) return json(res, 422, { error: !current.credentialRef ? 'credential_not_configured' : 'source_blocked' });
        const updated = { ...current, status: 'verified', lastCheckedAt: new Date().toISOString() }; await store.replace('sources', sourceId, updated); return json(res, 200, { ok: true, checkedAt: updated.lastCheckedAt });
      }
      if (req.method === 'POST' && url.pathname === '/api/llm/runs') {
        const input = await body(req); const model = input.model ?? 'local-fake'; const promptVersion = input.promptVersion ?? 'default'; const schemaVersion = input.schemaVersion ?? 'v1';
        const gateway = new OpenAIGateway(async () => ({ output: input.mockOutput ?? {}, inputTokens: Number(input.inputTokens ?? 0), outputTokens: Number(input.outputTokens ?? 0), latencyMs: 0 }), { tenantId: actor.tenantId!, model, promptVersion, schemaVersion, budgetCents: Number(input.budgetCents ?? 0), centsPerToken: Number(input.centsPerToken ?? 0) });
        try {
          const result = await gateway.run({ tenantId: actor.tenantId!, schema: input.schema ?? {}, input: input.input ?? {} }); const run = { id: id(), tenantId: actor.tenantId, ...result, output: result.output };
          return json(res, 201, await store.append('llm_runs', stampOwner(actor, run)));
        } catch (error: unknown) { return json(res, 422, { error: error instanceof Error ? error.message : 'llm_run_blocked' }); }
      }
      if (req.method === 'GET' && url.pathname === '/api/llm/runs') return json(res, 200, visibleTo(actor, await find(store, 'llm_runs')));

      if (req.method === 'GET' && /^\/api\/personas\/[^/]+\/read-model$/.test(url.pathname)) {
        const personaId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const persona: any = snapshot.personas.find((item) => item.id === personaId);
        if (!persona) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        const version: any = snapshot.versions.find((item) => item.id === persona.currentVersionId);
        try { return json(res, 200, createApprovedPersonaReadModel(persona, version)); }
        catch (error: unknown) { return json(res, errorStatus(error instanceof Error ? error.message : 'persona_approval_required'), { error: error instanceof Error ? error.message : 'persona_approval_required' }); }
      }
      if (req.method === 'POST' && /^\/api\/personas\/[^/]+\/approved-event$/.test(url.pathname)) {
        const personaId = url.pathname.split('/')[3]!; const input = await body(req); const snapshot = await formationFromStore(store); const persona: any = snapshot.personas.find((item) => item.id === personaId);
        if (!persona) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        const version: any = snapshot.versions.find((item) => item.id === persona.currentVersionId);
        try {
          const envelope = createPersonaApprovedEvent({ persona, version, blogId: input.blogId ?? '', blogNameVersionId: input.blogNameVersionId ?? '', correlationId: input.correlationId ?? '', causationId: input.causationId });
          const data = await store.read();
          if (data.outbox_events.some((event) => event.eventId === envelope.event_id)) return json(res, 409, { error: 'approved_event_already_exists' });
          await store.append('outbox_events', { id: envelope.event_id, eventId: envelope.event_id, eventType: envelope.event_type, aggregateId: envelope.aggregate_id, payload: envelope.payload, envelope: envelope as unknown as Record<string, unknown>, status: 'pending', attempts: 0, maxAttempts: 3, createdAt: envelope.occurred_at });
          return json(res, 201, envelope);
        } catch (error: unknown) { return json(res, errorStatus(error instanceof Error ? error.message : 'approved_event_blocked'), { error: error instanceof Error ? error.message : 'approved_event_blocked' }); }
      }
      if (req.method === 'GET' && /^\/api\/outbox-events\/[^/]+$/.test(url.pathname)) {
        const eventId = url.pathname.split('/')[3]!; const event = (await store.read({ projectId: 'local', ownerId: actor.ownerId })).outbox_events.find((item) => item.eventId === eventId);
        return event?.envelope ? json(res, 200, event.envelope) : json(res, 404, { error: 'outbox_event_not_found' });
      }

      // F1 - local, mockable Persona formation pipeline. Records are append-only snapshots in events.
      if (req.method === 'POST' && url.pathname === '/api/personas') {
        const input = await body(req);
        const snapshot = await formationFromStore(store);
        const pipeline = new LocalPersonaFormationPipeline(defaultPersonaModules(), formationMetadata(input), snapshot);
        const persona = pipeline.createPersona(input.input ?? input);
        Object.assign(persona, { ownerId: actor.ownerId, createdBy: actor.id });
        await persistFormation(store, pipeline.state, actor);
        return json(res, 201, persona);
      }
      if (req.method === 'GET' && /^\/api\/personas\/[^/]+$/.test(url.pathname)) {
        const personaId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const persona: any = snapshot.personas.find((item) => item.id === personaId);
        if (!persona) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        return json(res, 200, persona);
      }
      if (req.method === 'GET' && /^\/api\/personas\/[^/]+\/versions$/.test(url.pathname)) {
        const personaId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const persona: any = snapshot.personas.find((item) => item.id === personaId);
        if (!persona) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        return json(res, 200, snapshot.versions.filter((item) => item.personaId === personaId));
      }
      if (req.method === 'GET' && /^\/api\/persona-versions\/[^/]+$/.test(url.pathname)) {
        const versionId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const version: any = snapshot.versions.find((item) => item.id === versionId);
        if (!version) return json(res, 404, { error: 'persona_version_not_found' });
        const persona: any = snapshot.personas.find((item) => item.id === version.personaId);
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        return json(res, 200, version);
      }
      if (req.method === 'GET' && /^\/api\/personas\/[^/]+\/versions\/[^/]+$/.test(url.pathname)) {
        const [, , , personaId, versionNumber] = url.pathname.split('/'); const snapshot = await formationFromStore(store); const persona: any = snapshot.personas.find((item) => item.id === personaId);
        if (!persona) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        const version = snapshot.versions.find((item) => item.personaId === personaId && item.version === Number(versionNumber));
        return version ? json(res, 200, version) : json(res, 404, { error: 'persona_version_not_found' });
      }
      if (req.method === 'POST' && /^\/api\/personas\/[^/]+\/generate$/.test(url.pathname)) {
        const personaId = url.pathname.split('/')[3]!; const input = await body(req); const snapshot = await formationFromStore(store); const existing: any = snapshot.personas.find((item) => item.id === personaId);
        if (!existing) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(existing, actor)) return json(res, 403, { error: 'forbidden' });
        const modules = defaultPersonaModules().map((definition) => ({ ...definition, generate: async (context: any) => {
          if ((input.failModules ?? []).includes(definition.key)) throw new Error('mock_module_failure');
          if ((input.missingOutputs ?? []).includes(definition.key)) return undefined;
          return definition.generate(context);
        } }));
        const pipeline = new LocalPersonaFormationPipeline(modules, formationMetadata(input), snapshot);
        try {
          const version = await pipeline.generate(personaId);
          await persistFormation(store, pipeline.state, actor);
          if (version.status === 'generated') {
            const artifacts = await artifactsFromStore(store);
            for (const kind of ['character-bible', 'physical-identity-bible'] as const) {
              const supplied = kind === 'character-bible' ? input.characterBible : input.physicalIdentityBible;
              const artifact: FormationArtifact = { id: `${kind}_${version.id}`, kind, personaVersionId: version.id, personaId, version: version.version, status: 'generated', content: supplied ?? { version: version.version }, ownerId: actor.ownerId, createdAt: new Date().toISOString() };
              if (!artifacts.some((item) => item.id === artifact.id)) await persistArtifact(store, artifact, actor);
            }
          }
          return json(res, version.status === 'generated' ? 201 : 422, version);
        } catch (error: unknown) { return json(res, errorStatus(error instanceof Error ? error.message : 'generation_failed'), { error: error instanceof Error ? error.message : 'generation_failed' }); }
      }
      if (req.method === 'GET' && /^\/api\/persona-versions\/[^/]+\/module-runs$/.test(url.pathname)) {
        const versionId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const version: any = snapshot.versions.find((item) => item.id === versionId);
        if (!version) return json(res, 404, { error: 'persona_version_not_found' });
        const persona: any = snapshot.personas.find((item) => item.id === version.personaId);
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        return json(res, 200, snapshot.moduleRuns.filter((item) => item.personaVersionId === versionId));
      }
      if (req.method === 'GET' && /^\/api\/persona-versions\/[^/]+\/(character-bible|physical-identity-bible)$/.test(url.pathname)) {
        const [, , , versionId, biblePath] = url.pathname.split('/'); const snapshot = await formationFromStore(store); const version: any = snapshot.versions.find((item) => item.id === versionId);
        if (!version) return json(res, 404, { error: 'persona_version_not_found' });
        const persona: any = snapshot.personas.find((item) => item.id === version.personaId);
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        const kind = biblePath === 'character-bible' ? 'character-bible' : 'physical-identity-bible';
        const artifact = (await artifactsFromStore(store)).find((item) => item.personaVersionId === versionId && item.kind === kind);
        return artifact ? json(res, 200, { id: artifact.id, personaVersionId: artifact.personaVersionId, version: artifact.version, status: artifact.status, ...((artifact.content && typeof artifact.content === 'object') ? artifact.content : { content: artifact.content }) }) : json(res, 404, { error: `${kind}_not_found` });
      }
      if (req.method === 'GET' && /^\/api\/module-runs\/[^/]+$/.test(url.pathname)) {
        const runId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const run: any = snapshot.moduleRuns.find((item) => item.id === runId);
        if (!run) return json(res, 404, { error: 'module_run_not_found' });
        const version: any = snapshot.versions.find((item) => item.id === run.personaVersionId); const persona: any = snapshot.personas.find((item) => item.id === version?.personaId);
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        return json(res, 200, run);
      }
      if (req.method === 'POST' && /^\/api\/module-runs\/[^/]+\/retry$/.test(url.pathname)) {
        const runId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const pipeline = new LocalPersonaFormationPipeline(defaultPersonaModules(), formationMetadata(await body(req)), snapshot);
        try { const run = await pipeline.retryModule(runId); await persistFormation(store, pipeline.state, actor); return json(res, run.status === 'success' ? 200 : 422, run); }
        catch (error: unknown) { return json(res, errorStatus(error instanceof Error ? error.message : 'retry_failed'), { error: error instanceof Error ? error.message : 'retry_failed' }); }
      }
      if (req.method === 'GET' && /^\/api\/generation-jobs\/[^/]+$/.test(url.pathname)) {
        const jobId = url.pathname.split('/')[3]!; const job = (await formationFromStore(store)).jobs.find((item) => item.id === jobId); return job ? json(res, 200, job) : json(res, 404, { error: 'generation_job_not_found' });
      }
      if (req.method === 'POST' && /^\/api\/personas\/[^/]+\/approval-pack$/.test(url.pathname)) {
        const personaId = url.pathname.split('/')[3]!; const input = await body(req); const snapshot = await formationFromStore(store); const persona: any = snapshot.personas.find((item) => item.id === personaId);
        if (!persona) return json(res, 404, { error: 'persona_not_found' });
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        const pipeline = new LocalPersonaFormationPipeline(defaultPersonaModules(), formationMetadata(input), snapshot);
        try {
          const pack: any = pipeline.createApprovalPackage(personaId); const artifacts = await artifactsFromStore(store); const versionArtifacts = artifacts.filter((item) => item.personaVersionId === pack.personaVersionId);
          pack.characterBibleId = versionArtifacts.find((item) => item.kind === 'character-bible')?.id;
          pack.physicalIdentityBibleId = versionArtifacts.find((item) => item.kind === 'physical-identity-bible')?.id;
          pack.ownerId = actor.ownerId;
          await persistFormation(store, pipeline.state, actor); return json(res, 201, pack);
        } catch (error: unknown) { return json(res, errorStatus(error instanceof Error ? error.message : 'approval_package_blocked'), { error: error instanceof Error ? error.message : 'approval_package_blocked' }); }
      }
      if (req.method === 'GET' && /^\/api\/approval-packs\/[^/]+$/.test(url.pathname)) {
        const packId = url.pathname.split('/')[3]!; const snapshot = await formationFromStore(store); const pack: any = snapshot.approvalPackages.find((item) => item.id === packId);
        if (!pack) return json(res, 404, { error: 'approval_package_not_found' });
        const persona: any = snapshot.personas.find((item) => item.id === pack.personaId);
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        return json(res, 200, pack);
      }
      if (req.method === 'POST' && /^\/api\/approval-packs\/[^/]+\/approve$/.test(url.pathname)) {
        const packId = url.pathname.split('/')[3]!; const input = await body(req); const snapshot = await formationFromStore(store); const existing: any = snapshot.approvalPackages.find((item) => item.id === packId);
        if (!existing) return json(res, 404, { error: 'approval_package_not_found' });
        const persona: any = snapshot.personas.find((item) => item.id === existing.personaId);
        if (!ownerOfFormationResource(persona, actor)) return json(res, 403, { error: 'forbidden' });
        if (!Number.isInteger(input.personaVersion)) return json(res, 422, { error: 'persona_version_required' });
        const pipeline = new LocalPersonaFormationPipeline(defaultPersonaModules(), formationMetadata(input), snapshot);
        try { const pack = pipeline.approvePackage(packId, input.personaVersion); await persistFormation(store, pipeline.state, actor); return json(res, 200, pack); }
        catch (error: unknown) { return json(res, errorStatus(error instanceof Error ? error.message : 'approval_blocked'), { error: error instanceof Error ? error.message : 'approval_blocked' }); }
      }

      // Local-only Radar contract: deterministic DEMO adapter, never a live provider.
      if (req.method === 'POST' && url.pathname === '/api/research-briefs') {
        const input = await body(req);
        try {
          const brief = createLocalBrief({ tenantId: actor.tenantId!, ownerId: actor.ownerId, market: input.market ?? '', language: input.language ?? '', niche: input.niche ?? '', subniche: input.subniche ?? '', audience: input.audience ?? '', problem: input.problem ?? '', objective: input.objective ?? '' });
          await store.append('events', stampOwner(actor, { id: id(), type: 'research.brief.created', targetId: brief.id, payload: brief as unknown as Record<string, unknown>, createdAt: new Date().toISOString() }));
          return json(res, 201, brief);
        } catch (error: unknown) { const message = error instanceof Error ? error.message : 'research_brief_invalid'; return json(res, errorStatus(message), { error: message }); }
      }
      if (req.method === 'GET' && /^\/api\/research-briefs\/[^/]+$/.test(url.pathname)) {
        const briefId = url.pathname.split('/')[3]!;
        const brief = (await find(store, 'events')).filter((event: any) => event.type === 'research.brief.created').map((event: any) => event.payload).find((item: any) => item.id === briefId && item.tenantId === actor.tenantId);
        return brief ? json(res, 200, brief) : json(res, 404, { error: 'research_brief_not_found' });
      }
      if (req.method === 'POST' && /^\/api\/research-briefs\/[^/]+\/run$/.test(url.pathname)) {
        const briefId = url.pathname.split('/')[3]!; const input = await body(req);
        const events = await find(store, 'events'); const brief = events.filter((event: any) => event.type === 'research.brief.created').map((event: any) => event.payload).find((item: any) => item.id === briefId && item.tenantId === actor.tenantId) as LocalResearchBrief | undefined;
        if (!brief) return json(res, 404, { error: 'research_brief_not_found' });
        const opportunity = (await find(store, 'opportunities')).find((item: any) => item.id === input.opportunityId && item.tenantId === actor.tenantId) as Opportunity | undefined;
        if (!opportunity) return json(res, 404, { error: 'opportunity_not_found' });
        const result = runLocalResearch(brief, opportunity);
        await store.append('events', stampOwner(actor, { id: id(), type: 'research.run.completed', targetId: result.run.id, payload: result.run as unknown as Record<string, unknown>, createdAt: new Date().toISOString() }));
        await store.append('events', stampOwner(actor, { id: id(), type: 'research.dossier.created', targetId: result.dossier.id as string, payload: result.dossier as Record<string, unknown>, createdAt: new Date().toISOString() }));
        return json(res, 201, result.run);
      }
      if (req.method === 'GET' && /^\/api\/research-runs\/[^/]+$/.test(url.pathname)) {
        const runId = url.pathname.split('/')[3]!; const run = (await find(store, 'events')).filter((event: any) => event.type === 'research.run.completed').map((event: any) => event.payload).find((item: any) => item.id === runId && item.tenantId === actor.tenantId) as LocalResearchRun | undefined;
        return run ? json(res, 200, run) : json(res, 404, { error: 'research_run_not_found' });
      }
      if (req.method === 'GET' && /^\/api\/opportunities\/[^/]+\/dossier$/.test(url.pathname)) {
        const opportunityId = url.pathname.split('/')[3]!; const dossier = (await find(store, 'events')).filter((event: any) => event.type === 'research.dossier.created').map((event: any) => event.payload).reverse().find((item: any) => item.opportunityId === opportunityId && item.tenantId === actor.tenantId);
        return dossier ? json(res, 200, dossier) : json(res, 404, { error: 'dossier_not_found' });
      }
      if (req.method === 'POST' && /^\/api\/opportunities\/[^/]+\/qualify$/.test(url.pathname)) {
        const opportunityId = url.pathname.split('/')[3]!; const opportunities = await find(store, 'opportunities'); const current: any = opportunities.find((item: any) => item.id === opportunityId && item.tenantId === actor.tenantId);
        if (!current) return json(res, 404, { error: 'opportunity_not_found' });
        const dossier: any = (await find(store, 'events')).filter((event: any) => event.type === 'research.dossier.created').map((event: any) => event.payload).reverse().find((item: any) => item.opportunityId === opportunityId && item.tenantId === actor.tenantId);
        if (!dossier?.evidence?.length) return json(res, 422, { error: 'evidence_insufficient' });
        const updated = { ...current, status: 'qualified', qualifiedAt: new Date().toISOString(), qualificationReason: (await body(req)).reason ?? 'local evidence reviewed' };
        await store.replace('opportunities', opportunityId, updated); return json(res, 200, updated);
      }

      if (req.method === 'POST' && /^\/api\/opportunities\/[^/]+\/review$/.test(url.pathname)) {
        const opportunityId = url.pathname.split('/')[3]!;
        const current: any = (await find(store, 'opportunities')).find((item: any) => item.id === opportunityId && item.tenantId === actor.tenantId);
        if (!current) return json(res, 404, { error: 'opportunity_not_found' });
        const input = await body(req);
        const event = stampOwner(actor, { id: id(), type: 'research.dossier.review_requested', targetId: opportunityId, payload: { opportunityId, reason: input.reason ?? 'Revisão humana solicitada' }, createdAt: new Date().toISOString() });
        await store.append('events', event);
        return json(res, 200, { opportunity: current, reviewRequested: true, eventId: event.id });
      }
      if (req.method === 'POST' && /^\/api\/opportunities\/[^/]+\/block$/.test(url.pathname)) {
        const opportunityId = url.pathname.split('/')[3]!;
        const current: any = (await find(store, 'opportunities')).find((item: any) => item.id === opportunityId && item.tenantId === actor.tenantId);
        if (!current) return json(res, 404, { error: 'opportunity_not_found' });
        const input = await body(req);
        const updated = { ...current, status: 'blocked', blockedAt: new Date().toISOString(), blockReason: input.reason ?? 'Bloqueado na revisão do Dossier' };
        await store.replace('opportunities', opportunityId, updated);
        await store.append('events', stampOwner(actor, { id: id(), type: 'opportunity.blocked', targetId: opportunityId, payload: updated, createdAt: new Date().toISOString() }));
        return json(res, 200, updated);
      }


      // S1 - Audience Radar (descoberta de audiência; o Sales Engine terá seu próprio radar comercial)
      if (req.method === 'POST' && url.pathname === '/api/opportunities') {
        try {
          const item = stampOwner(actor, { id: id(), ...(await body(req)), status: 'candidate' });
          return json(res, 201, await store.append('opportunities', item));
        } catch (error: unknown) {
          if (isPersistenceFailure(error instanceof Error ? error.message : String(error))) return persistenceErrorResponse(res, error);
          throw error;
        }
      }
      if (req.method === 'POST' && url.pathname === '/api/opportunities/research') {
        const input = await body(req);
        const opportunities = await find(store, 'opportunities') as (Opportunity & Owned)[];
        const opportunity = opportunities.find((o) => o.id === input.opportunityId);
        if (!opportunity) return json(res, 404, { error: 'opportunity_not_found' });
        if (!requireOwner(res, actor, opportunity)) return;
        const research = stampOwner(actor, await researchOpportunityWithLLM(opportunity));
        await createResearchRecord(store, research);
        return json(res, 201, research);
      }
      if (req.method === 'GET' && url.pathname === '/api/research') return json(res, 200, visibleTo(actor, await find(store, 'research')));

      // S2 - Influencer Seeds Creator
      if (req.method === 'GET' && url.pathname === '/api/seeds/prompt') return json(res, 200, { model: process.env.AUTHORITY_SEED_MODEL || 'gpt-4o-mini', prompt: SEED_GENERATION_PROMPT });
      if (req.method === 'POST' && url.pathname === '/api/seeds/generate') {
        const input = await body(req);
        const researchList = await find(store, 'research');
        const research = researchList.find((r: any) => r.id === input.researchId);
        if (!research) return json(res, 404, { error: 'research_not_found' });
        if (!requireOwner(res, actor, research)) return;
        const archetypes = generateSeedArchetypes(research);
        const existingSeeds = (await find(store, 'seeds') as any[]).filter((seed) => seed.researchRef === research.id && seed.ownerId === actor.ownerId);
        if (existingSeeds.length > 0) return json(res, 200, { archetypes, seeds: existingSeeds, idempotent: true });
        const opportunities = await find(store, 'opportunities') as any[];
        const opportunity = opportunities.find((item) => item.id === research.opportunityId && item.ownerId === actor.ownerId);
        if (!opportunity) return json(res, 404, { error: 'opportunity_not_found_for_research' });
        const seeds = (await generateSeedProfilesWithLLM({ research: { ...research.research, id: research.id }, opportunity })).map((seed) => stampOwner(actor, seed));
        for (const seed of seeds) await store.append('seeds', seed);
        return json(res, 201, { archetypes, seeds });
      }
      if (req.method === 'POST' && url.pathname === '/api/seeds') { const item = stampOwner(actor, { id: id(), ...(await body(req)), status: 'proposed' }); return json(res, 201, await store.append('seeds', item)); }
      if (req.method === 'POST' && url.pathname === '/api/seeds/select') {
        const input = await body(req);
        const seedIds = Array.isArray(input.seedIds) ? input.seedIds.filter((value: unknown): value is string => typeof value === 'string') : [input.seedId].filter((value: unknown): value is string => typeof value === 'string');
        if (seedIds.length === 0) return json(res, 422, { error: 'seed_ids_required' });
        const seeds = (await store.read()).seeds as any[];
        const selected = seedIds.map((seedId: string) => seeds.find((seed: any) => seed.id === seedId));
        if (selected.some((seed: any) => !seed)) return json(res, 404, { error: 'seed_not_found' });
        for (const seed of selected as any[]) if (!requireOwner(res, actor, seed)) return;
        const updated = [];
        for (const seed of selected as any[]) { const next = { ...seed, status: 'selected' as const }; await store.replace('seeds', seed.id, next); updated.push(next); }
        return json(res, 200, { seeds: updated, selectedSeedIds: seedIds });
      }
      if (req.method === 'POST' && url.pathname === '/api/seeds/compare') {
        const input = await body(req);
        const seedIds = Array.isArray(input.seedIds) ? input.seedIds.filter((value: unknown): value is string => typeof value === 'string') : [];
        if (seedIds.length < 1) return json(res, 422, { error: 'seed_ids_required' });
        const seeds = (await store.read()).seeds as any[];
        const selected = seedIds.map((seedId: string) => seeds.find((seed: any) => seed.id === seedId));
        if (selected.some((seed: any) => !seed)) return json(res, 404, { error: 'seed_not_found' });
        for (const seed of selected as any[]) if (!requireOwner(res, actor, seed)) return;
        const unique = (key: string) => [...new Set(selected.flatMap((seed: any) => Array.isArray(seed[key]) ? seed[key] : seed[key] ? [seed[key]] : []))];
        return json(res, 200, { scenarioId: `scenario_${seedIds.join('_')}`, seedIds, seeds: selected, scenario: { name: selected.map((seed: any) => seed.name).join(' + '), archetypes: unique('archetype'), intellectualTraits: unique('intellectualTraits'), physicalIdentity: selected.map((seed: any) => seed.physicalIdentity).filter(Boolean), sharedPillars: unique('formats'), risks: unique('risks'), recommendation: 'Revisar coerência entre as sementes antes de desenvolver a Persona.' } });
      }

      // S3 - Influencer Farmer
      if (req.method === 'POST' && url.pathname === '/api/farmer/profile') {
        const input = await body(req);
        const seeds = (await store.read()).seeds as any[];
        const seed = seeds.find((s: any) => s.id === input.seedId && s.status === 'selected');
        if (!seed) return json(res, 404, { error: 'seed_not_found_or_not_selected' });
        if (!requireOwner(res, actor, seed)) return;
        const profile = stampOwner(actor, createFarmerProfile(seed, input.selectedThemes || []));
        await store.append('farmer_profiles', profile);
        return json(res, 201, profile);
      }
      if (req.method === 'GET' && url.pathname === '/api/farmer/profiles') return json(res, 200, visibleTo(actor, (await store.read()).farmer_profiles || []));
      if (req.method === 'POST' && url.pathname === '/api/farmer/profile/approve') {
        const input = await body(req);
        const profiles = await find(store, 'farmer_profiles') as FarmerProfile[];
        const current = profiles.find((p: any) => p.id === input.profileId);
        if (!current) return json(res, 404, { error: 'profile_not_found' });
        if (!requireOwner(res, actor, current)) return;
        const approved = { ...current, status: 'approved' as const };
        await store.replace('farmer_profiles', input.profileId, approved);
        return json(res, 200, approved);
      }

      // S4 - Post Machine
      if (req.method === 'POST' && url.pathname === '/api/post-machine/generate') {
        const input = await body(req);
        const profiles = await find(store, 'farmer_profiles') as FarmerProfile[];
        const profile = profiles.find((p: any) => p.id === input.profileId && p.status === 'approved');
        if (!profile) return json(res, 404, { error: 'approved_profile_not_found' });
        if (!requireOwner(res, actor, profile)) return;
        const topics = input.topics || { blog: profile.socialContentIdeas.blog.slice(0, 2), video: profile.socialContentIdeas.video.slice(0, 1), shorts: profile.socialContentIdeas.shorts.slice(0, 2), stories: profile.socialContentIdeas.stories.slice(0, 2) };
        const output = stampOwner(actor, await generatePostMachineOutput(profile, input.week || 1, topics));
        await store.append('post_machine', output);
        return json(res, 201, output);
      }
      if (req.method === 'GET' && url.pathname === '/api/post-machine') return json(res, 200, visibleTo(actor, (await store.read()).post_machine || []));

      // Existing endpoints
      if (req.method === 'POST' && url.pathname === '/api/briefs') {
        const input = await body(req) as ContentBrief;
        const profiles = await find(store, 'profiles') as (Profile & Owned)[];
        const profile = profiles.find((item) => item.id === input.profileId);
        if (profile && !requireOwner(res, actor, profile)) return;
        const queued = stampOwner(actor, enqueueBrief(profile, { ...input, id: input.id ?? id(), status: 'draft' }));
        await store.append('briefs', queued as any); return json(res, queued.state === 'blocked' ? 422 : 201, queued);
      }
      if (req.method === 'POST' && url.pathname === '/api/content') {
        const input = await body(req) as ContentDraft & { briefId: string };
        const profiles = await find(store, 'profiles') as (Profile & Owned)[];
        const briefs = await find(store, 'briefs') as any[];
        const brief = briefs.find((item) => item.brief?.id === input.briefId || item.id === input.briefId);
        if (!brief) return json(res, 404, { error: 'brief_not_found' });
        if (!requireOwner(res, actor, brief)) return;
        const profile = profiles.find((item) => item.id === brief?.brief?.profileId);
        const draft = stampOwner(actor, { id: id(), ...produceDraft(profile!, brief.brief ?? input) });
        return json(res, 201, await store.append('content', draft));
      }
      if (req.method === 'POST' && url.pathname.match(/^\/api\/content\/[^/]+\/review$/)) {
        const contentId = url.pathname.split('/')[3]!;
        const items = await find(store, 'content') as (ContentDraft & Owned)[];
        const current = items.find((item: any) => item.id === contentId);
        if (!current) return json(res, 404, { error: 'not_found' });
        if (!requireOwner(res, actor, current)) return;
        const reviewed = requestHumanApproval(submitForReview(current));
        return json(res, 200, await store.replace('content', contentId, reviewed));
      }
      if (req.method === 'POST' && url.pathname === '/api/approvals') {
        const input = await body(req);
        const content = (await find(store, 'content') as (ContentDraft & Owned)[]).find((item: any) => item.id === input.targetId);
        if (content && !requireOwner(res, actor, content)) return;
        if (input.approved !== true || input.scope !== 'publication' || !input.targetId || !input.targetVersion || !input.channel || !input.approver) return json(res, 422, { error: 'specific_publication_approval_required' });
        const item: Approval = { id: id(), targetId: input.targetId, targetVersion: input.targetVersion, channel: input.channel, scope: 'publication', approved: true, approver: input.approver, approvedAt: new Date().toISOString() };
        return json(res, 201, await store.append('approvals', stampOwner(actor, item)));
      }
      if (req.method === 'POST' && url.pathname.match(/^\/api\/content\/[^/]+\/publish$/)) {
        const contentId = url.pathname.split('/')[3]!;
        const items = await find(store, 'content') as (ContentDraft & Owned)[];
        const draft = items.find((item: any) => item.id === contentId);
        if (!draft) return json(res, 404, { error: 'not_found' });
        if (!requireOwner(res, actor, draft)) return;
        const approvals = await find(store, 'approvals') as (Approval & Owned)[];
        const approval = approvals.find((item) => item.targetId === contentId && item.targetVersion === draft.version && item.channel === draft.channel && (actor.role === 'admin' || !item.ownerId || item.ownerId === actor.ownerId));
        try {
          const receipt = stampOwner(actor, await publishAssisted(draft, approval, publishingAdapter));
          return json(res, 201, await store.append('receipts', receipt));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'publication_blocked';
          return json(res, errorStatus(message), { error: message });
        }
      }
      if (req.method === 'GET' && url.pathname === '/api/feedback') return json(res, 200, visibleTo(actor, await find(store, 'feedback')));
      if (req.method === 'GET' && url.pathname === '/api/audit-events') return json(res, 200, visibleTo(actor, await find(store, 'events')));
      if (req.method === 'GET' && url.pathname === '/api/readiness') {
        try {
          await store.read();
          return json(res, 200, { ready: true, persistence: store.kind, localAdapters: 'available', externalIntegrations: 'blocked', publication: 'blocked', remoteMigration: 'unknown', secrets: 'not_loaded', nextGate: 'human approval plus external readback' });
        } catch (error: unknown) {
          return persistenceErrorResponse(res, error);
        }
      }
      if (req.method === 'POST' && url.pathname === '/api/metrics') {
        const input = await body(req);
        try {
          validateMetricInput({ tenantId: actor.tenantId!, source: input.source, period: input.period, sufficient: input.sufficient, limitation: input.limitation });
          const metric = recordMetrics({ ...input, tenantId: actor.tenantId, id: undefined } as any);
          const feedback = createRadarFeedback(metric);
          await store.append('metrics', stampOwner(actor, metric)); await store.append('feedback', stampOwner(actor, feedback));
          await store.append('events', stampOwner(actor, { id: id(), type: 'metrics.recorded', targetId: metric.id, actor: actor.id, payload: { metricId: metric.id, feedbackId: feedback.id }, createdAt: new Date().toISOString() }));
          return json(res, 201, { metric, feedback });
        } catch (error: unknown) { const message = error instanceof Error ? error.message : 'metric_invalid'; return json(res, errorStatus(message), { error: message }); }
      }

      return json(res, 404, { error: 'not_found' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'bad_request';
      return json(res, errorStatus(message), { error: message });
    }
  });
}
