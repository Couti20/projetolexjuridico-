"""Regras de negócio para processos.

Mock removido — retorna lista vazia enquanto Escavador não está integrado.
O front trata lista vazia com estado visual adequado (empty state).
"""
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.process import Process
from app.models.monitoring import Monitoring
from app.schemas.process import ProcessItem


def list_processes_for_user(db: Session, user_id: str) -> list[ProcessItem]:
    """
    Retorna processos monitorados pelo advogado.
    Retorna lista vazia se nenhum processo foi vinculado ainda.
    TODO: quando Escavador estiver integrado, buscar atualizações em tempo real.
    """
    stmt = (
        select(
            Process.id,
            Process.number,
            Process.court,
            Process.claimant,
            Process.defendant,
            Process.district,
            Process.status,
            Process.latest_movement_at,
            Process.latest_movement_title,
        )
        .join(Monitoring, Monitoring.process_id == Process.id)
        .where(Monitoring.user_id == user_id, Monitoring.is_active.is_(True))
    )
    rows = db.execute(stmt).all()

    return [
        ProcessItem(
            id=row.id,
            number=row.number,
            court=row.court,
            claimant=row.claimant,
            defendant=row.defendant,
            district=row.district,
            status=row.status,
            latestMovementAt=row.latest_movement_at or "",
            latestMovementTitle=row.latest_movement_title or "",
        )
        for row in rows
    ]
