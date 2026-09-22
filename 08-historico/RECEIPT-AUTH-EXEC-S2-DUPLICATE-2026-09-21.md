# Receipt — correção de duplicate protection no backend

**Data:** 2026-09-21
**Track:** Agent A — backend/domain
**Escopo:** apenas persistence local/fake e testes backend; nenhum provider real, migration remota, deploy, publicação, gasto ou secret.

## O que foi corrigido

- O boundary HTTP continua derivando `tenantId` e `ownerId` do principal autenticado; valores equivalentes enviados no payload não sobrescrevem o contexto.
- `PartnerRegistry` e `SourceRegistry` validam status em runtime (`planned`, `configured`, `verified`, `blocked`, `disabled`).
- `JsonStoreFake` passou a aplicar proteção de duplicidade por `(tenantId, id)` para partners/sources e serializa writes por arquivo para cobrir chamadas consecutivas/concurrentes locais.
- A persistência local rejeita partner ausente ao registrar source, tenant/status ausentes ou inválidos e owner ausente.
- `RelationalAuthorityStore` valida identidade/status de registry e exige que o owner do payload coincida com o contexto relacional antes de inserir/substituir. SQL permanece local-only; não foi aplicado remotamente.
- Status update HTTP também rejeita status inválido.

## Evidência

- `npm run check` em `09-codigo`: build TypeScript passou; **59 testes passaram, 0 falharam**.
- Teste HTTP cobre duas chamadas consecutivas para o mesmo partner: segunda retorna `409 partner_already_exists`.
- Teste HTTP cobre duas chamadas consecutivas para a mesma source: segunda retorna `409 source_already_exists`.
- Teste HTTP cobre status inválido (`422 status_invalid`).
- Teste HTTP cobre tenant/owner enviados no payload sendo ignorados em favor do principal autenticado.
- Teste HTTP cobre source tentando referenciar partner de outro tenant (`404 partner_not_found`).
- `git diff --check` passou; apenas avisos normais de conversão LF/CRLF do Git.

## Revisão honesta dos gaps

- **S0-T02:** parcial; contratos completos do PRD, exemplos request/response e Gate S0 continuam sem aprovação do coordenador.
- **S1-T01/S1-T02:** parcial; há slice local de tenant/auth/RBAC/ownership e testes positivos/negativos, mas não há claim de Gate S1/RLS relacional verificado.
- **S1-T03:** parcial; fake JSON e adapter relacional local existem, mas restart/readback relacional real não foi exercitado.
- **S2-T01/S2-T02:** duplicate protection, status, tenant/owner e rotas HTTP locais foram reforçados; catálogo/UI, readback relacional real e Gate S2 continuam pendentes.
- **S2-T03:** parcial; gateway é fake/local, sem provider real, retry completo ou evals SharpEye.
- **S3-T01:** não avançado nesta passagem porque os contratos/Gates S0/S1/S2 não estão liberados/verificados.

## Handoff e blockers

Nenhum Sprint foi marcado como concluído. Coordenador deve revisar os contratos canônicos e decidir os Gates S0/S1/S2 antes de autorizar S3-T01. Runtime relacional, provider real, credenciais, migration remota, deploy e integrações externas permanecem bloqueados.
