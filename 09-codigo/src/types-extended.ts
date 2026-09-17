export interface OpportunityResearch {
  id: string;
  opportunityId: string;
  research: {
    marketSize: string;
    trends: string[];
    competitors: string[];
    keywords: string[];
    audienceInsights: string[];
    contentGaps: string[];
    monetizationPaths: string[];
  };
  sources: { title: string; url: string; type: 'web' | 'marketplace' | 'social' }[];
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface SeedArchetype {
  id: string;
  name: string;
  archetype: string;
  description: string;
  approach: string;
  strengths: string[];
  tone: string;
  visualDirection: string;
  contentPillars: string[];
  whyThisWorks: string;
}

export interface InfluencerSeedFull {
  id: string;
  opportunityId: string;
  name: string;
  archetype: string;
  function: string;
  mentorRole: 'mentor';
  audience: string;
  problem: string;
  thesis: string;
  promise: string;
  traits: string[];
  decisionCompass: string;
  not: string[];
  backstory: string;
  differentiation: string;
  voice: string;
  visualDirection: string;
  anchorFace: string;
  signatureTrait: string;
  formats: string[];
  monetizationPaths: string[];
  risks: string[];
  antiNetwork: string[];
  score: number;
  status: 'proposed' | 'selected' | 'blocked';
  researchRef: string;
}

export interface FarmerProfile {
  id: string;
  seedId: string;
  name: string;
  brand: string;
  bio: string;
  disclosure: string;
  thesis: string;
  promise: string;
  mentorRole: 'mentor';
  archetype: string;
  traits: string[];
  decisionCompass: string;
  not: string[];
  backstory: string;
  authorityMethod: string;
  voice: {
    tone: string;
    vocabulary: string[];
    prohibited: string[];
  };
  visual: {
    style: string;
    palette: string;
    continuity: string;
    anchorFace: string;
    signatureTrait: string;
    prompts: string[];
    credibilitySettings: string[];
    credibilityLocations: string[];
  };
  pillars: string[];
  formats: string[];
  guardrails: string[];
  claims: {
    allowed: string[];
    soften: string[];
    prohibited: string[];
  };
  aboutPage: string;
  footerDisclaimer: string;
  monetizationModel: string[];
  crossCuttingThemes: string[];
  socialContentIdeas: {
    blog: string[];
    video: string[];
    shorts: string[];
    stories: string[];
  };
  weeklyContentPlan: {
    week: number;
    themes: string[];
    blogTopics: string[];
    videoTopics: string[];
    shortsTopics: string[];
    storiesTopics: string[];
  }[];
  status: 'development' | 'review' | 'approved';
  createdAt: string;
}

export interface PostMachineOutput {
  id: string;
  profileId: string;
  week: number;
  blogArticles: BlogArticle[];
  videoScripts: VideoScript[];
  shorts: ShortScript[];
  stories: StoryScript[];
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  wordCount: number;
  structure: {
    hook: string;
    intro: string;
    sections: { heading: string; content: string }[];
    conclusion: string;
    cta: string;
  };
  sources: string[];
  disclosure: string;
  seo: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    metaDescription: string;
  };
}

export interface VideoScript {
  id: string;
  title: string;
  duration: '5min';
  structure: {
    hook: string;
    intro: string;
    segments: { title: string; content: string; visualCue: string }[];
    conclusion: string;
    cta: string;
  };
  sources: string[];
  disclosure: string;
  thumbnails: string[];
}

export interface ShortScript {
  id: string;
  title: string;
  platform: 'instagram' | 'tiktok';
  duration: '30-60s';
  structure: {
    hook: string;
    body: string;
    cta: string;
  };
  visualPlan: string[];
  caption: string;
  hashtags: string[];
}

export interface StoryScript {
  id: string;
  title: string;
  platform: 'instagram';
  sequence: {
    frame: number;
    visual: string;
    text: string;
    interactive?: string;
  }[];
  cta: string;
}