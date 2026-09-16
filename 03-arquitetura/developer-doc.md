# Documentação de Integração Técnica - Authority Engine

## 1. Identidade e Governança do Projeto

- **Nome da Aplicação:** Authority Engine
- **Project ID (UUID):** `dfb080ea-5fa2-4924-bccd-8f121c637e6e`
- **Slug:** `authorityengine`
- **Tipo de Negócio:** `custom`
- **Template Base:** `custom_base` (v1.0.0)
- **Schema Provisionado (Isolamento):** `custom_authorityengine`
- **Domínio Oficial:** `não configurado`
- **Idioma:** `pt`
- **Status:** `active`
- **Namespace de Secrets:** `fbr/blogs/dfb080ea-5fa2-4924-bccd-8f121c637e6e/`

---

## 2. Política de Secrets e Injeção de Variáveis

> [!IMPORTANT]
> **Princípio Zero Secret Leaks:** O Control Tower e os documentos de handoff **nunca contêm valores reais de chaves privadas** (como a `SUPABASE_SERVICE_ROLE_KEY`). O documento entrega referências e especificações para injeção segura no runtime.

### Onde configurar as variáveis:
1. **Ambiente Local de Desenvolvimento:** Crie um arquivo `.env.local` (garantido no `.gitignore`) substituindo as referências pelas credenciais do seu ambiente de teste.
2. **Ambiente de Produção (Easypanel):** Acesse a aplicação no painel do Easypanel $\rightarrow$ aba **Environment** $\rightarrow$ insira os valores reais ou vincule o Secret Manager do namespace `fbr/blogs/dfb080ea-5fa2-4924-bccd-8f121c637e6e`.

---

## 3. Modelo de Variáveis (.env.example)

```env
# =========================================================================
# 1. VARIÁVEIS PÚBLICAS (Frontend / Client-Side)
# Podem ser expostas no bundle do browser com prefixo NEXT_PUBLIC_
# =========================================================================
NEXT_PUBLIC_APP_NAME="Authority Engine"
NEXT_PUBLIC_SUPABASE_URL=https://supabase-control-tower-api.fbr.news
NEXT_PUBLIC_SUPABASE_ANON_KEY=<secret-manager:fbr/blogs/dfb080ea-5fa2-4924-bccd-8f121c637e6e/NEXT_PUBLIC_SUPABASE_ANON_KEY>

# =========================================================================
# 2. VARIÁVEIS PRIVADAS DE RUNTIME (Backend / Workers / Servidor)
# Injetar EXCLUSIVAMENTE na aba Environment do Easypanel / Secret Manager.
# NUNCA comitar no Git, NUNCA expor no Frontend, NUNCA colar em chat/logs.
# =========================================================================
SUPABASE_URL=https://supabase-control-tower-api.fbr.news
SUPABASE_SERVICE_ROLE_KEY=<secret-manager-reference>
CONTROL_TOWER_PROJECT_ID=dfb080ea-5fa2-4924-bccd-8f121c637e6e
CONTROL_TOWER_SCHEMA_NAME=custom_authorityengine
```

---

## 4. Regras de Arquitetura e Isolamento

1. **Isolamento por Schema:** Todo o código da aplicação deve operar exclusivamente dentro do schema `custom_authorityengine`.
2. **Catálogo Central (`public`):** As tabelas no schema `public` pertencem à governança central do Control Tower. O blog/sistema **NUNCA** deve criar, alterar ou excluir tabelas em `public`.
3. **Chave de Serviço:** A `SUPABASE_SERVICE_ROLE_KEY` possui permissões administrativas e **jamais** deve ser acessível pelo código do cliente/frontend (browser).
4. **Evolução de Estrutura:** Se o projeto necessitar de novas tabelas ou colunas específicas, aplique o SQL no schema `custom_authorityengine` via Editor SQL do Control Tower.

---

## 5. Tabelas Provisionadas no Schema `custom_authorityengine`

- entities
- entity_relations
- records
- files
- settings
- audit_logs
- events

---

## 6. Exemplo de Customização Segura de Schema

Caso precise adicionar campos específicos ao seu projeto:

```sql
-- Executar via Control Tower apontando para o schema do projeto:
alter table custom_authorityengine.articles
  add column if not exists custom_notes text;
```

---

## 7. Checklist de Validação do Desenvolvedor

- [ ] Arquivo `.env.local` configurado localmente e presente no `.gitignore`.
- [ ] No Easypanel, as variáveis privadas foram salvas na aba **Environment**.
- [ ] O frontend utiliza apenas variáveis com prefixo `NEXT_PUBLIC_`.
- [ ] As consultas Supabase especificam o schema `custom_authorityengine`.
- [ ] Nenhuma query afeta ou consulta tabelas do schema `public`.
- [ ] O health check da aplicação respondeu com sucesso (HTTP 200).

---

## 8. Query de Conferência Cadastral

```sql
select id, name, slug, business_type, template_key, schema_name, domain, status, template_version
from public.projects
where id = 'dfb080ea-5fa2-4924-bccd-8f121c637e6e';
```
