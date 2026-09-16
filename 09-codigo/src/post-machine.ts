import type { Approval, AssetVersion, ChannelAdapter, ContentBrief, ContentDraft, Evidence, MetricRecord, Profile, PublicationReceipt, RadarFeedback } from './types.js';

const CHANNELS: Record<string, { maxCharacters: number; format: string }> = {
  'short-video': { maxCharacters: 2200, format: '9:16 video + caption' },
  instagram: { maxCharacters: 2200, format: '4:5 image/video + caption' },
  blog: { maxCharacters: 12000, format: 'HTML/Markdown article' },
  email: { maxCharacters: 6000, format: 'subject + plain text/HTML' },
  linkedin: { maxCharacters: 3000, format: 'text + optional image' },
};

export interface QueueItem { id: string; brief: ContentBrief; state: ContentBrief['status']; reasons: string[]; queuedAt: string; }
export function validateBrief(profile: Profile | undefined, brief: ContentBrief): string[] {
  const reasons: string[] = [];
  if (!profile || profile.id !== brief.profileId || profile.status !== 'approved') reasons.push('profile_not_approved');
  if (!brief.topic.trim() || !brief.pillar.trim() || !brief.format.trim() || !brief.channel.trim() || !brief.objective.trim()) reasons.push('brief_missing_context');
  if (!profile?.guardrails?.length) reasons.push('missing_character_bible_or_guardrails');
  if (!brief.sources?.length) reasons.push('sources_required');
  if (profile && !profile.pillars.includes(brief.pillar)) reasons.push('pillar_not_approved');
  if (profile && !profile.formats.includes(brief.format)) reasons.push('format_not_approved');
  return reasons;
}
export function enqueueBrief(profile: Profile | undefined, brief: ContentBrief): QueueItem {
  const reasons = validateBrief(profile, brief);
  return { id: `queue_${brief.id}`, brief: { ...brief, status: reasons.length ? 'blocked' : 'draft', owner: brief.owner ?? 'editorial-operator', priority: brief.priority ?? 'medium', nextGate: reasons.length ? 'resolve_blockers' : 'produce_draft' }, state: reasons.length ? 'blocked' : 'draft', reasons, queuedAt: new Date().toISOString() };
}

function assertClaims(profile: Profile, text: string): void {
  const lower = text.toLowerCase();
  if (profile.voice.prohibited.some((claim) => lower.includes(claim.toLowerCase())) || profile.claims.prohibited.some((claim) => lower.includes(claim.toLowerCase())) || /\b(cura|garantia|resultado garantido)\b/i.test(lower)) throw new Error('prohibited_claim');
  if (lower.includes('eu usei') || lower.includes('meu corpo') || lower.includes('minha experiência') || /\b(cura|garantid[oa]|resultado garantido)\b/i.test(lower)) throw new Error('prohibited_claim');
}
export function produceDraft(profile: Profile, brief: ContentBrief): ContentDraft {
  const reasons = validateBrief(profile, brief); if (reasons.length) throw new Error(`invalid_content_brief:${reasons.join(',')}`);
  const disclosure = brief.product ? `${profile.disclosure} Este conteúdo pode conter link de afiliado.` : profile.disclosure;
  const body = `${brief.topic}: organize os critérios antes de decidir. A persona ${profile.name} apresenta contexto, alternativas e limitações com base nas fontes do briefing.`;
  assertClaims(profile, body);
  return { briefId: brief.id, title: `${brief.topic}: o que observar antes de decidir`, body, caption: `${brief.topic}. Compare os critérios e verifique as fontes.`, cta: brief.product ? 'Confira a análise e identifique a alternativa adequada ao seu contexto.' : 'Leia a análise completa e compare as alternativas.', disclosure, sources: brief.sources, channel: brief.channel, format: brief.format, version: 'v01', status: 'draft' };
}
export function submitForReview(draft: ContentDraft): ContentDraft { if (draft.status !== 'draft') throw new Error('draft_required'); return { ...draft, status: 'review' }; }
export function requestHumanApproval(draft: ContentDraft): ContentDraft { if (draft.status !== 'review') throw new Error('draft_not_in_review'); return { ...draft, status: 'awaiting_human_approval' }; }
export function publishAfterApproval(draft: ContentDraft, approved: boolean): ContentDraft { if (!approved) return { ...draft, status: 'review' }; if (draft.status !== 'awaiting_human_approval') throw new Error('human_approval_required'); return { ...draft, status: 'published' }; }

export function adaptDraft(draft: ContentDraft, channel: string, version = 'v01'): AssetVersion {
  const spec = CHANNELS[channel]; if (!spec) throw new Error('unsupported_channel');
  const disclosure = draft.disclosure ?? 'Conteúdo editorial; verifique as fontes.';
  const content = `${draft.caption}\n\n${draft.body}\n\n${draft.cta}\n\n${disclosure}`;
  if (content.length > spec.maxCharacters) throw new Error('channel_limit_exceeded');
  const asset: AssetVersion = { id: `${draft.briefId}_${channel}_${version}`, briefId: draft.briefId, channel, version, name: `AE_${draft.briefId}_${channel}_${version}`, kind: 'copy', content, specification: spec, disclosure, sources: draft.sources ?? [], source: { source: 'generated-editorial-copy', license: 'internal' } };
  if (draft.id) asset.parentId = draft.id;
  return asset;
}
export function createVersion(draft: ContentDraft, channel: string, nextVersion: number): AssetVersion { return adaptDraft(draft, channel, `v${String(nextVersion).padStart(2, '0')}`); }

export class FakePublishingAdapter implements ChannelAdapter {
  readonly name = 'fake-channel-adapter';
  async publish(input: { draft: ContentDraft; channel: string; approval: Approval }): Promise<PublicationReceipt> {
    if (input.approval.targetId !== (input.draft.id ?? input.draft.briefId) || input.approval.targetVersion !== input.draft.version || input.approval.channel !== input.channel) throw new Error('approval_scope_mismatch');
    return { id: `receipt_fake_${input.draft.briefId}_${input.channel}_${input.draft.version}`, draftId: input.draft.id ?? input.draft.briefId, briefId: input.draft.briefId, channel: input.channel, version: input.draft.version, provider: this.name, externalId: `fake_${input.draft.briefId}_${input.channel}`, publishedAt: new Date().toISOString(), operator: input.approval.approver, mode: 'fake' };
  }
}
export class UnconfiguredPublishingAdapter implements ChannelAdapter {
  constructor(public readonly name = 'real-channel-not-configured') {}
  async publish(): Promise<PublicationReceipt> { throw new Error('external_channel_not_configured'); }
}
export async function publishAssisted(draft: ContentDraft, approval: Approval | undefined, adapter: ChannelAdapter): Promise<PublicationReceipt> {
  if (draft.status !== 'awaiting_human_approval') throw new Error('human_approval_required');
  if (!approval?.approved || approval.scope !== 'publication' || approval.targetVersion !== draft.version || approval.channel !== draft.channel) throw new Error('specific_publication_approval_required');
  return adapter.publish({ draft, channel: draft.channel!, approval });
}

export function recordMetrics(input: Omit<MetricRecord, 'id'>): MetricRecord { return { ...input, id: `metric_${input.briefId}_${input.version}_${input.channel}` }; }
export function createRadarFeedback(metric: MetricRecord): RadarFeedback {
  const signals: string[] = []; const questions: string[] = [];
  if (!metric.sufficient) { signals.push('insufficient_data'); questions.push('Qual período e canal devem ser observados para completar a amostra?'); }
  if ((metric.attention.saves ?? 0) > 0 || (metric.attention.shares ?? 0) > 0) signals.push('content_resonance');
  if ((metric.traffic.clicks ?? 0) > 0) signals.push('intent_signal');
  if ((metric.conversion.count ?? 0) > 0) signals.push('conversion_signal');
  questions.push('Quais fontes e ângulos devem ser pesquisados na próxima oportunidade?');
  return { id: `feedback_${metric.id}`, metricId: metric.id, briefId: metric.briefId, signals, questions, recommendation: metric.sufficient ? 'Revisar o próximo briefing usando sinais de atenção, confiança, tráfego, leads e conversão; não usar seguidores como substituto.' : 'Não concluir sobre performance: coletar dados adicionais antes de mudar a estratégia.', createdAt: new Date().toISOString() };
}
export function sourceSummary(sources: Evidence[]): string[] { return sources.map((source) => source.source); }
