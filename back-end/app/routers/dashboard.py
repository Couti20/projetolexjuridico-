from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter()


class DashboardSummary(BaseModel):
    totalProcesses: int
    criticalCount: int
    attentionCount: int
    normalCount: int
    pendingTasks: int


@router.get("", response_model=DashboardSummary)
def get_dashboard(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retorna resumo do painel do advogado.
    TODO: calcular a partir dos dados reais do banco.
    """
    return DashboardSummary(
        totalProcesses=20,
        criticalCount=2,
        attentionCount=5,
        normalCount=13,
        pendingTasks=7,
    )
