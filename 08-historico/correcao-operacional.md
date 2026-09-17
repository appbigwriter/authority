# Correção operacional — Authority Engine

## Regra obrigatória
Nenhum dashboard local, API local, fake adapter ou JsonStore pode ser apresentado como sistema operacional, deploy ou Sprint concluída.

## Gate de infraestrutura antes de operação
O Authority Engine só pode ser marcado como `operational` quando todos os itens abaixo tiverem readback objetivo:

- [ ] serviço AuthorityEngine existe na VPS/Easypanel;
- [ ] serviço está apontando para o commit/build correto;
- [ ] `CONTROL_TOWER_PROJECT_ID` está configurado no runtime;
- [ ] `CONTROL_TOWER_SCHEMA_NAME=custom_authorityengine` está configurado;
- [ ] `SUPABASE_URL` e `DATABASE_URL` vêm do Secret Manager;
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está injetada somente no backend;
- [ ] aplicação conecta ao banco remoto;
- [ ] migrations foram aplicadas no schema correto;
- [ ] `/health` remoto retorna banco conectado;
- [ ] leitura e escrita de teste foram confirmadas no banco remoto;
- [ ] dashboard remoto aponta para a API remota;
- [ ] nenhum dado depende de JsonStore local.

## Gate de Sprint
Uma Sprint só pode ser `concluida` quando:

1. suas stories estão implementadas;
2. os critérios de aceite foram testados;
3. os testes unitários/integrados passaram;
4. os adapters reais foram verificados quando fazem parte do escopo;
5. a persistência definitiva foi verificada;
6. o ambiente de execução foi verificado;
7. os blockers estão resolvidos;
8. o relatório foi conferido por readback;
9. o QA formal recebeu uma versão congelada.

`núcleo local funcionando` deve ser reportado como `parcial`, nunca como concluído.

## Regra de comunicação
Toda resposta de status deve separar explicitamente:

```text
local/verificado
remoto/verificado
configurado
não configurado
mock/fake
integração real
bloqueio
```

## Regra de deployment
O dashboard não deve ser divulgado ao usuário como disponível até o serviço remoto estar implantado e o domínio/URL remoto responder. A rota local pode existir para desenvolvimento, mas deve ser identificada como `LOCAL DEVELOPMENT`.

## Regra de dados
Dados criados em local não são dados de produção. Só podem ser migrados após decisão explícita e validação do banco destino. O sistema deve exibir a origem do armazenamento no health/status.

## Falha que este documento corrige
O dashboard e a API locais foram tratados como se fossem o AuthorityEngine operacional, apesar de o serviço da VPS não ter variáveis, banco conectado ou deploy confirmado. Esta condição fica proibida pelo gate acima.
