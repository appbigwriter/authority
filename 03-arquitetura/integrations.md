# Authority Engine — Configuração de integrações

## Variáveis necessárias

```text
PORT=3400
AUTHORITY_STORE=./data/authority-engine.json
AMAZON_API_URL=
AMAZON_API_KEY=
SECONDARY_MARKETPLACE_API_URL=
SECONDARY_MARKETPLACE_API_KEY=
```

## Estado atual
As variáveis Amazon e marketplace secundário não estão configuradas neste ambiente. Os adapters existem e falham fechado com `*_integration_not_configured` quando usados sem configuração.

## Para considerar S1 integrado
Cada marketplace deve fornecer:

- contrato oficial do endpoint;
- método e payload;
- autenticação segura;
- limites de uso;
- resposta de produto/categoria;
- política de uso dos dados;
- ambiente de teste ou credencial válida;
- health check;
- smoke test real;
- evidência de resposta sanitizada;
- tratamento de rate limit, timeout e indisponibilidade.

Não preencher chaves com valores fictícios. Não declarar integração por ter apenas um adapter ou um fake.
