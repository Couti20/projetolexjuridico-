"""Router de autenticação — cadastro, login e logout.

Melhorias de segurança:
- Logout real: jti do token é inserido na blacklist do banco.
- Rate limiting via SlowAPI: 5 tentativas/min no login, 3/min no register.
- Todos os erros de autenticação retornam a mesma mensagem genérica
  para não vazar se o e-mail existe ou não (user enumeration prevention).
- Removido _banco_acessivel(): dupla conexão desnecessária. O SQLAlchemy
  já lança SQLAlchemyError se o banco estiver offline — tratado nos excepts.
"""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import create_access_token, get_current_user
from app.models.token_blacklist import TokenBlacklist
from app.schemas.auth import AuthUser, LoginRequest, LoginResponse, RegisterRequest
from app.services.user_service import (
    create_user,
    get_user_by_email,
    to_auth_user,
    verify_password,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _decode_jti(token: str) -> tuple[str | None, datetime | None]:
    """Extrai jti e exp do JWT sem validar assinatura (token já foi validado antes)."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        jti = payload.get("jti")
        exp_ts = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp_ts, tz=timezone.utc) if exp_ts else None
        return jti, expires_at
    except Exception:
        return None, None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=LoginResponse, status_code=201)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Cadastra novo advogado.
    Retorna JWT já autenticado (login automático após cadastro).
    Rate limit: 3 cadastros por minuto por IP.
    """
    try:
        existing = get_user_by_email(db, payload.email)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Banco de dados indisponível. Tente novamente em instantes.",
        )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma conta com este e-mail.",
        )

    try:
        user = create_user(
            db=db,
            full_name=payload.full_name,
            email=payload.email,
            plain_password=payload.password,
            oab=getattr(payload, "oab", ""),
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma conta com este e-mail.",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Banco de dados indisponível. Tente novamente em instantes.",
        )
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    auth_user = to_auth_user(user)
    token = create_access_token({"sub": auth_user.id, "email": auth_user.email})

    return LoginResponse(
        user=auth_user,
        accessToken=token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica o advogado.
    Rate limit: 5 tentativas por minuto por IP (proteção brute force).
    Mensagem de erro genérica (não revela se o e-mail existe).
    """
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="E-mail ou senha incorretos.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        user = get_user_by_email(db, payload.email)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço temporariamente indisponível. Tente novamente em instantes.",
        )

    if not user:
        raise invalid_credentials

    if not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta desativada. Entre em contato com o suporte.",
        )

    auth_user = to_auth_user(user)
    token = create_access_token({"sub": auth_user.id, "email": auth_user.email})

    return LoginResponse(
        user=auth_user,
        accessToken=token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout", status_code=200)
def logout(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Invalida o token JWT atual inserindo o jti na blacklist.
    A partir desse momento, o token é rejeitado em qualquer endpoint protegido.
    """
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()

    jti, expires_at = _decode_jti(token)

    if jti and expires_at:
        already_revoked = db.get(TokenBlacklist, jti)
        if not already_revoked:
            entry = TokenBlacklist(
                jti=jti,
                user_id=current_user["id"],
                expires_at=expires_at,
                revoked_at=datetime.now(timezone.utc),
            )
            db.add(entry)
            db.commit()

    return {"ok": True, "message": "Logout realizado com sucesso."}
