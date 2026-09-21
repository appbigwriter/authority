"""
Profile Building — Motor de publicação da Meta (Instagram + Facebook)
====================================================================

Espinha dorsal reutilizável, TENANT-AWARE, para publicar conteúdo de personas
de IA declaradas via Graph API oficial (v26).

Princípios de design refletidos aqui:
  * Multi-tenant: toda operação carrega um TenantContext. Credenciais são
    resolvidas por tenant através de um CredentialVault injetável — este módulo
    NUNCA lê token de variável global nem mistura contexto de tenants.
  * API-first: usa o fluxo oficial de dois passos (criar container -> publicar).
    Nada de automação de browser aqui.
  * Rótulo de IA como cidadão de primeira classe: todo ContentItem carrega
    `ai_generated`. Cada adapter é responsável por traduzir isso para o
    mecanismo da plataforma (ver nota em _apply_ai_disclosure).

Fatos da Graph API v26 embutidos (verificados na documentação atual):
  * Publicação é sempre em dois passos: POST .../media (container) ->
    poll GET container até status_code=FINISHED -> POST .../media_publish.
  * A mídia precisa estar numa URL PÚBLICA no momento da publicação (a Meta
    faz cURL do arquivo).
  * Imagens: apenas JPEG. Reels via API: <= 90s, H.264/AAC (MP4/MOV).
  * NÃO há agendamento nativo: o SEU scheduler é o relógio. Crie o container
    só perto da hora de publicar (containers expiram se ficarem parados).
  * Rate limit de polling é apertado (~200 chamadas/hora): faça poll com
    intervalo >= ~10s e backoff.

Dependências: requests  (pip install requests)
Escala: para muitas contas simultâneas, migre para httpx/async. A interface
foi mantida simples de propósito para ser o primeiro tijolo legível.
"""

from __future__ import annotations

import time
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Protocol, Sequence

import requests

logger = logging.getLogger("profile_building.meta")

GRAPH_VERSION = "v26.0"
GRAPH_BASE = f"https://graph.facebook.com/{GRAPH_VERSION}"


# ---------------------------------------------------------------------------
# Erros de domínio
# ---------------------------------------------------------------------------
class MetaPublishError(Exception):
    """Falha genérica de publicação na Meta."""


class ContainerTimeout(MetaPublishError):
    """O container não chegou a FINISHED dentro do prazo de polling."""


class MediaFormatError(MetaPublishError):
    """Mídia rejeitada por formato (ex.: erro 24 da Graph API = codec/formato)."""


# ---------------------------------------------------------------------------
# Multi-tenant: contexto e cofre de credenciais
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class TenantContext:
    """Identifica o tenant (empresa do grupo) e a conta-alvo dentro dele.

    Tudo neste módulo passa por aqui. É o que garante que o token da Empresa A
    jamais seja usado no contexto da Empresa B.
    """
    tenant_id: str
    ig_user_id: str          # Instagram professional account id (Business/Creator)
    fb_page_id: str | None = None  # opcional, para publicar também no Facebook


class CredentialVault(Protocol):
    """Interface do cofre. Implemente com KMS/Secrets Manager em produção,
    com uma chave de criptografia POR TENANT. Aqui é só o contrato.

    O motor de publicação depende só disto — nunca de onde o token mora.
    """

    def get_access_token(self, tenant_id: str) -> str:
        """Retorna um System User token válido para o tenant.

        Em produção: resolve o token do Business Manager do tenant, checa
        expiração, faz refresh se necessário, e descriptografa com a chave
        exclusiva do tenant. Falhas de auth devem estourar antes de retornar.
        """
        ...


# ---------------------------------------------------------------------------
# Modelo de conteúdo
# ---------------------------------------------------------------------------
class MediaType(str, Enum):
    IMAGE = "IMAGE"
    REELS = "REELS"
    CAROUSEL = "CAROUSEL"


@dataclass
class ContentItem:
    """Uma peça de conteúdo pronta para publicar.

    `ai_generated` é obrigatório e default True: personas são declaradamente
    virtuais, então a divulgação de IA nunca é opcional no nosso domínio.
    Cada asset_url precisa ser PÚBLICA no momento da publicação.
    """
    media_type: MediaType
    caption: str = ""
    image_url: str | None = None            # IMAGE / itens de carrossel
    video_url: str | None = None            # REELS
    cover_url: str | None = None            # capa do Reel (evita frame ruim)
    children: Sequence["ContentItem"] = field(default_factory=tuple)  # CAROUSEL
    ai_generated: bool = True

    def validate(self) -> None:
        if self.media_type is MediaType.IMAGE and not self.image_url:
            raise MediaFormatError("IMAGE exige image_url (JPEG em URL pública).")
        if self.media_type is MediaType.REELS and not self.video_url:
            raise MediaFormatError("REELS exige video_url (MP4/MOV, H.264/AAC, <=90s).")
        if self.media_type is MediaType.CAROUSEL and not (2 <= len(self.children) <= 10):
            raise MediaFormatError("CAROUSEL exige entre 2 e 10 itens filhos.")


# ---------------------------------------------------------------------------
# Motor de publicação
# ---------------------------------------------------------------------------
class MetaPublisher:
    """Publica ContentItems no Instagram (e opcionalmente Facebook) de um tenant.

    Uso:
        publisher = MetaPublisher(vault)
        media_id = publisher.publish(ctx, item)
    """

    def __init__(
        self,
        vault: CredentialVault,
        *,
        session: requests.Session | None = None,
        poll_interval_s: float = 10.0,
        poll_timeout_s: float = 300.0,
        request_timeout_s: float = 30.0,
    ) -> None:
        self._vault = vault
        self._session = session or requests.Session()
        self._poll_interval_s = poll_interval_s
        self._poll_timeout_s = poll_timeout_s
        self._request_timeout_s = request_timeout_s

    # --- API pública ------------------------------------------------------
    def publish(self, ctx: TenantContext, item: ContentItem) -> str:
        """Executa o fluxo completo e retorna o media_id publicado."""
        item.validate()
        token = self._vault.get_access_token(ctx.tenant_id)

        if item.media_type is MediaType.CAROUSEL:
            container_id = self._create_carousel_container(ctx, item, token)
        else:
            container_id = self._create_single_container(ctx, item, token)

        self._wait_until_finished(container_id, token)
        media_id = self._publish_container(ctx, container_id, token)

        logger.info(
            "publicado tenant=%s ig_user=%s media_id=%s tipo=%s",
            ctx.tenant_id, ctx.ig_user_id, media_id, item.media_type.value,
        )
        return media_id

    # --- Passo 1: criar container ----------------------------------------
    def _create_single_container(
        self, ctx: TenantContext, item: ContentItem, token: str
    ) -> str:
        params: dict[str, str] = {"caption": item.caption}

        if item.media_type is MediaType.IMAGE:
            params["image_url"] = item.image_url  # type: ignore[assignment]
        elif item.media_type is MediaType.REELS:
            params["media_type"] = "REELS"
            params["video_url"] = item.video_url  # type: ignore[assignment]
            if item.cover_url:
                params["cover_url"] = item.cover_url

        self._apply_ai_disclosure(params, item)
        return self._post_container(ctx.ig_user_id, params, token)

    def _create_carousel_container(
        self, ctx: TenantContext, item: ContentItem, token: str
    ) -> str:
        # Cada filho vira um container com is_carousel_item=true...
        child_ids: list[str] = []
        for child in item.children:
            child.validate()
            child_params: dict[str, str] = {"is_carousel_item": "true"}
            if child.media_type is MediaType.IMAGE:
                child_params["image_url"] = child.image_url  # type: ignore[assignment]
            elif child.media_type is MediaType.REELS:
                child_params["media_type"] = "VIDEO"
                child_params["video_url"] = child.video_url  # type: ignore[assignment]
            child_ids.append(self._post_container(ctx.ig_user_id, child_params, token))

        # ...e o pai amarra os filhos.
        parent_params = {
            "media_type": "CAROUSEL",
            "children": ",".join(child_ids),
            "caption": item.caption,
        }
        self._apply_ai_disclosure(parent_params, item)
        return self._post_container(ctx.ig_user_id, parent_params, token)

    def _post_container(self, ig_user_id: str, params: dict[str, str], token: str) -> str:
        url = f"{GRAPH_BASE}/{ig_user_id}/media"
        data = self._graph_post(url, params, token)
        container_id = data.get("id")
        if not container_id:
            raise MetaPublishError(f"resposta sem id de container: {data}")
        return container_id

    # --- Passo 2: polling até FINISHED -----------------------------------
    def _wait_until_finished(self, container_id: str, token: str) -> None:
        """Poll com intervalo fixo (respeitando o rate limit apertado).

        status_code: IN_PROGRESS | FINISHED | ERROR | EXPIRED | PUBLISHED.
        """
        deadline = time.monotonic() + self._poll_timeout_s
        url = f"{GRAPH_BASE}/{container_id}"
        while True:
            data = self._graph_get(url, {"fields": "status_code,status"}, token)
            status = data.get("status_code")
            if status == "FINISHED":
                return
            if status in ("ERROR", "EXPIRED"):
                raise MetaPublishError(
                    f"container {container_id} terminou em {status}: {data.get('status')}"
                )
            if time.monotonic() >= deadline:
                raise ContainerTimeout(
                    f"container {container_id} não ficou pronto em {self._poll_timeout_s}s"
                )
            time.sleep(self._poll_interval_s)

    # --- Passo 3: publicar -----------------------------------------------
    def _publish_container(self, ctx: TenantContext, container_id: str, token: str) -> str:
        url = f"{GRAPH_BASE}/{ctx.ig_user_id}/media_publish"
        data = self._graph_post(url, {"creation_id": container_id}, token)
        media_id = data.get("id")
        if not media_id:
            raise MetaPublishError(f"publish sem media_id: {data}")
        return media_id

    # --- Divulgação de IA -------------------------------------------------
    def _apply_ai_disclosure(self, params: dict[str, str], item: ContentItem) -> None:
        """Traduz item.ai_generated para o mecanismo da Meta.

        ATENÇÃO / A VERIFICAR: a exposição de rotulagem de conteúdo de IA via
        Graph API está evoluindo e nem todo tipo de post aceita um parâmetro
        de divulgação de IA pela API (parte da rotulagem é detecção automática
        + toggle no app). NÃO inventei um parâmetro aqui de propósito.

        Antes de ir para produção, confirme na doc atual da Meta qual campo
        (se houver) marca "conteúdo alterado/gerado por IA" no endpoint de
        media, e preencha aqui. Enquanto isso, o flag fica registrado no nosso
        sistema (auditoria/compliance) e a divulgação pode ser garantida por:
          (a) o campo de API correto assim que confirmado, e/ou
          (b) marcação manual no app durante o onboarding da conta.
        O importante do ponto de vista de compliance é que ai_generated JAMAIS
        seja silenciosamente ignorado — então logamos explicitamente.
        """
        if item.ai_generated:
            logger.debug("item marcado como IA — garantir divulgação na conta/post")
            # Quando o parâmetro oficial for confirmado, setar aqui. Ex. (placeholder):
            # params["<campo_oficial_de_ia>"] = "true"

    # --- HTTP + tratamento de erro da Graph ------------------------------
    def _graph_post(self, url: str, params: dict[str, str], token: str) -> dict:
        resp = self._session.post(
            url, data={**params, "access_token": token}, timeout=self._request_timeout_s
        )
        return self._handle(resp)

    def _graph_get(self, url: str, params: dict[str, str], token: str) -> dict:
        resp = self._session.get(
            url, params={**params, "access_token": token}, timeout=self._request_timeout_s
        )
        return self._handle(resp)

    @staticmethod
    def _handle(resp: requests.Response) -> dict:
        try:
            payload = resp.json()
        except ValueError:
            resp.raise_for_status()
            raise MetaPublishError(f"resposta não-JSON: {resp.text[:200]}")

        if "error" in payload:
            err = payload["error"]
            code = err.get("code")
            msg = err.get("message", "")
            # 24 = formato/codec de mídia inválido (H.264/AAC obrigatório em Reels).
            if code == 24:
                raise MediaFormatError(f"formato de mídia inválido (code 24): {msg}")
            raise MetaPublishError(f"Graph API erro {code}: {msg}")
        return payload


# ---------------------------------------------------------------------------
# Exemplo de uso (com um cofre falso — troque por KMS em produção)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    class _DemoVault:
        """SÓ PARA DEMO. Em produção: chave de criptografia por tenant + refresh."""
        _tokens = {"empresa_a": "TOKEN_SYSTEM_USER_DA_EMPRESA_A"}

        def get_access_token(self, tenant_id: str) -> str:
            try:
                return self._tokens[tenant_id]
            except KeyError:
                raise MetaPublishError(f"sem token para tenant {tenant_id}")

    publisher = MetaPublisher(_DemoVault())

    ctx = TenantContext(
        tenant_id="empresa_a",
        ig_user_id="17841400000000000",
        fb_page_id=None,
    )

    reel = ContentItem(
        media_type=MediaType.REELS,
        caption="Bom dia! ☕ (conteúdo de uma persona de IA)",
        video_url="https://cdn.exemplo.com/personas/maia/reel_001.mp4",
        cover_url="https://cdn.exemplo.com/personas/maia/reel_001_cover.jpg",
        ai_generated=True,
    )

    # media_id = publisher.publish(ctx, reel)   # descomente com credenciais reais
    print("Módulo carregado. Configure o cofre e as contas para publicar de verdade.")
