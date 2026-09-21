# MP-PB-001 — PRD: Profile Building

## Status
`PRD` | v0.1 | aguardando_revisao_Sergio
Depende de: **MP-000** (Fundação) · **MP-PB-000** (Projeto Conceitual)
Módulo de: **Authority Engine**

---

## 1. Objetivo do produto

Entregar a camada de **execução operacional** do Authority Engine: um sistema **multi-tenant, multi-plataforma e API-first** que, a partir de alvos qualificados (nichos, subnichos, produtos) e de Personas aprovadas, **sugere** o conjunto de perfis/canais, **provisiona** as contas de forma isolada e conforme, **orquestra e publica** conteúdo de forma assistida (com gate humano) e **captura audiência** para ativos próprios da FBR — alimentando o ciclo de feedback do Opportunity Radar.

**Não-objetivo:** o Profile Building não avalia mérito de persona, não aprova claims e não substitui os gates G0–G7. Ele os executa e respeita.

---

## 2. Contexto e posicionamento

- **Upstream:** Opportunity Radar (alvos), pipeline formador (Persona, Character Bible, Physical Identity Bible, pacote editorial, guardrails, claims).
- **Este módulo:** Profile Building (sugestão de perfis + provisionamento + orquestração + publicação + captura).
- **Downstream:** FBR Agency Flux (coordenação de jobs, provisionamento, readbacks), FBR Blogs (projetos editoriais derivados).
- **Governança:** Sergio aprova Persona, nome de blog e publicações na fase piloto.

Comunicação exclusivamente por **APIs oficiais e eventos assinados**. Nenhum módulo lê tabelas internas de outro.

---

## 3. Escopo

### 3.1 Em escopo (fase 1)
- Sugestão de perfis/mix de plataformas a partir de alvo qualificado + Persona aprovada.
- Provisionamento de perfis e contas por tenant (Instagram, Facebook, TikTok, YouTube).
- Cofre de credenciais multi-tenant (System User tokens Meta, OAuth TikTok, OAuth YouTube).
- Isolamento de sessão por persona (contêiner) e proxy coerente/fixo por conta.
- Orquestração de conteúdo: calendário, fila de aprovação, enforcement de disclosure de IA.
- Publicação assistida via adapters oficiais (Meta/TikTok/YouTube).
- Scheduler tenant-aware (cadência, budget, cota).
- Roteamento de monetização (Amazon, TikTok Shop, Clickbank) e captura para ativo próprio.
- RBAC, trilha de auditoria e métricas com feedback ao Opportunity Radar.

### 3.2 Fora de escopo (explícito)
- **Evasão de banimento / contas de reposição** para dar continuidade a uma conta bloqueada.
- **Fingerprint spoofing / antidetect** para enganar sistemas de risco de plataforma.
- **Identidade humana falsa** ou ocultação do caráter de IA da persona.
- **LinkedIn como perfil-pessoa** (exige pessoa real; eventual Página de organização fica para fase futura).
- Criação/mérito de Persona (é do pipeline formador e dos gates).
- Execução comercial de Persona em estado `draft/blocked/rejected`.

---

## 4. Usuários e papéis (RBAC)

| Papel | Permissões |
|---|---|
| **Aprovador (Sergio)** | Aprovar/reprovar publicações e handoffs; aprovar provisionamento; ver tudo. Única alçada para liberar ação externa irreversível na fase piloto. |
| **Operador FBR** | Criar rascunhos de agenda, preparar pacotes, solicitar aprovação, monitorar. Não publica sem aprovação. |
| **Revisor de conformidade** | Verificar disclosure, claims, fontes; marcar não-conformidade; bloquear peça. |
| **Sistema (workers)** | Executar jobs aprovados; publicar via adapters; coletar métricas. |
| **Admin de tenant** | Configurar contas, proxies, budgets, cota e credenciais de uma empresa do grupo. |

Todo papel é **escopado por tenant**. Nenhum papel de um tenant enxerga dados de outro.

---

## 5. Requisitos funcionais

Nomenclatura: `RF-<área>-<n>`. Prioridade: **P0** (MVP), **P1** (piloto), **P2** (evolução).

### 5.1 Sugestão de perfis (RF-SUG)
- **RF-SUG-1 (P1):** Dado um alvo qualificado (nicho/subnicho/produto) e uma Persona aprovada, o sistema propõe um **conjunto de perfis** e o **mix de plataformas** recomendado, com justificativa (adequação da plataforma ao público e ao formato do nicho).
- **RF-SUG-2 (P1):** A sugestão inclui: plataformas recomendadas, tipo de conta (Business/Creator/canal), cadência inicial sugerida e ativos próprios de destino (blog/lista).
- **RF-SUG-3 (P1):** A sugestão é uma **proposta em `draft`**; nunca provisiona nada sozinha. Requer aprovação para avançar.
- **RF-SUG-4 (P2):** A sugestão consome sinais de desempenho históricos (feedback loop) para calibrar o mix.

### 5.2 Provisionamento de perfil (RF-PROV)
- **RF-PROV-1 (P0):** Registrar uma **Persona operável** (referência à Persona canônica versionada; nunca cópia autoritativa).
- **RF-PROV-2 (P0):** Registrar **Accounts** por plataforma vinculadas à persona e ao tenant, com tipo, ids de plataforma, proxy e caminho de contêiner.
- **RF-PROV-3 (P0):** Resolver credenciais **sempre** via cofre por `tenant_id` + plataforma. O motor nunca lê token global.
- **RF-PROV-4 (P1):** Atribuir **proxy coerente e fixo** por conta (geo compatível com o público declarado da persona).
- **RF-PROV-5 (P1):** Manter **contêiner isolado** por persona (sessão/cookies/cache) para onboarding/operação humana e fallback.
- **RF-PROV-6 (P1):** Bloquear provisionamento se a Persona não estiver em estado `approved`/`pilot`.

### 5.3 Orquestração de conteúdo (RF-ORQ)
- **RF-ORQ-1 (P0):** Modelar **ContentItem** (tipo de mídia, título, legenda, mídia, tags, `ai_generated`, vínculo de monetização, estado de aprovação).
- **RF-ORQ-2 (P0):** Enforcement de disclosure: um ContentItem com `ai_generated=true` **não pode** ser publicado sem o mecanismo de disclosure da plataforma configurado (ou registro explícito quando o campo de API ainda não existir).
- **RF-ORQ-3 (P1):** Calendário editorial por persona/plataforma com cadência configurável.
- **RF-ORQ-4 (P1):** Fila de aprovação; nenhuma peça vai a publicação sem gate humano na fase piloto.
- **RF-ORQ-5 (P1):** Validação de claims: rejeitar peça com claim proibido (testemunho corporal inventado, credencial falsa, cura, garantia, resultado fabricado) conforme G3/G5.
- **RF-ORQ-6 (P2):** Adaptação automática de formato por plataforma (aspect ratio, duração, capa) a partir de um master.

### 5.4 Publicação multi-plataforma (RF-PUB)
- **RF-PUB-1 (P0):** Adapter **Meta** (Instagram + Facebook): fluxo de container em dois passos (criar → poll até `FINISHED` → publish); imagem (JPEG), Reel (≤90s, H.264/AAC) e carrossel; tratamento do erro 24 (codec). *Referência: `meta_publisher.py`.*
- **RF-PUB-2 (P1):** Adapter **TikTok**: `creator_info/query` antes de publicar; `is_aigc=true`; enforcement de `SELF_ONLY` enquanto o app não for auditado; PULL_FROM_URL com domínio verificado; tratamento de `rate_limit_exceeded` e `url_ownership_unverified`. *Referência: `tiktok_publisher.py`.*
- **RF-PUB-3 (P1):** Adapter **YouTube**: upload resumable (bytes, não pull de URL); `gcp_project_id` por tenant para isolar cota; guard de cota; declaração de conteúdo sintético registrada. *Referência: `youtube_publisher.py`.*
- **RF-PUB-4 (P0):** Todo adapter é **tenant-aware** e compartilha o `core` (TenantContext, CredentialVault, ContentItem, erros).
- **RF-PUB-5 (P1):** **Idempotência**: armazenar `container_id`/`publish_id`/`upload session` por peça agendada, para que um worker que reinicia não duplique publicação.

### 5.5 Scheduler tenant-aware (RF-SCH)
- **RF-SCH-1 (P1):** O sistema é o **relógio** (nenhuma plataforma agenda nativamente). Dispara a publicação no horário-alvo criando o container/init só perto da hora (containers expiram).
- **RF-SCH-2 (P1):** Respeitar **cadência e budget por tenant** (goals diferentes por empresa do grupo).
- **RF-SCH-3 (P1):** Respeitar **cota do YouTube por projeto/tenant** (contador diário; bloquear ao esgotar).
- **RF-SCH-4 (P1):** Respeitar **rate limits** por plataforma (Meta ~200 chamadas/h de polling; TikTok 6 req/min por token).
- **RF-SCH-5 (P1):** Política de **retry/backoff** reaproveitando os erros de domínio dos adapters (timeout de container, formato inválido, compliance).
- **RF-SCH-6 (P0):** Nenhum job de publicação executa sem estado `approved`.

### 5.6 Monetização e captura de audiência (RF-MON)
- **RF-MON-1 (P1):** Registrar **MonetizationLink** (produto, fonte — Amazon/TikTok Shop/Clickbank —, tipo próprio/afiliado, URL, vínculo com post e perfil) para auditoria.
- **RF-MON-2 (P1):** Todo perfil aponta para um **ativo próprio** (blog `<slug>.fbr.news`, lista) configurado no provisionamento.
- **RF-MON-3 (P1):** Bloquear vínculo de monetização que viole guardrails de claim do nicho.
- **RF-MON-4 (P2):** Mecanismo de captura (CTA/bio/lead) que migra seguidor de plataforma para ativo próprio, com atribuição.

### 5.7 Gestão, auditoria e feedback (RF-GOV)
- **RF-GOV-1 (P0):** **PublishLog** imutável: quem/o quê/quando/qual resposta da API/estado de disclosure. É a trilha de compliance.
- **RF-GOV-2 (P1):** Dashboard por tenant: status de contas, fila de aprovação, publicações, cota, alertas de conformidade.
- **RF-GOV-3 (P1):** Emissão de **eventos assinados** de métricas para o Opportunity Radar (fechando o ciclo).
- **RF-GOV-4 (P1):** Alertas de risco: conta em verificação/bloqueio, disclosure ausente, claim rejeitado, cota esgotando.

---

## 6. Requisitos não-funcionais

- **RNF-SEG-1:** Credenciais criptografadas com **chave por tenant** (KMS/Secrets Manager). Tokens nunca em log nem em variável global.
- **RNF-SEG-2:** Isolamento multi-tenant em dados, credenciais, cota, auditoria e RBAC (row-level security no Supabase/Postgres, no mínimo).
- **RNF-PRIV-1:** Conformidade com LGPD para dados de audiência/lead capturados; base legal e retenção definidas por tenant.
- **RNF-CONF-1:** Publicação sempre pelos caminhos oficiais; automação de browser só como fallback auditável.
- **RNF-OBS-1:** Observabilidade: logs estruturados, métricas por adapter, rastreio de job fim a fim.
- **RNF-ESC-1:** Escalabilidade para muitas contas simultâneas — workers assíncronos e filas (evoluir de `requests` síncrono dos protótipos para execução concorrente).
- **RNF-RES-1:** Resiliência de portfólio: a queda de uma conta não interrompe a operação; audiência preservada em ativo próprio.
- **RNF-IDEM-1:** Operações de publicação idempotentes por peça agendada.

---

## 7. Modelo de dados (canônico do módulo)

```text
Tenant(id, nome, budget_config, quota_config, status)
Persona(id, tenant_id, ref_persona_canonica, versao, is_ai=true, estado, ativo)
Account(id, tenant_id, persona_id, plataforma, tipo, ids_plataforma,
        proxy_id, container_path, estado)
Proxy(id, tenant_id, tipo, geo, credenciais_ref, account_id_fixo)
ContentItem(id, tenant_id, persona_id, media_type, title, caption, media_refs,
            tags, ai_generated=true, monetization_link_id, estado_aprovacao)
ScheduleEntry(id, tenant_id, content_id, account_id, publish_at, estado,
              external_ref)   # external_ref = container_id/publish_id (idempotência)
MonetizationLink(id, tenant_id, produto, fonte, tipo_proprio_ou_afiliado,
                 url, post_ref, guardrail_ok)
PublishLog(id, tenant_id, account_id, content_id, quem, quando, resposta_api,
           disclosure_status)   # imutável
OwnedAsset(id, tenant_id, persona_id, tipo, url)   # blog/lista de destino
ApprovalGate(id, tenant_id, alvo, gate, decisao, decisor, data)
```

Estados de peça/persona alinhados ao MP-000: `draft`, `blocked`, `approved`, `pilot` (+ `publishing`, `published`, `failed` no ciclo de publicação).

---

## 8. Arquitetura técnica

### 8.1 Camadas
```text
[ App/API (Next.js/TypeScript) ]  ← dashboard, RBAC, aprovação, eventos assinados
            │
[ Orquestração/Scheduler ]        ← relógio, cadência, budget, cota, retry
            │
[ Core compartilhado ]            ← TenantContext, CredentialVault, ContentItem, erros
       ┌────┴─────┬──────────┐
   [Meta adapter][TikTok][YouTube]  ← publicação oficial, tenant-aware
            │
[ Cofre de credenciais ]          ← KMS/Secrets Manager, chave por tenant
            │
[ Postgres/Supabase ]             ← dados isolados por tenant (RLS)
```

### 8.2 Decisão de stack (a confirmar com Sergio)
O MP-000 fixa **Next.js/TypeScript/Tailwind + Postgres/Supabase**. Os protótipos dos adapters estão em Python (`core.py`, `meta_publisher.py`, `tiktok_publisher.py`, `youtube_publisher.py`). Duas opções:

1. **Portar os adapters para TypeScript** e manter tudo num monólito modular alinhado ao padrão FBR. *(Recomendado para coesão.)*
2. **Manter os adapters como workers Python** atrás de uma fila (isolados), com o app/API em TS. *(Recomendado se quiser aproveitar os protótipos já validados e a robustez do ecossistema Python para mídia.)*

Os protótipos Python servem, no mínimo, como **especificação executável** dos fluxos oficiais de cada plataforma.

### 8.3 Integração com o Authority Engine
- **Consome:** evento assinado `persona.approved` (com pacote completo do MP-000) e `target.qualified`.
- **Emite:** `profile.suggested`, `profile.provisioned`, `content.published`, `metrics.updated` (assinados).
- **Regra:** o Profile Building mantém sua própria fonte canônica de Account/ContentItem/PublishLog; consome Persona por referência, sem duplicar autoridade.

---

## 9. Conformidade e gates

| Gate MP-000 | Enforcement no Profile Building |
|---|---|
| **G3 — Autoridade e ética** | Rejeita peça com claim proibido; registra limites de autoridade da persona. |
| **G5 — Monetização sustentável** | Valida pertinência do produto; bloqueia vínculo que distorça recomendação. |
| **G6 — Identidade e transparência** | Sem disclosure de IA configurada, o perfil não opera. Aplica política visual/Character Bible. |
| **G7 — Aprovação do piloto** | Sem “SIM” explícito e datado do Sergio, saída permanece `draft`; nada externo executa. |

Disclosure de IA por plataforma:
- **TikTok:** `is_aigc=true` (resolvido).
- **Meta / YouTube:** campo de API a confirmar contra a doc viva; enquanto isso, flag registrado, logado e garantido por marcação no onboarding — **nunca** silenciosamente ignorado.

---

## 10. Roadmap por fases

- **Fase 0 — Fundação técnica (P0):** `core`, cofre de credenciais real (System Users Meta), adapter Meta em produção, PublishLog, RBAC básico.
- **Fase 1 — Piloto SharpEye/Nadia (P1):** sugestão de perfis, provisionamento, orquestração com gate humano, adapter TikTok (com audit) e YouTube (com projeto por tenant), scheduler, roteamento de monetização e captura para ativo próprio.
- **Fase 2 — Escala e feedback (P2):** adaptação automática de formato, calibração da sugestão por desempenho, workers assíncronos, dashboards ricos, captura de lead com atribuição.

Cada fase respeita o MP-000: **o piloto e seus critérios de sucesso são definidos antes de construir software de escala.**

---

## 11. Métricas de sucesso (piloto)
- Qualidade e utilidade do conteúdo (avaliação humana).
- Consistência de identidade da persona (aderência ao Character/Physical Identity Bible).
- Volume de produção sustentável (≥ cadência planejada por 90 dias).
- CTR e sinais de confiança; crescimento de lista/ativo próprio.
- Conversão para produtos próprios/afiliados sem violar guardrails.
- Taxa de conformidade: 100% das peças com disclosure de IA e claims válidos.
- Resiliência: continuidade de audiência mesmo com rotatividade de contas.

---

## 12. Riscos e questões em aberto
- Confirmar fronteira Profile Building ↔ Post Machine ↔ Influencer Farmer (MP-PB-000 §2).
- Confirmar stack de execução (§8.2).
- Fechar o campo de disclosure de IA na Meta e no YouTube contra a doc atual antes de produção.
- Definir política de proxy/geo por nicho.
- Definir escala e mapeamento persona↔marca↔contas (1..N por plataforma).
- Definir contadores de cota/budget por tenant (armazenamento e política de bloqueio).
- Aprovação da estratégia de audit do TikTok (tempo de espera vs. início do piloto).

---

## 13. Critérios de aceite do PRD
- [ ] Escopo separa **operação conforme** de **antidetect/evasão** de forma inequívoca.
- [ ] Todos os RF-P0/P1 têm dono, estado e gate correspondente.
- [ ] Disclosure de IA é enforce técnico, não recomendação.
- [ ] Multi-tenant isola dados, credenciais, cota e auditoria.
- [ ] Nenhuma ação externa irreversível sem aprovação do Sergio na fase piloto.
- [ ] Modelo de dados e contratos de evento estão completos e assináveis.
- [ ] O piloto SharpEye/Nadia e seus critérios de sucesso estão definidos.
- [ ] MP-PB-001 revisado e aprovado explicitamente pelo Sergio.
