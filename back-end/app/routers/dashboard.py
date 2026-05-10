from datetime import date, timedelta
from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter()


class WeekLoad(BaseModel):
    day: str
    date: int
    count: int
    peak: bool


class NextTask(BaseModel):
    processId: str
    title: str
    reason: str


class DashboardOverview(BaseModel):
    criticalCount24h: int
    attentionCount72h: int
    futureCount30d: int
    weekLoad: list[WeekLoad]
    todayIndex: int
    aiInsight: str
    activeProcessesCount: int
    nextTask: NextTask


def _build_week_load() -> tuple[list[WeekLoad], int]:
    """Gera os dados da carga semanal a partir da data atual."""
    days_pt = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"]
    today = date.today()
    # Volta para segunda-feira da semana atual
    monday = today - timedelta(days=today.weekday())
    today_index = today.weekday()  # 0=SEG ... 6=DOM

    # TODO: substituir por contagem real do banco por dia
    mock_counts = [18, 19, 29, 14, 11, 4, 2]
    week_load = [
        WeekLoad(
            day=days_pt[i],
            date=(monday + timedelta(days=i)).day,
            count=mock_counts[i],
            peak=(mock_counts[i] == max(mock_counts)),
        )
        for i in range(7)
    ]
    return week_load, today_index


@router.get("", response_model=DashboardOverview)
def get_dashboard(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retorna resumo do painel do advogado autenticado.
    TODO: calcular métricas reais a partir do banco.
    """
    week_load, today_index = _build_week_load()

    return DashboardOverview(
        criticalCount24h=2,
        attentionCount72h=5,
        futureCount30d=20,
        weekLoad=week_load,
        todayIndex=today_index,
        aiInsight=(
            "Sua semana tem um pico na quarta-feira. "
            "Tente antecipar 2 prazos hoje para equilibrar a carga."
        ),
        activeProcessesCount=20,
        nextTask=NextTask(
            processId="1002345-67-2023-8-26-0100",
            title="Réplica do Processo 1002345-67",
            reason="É o prazo mais complexo da sua semana.",
        ),
    )
