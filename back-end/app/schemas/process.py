from typing import Literal
from pydantic import BaseModel


ProcessStatus = Literal["critico", "atencao", "normal"]


class ProcessItem(BaseModel):
    id: str
    number: str
    court: str
    claimant: str
    defendant: str
    district: str
    status: ProcessStatus
    latestMovementAt: str
    latestMovementTitle: str


class ProcessMovement(BaseModel):
    id: str
    datetime: str
    title: str
    description: str
    sourceUrl: str
