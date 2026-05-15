"""Serviço de controle de bloqueio progressivo por tentativas de login.

Regra de bloqueio:
  - 1-4 falhas  → sem bloqueio
  - 5-9 falhas  → locked por 5 minutos
  - 10-14 falhas → locked por 15 minutos
  - 15-19 falhas → locked por 30 minutos
  - 20+ falhas  → locked por 60 minutos

O contador só é zerado após login bem-sucedido.
Cada vez que o usuário erra DENTRO do período bloqueado,
ele acumula mais uma falha (podendo subir de faixa).
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.login_attempt import LoginAttempt


# Tabela de faixas: (falhas_minimas, minutos_de_bloqueio)
_LOCKOUT_TIERS: list[tuple[int, int]] = [
    (20, 60),
    (15, 30),
    (10, 15),
    (5, 5),
]


def _lockout_minutes(failed_count: int) -> int:
    """Retorna quantos minutos bloquear baseado no total de falhas."""
    for threshold, minutes in _LOCKOUT_TIERS:
        if failed_count >= threshold:
            return minutes
    return 0  # menos de 5 falhas → sem bloqueio


def _get_or_create(db: Session, email: str) -> LoginAttempt:
    """Busca ou cria o registro de tentativas para o e-mail."""
    record = db.query(LoginAttempt).filter(LoginAttempt.email == email).first()
    if not record:
        record = LoginAttempt(email=email, failed_count=0, locked_until=None)
        db.add(record)
        db.flush()  # gera ID sem commit
    return record


def check_lockout(db: Session, email: str) -> tuple[bool, int]:
    """Verifica se o e-mail está bloqueado.

    Returns:
        (is_locked, seconds_remaining)
        Se is_locked=False, seconds_remaining=0.
    """
    record = db.query(LoginAttempt).filter(LoginAttempt.email == email).first()
    if not record or not record.locked_until:
        return False, 0

    now = datetime.now(timezone.utc)
    locked_until = record.locked_until

    # garante que locked_until tenha timezone
    if locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)

    if now < locked_until:
        remaining = int((locked_until - now).total_seconds())
        return True, remaining

    # bloqueio expirou — limpa locked_until mas MANTÉM o contador
    # (o desbloqueio automático não perdoa, só login correto perdoa)
    record.locked_until = None
    db.flush()
    return False, 0


def register_failure(db: Session, email: str) -> tuple[int, int]:
    """Registra uma falha de login e aplica bloqueio se necessário.

    Returns:
        (failed_count, lockout_seconds)
        lockout_seconds=0 se não há bloqueio ativo.
    """
    record = _get_or_create(db, email)
    record.failed_count += 1

    lockout_minutes = _lockout_minutes(record.failed_count)
    if lockout_minutes > 0:
        record.locked_until = datetime.now(timezone.utc) + timedelta(minutes=lockout_minutes)
    else:
        record.locked_until = None

    db.commit()
    return record.failed_count, lockout_minutes * 60


def reset_on_success(db: Session, email: str) -> None:
    """Zera o contador após login bem-sucedido."""
    record = db.query(LoginAttempt).filter(LoginAttempt.email == email).first()
    if record:
        record.failed_count = 0
        record.locked_until = None
        db.commit()
