"""Tabela de tokens JWT invalidados (logout real).

Estratégia: armazenar apenas o jti (JWT ID) e a data de expiração.
Um job de limpeza (ou trigger) pode remover registros expirados periodicamente.
"""
from datetime import datetime

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    # jti é o JWT ID — UUID v4 gerado em cada token
    jti: Mapped[str] = mapped_column(String(36), primary_key=True)

    # user_id para auditoria e revogação em massa (ex: trocar senha)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)

    # quando o token expira — permite limpeza automática de registros velhos
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # quando foi feito o logout
    revoked_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # índice composto: a consulta mais frequente é "esse jti existe?"
    __table_args__ = (
        Index("ix_token_blacklist_jti", "jti"),
        Index("ix_token_blacklist_expires_at", "expires_at"),  # para limpeza
    )
