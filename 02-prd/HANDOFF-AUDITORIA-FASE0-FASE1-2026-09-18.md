# Handoff — Auditoria Fase 0/1 Authority Engine

**Data:** 2026-09-18
**Agente:** GPT-5.6 Luna / OpenAI Codex
**Modo:** somente leitura; nenhuma migration, mutação ou secret acessado
**Documento global:** aprovado por Sergio

## Resultado

A fundação atual define o pipeline modular, a ficha física ultra detalhada, Gates e envelope de eventos, mas o código ainda opera principalmente com entidades genéricas, JSON Store/adapter relacional local e eventos parciais. Não há contrato implementado e versionado para Persona, PersonaVersion, Physical Identity Bible, runs modulares, API canônica ou outbox/inbox idempotente.

`npm run check` local passou com 33 testes, mas isso não comprova integração remota nem o fluxo global Authority → Flux → Blogs → Control Tower.

## Gaps prioritários

1. MP-000 específico ainda está em revisão estrutural.
2. Schema atual não possui todas as entidades globais previstas.
3. Persona e versões canônicas não estão formalizadas.
4. Physical Identity Bible não possui entidade, validador ou invalidação de assets.
5. Runs dos módulos não persistem input, output, status, provider, modelo, prompt e job.
6. API atual v0.1 é genérica e não cobre Persona/version, identidade física, aprovação versionada ou handoff.
7. Existe coleção de eventos, mas não outbox transacional com retry, assinatura e consumer.
8. Não existe inbox persistente idempotente comprovada.
9. Estados legados divergem do documento global.
10. Approval local não possui todo o contrato de versões, artifacts, motivos e pacote desatualizado.

## Stories recomendadas

- F0-01: matriz única de entidades, ownership, estados, APIs e Gates.
- F0-02: contrato do pipeline dos dez módulos formadores.
- F1-01: Persona, versões e Character Bible canônicos.
- F1-02: Physical Identity Bible e consistência visual.
- F1-03: API canônica de consulta e aprovação.
- F1-04: outbox transacional de eventos assinados.
- F1-05: inbox/consumer idempotente para Flux.
- F1-06: E2E local sem publicação real.
- AUTH-001/AUTH-003: reconciliar persistência relacional/RLS antes de migration.

## Blockers

- Contratos de API/eventos, ownership, cardinalidades e tabelas finais ainda precisam ser fechados.
- Persona versus marca/projeto ainda precisa de regra formal de unidade canônica.
- Physical Identity Bible e invalidação de assets ainda não estão implementados.
- Outbox/inbox, assinatura e readback intersistemas ainda não estão implementados.
- Primeiro piloto, métricas e retry DNS ainda precisam ser definidos.

## Critério de handoff

Não aplicar migration remota até fechar F0-01/F0-02, ownership, RLS, eventos, Gates e plano de rollback/readback.
