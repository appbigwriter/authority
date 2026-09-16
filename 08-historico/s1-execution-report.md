# S1 — Opportunity Radar — Relatório de execução

- Executado em: 2026-09-15T21:42:57-03:00
- Diretório: `09-codigo`
- Escopo: OPR-001 a OPR-005; sem publicação, gasto, contas ou alteração de estado externo.
- Estado: **parcialmente implementado / núcleo local concluído**. A integração real permanece bloqueada.

## Stories

- **OPR-001 — atendida no núcleo local:** contrato `MarketplaceAdapter`, catálogo `MarketplaceSource`, status de credencial, health check e adapters configuráveis para `amazon` e `marketplace-secondary`. Ambos falham fechado com erro explícito sem URL/chave. `FakeMarketplaceAdapter` é sintético e identificado como fake.
- **OPR-002 — atendida:** contrato normalizado de produto/preço/moeda/disponibilidade/categoria/marketplace/fonte/timestamp; preservação de campos ausentes; `sourceRecordId` e deduplicação por marketplace + registro de origem, sem apagar o mesmo ID de outra fonte.
- **OPR-003 — atendida:** `detectTrends` agrupa observações, conserva fonte/data/período, separa `observed` de `insufficient_evidence` e não afirma tendência com uma observação só.
- **OPR-004 — atendida:** score `risk-adjusted-v1` com fatores explicados (demanda, intenção, conteúdo, product fit, autoridade, risco e confiança); risco sensível bloqueia e não é compensado por comissão.
- **OPR-005 — atendida:** `createOpportunityDossier` gera fatos, hipóteses, recomendações, riscos, bloqueios, alternativas gratuitas, decisão pendente e handoff explícito para S2; não abre projeto.

## Evidência executada

Comando: `npm run check` em `F:/Projetos/_FBR/AuthorityEngine/09-codigo`.

Resultado final: build TypeScript passou; **20 testes passaram, 0 falhas**.

Testes específicos em `src/tests/radar.test.ts` cobrem:

1. Amazon e marketplace secundário fail-closed sem credencial;
2. normalização e deduplicação entre fontes;
3. evidência insuficiente sem tendência afirmada;
4. bloqueio de categoria sensível, score versionado e dossiê;
5. fake qualificável sem declarar integração real.

## Limitações e hipóteses

- Não há endpoint, contrato oficial, credencial segura nem smoke test real configurados neste ambiente; portanto Amazon e marketplace adicional **não são declarados integrados**.
- A resposta do adapter configurável pressupõe um endpoint autorizado que aceite `POST` com `{ niche, subniche }` e devolva `products`/`trends`; isso é contrato interno provisório, não prova de API de provedor.
- Fakes usam dados sintéticos; os resultados qualificam apenas o domínio local.
- A categoria sensível é uma barreira lexical conservadora e deve ser complementada por política de compliance antes de uso real.
- O ID usa relógio local e o armazenamento externo não foi alterado.

## Arquivos S1 criados/alterados

- `09-codigo/src/types.ts`
- `09-codigo/src/marketplace-adapters.ts`
- `09-codigo/src/opportunity-radar.ts`
- `09-codigo/src/tests/radar.test.ts`

Também foram necessários pequenos ajustes de compatibilidade no código/testes já compartilhados para manter `npm run check` verde após a evolução dos contratos: `src/influencer-seeds.ts`, `src/influencer-farmer.ts`, `src/post-machine.ts` e `src/tests/pipeline.test.ts`.

## Gate de saída

O núcleo local gera pelo menos uma oportunidade qualificada com evidências, score e handoff usando fake. O gate de integração externa/produção permanece **bloqueado** até receber contratos oficiais, endpoints, credenciais seguras, limites, política de uso, health e smoke tests reais sanitizados.
