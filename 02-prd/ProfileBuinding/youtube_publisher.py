"""
Profile Building — Adapter do YouTube (Data API v3)
===================================================

Publica vídeos de personas de IA via API oficial do YouTube, TENANT-AWARE.

Diferenças estruturais frente a Meta/TikTok (verificadas):
  * O YouTube NÃO puxa de URL. Ele RECEBE bytes via upload resumable. Então
    aqui a gente busca o vídeo (CDN ou disco) e faz streaming para o endpoint.
  * COTA é o teto real: videos.insert custa ~1600 unidades e o projeto tem
    ~10.000/dia por padrão => ~6 uploads/dia POR PROJETO. Por isso o adapter
    recebe o gcp_project_id do tenant: a cota é cobrada no projeto que mintou
    o token, então um projeto por tenant isola o consumo entre empresas.
  * Divulgação de IA: o YouTube pede rótulo de "conteúdo alterado/sintético".
    NÃO há um campo estável e documentado no videos.insert para isso (costuma
    ser marcado no Studio). Não inventei parâmetro: registramos o flag, logamos
    e deixamos o ponto marcado. Ver _apply_ai_disclosure.

Endpoints:
  resumable init : POST https://www.googleapis.com/upload/youtube/v3/videos
                        ?uploadType=resumable&part=snippet,status
  upload         : PUT  (Location retornado pelo init)

Scope OAuth necessário: https://www.googleapis.com/auth/youtube.upload
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import requests

from core import (
    TenantContext, CredentialVault, Platform, ContentItem, MediaType,
    PublishError, MediaFormatError,
)

logger = logging.getLogger("profile_building.youtube")

RESUMABLE_INIT_URL = (
    "https://www.googleapis.com/upload/youtube/v3/videos"
    "?uploadType=resumable&part=snippet,status"
)

UPLOAD_QUOTA_COST = 1600   # custo aproximado de um videos.insert
DAILY_QUOTA_DEFAULT = 10000


@dataclass(frozen=True)
class YouTubeAccount:
    """Identidade YouTube do tenant. O gcp_project_id é informativo/telemetria:
    a cota real é cobrada no projeto do OAuth client que emitiu o token."""
    gcp_project_id: str
    channel_id: str | None = None


class YouTubePublisher:
    """Faz upload de vídeos ao canal de um tenant via upload resumable."""

    def __init__(
        self,
        vault: CredentialVault,
        *,
        session: requests.Session | None = None,
        request_timeout_s: float = 120.0,
        default_category_id: str = "22",   # People & Blogs
    ) -> None:
        self._vault = vault
        self._session = session or requests.Session()
        self._request_timeout_s = request_timeout_s
        self._default_category_id = default_category_id

    # --- API pública ------------------------------------------------------
    def publish(
        self,
        ctx: TenantContext,
        account: YouTubeAccount,
        item: ContentItem,
        *,
        privacy_status: str = "public",   # public | unlisted | private
    ) -> str:
        """Faz upload e retorna o video_id. Estima e loga a cota consumida."""
        if item.media_type is not MediaType.VIDEO:
            raise PublishError("YouTube adapter: só vídeo.")
        if not item.video_url:
            raise PublishError("YouTube exige a fonte do vídeo (video_url/caminho).")

        self._quota_guard(account)
        token = self._vault.get_access_token(ctx.tenant_id, Platform.YOUTUBE)

        metadata = self._build_metadata(item, privacy_status)
        self._apply_ai_disclosure(metadata, item)

        upload_url = self._start_resumable(metadata, token)
        video_id = self._upload_bytes(upload_url, item.video_url, token)

        logger.info(
            "youtube publicado tenant=%s project=%s video_id=%s (~%d unidades de cota)",
            ctx.tenant_id, account.gcp_project_id, video_id, UPLOAD_QUOTA_COST,
        )
        return video_id

    # --- Metadados --------------------------------------------------------
    def _build_metadata(self, item: ContentItem, privacy_status: str) -> dict:
        return {
            "snippet": {
                "title": (item.title or item.caption or "Vídeo")[:100],
                "description": item.caption[:5000],
                "tags": list(item.tags),
                "categoryId": self._default_category_id,
            },
            "status": {
                "privacyStatus": privacy_status,
                "selfDeclaredMadeForKids": False,
            },
        }

    def _apply_ai_disclosure(self, metadata: dict, item: ContentItem) -> None:
        """Divulgação de conteúdo alterado/sintético (IA).

        A CONFIRMAR: não há campo público estável no videos.insert para a
        auto-declaração de conteúdo sintético (é feita no Studio na maioria dos
        casos). NÃO inventei parâmetro. Registramos e logamos para que o flag
        JAMAIS seja silenciosamente ignorado — compliance depende disso.

        Quando/se o campo oficial existir na Data API, setar aqui. Enquanto
        isso, garanta a marcação no onboarding do canal ou por rotina no Studio.
        """
        if item.ai_generated:
            logger.debug(
                "youtube: conteúdo de IA — garantir divulgação de conteúdo "
                "alterado/sintético (Studio ou campo oficial quando disponível)"
            )
            # Placeholder consciente — preencher quando confirmado:
            # metadata["status"]["containsSyntheticMedia"] = True

    # --- Upload resumable -------------------------------------------------
    def _start_resumable(self, metadata: dict, token: str) -> str:
        resp = self._session.post(
            RESUMABLE_INIT_URL,
            json=metadata,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
            timeout=self._request_timeout_s,
        )
        if resp.status_code not in (200, 201):
            raise PublishError(f"falha ao iniciar upload resumable: {resp.status_code} {resp.text[:200]}")
        location = resp.headers.get("Location")
        if not location:
            raise PublishError("resposta sem header Location (URL de upload).")
        return location

    def _upload_bytes(self, upload_url: str, source: str, token: str) -> str:
        """Streaming dos bytes do vídeo para o upload_url.

        Versão simples (single-shot). Em produção: upload em chunks com
        Content-Range e retomada em falha (o protocolo resumable permite
        retomar de onde parou). Para arquivos grandes, isso é essencial.
        """
        video_bytes = self._read_source(source)
        resp = self._session.put(
            upload_url,
            data=video_bytes,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "video/*",
                "Content-Length": str(len(video_bytes)),
            },
            timeout=self._request_timeout_s,
        )
        if resp.status_code not in (200, 201):
            raise MediaFormatError(f"upload rejeitado: {resp.status_code} {resp.text[:200]}")
        video_id = resp.json().get("id")
        if not video_id:
            raise PublishError(f"upload sem id de vídeo: {resp.text[:200]}")
        return video_id

    def _read_source(self, source: str) -> bytes:
        """Busca os bytes: URL http(s) do seu CDN ou caminho local."""
        if source.startswith("http://") or source.startswith("https://"):
            r = self._session.get(source, timeout=self._request_timeout_s)
            r.raise_for_status()
            return r.content
        with open(source, "rb") as fh:
            return fh.read()

    # --- Cota -------------------------------------------------------------
    def _quota_guard(self, account: YouTubeAccount) -> None:
        """Aviso preventivo de cota. Em produção, troque por um contador real
        por projeto (Redis/DB) que bloqueia quando o saldo diário acabar."""
        max_uploads = DAILY_QUOTA_DEFAULT // UPLOAD_QUOTA_COST
        logger.debug(
            "youtube cota: projeto=%s permite ~%d uploads/dia no teto padrão",
            account.gcp_project_id, max_uploads,
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    class _DemoVault:
        def get_access_token(self, tenant_id: str, platform) -> str:
            return "OAUTH_TOKEN_DEMO"

    pub = YouTubePublisher(_DemoVault())
    ctx = TenantContext(tenant_id="empresa_c")
    account = YouTubeAccount(gcp_project_id="pb-empresa-c", channel_id="UC_xxx")
    item = ContentItem(
        media_type=MediaType.VIDEO,
        title="Rotina matinal | persona de IA",
        caption="Feito por uma persona virtual. #ia",
        video_url="https://cdn.exemplo.com/personas/ana/short_012.mp4",
        tags=("rotina", "produtividade"),
        ai_generated=True,
    )
    # video_id = pub.publish(ctx, account, item)  # descomente com token real
    print("Adapter YouTube carregado. Lembre: ~6 uploads/dia por projeto no teto padrão.")
