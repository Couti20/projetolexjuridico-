"""Router de usuários autenticados.

Endpoints:
- GET  /me           → retorna perfil completo do usuário logado
- PUT  /me/setup     → marca setup como concluído e persiste OAB
- PUT  /me/password  → troca de senha (valida senha atual antes)
"""
from datetime import timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.user import ChangePasswordRequest, UserProfileResponse
from app.services.user_service import (
    complete_setup,
    get_user_by_id,
    hash_password,
    verify_password,
    to_auth_user,
)

router = APIRouter()


class SetupRequest(BaseModel):
    oab: str = Field(min_length=4, max_length=30, description="Número OAB do advogado")
    whatsapp: str = Field(min_length=10, max_length=20, description="Número WhatsApp E.164")


@router.get("/me", response_model=UserProfileResponse)
def get_me(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Retorna os dados completos do usuário autenticado.
    Requer Bearer token válido no header Authorization.
    """
    user = get_user_by_id(db, current_user["id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    return UserProfileResponse(
        id=user.id,
        fullName=user.full_name,
        email=user.email,
        oab=user.oab,
        plan=user.plan,
        created_at=user.created_at.replace(tzinfo=timezone.utc).isoformat(),
    )


@router.put("/me/setup", response_model=AuthUser)
def finish_setup(
    payload: SetupRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Marca o onboarding como concluído.
    - Persiste o OAB definitivo no banco.
    - Define setup_completed = True (persiste entre dispositivos).
    - Retorna AuthUser atualizado para o front sincronizar o estado.
    """
    user = complete_setup(db, current_user["id"], payload.oab)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
    return to_auth_user(user)


@router.put("/me/password", status_code=200)
def change_password(
    payload: ChangePasswordRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Troca a senha do usuário autenticado.
    Valida que a senha atual está correta antes de qualquer alteração.
    """
    user = get_user_by_id(db, current_user["id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual incorreta.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if verify_password(payload.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A nova senha não pode ser igual à senha atual.",
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"ok": True, "message": "Senha atualizada com sucesso."}
