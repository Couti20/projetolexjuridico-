"""Regras de negócio para processos.

Mock removido — retorna lista vazia enquanto Escavador não está integrado.
O front trata lista vazia com estado visual adequado (empty state).
"""
from sqlalchemy.orm import Session

from app.models.process import Process
from app.models.monitoring import Monitoring
from app.schemas.process import ProcessItem


def list_processes_for_user(db: Session, user_id: str) -> list[ProcessItem]:
    """
    Retorna processos monitorados pelo advogado.
    Retorna lista vazia se nenhum processo foi vinculado ainda.
    TODO: quando Escavador estiver integrado, buscar atualizações em tempo real.
    """
    monitorings = (
        db.query(Monitoring)
        .filter(Monitoring.user_id == user_id, Monitoring.is_active == True)
        .all()
    )

    if not monitorings:
        return []

    process_ids = [m.process_id for m in monitorings]
    processes = db.query(Process).filter(Process.id.in_(process_ids)).all()

    return [
        ProcessItem(
            id=p.id,
            number=p.number,
            court=p.court,
            claimant=p.claimant,
            defendant=p.defendant,
            district=p.district,
            status=p.status,
            latestMovementAt=p.latest_movement_at or "",
            latestMovementTitle=p.latest_movement_title or "",
        )
        for p in processes
    ]
