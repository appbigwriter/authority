"""
Profile Building — Núcleo compartilhado (core)
==============================================

Abstrações comuns a TODOS os adapters de plataforma (Meta, TikTok, YouTube).
Extrair isto para um único lugar é o que permite ter N adapters sem duplicar a
lógica multi-tenant: cada adapter recebe um TenantContext e resolve credenciais
pelo mesmo CredentialVault, isolando empresas do grupo umas das outras.

Recomendação: refatore o meta_publisher.py para importar TenantContext,
CredentialVault e ContentItem daqui, em vez de defini-los localmente.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Protocol, Sequence


# ---------------------------------------------------------------------------
# Plataformas
# ---------------------------------------------------------------------------
class Platform(str, Enum):
    META = "meta"
    TIKTOK = "tiktok"
    YOUTUBE = "youtube"


# ---------------------------------------------------------------------------
# Multi-tenant
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class TenantContext:
    """O tenant (empresa do grupo). Minimalista de propósito: identidade de
    conta específica de cada plataforma vive nos *Account* de cada adapter."""
    tenant_id: str


class CredentialVault(Protocol):
    """Cofre multi-plataforma. Implemente com KMS/Secrets Manager usando uma
    chave de criptografia POR TENANT. Os adapters dependem só deste contrato.
    """

    def get_access_token(self, tenant_id: str, platform: Platform) -> str:
        """Token válido para (tenant, plataforma). Resolve, descriptografa,
        checa expiração e faz refresh. Falha de auth deve estourar aqui."""
        ...


# ---------------------------------------------------------------------------
# Modelo de conteúdo (comum às plataformas)
# ---------------------------------------------------------------------------
class MediaType(str, Enum):
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"      # Reel (Meta), vídeo (TikTok), vídeo (YouTube)
    CAROUSEL = "CAROUSEL"


@dataclass
class ContentItem:
    """Peça de conteúdo pronta para publicar.

    `ai_generated` é obrigatório e default True: personas são declaradamente
    virtuais, então a divulgação de IA nunca é opcional no nosso domínio.
    Cada adapter mapeia este flag para o mecanismo da plataforma
    (is_aigc no TikTok; campo a confirmar na Meta/YouTube).
    """
    media_type: MediaType
    title: str = ""                  # título (YouTube) / usado como caption curto
    caption: str = ""                # legenda/descrição (Meta, TikTok, YouTube)
    video_url: str | None = None     # URL pública do vídeo (ou caminho local p/ YT)
    image_url: str | None = None     # imagem única / item de carrossel
    cover_url: str | None = None     # capa
    tags: Sequence[str] = field(default_factory=tuple)   # YouTube
    children: Sequence["ContentItem"] = field(default_factory=tuple)  # carrossel
    ai_generated: bool = True


# ---------------------------------------------------------------------------
# Erros de domínio (base comum)
# ---------------------------------------------------------------------------
class PublishError(Exception):
    """Falha genérica de publicação."""


class MediaFormatError(PublishError):
    """Mídia rejeitada por formato/codec."""


class PublishTimeout(PublishError):
    """Processamento não concluiu dentro do prazo."""


class ComplianceError(PublishError):
    """Bloqueio por regra de conformidade (ex.: post público num app não auditado)."""
