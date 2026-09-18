# Fluxo Global — Authority Engine → Agency Flux → FBR Blogs → Control Tower

## Status

`BRIEFING CONSOLIDADO` | `em_validacao`

Este documento é a fonte transversal do fluxo entre Authority Engine, FBR Agency Flux, FBR Blogs e GestaoDB/Control Tower. Ele consolida as decisões do briefing atual. Não substitui os MP-000 específicos de cada projeto até que Sergio aprove as alterações de arquitetura e schema.

**Owner do contrato:** FBR / Sergio  
**Orquestração:** FBR Agency Flux  
**Fonte canônica da Persona:** Authority Engine  
**Provisionamento técnico:** GestaoDB / Control Tower  
**Consumidor editorial:** FBR Blogs  
**Provider de geração:** modelo/provider principal configurado no Hermes

---

## 1. Objetivo do sistema

Construir Personas completas de autoridade para nichos específicos e derivar delas um ou vários blogs, além de pautas e definições editoriais para redes sociais e YouTube.

O sistema deve:

1. Receber dados-base informados por Sergio/usuário;
2. Gerar uma Persona completa;
3. Submeter Persona e nome do blog à aprovação de Sergio;
4. Gerar domínio inicial automaticamente;
5. Permitir alteração de nome e domínio;
6. Confirmar DNS manual e automaticamente;
7. Provisionar aplicações, bancos, schemas, variáveis e referências de secrets;
8. Fazer Blogs herdar a Persona aprovada;
9. Registrar redes sociais e YouTube como pautas/configurações, sem criar contas reais na primeira fase;
10. Permitir publicação somente após aprovação integral de Sergio;
11. Manter histórico, versionamento, auditoria, retries e readbacks.

---

## 2. Decisões de produto

### 2.1 Persona e blogs

- Uma Persona pode ter vários blogs.
- Cada blog é um projeto editorial derivado da Persona.
- O Authority Engine é a fonte única da Persona.
- O blog mantém referência para a Persona e para a versão aprovada utilizada.
- A Persona pode evoluir sem alterar silenciosamente blogs já provisionados.
- Alterações relevantes devem criar nova versão e exigir reaprovação quando afetarem o projeto.

Modelo conceitual:

```text
Persona 1
  ├── Blog A
  ├── Blog B
  └── Blog C
```

### 2.2 Entrada do usuário

Dados-base mínimos:

- Nicho;
- Subnicho;
- Problema que a Persona pretende resolver;
- Público-alvo/audiência;
- Nome do blog.

A partir desses dados, o Authority Engine gera o perfil completo antes de qualquer provisionamento.

### 2.3 Perfil completo da Persona

O perfil gerado deve incluir, quando aplicável:

- Nome da Persona;
- Biografia;
- História/origem;
- Missão;
- Posicionamento;
- Promessa central;
- Dores, desejos, medos e objeções da audiência;
- Valores;
- Personalidade;
- Tom de voz;
- Vocabulário e expressões recorrentes;
- Pilares editoriais;
- Temas prioritários;
- Temas proibidos;
- Guardrails e limites de autoridade;
- Diretrizes para blog;
- Diretrizes para redes sociais;
- Diretrizes para YouTube;
- Descrição visual;
- Avatar e prompts visuais;
- Bios e descrições por canal;
- Formatos e frequência sugeridos;
- Critérios de qualidade e revisão.

A geração deve registrar metadados não sensíveis:

```text
provider
model
model_version, quando disponível
prompt_version
generation_job_id
generated_at
```

O código não fixa um provedor. Será usado o modelo/provider principal configurado no Hermes.

---

## 3. Nome, slug e domínio

### 3.1 Geração inicial

O nome aprovado do blog gera um slug técnico e o domínio inicial:

```text
Nome do blog: Vida Sem Dor
Slug: vida-sem-dor
Domínio inicial: vida-sem-dor.fbr.news
```

Regras:

- O domínio inicial usa `<slug>.fbr.news`;
- O domínio pode ser modificado posteriormente;
- O nome do blog pode ser alterado após a criação;
- Nome, slug e domínio devem possuir histórico/versionamento;
- Alterações não devem criar novo blog silenciosamente;
- O mesmo `blog_id` permanece enquanto versões são substituídas.

### 3.2 Estados do domínio/DNS

```text
domain_generated
→ awaiting_dns
→ dns_manual_confirmed
→ dns_verified
```

A confirmação possui dois níveis:

1. Sergio marca manualmente o DNS como provisionado;
2. O sistema executa verificação automática;
3. O domínio só fica `dns_verified` após a verificação técnica.

Se a marcação manual existir, mas a verificação falhar, o projeto permanece bloqueado.

---

## 4. Gates humanos

### G0 — Dados-base

Exige nicho, subnicho, problema, audiência e nome do blog.

### G1 — Persona completa

O Authority Engine gera a Persona completa e disponibiliza revisão.

### G2 — Aprovação da Persona

Sergio aprova, rejeita ou solicita revisão.

Sem aprovação explícita, nenhum provisionamento começa.

### G3 — Aprovação do nome do blog

Sergio aprova o nome do blog e a versão que será usada no projeto.

### G4 — Domínio e DNS

O domínio é gerado automaticamente. Sergio provisiona o registro DNS. O sistema confirma tecnicamente o DNS.

### G5 — Provisionamento

Após Persona e blog aprovados, o Agency Flux inicia o provisionamento automaticamente.

### G6 — Aprovação integral de publicação

Na primeira fase, Sergio aprova o pacote completo:

- Persona;
- Blog;
- Domínio;
- Banco e schema;
- Aplicação;
- Variáveis;
- Referências de secrets;
- Health check;
- Pautas de redes sociais;
- Pautas de YouTube;
- Readbacks;
- Evidências de provisionamento.

### G7 — Publicação

A publicação só ocorre após aprovação integral de Sergio. Futuramente o Gate poderá ser flexibilizado por tipo de ação, confiança ou projeto.

---

## 5. Fluxo operacional completo

```text
[Authority Engine]
Usuário informa nicho, subnicho, problema, audiência e nome do blog
        ↓
Authority Engine cria dados-base
        ↓
Modelo principal do Hermes gera Persona completa
        ↓
Persona fica em pending_approval
        ↓
Sergio revisa, edita e aprova a Persona
        ↓
Sergio aprova o nome do blog
        ↓
Sistema gera slug e domínio inicial
        ↓
Projeto fica awaiting_dns
        ↓
Sergio provisiona registro DNS
        ↓
Sergio marca DNS como provisionado
        ↓
Sistema verifica DNS automaticamente
        ↓
Projeto fica dns_verified
        ↓
[Agency Flux]
Flux recebe evento assinado de aprovação
        ↓
Flux cria job idempotente de provisionamento
        ↓
[Control Tower]
Cria/atualiza projeto, schema e catálogo técnico
        ↓
Gera/reconcilia variáveis públicas
        ↓
Gera/reconcilia namespace
        ↓
Gera domínio de validação /health
        ↓
Cria referências de secrets sem expor valores
        ↓
Executa readbacks
        ↓
[FBR Blogs]
Consulta Persona aprovada via API/evento
        ↓
Configura aplicação e estrutura editorial
        ↓
Registra pautas e características de social/YouTube
        ↓
[Agency Flux]
Consolida jobs, evidências, blockers e handoffs
        ↓
Sergio aprova pacote integral
        ↓
Flux executa publicação
        ↓
Readback final e estado published
```

---

## 6. Responsabilidade de cada módulo

### Authority Engine

Responsável por:

- Dados-base da oportunidade;
- Geração da Persona completa;
- Character Bible e guardrails;
- Versionamento da Persona;
- Aprovação/reprovação da Persona;
- Referência aos blogs derivados;
- Emissão de eventos de negócio;
- Fonte canônica dos dados da Persona.

Não deve executar provisionamento técnico de banco, aplicação ou secrets.

### FBR Agency Flux

Responsável por:

- Orquestração durável;
- Estado global do fluxo;
- Jobs e dependências;
- Idempotência;
- Retries;
- Blockers;
- Handoffs;
- Gates de Sergio;
- Auditoria;
- Receipts e evidências;
- Readbacks entre módulos;
- Coordenação de Authority Engine, Blogs e Control Tower.

### FBR Blogs

Responsável por:

- Consumir a Persona aprovada;
- Criar configuração editorial do blog;
- Herdar nicho, público, problema, tom e pilares;
- Preparar pautas e estruturas editoriais;
- Registrar destinos sociais e YouTube;
- Produzir drafts e assets conforme os Gates.

Na primeira fase, não cria automaticamente contas reais de redes sociais ou YouTube.

### GestaoDB / Control Tower

Responsável por:

- Catálogo de projetos;
- Provisionamento de schemas;
- Projetos e templates;
- Variáveis públicas/metadados;
- Namespaces;
- Referências de secrets;
- Domínios de validação;
- Health checks;
- Readbacks técnicos.

Não deve ser a fonte canônica da Persona.

### Hermes

Responsável por:

- Configuração do provider/modelo principal;
- Execução da geração da Persona pelo runtime autorizado;
- Registro do provider/modelo utilizado;
- Não armazenar secrets no conteúdo gerado ou nos handoffs.

### n8n

Usado como adaptador de integrações externas quando necessário. Não será a fonte principal de estado nem o orquestrador global.

---

## 7. Arquitetura de comunicação

### Regra principal

Nenhum módulo acessa diretamente tabelas internas de outro módulo.

A comunicação ocorre por:

- API oficial;
- Eventos assinados;
- Readback por API;
- Handoffs com identificadores e versões.

### Fluxo recomendado

```text
Authority Engine
  ├── API de consulta da Persona
  └── Outbox de eventos assinados
          ↓
      Agency Flux Inbox
          ↓
      Jobs idempotentes
          ├── API Blogs
          └── API Control Tower
```

### Envelope mínimo de evento

```json
{
  "event_id": "uuid",
  "event_type": "persona.approved",
  "event_version": 1,
  "occurred_at": "ISO-8601",
  "source": "authority-engine",
  "aggregate_type": "persona",
  "aggregate_id": "uuid",
  "aggregate_version": 3,
  "correlation_id": "uuid",
  "causation_id": "uuid|null",
  "payload": {
    "persona_id": "uuid",
    "persona_version_id": "uuid",
    "blog_id": "uuid",
    "blog_name_version_id": "uuid"
  }
}
```

Não incluir tokens, senhas, service roles, CVCs ou valores secretos no evento.

---

## 8. Idempotência e recuperação

Cada evento deve ser processado no máximo uma vez por consumidor lógico.

O Agency Flux deve registrar:

```text
event_id
consumer
received_at
processed_at
status
attempt_count
last_error
next_retry_at
```

Regras:

- Evento duplicado não cria novo blog, schema ou namespace;
- Jobs de provisionamento usam chave idempotente;
- Falhas externas ficam `waiting_external`, `retrying` ou `blocked`;
- Nenhuma falha pode cair silenciosamente para JSON local;
- Todo retry possui motivo e próximo check;
- Readback confirma o resultado real antes de avançar o estado.

---

## 9. Estados

### Persona

```text
draft
profile_generated
pending_approval
approved
rejected
archived
```

### Blog/projeto

```text
draft
awaiting_persona_approval
awaiting_blog_name_approval
domain_generated
awaiting_dns
dns_manual_confirmed
dns_verified
ready_for_provisioning
provisioning
provisioned
awaiting_publication_approval
published
blocked
failed
archived
```

### Job

```text
pending
running
waiting_external
retrying
blocked
success
failed
cancelled
```

Toda transição deve possuir:

- Estado anterior;
- Estado novo;
- Autor/ator;
- Motivo;
- Timestamp;
- Correlation ID;
- Evidência ou erro sanitizado.

---

## 10. Dados e entidades conceituais

### Authority Engine

```text
authority_personas
authority_persona_versions
authority_character_bibles
authority_blog_projects
authority_blog_name_versions
authority_domain_versions
authority_approvals
authority_generation_jobs
authority_outbox_events
```

### Agency Flux

```text
flux_projects
flux_jobs
flux_job_dependencies
flux_approvals
flux_events
flux_handoffs
flux_artifacts
flux_blockers
flux_readbacks
flux_inbox_events
```

### FBR Blogs

```text
blog_applications
blog_persona_bindings
editorial_profiles
editorial_pillars
social_channel_plans
youtube_channel_plans
editorial_jobs
article_drafts
workflow_events
```

### Control Tower

```text
projects
provisioning_jobs
project_configuration_artifacts
secret_namespaces
secret_bindings
audit_logs
```

As tabelas acima são modelo conceitual. Nenhuma migration deve ser executada somente com base neste documento sem revisão do MP-000 e Gate de Sergio.

---

## 11. Configurações e secrets

### Variáveis públicas/metadados

Podem ser geradas e baixadas:

```env
PORT=
NODE_ENV=production
APP_ENV=production
CONTROL_TOWER_BASE_URL=control-tower.fbr.news
CONTROL_TOWER_PROJECT_ID=<project-id>
CONTROL_TOWER_SCHEMA_NAME=<schema-name>
SUPABASE_URL=supabase-control-tower-api.fbr.news
SUPABASE_ANON_KEY=
```

### Secrets

A service role e demais secrets não devem ser exibidos no frontend nem incluídos em arquivos baixáveis.

O banco deve armazenar somente:

```text
secret_name
reference_path
provider
environment
status
namespace_id
```

O valor real deve permanecer no Secret Manager/runtime autorizado.

---

## 12. Control Tower: geração automática

Após o evento de provisionamento, o Control Tower deve automaticamente:

1. Criar ou localizar o projeto;
2. Criar ou reconciliar schema;
3. Gerar artefato de variáveis públicas;
4. Gerar namespace;
5. Gerar domínio de validação:
   ```text
   https://<dominio-do-projeto>/health
   ```
6. Criar/reconciliar referências de secrets;
7. Persistir cada artefato no banco;
8. Fazer readback;
9. Retornar resultado para o Agency Flux.

Os botões do Control Panel permanecem como ações manuais de:

- Regenerar;
- Reconciliar;
- Reprocessar falha;
- Consultar;
- Baixar artefatos.

O clique manual não pode ser requisito do fluxo normal.

---

## 13. Aprovação e publicação inicial

A aprovação integral deve conter um snapshot/versionamento dos seguintes itens:

```text
persona_version_id
blog_name_version_id
domain_version_id
control_tower_project_id
schema_name
provisioning_job_id
health_readback_id
configuration_artifact_ids
secret_binding_ids
social_channel_plan_version_id
youtube_channel_plan_version_id
```

A aprovação não deve ser apenas um booleano. Deve registrar:

```text
approved_by
approved_at
approval_scope
approval_comment
approved_versions
```

Se qualquer versão relevante mudar depois da aprovação, o pacote deve retornar para revisão.

---

## 14. Falhas e blockers

### Falha de banco

Exemplo: migration ausente ou tabela indisponível.

Estado:

```text
provisioning → blocked
```

O sistema deve registrar erro sanitizado, não esconder a falha nem usar fallback silencioso.

### Falha de DNS

```text
awaiting_dns → dns_manual_confirmed → blocked
```

O job poderá repetir a verificação conforme política de retry.

### Falha de provider/modelo

A geração da Persona deve registrar o job como falho, sem criar uma Persona aprovada parcialmente.

### Falha de Control Tower

Flux deve preservar o job, permitir retry idempotente e mostrar o último readback confirmado.

---

## 15. Critérios de aceite do fluxo global

- [ ] Dados-base criam uma Persona em estado rastreável;
- [ ] Persona completa é gerada pelo modelo principal do Hermes;
- [ ] Provider/modelo/prompt/versionamento ficam registrados;
- [ ] Sergio aprova explicitamente a Persona;
- [ ] Sergio aprova explicitamente o nome do blog;
- [ ] Uma Persona pode possuir vários blogs;
- [ ] Nome, slug e domínio possuem versionamento;
- [ ] Domínio inicial é gerado como `<slug>.fbr.news`;
- [ ] Alteração de domínio é possível sem apagar o blog;
- [ ] DNS possui confirmação manual e verificação automática;
- [ ] Provisionamento inicia automaticamente após os Gates necessários;
- [ ] Agency Flux controla jobs, eventos, retries e blockers;
- [ ] Authority Engine permanece como fonte canônica da Persona;
- [ ] Blogs consome dados por API/eventos, sem leitura direta das tabelas internas;
- [ ] Control Tower provisiona banco, schema, variáveis e referências de secrets;
- [ ] Secrets não aparecem no frontend, downloads, eventos ou logs;
- [ ] Redes sociais e YouTube são inicialmente pautados/configurados, não criados automaticamente;
- [ ] Publicação inicial exige aprovação integral de Sergio;
- [ ] Todo avanço possui readback verificável;
- [ ] Eventos duplicados não geram recursos duplicados;
- [ ] Falhas ficam visíveis como blockers ou retries;
- [ ] Nenhuma migration remota é aplicada sem Gate autorizado;
- [ ] O fluxo completo é reproduzido em um teste E2E sem publicação real.

---

## 16. Pontos ainda em validação

1. Contrato exato das APIs entre Authority Engine, Agency Flux, Blogs e Control Tower;
2. Nomes finais das tabelas e ownership de cada migration;
3. Mecanismo final de assinatura e autenticação dos eventos;
4. Política de retry e janela de verificação DNS;
5. Interface de aprovação de Sergio;
6. Definição do primeiro piloto;
7. Atualização dos MP-000 específicos para refletir este fluxo;
8. Readback remoto em ambiente autorizado;
9. Política de retenção de versões de Persona, blog e domínio;
10. Regras de invalidação quando a Persona for alterada após um blog já estar ativo.

---

## 17. Próxima sequência de implementação

1. Aprovar este documento como contrato transversal;
2. Atualizar o MP-000 do Authority Engine;
3. Atualizar o MP-000 do Agency Flux;
4. Atualizar o MP-000 do FBR Blogs;
5. Definir o contrato de eventos e APIs;
6. Ajustar schema relacional e RLS;
7. Implementar outbox/inbox e idempotência;
8. Corrigir o fluxo automático do Control Tower;
9. Criar teste E2E local sem publicação real;
10. Aplicar migrations somente após Gate de Sergio;
11. Fazer readback remoto;
12. Executar piloto controlado.

---

## Rastreabilidade

### Fatos

- Authority Engine, FBR Agency Flux e FBR Blogs possuem MP-000 existentes em seus diretórios de projeto.
- O Control Tower possui catálogo de projetos, provisionamento e módulo de namespaces/secrets.
- A geração de configuração do Control Tower foi implementada localmente, mas a migration correspondente ainda depende de aplicação/readback remoto.

### Decisões do briefing

- Persona completa antes do provisionamento;
- Uma Persona pode ter vários blogs;
- Authority Engine é a fonte única da Persona;
- Agency Flux orquestra o fluxo;
- DNS tem confirmação manual e automática;
- Publicação inicial exige aprovação integral de Sergio;
- Modelo/provider é o principal configurado no Hermes;
- Redes sociais e YouTube serão inicialmente pautados/configurados.

### Hipóteses/recomendações técnicas

- Outbox/inbox com eventos assinados;
- Agency Flux como orquestrador durável;
- n8n como adaptador e não como fonte de estado;
- APIs e eventos, sem leitura direta de tabelas entre módulos;
- Versionamento de Persona, nome e domínio.

### Bloqueios

- Contratos finais de API/eventos ainda não foram implementados;
- MP-000s específicos ainda precisam incorporar este fluxo;
- Migration do artefato de configuração do Control Tower ainda precisa de aplicação e readback remoto.
