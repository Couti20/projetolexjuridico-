"""Serviço de controle de tentativas de login por e-mail + IP.

Regra de bloqueio cíclico:
  - Até 5 falhas: sem bloqueio
  - Na 6ª falha: bloqueia por 5 minutos
  - Quando o bloqueio expira: contador volta para 0 automaticamente
    e o usuário ganha novamente 6 tentativas.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.login_attempt import LoginAttempt


_MAX_FAILURES_BEFORE_LOCK = 6
_LOCKOUT_MINUTES = 5


def _normalize_ip(ip_address: str | None) -> str:
    ip = (ip_address or "").strip()
    return ip or "unknown"


def _get_or_create(db: Session, email: str, ip_address: str | None) -> LoginAttempt:
    normalized_email = email.lower().strip()
    normalized_ip = _normalize_ip(ip_address)
    record = db.query(LoginAttempt).filter(
        LoginAttempt.email == normalized_email,
        LoginAttempt.ip_address == normalized_ip,
    ).first()
    if not record:
        record = LoginAttempt(
            email=normalized_email,
            ip_address=normalized_ip,
            failed_count=0,
            locked_until=None,
        )
        db.add(record)
        db.flush()
    return record


def _normalize_utc(dt: datetime) -> datetime:
    """Garante que o datetime tenha tzinfo UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def check_lockout(db: Session, email: str, ip_address: str | None) -> tuple[bool, int, str | None]:
    """Verifica se o e-mail está bloqueado.

    Returns:
        (is_locked, seconds_remaining, locked_until_iso)
        Se is_locked=False → seconds_remaining=0, locked_until_iso=None.
    """
    normalized_email = email.lower().strip()
    normalized_ip = _normalize_ip(ip_address)
    record = db.query(LoginAttempt).filter(
        LoginAttempt.email == normalized_email,
        LoginAttempt.ip_address == normalized_ip,
    ).first()
    if not record or not record.locked_until:
        return False, 0, None

    now = datetime.now(timezone.utc)
    locked_until = _normalize_utc(record.locked_until)

    if now < locked_until:
        remaining = int((locked_until - now).total_seconds())
        return True, remaining, locked_until.isoformat()

    # Bloqueio expirou — reinicia ciclo de tentativas
    record.failed_count = 0
    record.locked_until = None
    db.commit()
    return False, 0, None


def register_failure(db: Session, email: str, ip_address: str | None) -> tuple[int, int, str | None]:
    """Registra uma falha de login e aplica bloqueio se necessário.

    Returns:
        (failed_count, lockout_seconds, locked_until_iso)
        lockout_seconds=0 e locked_until_iso=None se não há bloqueio.
    """
    record = _get_or_create(db, email, ip_address)

    if record.locked_until:
        now = datetime.now(timezone.utc)
        locked_until = _normalize_utc(record.locked_until)
        if now >= locked_until:
            # Reinicia o ciclo se o lock já expirou
            record.failed_count = 0
            record.locked_until = None

    record.failed_count += 1

    locked_until_iso: str | None = None

    if record.failed_count >= _MAX_FAILURES_BEFORE_LOCK:
        locked_until = datetime.now(timezone.utc) + timedelta(minutes=_LOCKOUT_MINUTES)
        record.locked_until = locked_until
        locked_until_iso = locked_until.isoformat()
    else:
        record.locked_until = None

    db.commit()
    return record.failed_count, (_LOCKOUT_MINUTES * 60 if locked_until_iso else 0), locked_until_iso


def reset_on_success(db: Session, email: str, ip_address: str | None) -> None:
    """Zera o contador após login bem-sucedido."""
    normalized_email = email.lower().strip()
    normalized_ip = _normalize_ip(ip_address)
    record = db.query(LoginAttempt).filter(
        LoginAttempt.email == normalized_email,
        LoginAttempt.ip_address == normalized_ip,
    ).first()
    if record:
        record.failed_count = 0
        record.locked_until = None
        db.commit()
