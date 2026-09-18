# Tasklist — Authority Engine

## Objetivo desta rodada
Avançar o Authority Engine sem declarar produção pronta, separando o trabalho em duas tracks sem sobreposição.

## Stories

| ID | Story | Owner | Estado | Depende de |
|---|---|---|---|---|
| AUTH-001 | Auditar e preparar a persistência relacional/RLS | Subagente Authority A | review | validação de Sergio para mutações remotas |
| AUTH-002 | Fechar matriz de integração, piloto e QA | Subagente Authority B | review | contratos e evidências existentes |

## Regras
- Não executar migration, criar contas, publicar ou alterar produção sem Gate de Sergio.
- Toda entrega deve conter artefato, evidência, riscos e próximo handoff.
- O estado `IMPLEMENTACAO_PARCIAL` permanece até as pendências serem verificadas.

## Critério de encerramento da rodada
As duas stories entregam artefatos revisáveis, testes executados quando aplicável e blockers explicitamente atribuídos; nenhuma conclusão será inferida apenas pelo relato do subagente.
