from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import create_access_token, get_current_user
from app.schemas.auth import AuthUser, LoginRequest, LoginResponse
from app.config import settings

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """
    Autentica o advogado com e-mail e senha.
    Retorna JWT + dados do usuário.

    TODO: substituir mock por consulta real ao banco.
    """
    # ── Mock temporário (remover quando banco estiver pronto) ──────────────────
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    user = AuthUser(
        id=f"user-{payload.email}",
        fullName=payload.email.split("@")[0].replace(".", " ").title(),
        email=payload.email,
        oab="OAB/SP 123.456",  # TODO: buscar do banco
    )

    token = create_access_token({"sub": user.id, "email": user.email})

    return LoginResponse(
        user=user,
        accessToken=token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
def logout(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Logout — invalida sessão no cliente.
    JWT é stateless; o front remove o token do localStorage.
    """
    return {"ok": True}
