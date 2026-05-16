from datetime import datetime
from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False, index=True)
    oab: Mapped[str] = mapped_column(String(30), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(String(20), nullable=False, default="light")  # light | pro | elite
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # setup_completed: marcado como True após o advogado preencher OAB + WhatsApp
    # na tela de onboarding. Persiste entre dispositivos via banco.
    setup_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    token_invalid_before: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
