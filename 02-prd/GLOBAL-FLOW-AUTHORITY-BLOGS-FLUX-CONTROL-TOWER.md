# Fluxo Global — Authority Engine → Agency Flux → FBR Blogs → Control Tower

## Status

`BRIEFING CONSOLIDADO` | `aprovado`

**Aprovado por:** Sergio  
**Aprovação registrada:** 2026-09-18  
**Escopo da aprovação:** fluxo global, pipeline modular da Persona, ficha física visual, Central de Aprovações, Gates, orquestração, APIs/eventos, provisionamento e critérios de aceite.

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

A partir desses dados, o Authority Engine não gera a Persona em uma única etapa genérica. Ele inicia um pipeline de módulos especializados do próprio Authority, cada um responsável por responder um conjunto de perguntas, validar coerência e enriquecer o perfil. O pipeline usa o modelo/provider principal configurado no Hermes e produz uma Persona completa, versionada e revisável antes de qualquer provisionamento.

O processo de formação deve:

1. Interpretar nicho, subnicho, problema e audiência;
2. Definir posicionamento, diferenciação e autoridade plausível;
3. Construir o Character Bible;
4. Definir personalidade, tom e linguagem;
5. Criar pilares e formatos editoriais;
6. Gerar a identidade visual e a ficha física ultra detalhada;
7. Criar prompts consistentes para imagens e vídeos;
8. Definir guardrails, temas proibidos e limites de autoridade;
9. Produzir as diretrizes específicas para blog, redes sociais e YouTube;
10. Executar uma etapa de revisão de consistência antes de marcar a Persona como `profile_generated`.

A Persona só fica disponível para aprovação depois que todos os módulos obrigatórios concluírem suas saídas. Se qualquer módulo falhar ou ficar bloqueado, a Persona permanece em `generation_blocked` e não pode avançar para aprovação.

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

### 2.4 Ficha física e consistência visual

A Persona deverá possuir uma ficha física ultra detalhada para garantir consistência entre imagens, vídeos, thumbnails, avatares e futuras peças editoriais. Essa ficha não é apenas descritiva: ela será uma fonte versionada para os prompts visuais.

Campos mínimos:

- Idade aparente e faixa etária;
- Data de nascimento ficcional, quando necessária para coerência;
- Altura, proporções e biotipo;
- Peso aproximado, quando relevante para a representação visual;
- Formato do rosto;
- Estrutura óssea e características faciais;
- Pele, subtom, textura e marcas identificadoras;
- Olhos, formato, cor e distância relativa;
- Sobrancelhas;
- Nariz;
- Boca, lábios e sorriso;
- Dentes, quando visíveis;
- Cabelo: cor, textura, corte, comprimento e penteados;
- Pelos faciais, quando aplicável;
- Mãos, unhas e características recorrentes;
- Postura, gestos e expressões;
- Voz visualizada em termos de energia, ritmo e presença;
- Estilo de roupas;
- Acessórios recorrentes;
- Maquiagem, quando aplicável;
- Paleta pessoal;
- Ambientes preferenciais;
- Iluminação e enquadramentos recomendados;
- Elementos que nunca devem mudar;
- Variações permitidas por canal e contexto;
- Prompt positivo mestre;
- Prompt negativo/itens proibidos;
- Imagens de referência e identificadores dos assets.

A ficha física deve possuir versão, status e aprovação. Alterações em atributos críticos devem invalidar ou revisar os assets derivados que dependem deles.

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

### 2.5 Módulos formadores do Authority Engine

A formação da Persona será decomposta em módulos especializados, coordenados pelo próprio Authority Engine. Os nomes abaixo representam responsabilidades de domínio; a implementação pode usar agentes, jobs ou módulos internos, desde que as saídas sejam persistidas e versionadas.

| Módulo | Responsabilidade | Saída obrigatória |
|---|---|---|
| Brief Interpreter | Interpretar os dados-base e identificar lacunas | Brief estruturado e perguntas pendentes |
| Niche & Audience Analyst | Refinar nicho, subnicho, problema e audiência | Mapa de audiência e contexto |
| Authority Strategist | Definir diferenciação, posicionamento e limites | Tese de autoridade e guardrails |
| Persona Architect | Construir identidade, personalidade e história | Character Bible |
| Physical Identity Designer | Definir a ficha física ultra detalhada | Physical Identity Bible |
| Visual Consistency Designer | Transformar a identidade física em regras de imagem/vídeo | Prompts, referências e invariantes |
| Editorial Strategist | Definir pilares, formatos e pautas | Plano editorial por canal |
| Channel Planner | Adaptar a Persona para blog, social e YouTube | Características e pautas dos canais |
| Consistency Reviewer | Verificar conflitos, lacunas e coerência | Relatório de consistência |
| Approval Packager | Consolidar o pacote para Sergio | Pacote de aprovação versionado |

Regras do pipeline:

- Cada módulo registra entrada, saída, versão, modelo utilizado e status;
- Um módulo não pode sobrescrever silenciosamente a saída de outro;
- Falhas parciais ficam visíveis no Authority Engine;
- A Persona só avança para `profile_generated` quando as saídas obrigatórias estiverem concluídas;
- O pacote de aprovação deve permitir visualizar a origem de cada informação gerada;
- O Agency Flux orquestrará o fluxo global, mas a formação interna da Persona permanece sob responsabilidade do Authority Engine.

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

A aprovação ocorrerá na **Central de Aprovações do Agency Flux**. Sergio poderá revisar o pacote completo, aprovar, reprovar ou devolver para revisão.

Sem aprovação explícita registrada na Central de Aprovações, nenhum provisionamento começa.

### G3 — Aprovação do nome do blog

O nome do blog será uma aprovação própria na Central de Aprovações. Sergio aprova a versão que será usada no projeto.

### G4 — Domínio e DNS

O domínio é gerado automaticamente. Sergio provisiona o registro DNS e confirma manualmente na Central de Aprovações. O sistema confirma tecnicamente o DNS antes de avançar.

### G5 — Provisionamento

Após Persona, blog e pré-condições de DNS aprovados, o Agency Flux inicia o provisionamento automaticamente.

### G6 — Aprovação integral de publicação

A publicação também será uma aprovação na Central de Aprovações. Na primeira fase, Sergio aprova o pacote completo:

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

## 5. Central de Aprovações do Agency Flux

Todas as aprovações operacionais dos projetos serão indexadas em uma página central do Agency Flux. A página deve permitir que Sergio acompanhe o que está aguardando decisão sem precisar navegar por cada módulo.

### 5.1 Funções da página

A Central de Aprovações deve:

- Listar aprovações pendentes, aprovadas, reprovadas e devolvidas para revisão;
- Indexar aprovações por projeto, Persona, blog, tipo, status e data;
- Exibir o pacote versionado que está sendo aprovado;
- Mostrar origem e versão de cada artefato;
- Exibir dependências e blockers;
- Permitir abrir o detalhe do projeto;
- Permitir aprovar;
- Permitir reprovar;
- Permitir devolver para revisão;
- Exigir motivo em toda reprovação/devolução;
- Registrar usuário, data, comentário e versões aprovadas;
- Mostrar histórico de decisões;
- Impedir aprovação de pacote desatualizado;
- Alertar quando algum item mudou depois da montagem do pacote.

### 5.2 Tipos de aprovação

```text
persona_review
blog_name_review
domain_review
dns_manual_confirmation
provisioning_review
publication_review
```

Mesmo quando uma etapa é automática, sua confirmação ou exceção deve aparecer no índice quando existir Gate humano.

### 5.3 Ações da Central

```text
Aprovar
Reprovar
Devolver para revisão
Abrir projeto
Ver evidências
Ver histórico
Reprocessar job, quando permitido
```

O campo de motivo é obrigatório para:

- Reprovar;
- Devolver para revisão;
- Suspender;
- Liberar uma exceção;
- Reabrir um Gate já aprovado.

### 5.4 Modelo mínimo de aprovação

```text
id
project_id
persona_id
blog_id
approval_type
status
requested_at
requested_by
reviewed_at
reviewed_by
reason
comment
approved_versions jsonb
artifact_ids jsonb
job_id
correlation_id
created_at
updated_at
```

Estados:

```text
pending
approved
rejected
revision_requested
superseded
cancelled
```

### 5.5 Regras de segurança do Gate

- Apenas Sergio pode executar os Gates iniciais definidos neste documento;
- Aprovação não pode ser feita sem pacote versionado;
- Uma aprovação antiga não vale automaticamente para uma nova versão;
- Reprovação nunca apaga a versão anterior;
- Toda decisão gera evento e registro de auditoria;
- O Agency Flux só libera a próxima transição após readback da aprovação persistida.

---

## 6. Fluxo operacional completo

```text
[Authority Engine]
Usuário informa nicho, subnicho, problema, audiência e nome do blog
        ↓
Authority Engine cria dados-base
        ↓
Pipeline interno de módulos formadores:
Brief → Nicho/Audiência → Autoridade → Persona → Identidade Física
→ Consistência Visual → Editorial → Canais → Revisão
        ↓
Persona completa, ficha física e pacote visual versionados
        ↓
Persona fica em pending_approval
        ↓
[Agency Flux — Central de Aprovações]
Sergio revisa o pacote completo da Persona
        ↓
Sergio aprova ou reprova com motivo
        ↓
Sergio aprova o nome do blog
        ↓
Sistema gera slug e domínio inicial
        ↓
Projeto fica awaiting_dns
        ↓
Sergio provisiona registro DNS
        ↓
Sergio confirma DNS na Central de Aprovações
        ↓
Sistema verifica DNS automaticamente
        ↓
Projeto fica dns_verified
        ↓
[Agency Flux]
Flux recebe evento assinado e cria job idempotente
        ↓
[Control Tower]
Cria/atualiza projeto, schema e catálogo técnico
        ↓
Gera/reconcilia variáveis públicas, namespace e /health
        ↓
Cria referências de secrets sem expor valores
        ↓
Executa readbacks
        ↓
[FBR Blogs]
Consulta Persona aprovada e versão aprovada via API/evento
        ↓
Configura aplicação, estrutura editorial e pautas de social/YouTube
        ↓
[Agency Flux — Central de Aprovações]
Consolida jobs, evidências, blockers e handoffs
        ↓
Sergio aprova o pacote integral de publicação
        ↓
Flux executa publicação
        ↓
Readback final e estado published
```

---

## 7. Responsabilidade de cada módulo

### Authority Engine

Responsável por:

- Dados-base da oportunidade;
- Geração da Persona completa por pipeline de módulos;
- Character Bible, Physical Identity Bible e guardrails;
- Versionamento da Persona e dos módulos formadores;
- Preparação do pacote de aprovação;
- Aprovação/reprovação da Persona no Authority Engine quando aplicável ao domínio;
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
- Central de Aprovações indexada por projeto;
- Aprovar, reprovar e devolver para revisão com motivo;
- Versionamento do pacote aprovado;
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

## 8. Arquitetura de comunicação

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

## 9. Idempotência e recuperação

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

## 10. Estados

### Persona

```text
draft
profile_generating
profile_generated
pending_approval
revision_requested
approved
rejected
generation_blocked
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

## 11. Dados e entidades conceituais

### Authority Engine

```text
authority_personas
authority_persona_versions
authority_character_bibles
authority_physical_identity_bibles
authority_visual_consistency_profiles
authority_editorial_profiles
authority_channel_plans
authority_generation_jobs
authority_generation_module_runs
authority_blog_projects
authority_blog_name_versions
authority_domain_versions
authority_approvals
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

## 12. Configurações e secrets

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

## 13. Control Tower: geração automática

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

## 14. Aprovação e publicação inicial

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

## 15. Falhas e blockers

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

## 16. Critérios de aceite do fluxo global

- [ ] Dados-base criam uma Persona em estado rastreável;
- [ ] Persona é formada por pipeline de módulos especializados do Authority Engine;
- [ ] Cada módulo registra entrada, saída, versão, status e modelo utilizado;
- [ ] Persona completa é gerada pelo modelo principal do Hermes;
- [ ] Character Bible e Physical Identity Bible são gerados;
- [ ] Ficha física ultra detalhada garante consistência de imagens e vídeos;
- [ ] Prompts positivos, negativos, referências e invariantes são versionados;
- [ ] Provider/modelo/prompt/versionamento ficam registrados;
- [ ] Sergio aprova explicitamente a Persona na Central de Aprovações;
- [ ] Sergio pode aprovar, reprovar ou devolver para revisão com motivo;
- [ ] Aprovações ficam indexadas por projeto, Persona, blog, tipo e status;
- [ ] Sergio aprova explicitamente o nome do blog;
- [ ] Uma Persona pode possuir vários blogs;
- [ ] Nome, slug e domínio possuem versionamento;
- [ ] Domínio inicial é gerado como `<slug>.fbr.news`;
- [ ] Alteração de domínio é possível sem apagar o blog;
- [ ] DNS possui confirmação manual na Central e verificação automática;
- [ ] Provisionamento inicia automaticamente após os Gates necessários;
- [ ] Agency Flux controla jobs, eventos, retries e blockers;
- [ ] Authority Engine permanece como fonte canônica da Persona;
- [ ] Blogs consome dados por API/eventos, sem leitura direta das tabelas internas;
- [ ] Control Tower provisiona banco, schema, variáveis e referências de secrets;
- [ ] Secrets não aparecem no frontend, downloads, eventos ou logs;
- [ ] Redes sociais e YouTube são inicialmente pautados/configurados, não criados automaticamente;
- [ ] Publicação inicial exige aprovação integral de Sergio na Central;
- [ ] Todo avanço possui readback verificável;
- [ ] Eventos duplicados não geram recursos duplicados;
- [ ] Falhas ficam visíveis como blockers ou retries;
- [ ] Nenhuma migration remota é aplicada sem Gate autorizado;
- [ ] O fluxo completo é reproduzido em um teste E2E sem publicação real.

---

## 17. Pontos ainda em validação

1. Contrato exato das APIs entre Authority Engine, Agency Flux, Blogs e Control Tower;
2. Nomes finais das tabelas e ownership de cada migration;
3. Mecanismo final de assinatura e autenticação dos eventos;
4. Política de retry e janela de verificação DNS;
5. Implementação visual e técnica da Central de Aprovações de Sergio;
6. Definição do primeiro piloto;
7. Atualização dos MP-000 específicos para refletir este fluxo;
8. Readback remoto em ambiente autorizado;
9. Política de retenção de versões de Persona, identidade física, blog e domínio;
10. Regras de invalidação quando a Persona ou sua ficha física for alterada após um blog já estar ativo.

---

## 18. Próxima sequência de implementação

1. Aprovar este documento como contrato transversal;
2. Atualizar o MP-000 do Authority Engine;
3. Atualizar o MP-000 do Agency Flux;
4. Atualizar o MP-000 do FBR Blogs;
5. Definir módulos formadores, saídas e contrato de geração da Persona;
6. Definir o contrato de eventos e APIs;
7. Ajustar schema relacional e RLS;
8. Implementar a Central de Aprovações no Agency Flux;
9. Implementar outbox/inbox e idempotência;
10. Corrigir o fluxo automático do Control Tower;
11. Criar teste E2E local sem publicação real;
12. Aplicar migrations somente após Gate de Sergio;
13. Fazer readback remoto;
14. Executar piloto controlado.

---

## Rastreabilidade

### Fatos

- Authority Engine, FBR Agency Flux e FBR Blogs possuem MP-000 existentes em seus diretórios de projeto.
- O Control Tower possui catálogo de projetos, provisionamento e módulo de namespaces/secrets.
- A geração de configuração do Control Tower foi implementada localmente, mas a migration correspondente ainda depende de aplicação/readback remoto.

### Decisões do briefing

- Persona completa antes do provisionamento;
- Persona formada por módulos especializados do Authority Engine;
- Ficha física ultra detalhada e consistência visual versionada;
- Uma Persona pode ter vários blogs;
- Authority Engine é a fonte única da Persona;
- Agency Flux orquestra o fluxo;
- Central de Aprovações do Agency Flux indexa os Gates de cada projeto;
- Aprovar/reprovar/devolver exige registro; reprovação e devolução exigem motivo;
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
