"""
Profile Building — Adapter do TikTok (Content Posting API v2)
============================================================

Publica vídeos de personas de IA via API oficial do TikTok, TENANT-AWARE.

Fatos verificados da API atual embutidos aqui:
  * Fluxo obrigatório: creator_info/query ANTES de publicar. O privacy_level
    enviado no init TEM que ser um dos privacy_level_options retornados, senão
    a API rejeita (privacy_level_option_mismatch). É exigência de product-use.
  * is_aigc (bool) em post_info: quando true, o TikTok rotula o vídeo com a
    tag "Creator labeled as AI-generated". É a nossa divulgação de IA oficial.
  * Gate de auditoria: apps NÃO auditados só podem postar SELF_ONLY (privado).
    Este adapter recusa qualquer outra visibilidade enquanto audited=False.
  * PULL_FROM_URL exige domínio/prefixo verificado no portal do app.
  * Rate limit: 6 requisições/min por user access_token.

Endpoints:
  creator_info : POST /v2/post/publish/creator_info/query/
  video init   : POST /v2/post/publish/video/init/
  status       : POST /v2/post/publish/status/fetch/
"""

from __future__ import annotations

import time
import logging

import requests

from core import (
    TenantContext, CredentialVault, Platform, ContentItem, MediaType,
    PublishError, PublishTimeout, ComplianceError,
)

logger = logging.getLogger("profile_building.tiktok")

API_BASE = "https://open.tiktokapis.com/v2"
CREATOR_INFO_URL = f"{API_BASE}/post/publish/creator_info/query/"
VIDEO_INIT_URL = f"{API_BASE}/post/publish/video/init/"
STATUS_URL = f"{API_BASE}/post/publish/status/fetch/"

PRIVATE = "SELF_ONLY"
TERMINAL_OK = "PUBLISH_COMPLETE"
TERMINAL_FAIL = {"FAILED"}


class TikTokPublisher:
    """Publica ContentItems de vídeo no TikTok de um tenant.

    Args:
        vault: cofre multi-plataforma.
        audited: True somente depois que o app passou na auditoria de conteúdo
                 do TikTok. Enquanto False, força SELF_ONLY (privado).
    """

    def __init__(
        self,
        vault: CredentialVault,
        *,
        audited: bool = False,
        session: requests.Session | None = None,
        poll_interval_s: float = 10.0,
        poll_timeout_s: float = 300.0,
        request_timeout_s: float = 30.0,
    ) -> None:
        self._vault = vault
        self._audited = audited
        self._session = session or requests.Session()
        self._poll_interval_s = poll_interval_s
        self._poll_timeout_s = poll_timeout_s
        self._request_timeout_s = request_timeout_s

    # --- API pública ------------------------------------------------------
    def publish(
        self,
        ctx: TenantContext,
        item: ContentItem,
        *,
        desired_privacy: str = "PUBLIC_TO_EVERYONE",
    ) -> str:
        """Publica um vídeo e retorna o publish_id. Fluxo completo:
        creator_info -> resolve visibilidade -> init (PULL_FROM_URL) -> poll.
        """
        if item.media_type is not MediaType.VIDEO:
            raise PublishError("TikTok adapter: só vídeo neste método.")
        if not item.video_url:
            raise PublishError("TikTok exige video_url (domínio verificado).")

        token = self._vault.get_access_token(ctx.tenant_id, Platform.TIKTOK)

        # 1) creator_info: obrigatório antes de publicar.
        info = self._creator_info(token)
        allowed = info.get("privacy_level_options", [])

        # 2) resolve visibilidade respeitando o gate de auditoria.
        privacy = self._resolve_privacy(desired_privacy, allowed)

        # 3) init do post (PULL_FROM_URL) com is_aigc.
        publish_id = self._init_video(token, item, privacy)

        # 4) poll até PUBLISH_COMPLETE.
        self._wait_complete(token, publish_id)

        logger.info(
            "tiktok publicado tenant=%s publish_id=%s privacy=%s aigc=%s",
            ctx.tenant_id, publish_id, privacy, item.ai_generated,
        )
        return publish_id

    # --- Etapas -----------------------------------------------------------
    def _creator_info(self, token: str) -> dict:
        data = self._post(CREATOR_INFO_URL, {}, token)
        return data.get("data", {})

    def _resolve_privacy(self, desired: str, allowed: list[str]) -> str:
        # App não auditado: só privado, ponto final.
        if not self._audited:
            if desired != PRIVATE:
                logger.warning(
                    "app não auditado — forçando %s (pedido: %s)", PRIVATE, desired
                )
            if PRIVATE not in allowed:
                raise ComplianceError(
                    "SELF_ONLY não está em privacy_level_options; conta não pode receber post."
                )
            return PRIVATE
        # App auditado: o desejado precisa estar nas opções do criador.
        if desired not in allowed:
            raise ComplianceError(
                f"privacy '{desired}' não permitido para este criador; opções: {allowed}"
            )
        return desired

    def _init_video(self, token: str, item: ContentItem, privacy: str) -> str:
        body = {
            "post_info": {
                "title": (item.title or item.caption)[:2200],
                "privacy_level": privacy,
                "disable_comment": False,
                "disable_duet": False,
                "disable_stitch": False,
                "video_cover_timestamp_ms": 1000,
                # Divulgação de IA oficial: gera a tag "Creator labeled as AI-generated".
                "is_aigc": bool(item.ai_generated),
            },
            "source_info": {
                "source": "PULL_FROM_URL",
                "video_url": item.video_url,
            },
        }
        if item.ai_generated:
            logger.debug("tiktok: is_aigc=true aplicado (persona de IA)")

        data = self._post(VIDEO_INIT_URL, body, token)
        publish_id = data.get("data", {}).get("publish_id")
        if not publish_id:
            raise PublishError(f"init sem publish_id: {data}")
        return publish_id

    def _wait_complete(self, token: str, publish_id: str) -> None:
        deadline = time.monotonic() + self._poll_timeout_s
        while True:
            data = self._post(STATUS_URL, {"publish_id": publish_id}, token)
            status = data.get("data", {}).get("status")
            if status == TERMINAL_OK:
                return
            if status in TERMINAL_FAIL:
                reason = data.get("data", {}).get("fail_reason", "desconhecido")
                raise PublishError(f"publish {publish_id} falhou: {reason}")
            if time.monotonic() >= deadline:
                raise PublishTimeout(
                    f"publish {publish_id} não concluiu em {self._poll_timeout_s}s (último: {status})"
                )
            time.sleep(self._poll_interval_s)

    # --- HTTP -------------------------------------------------------------
    def _post(self, url: str, body: dict, token: str) -> dict:
        resp = self._session.post(
            url,
            json=body,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
            timeout=self._request_timeout_s,
        )
        payload = resp.json()
        err = payload.get("error", {})
        code = err.get("code")
        if code and code != "ok":
            msg = err.get("message", "")
            if code == "rate_limit_exceeded":
                raise PublishError("TikTok rate limit (6 req/min por token) — reduza a cadência.")
            if code == "url_ownership_unverified":
                raise ComplianceError("Domínio da video_url não verificado no portal do app.")
            raise PublishError(f"TikTok erro {code}: {msg}")
        return payload


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    class _DemoVault:
        def get_access_token(self, tenant_id: str, platform) -> str:
            return "ACCESS_TOKEN_DEMO"

    pub = TikTokPublisher(_DemoVault(), audited=False)  # não auditado -> SELF_ONLY
    ctx = TenantContext(tenant_id="empresa_b")
    item = ContentItem(
        media_type=MediaType.VIDEO,
        title="Dica rápida de produtividade",
        video_url="https://cdn.verificado.exemplo.com/personas/leo/vid_007.mp4",
        ai_generated=True,
    )
    # publish_id = pub.publish(ctx, item)  # descomente com token/domínio reais
    print("Adapter TikTok carregado. Auditoria pendente => posts sairiam como SELF_ONLY.")
