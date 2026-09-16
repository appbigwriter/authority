import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { JsonStore } from './repository.js';
import { enqueueBrief, produceDraft, submitForReview, requestHumanApproval, publishAfterApproval, recordMetrics, createRadarFeedback, publishAssisted, FakePublishingAdapter } from './post-machine.js';
import type { Approval, ContentBrief, ContentDraft, Profile } from './types.js';

const json = (res: ServerResponse, status: number, body: unknown) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
const body = async (req: IncomingMessage): Promise<any> => { let raw = ''; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; };
const id = () => `api_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const find = async (store: JsonStore, collection: 'profiles' | 'briefs' | 'content' | 'approvals' | 'metrics') => (await store.read())[collection];

export function createAuthorityServer(store: JsonStore) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'authority-engine', persistence: 'json-store', externalIntegrations: 'not_configured', publicationMode: 'assisted_only' });
      if (req.method === 'GET' && url.pathname === '/api/state') return json(res, 200, await store.read());
      if (req.method === 'POST' && url.pathname === '/api/opportunities') { const item = { id: id(), ...(await body(req)), status: 'candidate' }; return json(res, 201, await store.append('opportunities', item)); }
      if (req.method === 'POST' && url.pathname === '/api/seeds') { const item = { id: id(), ...(await body(req)), status: 'proposed' }; return json(res, 201, await store.append('seeds', item)); }
      if (req.method === 'POST' && url.pathname === '/api/profiles') { const item = { id: id(), ...(await body(req)), status: 'review' }; return json(res, 201, await store.append('profiles', item)); }
      if (req.method === 'POST' && url.pathname === '/api/briefs') {
        const input = await body(req) as ContentBrief; const profiles = await find(store, 'profiles') as Profile[]; const profile = profiles.find((item) => item.id === input.profileId); const queued = enqueueBrief(profile, { ...input, id: input.id ?? id(), status: 'draft' });
        await store.append('briefs', queued); return json(res, queued.state === 'blocked' ? 422 : 201, queued);
      }
      if (req.method === 'POST' && url.pathname === '/api/content') { const input = await body(req) as ContentDraft; const profiles = await find(store, 'profiles') as Profile[]; const briefs = await find(store, 'briefs') as any[]; const brief = briefs.find((item) => item.brief?.id === input.briefId || item.id === input.briefId); const profile = profiles.find((item) => item.id === brief?.brief?.profileId); const draft = produceDraft(profile!, brief?.brief ?? input); const saved = { id: id(), ...draft }; return json(res, 201, await store.append('content', saved)); }
      if (req.method === 'POST' && url.pathname.match(/^\/api\/content\/[^/]+\/review$/)) { const contentId = url.pathname.split('/')[3]!; const items = await find(store, 'content') as ContentDraft[]; const current = items.find((item) => item.id === contentId); if (!current) return json(res, 404, { error: 'not_found' }); const reviewed = requestHumanApproval(submitForReview(current)); return json(res, 200, await store.replace('content', contentId, reviewed)); }
      if (req.method === 'POST' && url.pathname === '/api/approvals') { const input = await body(req); if (input.approved !== true || input.scope !== 'publication' || !input.targetId || !input.targetVersion || !input.channel || !input.approver) return json(res, 422, { error: 'specific_publication_approval_required' }); const item: Approval = { id: id(), targetId: input.targetId, targetVersion: input.targetVersion, channel: input.channel, scope: 'publication', approved: true, approver: input.approver, approvedAt: new Date().toISOString() }; return json(res, 201, await store.append('approvals', item)); }
      if (req.method === 'POST' && url.pathname.match(/^\/api\/content\/[^/]+\/publish$/)) { const contentId = url.pathname.split('/')[3]!; const items = await find(store, 'content') as ContentDraft[]; const draft = items.find((item) => item.id === contentId); if (!draft) return json(res, 404, { error: 'not_found' }); const approvals = await find(store, 'approvals') as Approval[]; const approval = approvals.find((item) => item.targetId === contentId && item.targetVersion === draft.version && item.channel === draft.channel); const receipt = await publishAssisted(draft, approval, new FakePublishingAdapter()); const published = publishAfterApproval(draft, true); await store.replace('content', contentId, published); return json(res, 201, await store.append('receipts', receipt)); }
      if (req.method === 'POST' && url.pathname === '/api/metrics') { const metric = recordMetrics({ ...(await body(req)), id: undefined } as any); const feedback = createRadarFeedback(metric); await store.append('metrics', metric); await store.append('feedback', feedback); return json(res, 201, { metric, feedback }); }
      return json(res, 404, { error: 'not_found' });
    } catch (error: unknown) { return json(res, 400, { error: error instanceof Error ? error.message : 'bad_request' }); }
  });
}
