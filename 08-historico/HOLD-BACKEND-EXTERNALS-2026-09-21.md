# HOLD — backend external boundaries

**Estado:** bloqueado externamente; não impede o track local.

| Dependência | Cause | Owner | nextAction | nextCheck |
|---|---|---|---|---|
| OpenAI real | provider, secret e orçamento não autorizados neste ciclo | Sergio/coordenador | aprovar provider, budget e Secret Manager; então configurar adapter atrás do gateway | após gate de runtime e credencial segura |
| Postgres/Supabase remoto | migration, runtime e RLS remotos não autorizados | coordenador de infraestrutura | aprovar janela de migration e executar health/readback remoto | após runtime exposto e contrato de schema aprovado |
| Marketplaces/partners | cadastro, permissões e contratos externos ausentes | owner de integrações | obter contrato e autorização read-only por parceiro | após cada contrato + credential ref |
| Publicação/canais | publicação e spend fora do escopo local | Sergio/aprovador | aprovar canal, disclosure, adapter oficial e publicação assistida | somente com Gate específico e readback exato |
| Visual asset provider | provider real e armazenamento externo não configurados | Sergio/coordenador | aprovar provider e storage; manter fake local até lá | após configuração segura |

Nenhuma chave, conta, deploy, Easypanel, migration remota ou publicação foi usada.
