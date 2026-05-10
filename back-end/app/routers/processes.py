from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.process import ProcessItem, ProcessMovement
from app.services.process_service import list_processes_for_user

router = APIRouter()


@router.get("", response_model=list[ProcessItem])
def list_processes(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lista os processos monitorados pelo advogado autenticado."""
    return list_processes_for_user(db, current_user["id"])


@router.get("/movements", response_model=dict[str, list[ProcessMovement]])
def list_movements(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Movimentações por processo.
    TODO: integrar com Escavador (escavador_client.listar_movimentacoes).
    """
    return {
        "1002345-67-2023-8-26-0100": [
            ProcessMovement(
                id="m1",
                datetime="15/04/2026 - 14:30",
                title="Expedição de Intimação",
                description="Para manifestação sobre o laudo pericial juntado às fls. 450/480.",
                sourceUrl="https://esaj.tjsp.jus.br",
            )
        ]
    }


@router.get("/checklist", response_model=dict[str, list[str]])
def list_checklist(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Checklist por processo.
    TODO: gerar via IA a partir das movimentações do Escavador.
    """
    return {
        "1002345-67-2023-8-26-0100": [
            "Analisar laudo pericial",
            "Consultar assistente técnico",
            "Protocolar petição (Réplica)",
        ]
    }
