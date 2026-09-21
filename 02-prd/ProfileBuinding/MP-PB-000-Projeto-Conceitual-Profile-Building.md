# MP-PB-000 — Projeto Conceitual: Profile Building

## Status
`CONCEITUAL` | aguardando_revisao_Sergio
Módulo de: **Authority Engine** · Downstream de: pipeline formador · Interface com: **FBR Agency Flux**, **FBR Blogs**

---

## 1. Definição em uma frase
O **Profile Building** é a camada de execução do Authority Engine que transforma uma **Persona aprovada** em **perfis de autoridade vivos, isolados, operados e conformes** nas plataformas de distribuição (Instagram, Facebook, TikTok e YouTube), e que, a partir de **nichos, subnichos e produtos-alvo** já qualificados, **sugere** o conjunto de perfis e o mix de plataformas adequado — sem nunca executar ação externa irreversível sem aprovação humana.

Ele não decide *se* uma persona deve existir (isso é dos gates G0–G7 e do Sergio). Ele decide e executa *como* uma persona aprovada vira presença operacional real e sustentável.

---

## 2. Posicionamento no Authority Engine

O pipeline formador do MP-000 é:

```text
Opportunity Radar
→ Influencer Seeds Creator
→ Influencer Farmer
→ Post Machine
→ métricas e feedback
→ Opportunity Radar
```

O Profile Building é a **infraestrutura de execução e operação** que dá corpo às duas pontas finais desse fluxo:

- Consome os **alvos qualificados** do Opportunity Radar (nichos/subnichos/produtos) para **sugerir** os perfis e canais.
- Consome a **Persona aprovada** (Character Bible, Physical Identity Bible, guardrails, claims, canais planejados) para **provisionar e operar** os perfis.
- É o substrato técnico sobre o qual o **Post Machine** publica de forma assistida.
- Emite **métricas e sinais** de volta para o Opportunity Radar, fechando o ciclo.

Fronteira explícita (suposição a validar com Sergio):

| Responsabilidade | Módulo dono |
|---|---|
| Sugerir **arquétipo/função** do influencer para a oportunidade | Influencer Seeds Creator |
| Desenvolver a seed em **perfil de autoridade completo** (conteúdo, identidade, monetização) | Influencer Farmer |
| **Sugerir mix de plataformas + conjunto de perfis** para um alvo qualificado | **Profile Building** |
| **Provisionar, isolar e operar** as contas nas plataformas | **Profile Building** |
| **Preparar, adaptar e publicar** os posts (assistido, com gate humano) | Post Machine, sobre a infra do **Profile Building** |

---

## 3. Tese do módulo
Ter uma boa Persona não gera distribuição. Distribuição proprietária exige **perfis reais, consistentes e conformes**, operados de forma constante e **resiliente a bloqueios de plataforma**. O Profile Building existe para que a operação de N personas seja:

- **Legítima:** publica pelos caminhos oficiais (APIs sancionadas), com o rótulo de IA como cidadão de primeira classe.
- **Isolada:** cada persona é um contexto estanque — nenhum vazamento entre empresas do grupo (multi-tenant) nem entre personas.
- **Resiliente:** o valor (audiência, lista, conteúdo) mora em ativos próprios da FBR, não na conta alugada. A queda de uma conta é um custo operacional, não uma catástrofe.
- **Governada:** nada externo irreversível acontece sem aprovação do Sergio.

---

## 4. O que é e o que NÃO é

**É:**
- Um orquestrador multi-tenant e multi-plataforma de perfis de personas de IA declaradas.
- Um motor de publicação API-first (Graph API v26, TikTok Content Posting API, YouTube Data API v3).
- Uma camada de conformidade viva: disclosure de IA, trilha de auditoria, enforcement de gates.

**NÃO é:**
- **Não** é um antidetect browser nem uma ferramenta de *fingerprint spoofing* para enganar sistemas de risco. O isolamento aqui serve à higiene legítima de sessão e à operação humana de onboarding — não à evasão.
- **Não** é uma fábrica de contas de reposição. Perfis novos entram por **expansão de portfólio**, nunca para "assumir a vaga" de uma conta bloqueada (evasão de banimento é violação de termos por si só e está fora de escopo).
- **Não** publica no LinkedIn como perfil-pessoa: o LinkedIn exige que todo perfil represente uma pessoa real, então persona virtual só caberia como Página de organização — fora do escopo desta fase.
- **Não** substitui o julgamento humano dos gates. É subordinado a eles.

---

## 5. Modelo de criação de valor

- **Entrada:** alvos qualificados (nicho/subnicho/produto) + Persona aprovada e versionada.
- **Saída:** perfis provisionados, isolados e operados; conteúdo publicado de forma assistida; audiência capturada para ativos próprios; sinais de desempenho.
- **Retorno estratégico:** distribuição proprietária dos **produtos físicos próprios da FBR** e de **afiliados** (Amazon, TikTok Shop, Clickbank), audiência recorrente, lista, dados de conversão e ativos editoriais reutilizáveis.

O ativo estratégico não é a conta na plataforma. É a **combinação de confiança temática + audiência própria + capacidade de recomendação conforme**, ancorada em ativos que a FBR controla.

---

## 6. Relação com a monetização

Cada perfil operado pelo Profile Building é um canal de distribuição que **roteia** para as fontes de receita, sempre respeitando os guardrails de claim (G3/G5):

- **Amazon:** produtos próprios e afiliados via Associates / catálogo autorizado.
- **TikTok Shop:** produtos próprios e afiliados, com o TikTok como plataforma de origem e destino.
- **Clickbank:** ofertas de afiliados pertinentes ao nicho.

Princípio inegociável herdado do MP-000: **comissão não aprova recomendação**. O produto tem que ser pertinente e, de preferência, de função demonstrável. O Profile Building **registra** o vínculo produto↔post↔perfil para auditoria, mas a legitimidade da recomendação é decidida a montante (Farmer + gates).

Regra de resiliência: todo perfil aponta, desde o dia um, para um **ativo próprio** (blog em `<slug>.fbr.news`, lista/e-mail). É o que torna a rotatividade de contas um custo gerenciável em vez de perda de audiência.

---

## 7. Princípios de design

1. **API-first.** Automação de browser só como fallback pontual onde não há API oficial.
2. **Multi-tenant por construção.** Toda operação carrega `tenant_id`; credenciais resolvidas por tenant com chave de criptografia exclusiva. Empresas do grupo (budgets e goals diferentes) nunca se cruzam.
3. **Disclosure de IA como campo de primeira classe.** `ai_generated` nunca é opcional nem silenciosamente ignorado. Cada plataforma recebe o mecanismo dela (`is_aigc` no TikTok; campo a confirmar na Meta/YouTube — registrado e logado enquanto isso).
4. **Isolamento legítimo.** Contêiner por persona (sessão/cookies/cache) e proxy coerente e fixo por conta — para higiene e coerência geográfica, não para disfarce.
5. **Resiliência de portfólio.** N personas independentes; nenhuma é reposição de outra.
6. **Governança acima de automação.** Gates G0–G7 e aprovação do Sergio bloqueiam qualquer ação externa irreversível.
7. **Fonte canônica e contratos.** Módulos conversam por APIs oficiais e eventos assinados; ninguém lê tabela interna de outro módulo.

---

## 8. Plataformas e realidades técnicas (resumo)

| Plataforma | Caminho oficial | Disclosure de IA | Restrição-chave |
|---|---|---|---|
| Instagram + Facebook | Graph API v26 (container em 2 passos) | Campo via API a confirmar; registrado no sistema | Só Business/Creator; mídia em URL pública; sem agendamento nativo (o scheduler é o relógio) |
| TikTok (+ TikTok Shop) | Content Posting API v2 | `is_aigc=true` (oficial, resolvido) | Audit obrigatório: sem ele, tudo sai `SELF_ONLY`; `creator_info` antes de publicar; domínio verificado p/ PULL_FROM_URL |
| YouTube | Data API v3 (upload resumable) | Declaração de conteúdo sintético a confirmar; registrada | Cota ~10k/dia por projeto (~6 uploads/dia) → **projeto GCP por tenant** |
| LinkedIn | — | — | Fora de escopo nesta fase (exige pessoa real) |

---

## 9. Relação com os gates e com o Sergio

O Profile Building **não cria personas** e **não aprova publicações**. Ele:

- Só recebe handoff de Persona em estado `approved`/`pilot` (nunca `draft`, `blocked` ou `rejected`).
- Exige, para publicar, um gate humano por peça/pacote na primeira fase — aprovação integral do Sergio.
- Aplica G6 (identidade e transparência) tecnicamente: sem disclosure de IA configurada, o perfil não opera.
- Aplica G3/G5 como validação: não publica claim proibido (testemunho corporal inventado, credencial falsa, cura, garantia, resultado fabricado) — o pacote editorial já chega com claims permitidos e fontes.

---

## 10. Suposições a validar
- Confirmar a fronteira Profile Building ↔ Post Machine ↔ Influencer Farmer (proposta na seção 2).
- Confirmar unidade de gestão: **persona vinculada a marca editorial** (recomendação do MP-000) e como isso mapeia para 1..N contas por plataforma.
- Confirmar SharpEye/Nadia como primeiro caso de teste e seu nicho exato antes de qualquer provisionamento.
- Confirmar stack de execução (ver PRD): alinhar com Next.js/TypeScript da FBR ou isolar workers de publicação.
- Definir política de proxy/geo por persona conforme o público-alvo de cada nicho.

---

## 11. Critérios de aceite do conceito
- [ ] O módulo diferencia **operação conforme** de **antidetect/farm de reposição**.
- [ ] Toda persona operada tem disclosure de IA aplicável e verificável.
- [ ] Toda publicação passa por gate humano na fase piloto.
- [ ] Todo perfil aponta para um ativo próprio da FBR desde o início.
- [ ] Multi-tenant isola credenciais, dados, cota e auditoria por empresa.
- [ ] Nenhuma ação externa irreversível ocorre sem aprovação específica do Sergio.
- [ ] O MP-PB-000 foi revisado e aprovado explicitamente pelo Sergio.
