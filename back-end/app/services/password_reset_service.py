import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.models.password_reset_token import PasswordResetToken
from app.services.user_service import (
    get_user_by_email,
    get_user_by_id,
    hash_password,
    verify_password,
)
from app.services.refresh_token_service import revoke_all_user_refresh_sessions


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_password_reset_request(db: Session, email: str) -> tuple[str, str, str] | None:
    user = get_user_by_email(db, email)
    if not user or not user.is_active:
        return None

    now = datetime.now(timezone.utc)
    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_token(raw_token)
    expires_at = now + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_TTL_MINUTES)

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None),
    ).update({PasswordResetToken.used_at: now}, synchronize_session=False)

    entry = PasswordResetToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(entry)
    db.commit()

    return user.email, user.full_name, raw_token


def reset_password_with_token(db: Session, token: str, new_password: str) -> None:
    now = datetime.now(timezone.utc)
    token_hash = _hash_token(token)

    reset_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used_at.is_(None),
    ).first()

    if not reset_entry:
        raise ValueError("invalid_or_expired_token")

    expires_at = reset_entry.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= now:
        reset_entry.used_at = now
        db.commit()
        raise ValueError("invalid_or_expired_token")

    user = get_user_by_id(db, reset_entry.user_id)
    if not user or not user.is_active:
        reset_entry.used_at = now
        db.commit()
        raise ValueError("invalid_or_expired_token")

    if verify_password(new_password, user.hashed_password):
        raise ValueError("same_password")

    user.hashed_password = hash_password(new_password)
    user.token_invalid_before = now
    reset_entry.used_at = now
    revoke_all_user_refresh_sessions(db, user_id=user.id)

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None),
        PasswordResetToken.id != reset_entry.id,
    ).update({PasswordResetToken.used_at: now}, synchronize_session=False)

    db.commit()
