import type { ContentBrief, ContentDraft, Profile } from './types.js';

export function produceDraft(profile: Profile, brief: ContentBrief): ContentDraft {
  if (profile.status !== 'approved') throw new Error('profile_not_approved');
  if (brief.profileId !== profile.id || !brief.topic.trim() || brief.sources.length === 0) throw new Error('invalid_content_brief');
  const draft: ContentDraft = { briefId: brief.id, title: `${brief.topic}: o que observar antes de decidir`, body: `Análise editorial sobre ${brief.topic}. A persona organiza evidências e limitações para ${brief.objective}.`, caption: `${brief.topic}. Veja os critérios antes de escolher.`, cta: 'Confira a análise completa e compare as alternativas.', version: 'v01', status: 'review' };
  if (brief.product) draft.disclosure = 'Este conteúdo pode conter link de afiliado.';
  return draft;
}

export function requestHumanApproval(draft: ContentDraft): ContentDraft {
  if (draft.status !== 'review') throw new Error('draft_not_in_review');
  return { ...draft, status: 'awaiting_human_approval' };
}

export function publishAfterApproval(draft: ContentDraft, approved: boolean): ContentDraft {
  if (!approved) return { ...draft, status: 'review' };
  if (draft.status !== 'awaiting_human_approval') throw new Error('human_approval_required');
  return { ...draft, status: 'published' };
}
