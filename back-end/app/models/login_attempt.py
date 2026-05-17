"""Model para controle de tentativas de login e bloqueio cíclico por e-mail + IP."""
from datetime import datetime
from sqlalchemy import DateTime, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LoginAttempt(Base):
    """Registra tentativas de login falhas por e-mail + IP.

    Lógica de bloqueio:
      - até 5 falhas → sem bloqueio
      - na 6ª falha  → bloqueio de 5 minutos
      - após expirar o bloqueio, o contador reinicia automaticamente
        para o usuário ter novamente 6 tentativas.
    O campo locked_until define até quando o acesso está bloqueado.
    """
    __tablename__ = "login_attempts"
    __table_args__ = (
        Index("ix_login_attempts_email_ip", "email", "ip_address", unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False, index=True, default="unknown")
    failed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_attempt_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
