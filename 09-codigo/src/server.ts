import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import type { PersistenceStore, StoreCollection } from './repository.js';
import { enqueueBrief, produceDraft, submitForReview, requestHumanApproval, recordMetrics, createRadarFeedback, publishAssisted, UnconfiguredPublishingAdapter } from './post-machine.js';
import type { Approval, ChannelAdapter, ContentBrief, ContentDraft, Profile, Opportunity } from './types.js';
import { researchOpportunityWithLLM, createResearchRecord } from './services/opportunity-research.js';
import { generateSeedArchetypes, createSeedProfiles } from './services/influencer-seeds.js';
import { createFarmerProfile } from './services/influencer-farmer.js';
import { generatePostMachineOutput } from './services/post-machine.js';
import { assertOwnership, authConfigFromEnv, authenticate, requireRoles, stampOwner, type RuntimeAuthConfig, type RuntimePrincipal, type RuntimeRole } from './auth.js';

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

function visibleTo(principal: RuntimePrincipal, items: any[]): any[] {
  if (principal.role === 'admin') return items;
  return items.filter((item) => !item?.ownerId || item.ownerId === principal.ownerId);
}

function rolesFor(method: string | undefined, pathname: string): RuntimeRole[] | null {
  if (method === 'GET' && (pathname === '/api/info' || pathname === '/health' || pathname === '/' || pathname === '/dashboard')) return null;
  if (!pathname.startsWith('/api')) return null;
  if (method === 'GET' && pathname === '/api/state') return ['admin'];
  if (method === 'GET') return ['viewer'];
  if (method === 'POST' && pathname === '/api/approvals') return ['reviewer'];
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
  return auth.principal;
}

function requireOwner(res: ServerResponse, principal: RuntimePrincipal, resource: Owned | undefined): boolean {
  const denied = assertOwnership(principal, resource);
  if (!denied) return true;
  json(res, denied.status, denied);
  return false;
}

function errorStatus(message: string): number {
  if (/required|missing|not_configured|gate_closed|credential|contract|disclosure|sources/.test(message)) return 422;
  if (/approval|forbidden|owner|human_approval/.test(message)) return 403;
  return 400;
}

export function createAuthorityServer(store: PersistenceStore, options: AuthorityServerOptions = {}) {
  const authConfig = options.auth ?? authConfigFromEnv();
  const publishingAdapter = options.publishingAdapter ?? new UnconfiguredPublishingAdapter();
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/dashboard' || url.pathname === '/about')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(await readFile(new URL('../public/dashboard.html', import.meta.url), 'utf8')); }
      if (req.method === 'GET' && url.pathname === '/api/info') return json(res, 200, { service: 'authority-engine', status: 'running', health: '/health', state: '/api/state', version: '0.1.0' });
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'authority-engine', persistence: 'json-store', externalIntegrations: 'not_configured', publicationMode: 'blocked_without_configured_adapter' });

      const roles = rolesFor(req.method, url.pathname);
      const principal = authorize(req, res, authConfig, roles);
      if (roles && !principal) return;
      const actor = principal!;

      if (req.method === 'GET' && url.pathname === '/api/state') return json(res, 200, await store.read());

      // S1 - Opportunity Radar
      if (req.method === 'POST' && url.pathname === '/api/opportunities') { const item = stampOwner(actor, { id: id(), ...(await body(req)), status: 'candidate' }); return json(res, 201, await store.append('opportunities', item)); }
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
      if (req.method === 'POST' && url.pathname === '/api/seeds/generate') {
        const input = await body(req);
        const researchList = await find(store, 'research');
        const research = researchList.find((r: any) => r.id === input.researchId);
        if (!research) return json(res, 404, { error: 'research_not_found' });
        if (!requireOwner(res, actor, research)) return;
        const archetypes = generateSeedArchetypes(research);
        const opportunityData = { audience: research.research?.audienceInsights?.[0] || '', problem: research.research?.contentGaps?.[0] || '', subniche: research.research?.monetizationPaths?.[0] || '', products: [], risks: [] };
        const seeds = createSeedProfiles(research.opportunityId, opportunityData, archetypes, research.id).map((seed) => stampOwner(actor, seed));
        for (const seed of seeds) await store.append('seeds', seed);
        return json(res, 201, { archetypes, seeds });
      }
      if (req.method === 'POST' && url.pathname === '/api/seeds') { const item = stampOwner(actor, { id: id(), ...(await body(req)), status: 'proposed' }); return json(res, 201, await store.append('seeds', item)); }
      if (req.method === 'POST' && url.pathname === '/api/seeds/select') {
        const input = await body(req);
        const seeds = (await store.read()).seeds as any[];
        const selected = seeds.find((s: any) => s.id === input.seedId);
        if (!selected) return json(res, 404, { error: 'seed_not_found' });
        if (!requireOwner(res, actor, selected)) return;
        const updated = { ...selected, status: 'selected' as const };
        await store.replace('seeds', input.seedId, updated);
        return json(res, 200, updated);
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
      if (req.method === 'POST' && url.pathname === '/api/metrics') { const metric = recordMetrics({ ...(await body(req)), id: undefined } as any); const feedback = createRadarFeedback(metric); await store.append('metrics', stampOwner(actor, metric)); await store.append('feedback', stampOwner(actor, feedback)); return json(res, 201, { metric, feedback }); }

      return json(res, 404, { error: 'not_found' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'bad_request';
      return json(res, errorStatus(message), { error: message });
    }
  });
}
