from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.config import settings
from app.database import get_db, engine
from app.dependencies import create_access_token, get_current_user
from app.schemas.auth import AuthUser, LoginRequest, LoginResponse, RegisterRequest
from app.services.user_service import (
    create_user,
    get_user_by_email,
    to_auth_user,
    verify_password,
)

router = APIRouter()


def _banco_acessivel() -> bool:
    """Verifica se o banco MySQL está online e acessível."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


@router.post("/register", response_model=LoginResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Cadastra novo advogado.
    Retorna JWT já autenticado (login automático após cadastro).
    """
    if not _banco_acessivel():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Banco de dados indisponível. Tente novamente em instantes.",
        )

    try:
        existing = get_user_by_email(db, payload.email)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Falha ao consultar o banco de dados. Verifique se as tabelas foram criadas.",
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
            oab="",
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
            detail="Falha ao gravar usuário no banco. Verifique estrutura da tabela users.",
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
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica o advogado.

    Regra de segurança:
    - Se o banco MySQL está online  → só aceita usuários cadastrados.
    - Se o banco está offline (ex: XAMPP desligado) → bloqueia tudo, sem exceção.
    - Mock foi completamente removido.
    """
    if not _banco_acessivel():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço temporariamente indisponível. Tente novamente em instantes.",
        )

    try:
        user = get_user_by_email(db, payload.email)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Falha ao consultar usuários no banco. Verifique conexão e migrações.",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

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


@router.post("/logout")
def logout(current_user: Annotated[dict, Depends(get_current_user)]):
    return {"ok": True}
