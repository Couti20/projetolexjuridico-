from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


def create_refresh_session(
    db: Session,
    *,
    user_id: str,
    jti: str,
    expires_at: datetime,
    ip_address: str | None,
    user_agent: str | None,
) -> RefreshToken:
    session = RefreshToken(
        jti=jti,
        user_id=user_id,
        issued_at=datetime.now(timezone.utc),
        expires_at=expires_at,
        revoked_at=None,
        replaced_by_jti=None,
        ip_address=ip_address,
        user_agent=(user_agent or "")[:255] or None,
    )
    db.add(session)
    return session


def revoke_refresh_session(
    db: Session,
    *,
    jti: str,
    replaced_by_jti: str | None = None,
) -> None:
    session = db.get(RefreshToken, jti)
    if session is None or session.revoked_at is not None:
        return
    session.revoked_at = datetime.now(timezone.utc)
    session.replaced_by_jti = replaced_by_jti


def revoke_all_user_refresh_sessions(db: Session, *, user_id: str) -> int:
    now = datetime.now(timezone.utc)
    updated = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None),
    ).update(
        {RefreshToken.revoked_at: now},
        synchronize_session=False,
    )
    return int(updated)
