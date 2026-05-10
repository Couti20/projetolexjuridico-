"""Tabela de vínculo entre advogado (User) e processo (Process).

Um advogado pode monitorar vários processos.
Um processo pode ser monitorado por vários advogados.
"""
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Monitoring(Base):
    __tablename__ = "monitorings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    process_id: Mapped[str] = mapped_column(String(60), ForeignKey("processes.id"), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relacionamentos
    user: Mapped["User"] = relationship()
    process: Mapped["Process"] = relationship(back_populates="monitorings")
