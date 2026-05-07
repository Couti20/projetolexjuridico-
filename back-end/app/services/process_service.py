"""Regras de negócio para processos.

Por enquanto retorna mock.
Quando a API Escavador for integrada, substituir os métodos
chamando escavador_client ao invés do mock.
"""
from sqlalchemy.orm import Session

from app.models.process import Process
from app.models.monitoring import Monitoring
from app.schemas.process import ProcessItem


# ── Mock — remover após integrar Escavador ─────────────────────────────────
MOCK_PROCESSES: list[ProcessItem] = [
    ProcessItem(
        id="1002345-67-2023-8-26-0100",
        number="1002345-67.2023.8.26.0100",
        court="TJSP",
        claimant="João da Silva",
        defendant="Banco Exemplo S.A.",
        district="2ª Vara Cível - Foro Central de São Paulo",
        status="critico",
        latestMovementAt="15/04/2026 14:30",
        latestMovementTitle="Expedição de Intimação",
    ),
    ProcessItem(
        id="1045231-88-2024-8-26-0100",
        number="1045231-88.2024.8.26.0100",
        court="TJSP",
        claimant="Maria Oliveira",
        defendant="Seguradora Foco S.A.",
        district="7ª Vara Cível - Foro Central de São Paulo",
        status="atencao",
        latestMovementAt="14/04/2026 10:10",
        latestMovementTitle="Juntada de Documento",
    ),
]


def list_processes_for_user(db: Session, user_id: str) -> list[ProcessItem]:
    """
    Retorna processos monitorados pelo advogado.
    TODO: quando Escavador estiver integrado, buscar atualizações em tempo real.
    """
    monitorings = (
        db.query(Monitoring)
        .filter(Monitoring.user_id == user_id, Monitoring.is_active == True)
        .all()
    )

    if not monitorings:
        # Banco vazio — retorna mock para não quebrar o front
        return MOCK_PROCESSES

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
