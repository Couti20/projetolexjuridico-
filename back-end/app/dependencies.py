"""Dependências compartilhadas da Lex API.

Mudanças nesta versão:
- create_access_token agora gera um jti (JWT ID) único por token.
- get_current_user valida o token E verifica a blacklist no banco.
  Isso garante que tokens de logout sejam rejeitados imediatamente.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db

bearerScheme = HTTPBearer()


def create_access_token(data: dict) -> str:
    """Gera JWT com jti único para suportar blacklist no logout."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "iat": now,
        "exp": expire,
        "type": "access",
        "jti": str(uuid.uuid4()),  # JWT ID único — usado na blacklist
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearerScheme)],
    db: Session = Depends(get_db),
) -> dict:
    """Valida o JWT e garante que não foi revogado (logout real)."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão expirada ou inválida. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        if payload.get("type") != "access":
            raise credentials_exception

        user_id: str | None = payload.get("sub")
        jti: str | None = payload.get("jti")

        if user_id is None or jti is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # ── Verificação de blacklist (O(1) por índice primário) ──────────────────
    from app.models.token_blacklist import TokenBlacklist  # import local evita circular

    revoked = db.get(TokenBlacklist, jti)
    if revoked is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revogado. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"id": user_id, "email": payload.get("email", ""), "jti": jti}
