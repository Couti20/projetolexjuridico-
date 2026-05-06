from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.process import ProcessItem, ProcessMovement

router = APIRouter()

# ── Mock temporário (remover quando Escavador estiver integrado) ───────────────
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


@router.get("", response_model=list[ProcessItem])
def list_processes(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Lista os processos do advogado autenticado.
    TODO: filtrar por user_id e buscar do banco.
    """
    return MOCK_PROCESSES


@router.get("/movements", response_model=dict[str, list[ProcessMovement]])
def list_movements(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retorna mapa de movimentações por processo.
    TODO: integrar com Escavador webhooks.
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
    Retorna checklist de tarefas por processo.
    TODO: gerar checklist via IA a partir das movimentações.
    """
    return {
        "1002345-67-2023-8-26-0100": [
            "Analisar laudo pericial",
            "Consultar assistente técnico",
            "Protocolar petição (Réplica)",
        ]
    }
