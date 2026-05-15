"""Router de autenticação — cadastro, login e logout.

Melhorias de segurança:
- Logout real: jti do token é inserido na blacklist do banco.
- Rate limiting via SlowAPI: 5 tentativas/min no login, 3/min no register.
- Bloqueio progressivo por e-mail (login_attempt_service):
    1-4 falhas   → sem bloqueio
    5-9 falhas   → bloqueado 5 minutos
    10-14 falhas → bloqueado 15 minutos
    15-19 falhas → bloqueado 30 minutos
    20+ falhas   → bloqueado 60 minutos
  O contador SÓ é zerado após login bem-sucedido.
- Erros de bloqueio retornam retryAfter (segundos) e lockedUntil (ISO 8601)
  no corpo do erro para o front-end montar um contador regressivo.
- Todos os erros de autenticação retornam mensagem genérica
  para não vazar se o e-mail existe (user enumeration prevention).
"""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
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
from app.services.login_attempt_service import (
    check_lockout,
    register_failure,
    reset_on_success,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ── Helpers ─────────────────────────────────────────────────────────────────

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


def _fmt_time(seconds: int) -> str:
    """Formata segundos em texto legível: '5 minutos', '1 minuto e 30 segundos', etc."""
    minutes = seconds // 60
    secs = seconds % 60
    if minutes > 0 and secs > 0:
        return f"{minutes} minuto(s) e {secs} segundo(s)"
    if minutes > 0:
        return f"{minutes} minuto(s)"
    return f"{secs} segundo(s)"


def _lockout_response(detail: str, retry_after: int, locked_until: str | None) -> JSONResponse:
    """Monta um JSONResponse 429 com retryAfter e lockedUntil para o front-end."""
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": detail,
            "retryAfter": retry_after,       # segundos restantes de bloqueio
            "lockedUntil": locked_until,     # ISO 8601 — ex: "2026-05-14T22:15:00+00:00"
        },
        headers={"Retry-After": str(retry_after)},
    )


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

    Proteções ativas:
    1. Rate limit por IP (SlowAPI): 5 req/min
    2. Bloqueio progressivo por e-mail (login_attempt_service).

    Quando bloqueado, a resposta 429 inclui:
      - detail      → mensagem com tempo restante
      - retryAfter  → segundos até poder tentar novamente
      - lockedUntil → data/hora exata em ISO 8601
      - header Retry-After (padrão HTTP)
    """
    # ── 1. Verifica se o e-mail já está bloqueado ───────────────────────────
    is_locked, remaining_seconds, locked_until = check_lockout(db, payload.email)
    if is_locked:
        return _lockout_response(
            detail=f"Conta bloqueada por excesso de tentativas. Tente novamente em {_fmt_time(remaining_seconds)}.",
            retry_after=remaining_seconds,
            locked_until=locked_until,
        )

    # ── 2. Busca o usuário ────────────────────────────────────────────────────
    try:
        user = get_user_by_email(db, payload.email)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço temporariamente indisponível. Tente novamente em instantes.",
        )

    # ── 3. Valida credenciais ─────────────────────────────────────────────────
    if not user or not verify_password(payload.password, user.hashed_password):
        failed_count, lockout_seconds, locked_until_iso = register_failure(db, payload.email)

        if lockout_seconds > 0:
            return _lockout_response(
                detail=(
                    f"E-mail ou senha incorretos. "
                    f"Muitas tentativas falhas — conta bloqueada por {_fmt_time(lockout_seconds)}."
                ),
                retry_after=lockout_seconds,
                locked_until=locked_until_iso,
            )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 4. Conta desativada ───────────────────────────────────────────────────
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta desativada. Entre em contato com o suporte.",
        )

    # ── 5. Login bem-sucedido → zera contador ─────────────────────────────────
    reset_on_success(db, payload.email)

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
