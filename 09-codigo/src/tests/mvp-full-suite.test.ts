import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAuthorityServer } from '../server.js';
import { authConfigForTests, type RuntimePrincipal } from '../auth.js';
import { JsonStore } from '../repository.js';
import type { PersistenceStore } from '../persistence/types.js';

interface TestEnv {
  store: PersistenceStore;
  baseUrl: string;
  tokens: Record<string, string>;
  close: () => Promise<void>;
}

async function createTestEnv(): Promise<TestEnv> {
  const dir = await mkdtemp(join(tmpdir(), 'authority-full-suite-'));
  const store = new JsonStore(join(dir, 'state.json'));
  const principals: RuntimePrincipal[] = [
    { id: 'admin-user', role: 'admin', ownerId: 'admin-user', tenantId: 'fbr-agency' },
    { id: 'sergio-reviewer', role: 'reviewer', ownerId: 'sergio-reviewer', tenantId: 'fbr-agency' },
    { id: 'operator-user', role: 'operator', ownerId: 'operator-user', tenantId: 'fbr-agency' },
    { id: 'viewer-user', role: 'viewer', ownerId: 'viewer-user', tenantId: 'fbr-agency' },
    { id: 'external-user', role: 'operator', ownerId: 'external-user', tenantId: 'other-agency' },
  ];
  const { config, tokens } = authConfigForTests(principals);
  const server = createAuthorityServer(store, { auth: config });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  return {
    store,
    baseUrl,
    tokens,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(dir, { recursive: true, force: true });
    },
  };
}

test('MVP-S0 & MVP-S1: Contratos, Auth, Sessão, Tenant e Setup Onboarding', async () => {
  const env = await createTestEnv();
  try {
    // 1. Health & Info (MVP-S0-001)
    const healthRes = await fetch(`${env.baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.ok, true);
    assert.equal(health.publicationMode, 'blocked_without_configured_adapter');

    // 2. Auth Login (MVP-S1-001)
    const loginRes = await fetch(`${env.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'operator@fbr.agency', role: 'operator', tenantId: 'fbr-agency' }),
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.ok, true);
    assert.equal(loginData.status, 'authenticated');
    assert.ok(loginData.token);

    // 3. Auth Session verification
    const sessionRes = await fetch(`${env.baseUrl}/api/auth/session`, {
      headers: { authorization: `Bearer ${loginData.token}` },
    });
    assert.equal(sessionRes.status, 200);
    const sessionData = await sessionRes.json();
    assert.equal(sessionData.principal.tenantId, 'fbr-agency');

    // 4. Multi-tenant listing & selection (MVP-S1-003, MVP-S1-004)
    const tenantsRes = await fetch(`${env.baseUrl}/api/tenants`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(tenantsRes.status, 200);
    const tenants = await tenantsRes.json();
    assert.ok(tenants.some((t: any) => t.id === 'fbr-agency'));

    const selectRes = await fetch(`${env.baseUrl}/api/tenants/select`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.tokens['operator-user']}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ tenantId: 'fbr-agency' }),
    });
    assert.equal(selectRes.status, 200);

    // 5. Onboarding /setup (MVP-S1-005)
    const setupGetRes = await fetch(`${env.baseUrl}/api/setup`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(setupGetRes.status, 200);
    const initialSetup = await setupGetRes.json();
    assert.equal(initialSetup.status, 'setup_incomplete');

    const setupPostRes = await fetch(`${env.baseUrl}/api/setup`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.tokens['operator-user']}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        organizationName: 'FBR Agency',
        editorialGoal: 'Construir autoridade sólida em nichos rentáveis',
        partners: ['amazon-associates'],
        sources: ['manual-briefings'],
        llmLimitCents: 5000,
        members: [{ email: 'sergio@fbr.agency', role: 'reviewer' }],
        brandName: 'Authority Blog Network',
      }),
    });
    assert.equal(setupPostRes.status, 200);
    const updatedSetup = await setupPostRes.json();
    assert.equal(updatedSetup.status, 'ready_for_research');
    assert.equal(updatedSetup.checklist.organization, true);
    assert.equal(updatedSetup.checklist.brandMaster, true);
  } finally {
    await env.close();
  }
});

test('MVP-S2 & MVP-S3 & MVP-S4: Registries, Research Brief, Evidence Ledger & Opportunity Dossier', async () => {
  const env = await createTestEnv();
  try {
    const authHeaders = {
      authorization: `Bearer ${env.tokens['operator-user']}`,
      'content-type': 'application/json',
    };

    // 1. Partner Registry (MVP-S2-001, MVP-S2-002)
    const partnerRes = await fetch(`${env.baseUrl}/api/partners`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: 'partner-amazon-01',
        name: 'Amazon Associates BR',
        program: 'affiliate-br',
        status: 'configured',
      }),
    });
    assert.equal(partnerRes.status, 201);

    // 2. Source Registry (MVP-S2-003, MVP-S2-004, MVP-S2-005)
    const sourceRes = await fetch(`${env.baseUrl}/api/sources`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        id: 'source-manual-sharpeye',
        partnerId: 'partner-amazon-01',
        origin: 'manual://sharpeye/brief-01',
        contractVersion: 'v1.0',
        scope: 'nicho-oftalmologia',
        limits: 'local-only',
        status: 'configured',
        credentialRef: 'secret://fbr/blogs/manual',
      }),
    });
    assert.equal(sourceRes.status, 201);

    // Health check fail-closed sem credencial real não vaza dados
    const healthCheckRes = await fetch(`${env.baseUrl}/api/sources/source-manual-sharpeye/health`, {
      method: 'POST',
      headers: authHeaders,
    });
    assert.equal(healthCheckRes.status, 200);

    // 3. Opportunity creation
    const oppRes = await fetch(`${env.baseUrl}/api/opportunities`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Guia de Saúde Visual e Lentes Especializadas',
        niche: 'Saúde & Óptica',
        score: 8.8,
      }),
    });
    assert.equal(oppRes.status, 201);
    const opp = await oppRes.json();

    // 4. Research Brief creation & list (MVP-S3-001, MVP-S3-002)
    const briefRes = await fetch(`${env.baseUrl}/api/research-briefs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        market: 'Brasil',
        language: 'pt-BR',
        niche: 'Saúde Ocular',
        subniche: 'Lentes e Cuidados com a Visão',
        audience: 'Adultos 30-55 anos com fadiga visual',
        problem: 'Dificuldade para escolher lentes adequadas e prevenir cansaço ocular',
        objective: 'Mapear produtos e termos de alta conversão e autoridade',
      }),
    });
    assert.equal(briefRes.status, 201);
    const brief = await briefRes.json();

    const briefsListRes = await fetch(`${env.baseUrl}/api/research-briefs`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(briefsListRes.status, 200);
    const briefsList = await briefsListRes.json();
    assert.ok(briefsList.some((b: any) => b.id === brief.id));

    // 5. Research Run execution (MVP-S3-004, MVP-S3-005, MVP-S3-006)
    const runRes = await fetch(`${env.baseUrl}/api/research-briefs/${brief.id}/run`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ opportunityId: opp.id }),
    });
    assert.equal(runRes.status, 201);
    const run = await runRes.json();
    assert.equal(run.mode, 'DEMO');

    // 6. Evidence Ledger & Opportunity Dossier (MVP-S4-001, MVP-S4-005, MVP-S4-006)
    const evidenceRes = await fetch(`${env.baseUrl}/api/evidence`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(evidenceRes.status, 200);
    const evidenceList = await evidenceRes.json();
    assert.ok(evidenceList.length > 0);

    const dossierRes = await fetch(`${env.baseUrl}/api/opportunities/${opp.id}/dossier`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(dossierRes.status, 200);
    const dossier = await dossierRes.json();
    assert.equal(dossier.opportunityId, opp.id);
    assert.ok(dossier.evidence.length > 0);

    // 7. Qualify Opportunity with verified evidence (MVP-S4-006)
    const qualifyRes = await fetch(`${env.baseUrl}/api/opportunities/${opp.id}/qualify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Evidência médica e de mercado validada' }),
    });
    assert.equal(qualifyRes.status, 200);
    const qualifiedOpp = await qualifyRes.json();
    assert.equal(qualifiedOpp.status, 'qualified');

    // 8. Opportunity score factors explanation (MVP-S4-004)
    const oppDetailRes = await fetch(`${env.baseUrl}/api/opportunities/${opp.id}`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(oppDetailRes.status, 200);
    const oppDetail = await oppDetailRes.json();
    assert.equal(oppDetail.scoreFactors.formulaVersion, 'score.v1.0');
    assert.ok(oppDetail.scoreFactors.authority > 0);
  } finally {
    await env.close();
  }
});

test('MVP-S5 & MVP-S6: Seeds Creator, Comparison Pack, Decisão, Persona Formation, Character Kit e Approval Pack', async () => {
  const env = await createTestEnv();
  try {
    const operatorHeaders = {
      authorization: `Bearer ${env.tokens['operator-user']}`,
      'content-type': 'application/json',
    };
    const reviewerHeaders = {
      authorization: `Bearer ${env.tokens['sergio-reviewer']}`,
      'content-type': 'application/json',
    };

    // 1. Seeds prompt versioning (MVP-S5-001)
    const promptRes = await fetch(`${env.baseUrl}/api/seeds/prompt`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(promptRes.status, 200);
    const promptData = await promptRes.json();
    assert.ok(promptData.prompt);

    // 2. Criar Seeds diretamente (MVP-S5-002)
    const seed1Res = await fetch(`${env.baseUrl}/api/seeds`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        name: 'Dra. Nadia Brandão',
        archetype: 'Mentor / Especialista Científica',
        intellectualTraits: ['rigor técnico', 'linguagem acessível', 'baseada em evidências'],
        physicalIdentity: 'Óculos clássicos, jaleco moderno, estúdio claro com livros científicos',
        formats: ['Guia em Profundidade', 'Comparativo de Produtos', 'Vídeo Explicativo'],
        risks: ['Não prescrever medicamentos sem consulta'],
        score: 9.2,
      }),
    });
    assert.equal(seed1Res.status, 201);
    const seed1 = await seed1Res.json();

    const seed2Res = await fetch(`${env.baseUrl}/api/seeds`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        name: 'Dr. Lucas Ribeiro',
        archetype: 'Prático / Guia do Consumidor',
        intellectualTraits: ['foco em custo-benefício', 'didática direta'],
        physicalIdentity: 'Camisa casual, ambiente de consultório contemporâneo',
        formats: ['Review Rápido', 'Checklist de Compra'],
        risks: ['Evitar alegações de cura'],
        score: 8.6,
      }),
    });
    assert.equal(seed2Res.status, 201);
    const seed2 = await seed2Res.json();

    // 3. Comparison Pack (MVP-S5-004, MVP-S5-005)
    const compareRes = await fetch(`${env.baseUrl}/api/seeds/compare`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({ seedIds: [seed1.id, seed2.id] }),
    });
    assert.equal(compareRes.status, 200);
    const comparison = await compareRes.json();
    assert.equal(comparison.seedIds.length, 2);
    assert.ok(comparison.scenario.recommendation);

    // 4. Decisão formal humana de seleção de Seed (MVP-S5-006)
    const selectRes = await fetch(`${env.baseUrl}/api/seeds/select`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({ seedId: seed1.id }),
    });
    assert.equal(selectRes.status, 200);
    const selectData = await selectRes.json();
    assert.equal(selectData.seeds[0].status, 'selected');

    // 5. Persona Formation Pipeline (MVP-S6-001, MVP-S6-002, MVP-S6-003, MVP-S6-004)
    const createPersonaRes = await fetch(`${env.baseUrl}/api/personas`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        name: 'Dra. Nadia Brandão',
        archetype: 'Mentor Especialista',
        seedId: seed1.id,
      }),
    });
    assert.equal(createPersonaRes.status, 201);
    const persona = await createPersonaRes.json();

    const generateVersionRes = await fetch(`${env.baseUrl}/api/personas/${persona.id}/generate`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        characterBible: {
          voice: 'Autoritativa, empática e científica',
          guardrails: ['Não fazer diagnósticos personalizados'],
          disclosure: 'Conteúdo educativo. Parcerias transparentes.',
        },
        physicalIdentityBible: {
          visualStyle: 'Iluminação neutra, jaleco moderno, estúdio médico contemporâneo',
        },
      }),
    });
    assert.equal(generateVersionRes.status, 201);
    const version = await generateVersionRes.json();
    assert.equal(version.status, 'generated');

    // 6. Brand Master Document (MVP-S6-006, MVP-S6-007)
    const brandMasterRes = await fetch(`${env.baseUrl}/api/personas/${persona.id}/brand-master`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(brandMasterRes.status, 200);
    const brandMaster = await brandMasterRes.json();
    assert.equal(brandMaster.publicationMode, 'blocked_in_mvp');
    assert.equal(brandMaster.blogStatus, 'configured_offline');

    // 7. Approval Pack e Aprovação Humana de Sergio (MVP-S6-008)
    const packRes = await fetch(`${env.baseUrl}/api/personas/${persona.id}/approval-pack`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({}),
    });
    assert.equal(packRes.status, 201);
    const pack = await packRes.json();

    const approvePackRes = await fetch(`${env.baseUrl}/api/approval-packs/${pack.id}/approve`, {
      method: 'POST',
      headers: reviewerHeaders,
      body: JSON.stringify({ personaVersion: version.version }),
    });
    assert.equal(approvePackRes.status, 200);
    const approvedPack = await approvePackRes.json();
    assert.equal(approvedPack.status, 'approved');
  } finally {
    await env.close();
  }
});

test('MVP-S7 & MVP-S8: Post Machine, Calendário Editorial, Review Queue, Jobs & Audit', async () => {
  const env = await createTestEnv();
  try {
    const operatorHeaders = {
      authorization: `Bearer ${env.tokens['operator-user']}`,
      'content-type': 'application/json',
    };
    const reviewerHeaders = {
      authorization: `Bearer ${env.tokens['sergio-reviewer']}`,
      'content-type': 'application/json',
    };

    // 1. Calendário Editorial (MVP-S7-001, MVP-S7-002)
    const calRes = await fetch(`${env.baseUrl}/api/editorial-calendar`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        topic: 'Como escolher o filtro de luz azul correto para o trabalho no computador',
        pillar: 'Saúde Visual & Produtividade',
        format: 'Guia Detalhado',
        channel: 'Blog',
      }),
    });
    assert.equal(calRes.status, 201);
    const calItem = await calRes.json();

    const calListRes = await fetch(`${env.baseUrl}/api/editorial-calendar`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(calListRes.status, 200);
    const calList = await calListRes.json();
    assert.ok(calList.length > 0);

    // 2. Draft creation, editing and Review Queue (MVP-S7-003, MVP-S7-004, MVP-S7-005, MVP-S7-006)
    // Inserir draft inicial em estado draft
    const draftId = `draft_${Date.now()}`;
    const initialDraft: any = {
      id: draftId,
      briefId: calItem.id,
      title: 'Filtro de Luz Azul: Ciência vs Marketing',
      body: 'Texto completo e referenciado sobre lentes de proteção visual.',
      version: '1',
      status: 'draft',
      channel: 'Blog',
      disclosure: 'Transparência: Este artigo contém links de parceiros.',
      tenantId: 'fbr-agency',
      ownerId: 'operator-user',
    };
    await env.store.append('content', initialDraft);

    // Submeter para revisão humana do Sergio
    const reviewDecisionRes = await fetch(`${env.baseUrl}/api/content/${draftId}/review`, {
      method: 'POST',
      headers: reviewerHeaders,
    });
    assert.equal(reviewDecisionRes.status, 200);

    // Review queue check (agora deve conter o item em awaiting_human_approval)
    const reviewQueueRes = await fetch(`${env.baseUrl}/api/review-queue`, {
      headers: { authorization: `Bearer ${env.tokens['sergio-reviewer']}` },
    });
    assert.equal(reviewQueueRes.status, 200);
    const reviewQueue = await reviewQueueRes.json();
    assert.ok(reviewQueue.some((d: any) => d.id === draftId));

    // Publicação bloqueada fail-closed sem adaptador externo
    const publishRes = await fetch(`${env.baseUrl}/api/content/${draftId}/publish`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.tokens['sergio-reviewer']}`,
        'content-type': 'application/json',
      },
    });
    // Deve falhar fechado com 422 ou erro de adapter não configurado
    assert.ok([403, 422].includes(publishRes.status));

    // 3. Jobs duráveis e heartbeat (MVP-S8-001)
    const createJobRes = await fetch(`${env.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        type: 'research_batch_processing',
        targetId: 'opp_optical_01',
      }),
    });
    assert.equal(createJobRes.status, 201);
    const job = await createJobRes.json();

    const heartbeatRes = await fetch(`${env.baseUrl}/api/jobs/${job.id}/heartbeat`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({ progress: 100, status: 'completed' }),
    });
    assert.equal(heartbeatRes.status, 200);

    // 4. Decision Ledger e Audit Trail (MVP-S8-003, MVP-S8-004)
    const decisionsRes = await fetch(`${env.baseUrl}/api/decisions`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(decisionsRes.status, 200);
    const decisions = await decisionsRes.json();
    assert.ok(Array.isArray(decisions));

    const auditRes = await fetch(`${env.baseUrl}/api/audit-events`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(auditRes.status, 200);
    const auditEvents = await auditRes.json();
    assert.ok(auditEvents.length > 0);

    // 5. Métricas e Feedback Radar (MVP-S8-005, MVP-S8-006)
    const metricsRes = await fetch(`${env.baseUrl}/api/metrics`, {
      method: 'POST',
      headers: operatorHeaders,
      body: JSON.stringify({
        briefId: calItem.id,
        version: '1',
        channel: 'Blog',
        source: 'manual://analytics-preliminary',
        sufficient: false,
        limitation: 'Métricas pré-publicação estimadas em ambiente controlado',
        period: { from: '2026-09-01', to: '2026-09-22' },
        attention: { impressions: 100, views: 50, saves: 5, shares: 2 },
        trust: { comments: 3, positiveSignals: 4 },
        traffic: { clicks: 12, ctr: 0.12 },
        leads: { count: 1 },
        conversion: { count: 0, revenue: 0 },
      }),
    });
    assert.equal(metricsRes.status, 201);

    const feedbackRes = await fetch(`${env.baseUrl}/api/feedback`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(feedbackRes.status, 200);
    const feedbackList = await feedbackRes.json();
    assert.ok(feedbackList.length > 0);

    // 6. Readiness check (MVP-S8-007)
    const readinessRes = await fetch(`${env.baseUrl}/api/readiness`, {
      headers: { authorization: `Bearer ${env.tokens['operator-user']}` },
    });
    assert.equal(readinessRes.status, 200);
    const readiness = await readinessRes.json();
    assert.equal(readiness.ready, true);
    assert.equal(readiness.publication, 'blocked');
  } finally {
    await env.close();
  }
});
