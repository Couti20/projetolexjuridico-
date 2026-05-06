from typing import Annotated, Literal
from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

router = APIRouter()


TaskPriority = Literal["alta", "media", "baixa"]


class DailyTask(BaseModel):
    id: str
    processId: str
    processNumber: str
    title: str
    priority: TaskPriority
    dueDate: str | None = None
    done: bool = False


@router.get("/daily", response_model=list[DailyTask])
def get_daily_tasks(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retorna as tarefas do dia do advogado autenticado.
    TODO: gerar a partir das movimentações + prazos via Escavador.
    """
    return [
        DailyTask(
            id="t1",
            processId="1002345-67-2023-8-26-0100",
            processNumber="1002345-67.2023.8.26.0100",
            title="Analisar laudo pericial e protocolar réplica",
            priority="alta",
            dueDate="2026-05-10",
            done=False,
        ),
        DailyTask(
            id="t2",
            processId="1045231-88-2024-8-26-0100",
            processNumber="1045231-88.2024.8.26.0100",
            title="Verificar juntada de documento",
            priority="media",
            dueDate=None,
            done=False,
        ),
    ]
