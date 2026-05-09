"""Router de usuários autenticados.

Endpoints:
- GET  /me           → retorna perfil completo do usuário logado
- PUT  /me/password  → troca de senha (valida senha atual antes)
"""
from datetime import timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.user import ChangePasswordRequest, UserProfileResponse
from app.services.user_service import (
    get_user_by_id,
    hash_password,
    verify_password,
)

router = APIRouter()


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


@router.put("/me/password", status_code=200)
def change_password(
    payload: ChangePasswordRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Troca a senha do usuário autenticado.

    Regras:
    - Valida que a senha atual está correta antes de qualquer alteração.
    - A nova senha não pode ser igual à atual.
    - Aplica hash Argon2 antes de persistir.
    """
    user = get_user_by_id(db, current_user["id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    # Valida senha atual
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual incorreta.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Impede reutilização da mesma senha
    if verify_password(payload.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A nova senha não pode ser igual à senha atual.",
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"ok": True, "message": "Senha atualizada com sucesso."}
