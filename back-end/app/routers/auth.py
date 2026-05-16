"""Router de autenticação — cadastro, login e logout.

Melhorias de segurança:
- Logout real: jti do token é inserido na blacklist do banco.
- Rate limiting via SlowAPI: 6 tentativas/min no login, 3/min no register.
- Bloqueio cíclico por e-mail (login_attempt_service):
    até 5 falhas → sem bloqueio
    6ª falha     → bloqueio de 5 minutos
    após expirar, reinicia ciclo de 6 tentativas.
- Erros de bloqueio retornam retryAfter (segundos) e lockedUntil (ISO 8601)
  no corpo do erro para o front-end montar um contador regressivo.
- Todos os erros de autenticação retornam mensagem genérica
  para não vazar se o e-mail existe (user enumeration prevention).
"""
from datetime import datetime, timezone
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
import httpx
from jose import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import create_access_token, get_current_user
from app.models.token_blacklist import TokenBlacklist
from app.schemas.auth import (
    AuthUser,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.services.email_service import is_email_reset_configured, send_password_reset_email
from app.services.password_reset_service import (
    create_password_reset_request,
    reset_password_with_token,
)
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
logger = logging.getLogger(__name__)


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
            "retryAfter": retry_after,
            "lockedUntil": locked_until,
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
    1. Rate limit por IP (SlowAPI): 6 req/min
    2. Bloqueio cíclico por e-mail (6 falhas → 5 minutos).

    Quando bloqueado, a resposta 429 inclui:
      - detail      → mensagem com tempo restante
      - retryAfter  → segundos até poder tentar novamente
      - lockedUntil → data/hora exata em ISO 8601
      - header Retry-After (padrão HTTP)
    """
    # ── 1. Verifica bloqueio ativo ───────────────────────────────────────────
    try:
        is_locked, remaining_seconds, locked_until = check_lockout(db, payload.email)
    except SQLAlchemyError:
        # Tabela ainda não existe ou erro de BD → ignora bloqueio, não derruba o login
        is_locked, remaining_seconds, locked_until = False, 0, None

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
        try:
            failed_count, lockout_seconds, locked_until_iso = register_failure(db, payload.email)
        except SQLAlchemyError:
            # Tabela ainda não existe → apenas retorna credenciais inválidas
            failed_count, lockout_seconds, locked_until_iso = 0, 0, None

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
    try:
        reset_on_success(db, payload.email)
    except SQLAlchemyError:
        pass  # Tabela ainda não existe → ignora, login segue normalmente

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


@router.post("/forgot-password", response_model=ForgotPasswordResponse, status_code=200)
@limiter.limit(settings.RATE_LIMIT_FORGOT_PASSWORD)
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Solicita recuperação de senha por e-mail.
    Resposta é sempre genérica para evitar enumeração de usuários.
    """
    if not is_email_reset_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Recuperação de senha indisponível no momento. Contate o suporte.",
        )

    try:
        reset_data = create_password_reset_request(db, payload.email)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço temporariamente indisponível. Tente novamente em instantes.",
        )

    if reset_data is not None:
        user_email, full_name, token = reset_data
        try:
            send_password_reset_email(to_email=user_email, to_name=full_name, token=token)
        except (httpx.HTTPStatusError, httpx.RequestError):
            logger.exception("Falha ao enviar e-mail de recuperação de senha via Brevo")

    return ForgotPasswordResponse(
        message="Se existir uma conta para este e-mail, você receberá as instruções de recuperação."
    )


@router.post("/reset-password", status_code=200)
@limiter.limit(settings.RATE_LIMIT_RESET_PASSWORD)
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Redefine a senha a partir de token de recuperação de uso único."""
    try:
        reset_password_with_token(db, payload.token, payload.new_password)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço temporariamente indisponível. Tente novamente em instantes.",
        )
    except ValueError as exc:
        db.rollback()
        if str(exc) == "same_password":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="A nova senha não pode ser igual à senha atual.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperação inválido ou expirado.",
        )

    return {"ok": True, "message": "Senha redefinida com sucesso. Faça login com a nova senha."}
