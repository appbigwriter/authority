# Receipt — AUTH-FIX-UI-001

- **Task:** AUTH-FIX-UI-001
- **Projeto:** FBR Authority Engine
- **Data:** 2026-09-18
- **Owner:** David

## Alterações

Arquivo principal:

```text
09-codigo/public/dashboard.html
```

Correções aplicadas:

- `#runPM` agora é referenciado corretamente em disable/loading/reset;
- listener de `#researchSelect` adicionado após renderização dinâmica;
- geração de seeds preserva `researchId` ao reabrir o modal;
- chamadas de API passam por `apiFetch` autenticado;
- token fica em `sessionStorage` sob a chave `authority_engine_token`;
- Dashboard possui entrada de sessão local sem persistir token em arquivo ou URL.

Teste contratual criado/verificado:

```text
09-codigo/dashboard-contract.test.mjs
```

## Evidência

```text
node dashboard-contract.test.mjs → PASS
npm run check → build aprovado; 49 testes aprovados
 git diff --check → PASS
```

## Limitações

- Não houve deploy, publicação ou validação E2E remoto.
- O token continua dependendo de configuração segura do runtime/API; o Dashboard não cria credenciais.
- AUTH-FIX-BACKEND-002 permanece pendente e não foi declarado concluído.
