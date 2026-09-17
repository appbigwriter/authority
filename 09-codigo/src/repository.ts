import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export type EvidenceKind = 'fact' | 'hypothesis' | 'recommendation' | 'risk' | 'blocker';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Evidence { source: string; accessedAt: string; observation: string; kind: EvidenceKind; limitation?: string; }
export interface MarketplaceProduct { id: string; marketplace: string; title: string; category: string; niche: string; subniche: string; price?: number; currency?: string; availability: 'in_stock' | 'out_of_stock' | 'unknown'; observedAt: string; evidence: Evidence[]; }
export interface TrendSignal { id: string; niche: string; subniche: string; query: string; strength: number; period: string; evidence: Evidence[]; }
export interface Opportunity { id: string; niche: string; subniche: string; problem: string; audience: string; products: MarketplaceProduct[]; trends: TrendSignal[]; scores: { demand: number; intent: number; content: number; productFit: number; authority: number; risk: number; total: number }; risks: string[]; evidence: Evidence[]; status: 'candidate' | 'qualified' | 'blocked'; }
export interface InfluencerSeed { id: string; opportunityId: string; name: string; archetype: string; function: string; mentorRole: 'mentor'; audience: string; problem: string; thesis: string; promise: string; traits: string[]; decisionCompass: string; not: string[]; backstory: string; differentiation: string; voice: string; visualDirection: string; anchorFace: string; signatureTrait: string; formats: string[]; monetizationPaths: string[]; risks: string[]; antiNetwork: string[]; score: number; status: 'proposed' | 'selected' | 'blocked'; }
export interface Profile { id: string; seedId: string; name: string; brand: string; bio: string; disclosure: string; thesis: string; promise: string; mentorRole: 'mentor'; archetype: string; traits: string[]; decisionCompass: string; not: string[]; backstory: string; authorityMethod: string; voice: { tone: string; vocabulary: string[]; prohibited: string[] }; visual: { style: string; palette: string; continuity: string; anchorFace: string; signatureTrait: string; prompts: string[] }; pillars: string[]; formats: string[]; guardrails: string[]; claims: { allowed: string[]; soften: string[]; prohibited: string[] }; aboutPage: string; footerDisclaimer: string; monetizationModel: string[]; status: 'development' | 'review' | 'approved'; }
export interface ContentBrief { id: string; profileId: string; topic: string; pillar: string; format: string; channel: string; objective: string; product?: string; sources: Evidence[]; status: 'draft' | 'review' | 'awaiting_human_approval' | 'published' | 'blocked'; }
export interface ContentDraft { briefId: string; title: string; body: string; caption: string; cta: string; disclosure?: string; version: string; status: ContentBrief['status']; }
export interface MarketplaceAdapter { name: string; search(input: { niche: string; subniche?: string }): Promise<{ products: MarketplaceProduct[]; trends: TrendSignal[] }>; }

export interface InfluencerSeedFull { id: string; opportunityId: string; name: string; archetype: string; function: string; mentorRole: 'mentor'; audience: string; problem: string; thesis: string; promise: string; traits: string[]; decisionCompass: string; not: string[]; backstory: string; differentiation: string; voice: string; visualDirection: string; anchorFace: string; signatureTrait: string; formats: string[]; monetizationPaths: string[]; risks: string[]; antiNetwork: string[]; score: number; status: 'proposed' | 'selected' | 'blocked'; researchRef: string; }
export interface FarmerProfile { id: string; seedId: string; name: string; brand: string; bio: string; disclosure: string; thesis: string; promise: string; mentorRole: 'mentor'; archetype: string; traits: string[]; decisionCompass: string; not: string[]; backstory: string; authorityMethod: string; voice: { tone: string; vocabulary: string[]; prohibited: string[] }; visual: { style: string; palette: string; continuity: string; anchorFace: string; signatureTrait: string; prompts: string[]; credibilitySettings: string[]; credibilityLocations: string[] }; pillars: string[]; formats: string[]; guardrails: string[]; claims: { allowed: string[]; soften: string[]; prohibited: string[] }; aboutPage: string; footerDisclaimer: string; monetizationModel: string[]; crossCuttingThemes: string[]; socialContentIdeas: { blog: string[]; video: string[]; shorts: string[]; stories: string[]; }; weeklyContentPlan: any[]; status: 'development' | 'review' | 'approved'; createdAt: string; }
export interface PostMachineOutput { id: string; profileId: string; week: number; blogArticles: any[]; videoScripts: any[]; shorts: any[]; stories: any[]; status: 'draft' | 'review' | 'approved' | 'published'; createdAt: string; }
export interface OpportunityResearch { id: string; opportunityId: string; research: any; sources: any[]; createdAt: string; status: 'pending' | 'completed' | 'failed'; }

export interface StoreData { 
  opportunities: Opportunity[]; 
  seeds: any[]; 
  profiles: Profile[]; 
  content: ContentDraft[]; 
  briefs: ContentBrief[]; 
  assets: any[]; 
  approvals: any[]; 
  receipts: any[]; 
  metrics: any[]; 
  feedback: any[]; 
  events: any[]; 
  research: OpportunityResearch[]; 
  farmer_profiles: FarmerProfile[]; 
  post_machine: any[]; 
}
const empty: StoreData = { opportunities: [], seeds: [], profiles: [], content: [], briefs: [], assets: [], approvals: [], receipts: [], metrics: [], feedback: [], events: [], research: [], farmer_profiles: [], post_machine: [] };

export class JsonStore {
  constructor(private readonly file: string) {}
  async read(): Promise<StoreData> {
    try { return { ...empty, ...JSON.parse(await readFile(this.file, 'utf8')) as Partial<StoreData> }; }
    catch (error: unknown) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return structuredClone(empty); throw error; }
  }
  async append(collection: keyof StoreData, value: unknown): Promise<unknown> {
    const data = await this.read(); data[collection].push(value); await mkdir(dirname(this.file), { recursive: true }); await writeFile(this.file, JSON.stringify(data, null, 2)); return value;
  }
  async replace(collection: keyof StoreData, id: string, value: unknown): Promise<unknown> {
    const data = await this.read(); const index = data[collection].findIndex((item) => typeof item === 'object' && item !== null && 'id' in item && item.id === id);
    if (index < 0) throw new Error('not_found'); data[collection][index] = value; await mkdir(dirname(this.file), { recursive: true }); await writeFile(this.file, JSON.stringify(data, null, 2)); return value;
  }
}
