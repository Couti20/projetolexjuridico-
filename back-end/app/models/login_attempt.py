"""Model para controle de tentativas de login e bloqueio progressivo."""
from datetime import datetime
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LoginAttempt(Base):
    """Registra tentativas de login falhas por e-mail.

    Lógica de bloqueio progressivo:
      - failed_count 1-4  → sem bloqueio
      - failed_count 5-9  → bloqueio de 5 minutos
      - failed_count 10-14 → bloqueio de 15 minutos
      - failed_count 15-19 → bloqueio de 30 minutos
      - failed_count >= 20 → bloqueio de 60 minutos

    O contador nunca é zerado automaticamente pelo tempo;
    ele só é zerado após um login bem-sucedido.
    O campo locked_until define até quando o acesso está bloqueado.
    """
    __tablename__ = "login_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    failed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_attempt_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
