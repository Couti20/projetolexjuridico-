<<<<<<< HEAD
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text, func
=======
from datetime import datetime, date
from sqlalchemy import DateTime, Date, ForeignKey, String, Text, Integer, Boolean, func
>>>>>>> develop
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Process(Base):
    __tablename__ = "processes"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)   # número CNJ normalizado
    number: Mapped[str] = mapped_column(String(30), nullable=False)  # 1002345-67.2023.8.26.0100
    court: Mapped[str] = mapped_column(String(20), nullable=False)   # TJSP, STJ ...
    claimant: Mapped[str] = mapped_column(String(180), nullable=False)
    defendant: Mapped[str] = mapped_column(String(180), nullable=False)
    district: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="normal")  # critico | atencao | normal
    latest_movement_at: Mapped[str] = mapped_column(String(30), nullable=True)
    latest_movement_title: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

<<<<<<< HEAD
=======
    # ── Campos Escavador ─────────────────────────────────────────────────────
    numero_cnj:           Mapped[str | None]  = mapped_column(String(30),  nullable=True)
    classe_escavador:     Mapped[str | None]  = mapped_column(String(120), nullable=True)
    area_escavador:       Mapped[str | None]  = mapped_column(String(60),  nullable=True)
    orgao_julgador:       Mapped[str | None]  = mapped_column(String(120), nullable=True)
    data_distribuicao:    Mapped[date | None] = mapped_column(Date,        nullable=True)
    ultima_movimentacao:  Mapped[str | None]  = mapped_column(Text,        nullable=True)
    data_ultima_mov:      Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    prazo_dias:           Mapped[int | None]  = mapped_column(Integer,     nullable=True)
    prazo_estimado:       Mapped[bool]        = mapped_column(Boolean,     default=False)
    data_prazo:           Mapped[date | None] = mapped_column(Date,        nullable=True)
    escavador_sync_at:    Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

>>>>>>> develop
    # Relacionamento com monitoramentos
    monitorings: Mapped[list["Monitoring"]] = relationship(back_populates="process")
