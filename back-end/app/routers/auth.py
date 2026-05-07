from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import create_access_token, get_current_user
from app.schemas.auth import AuthUser, LoginRequest, LoginResponse
from app.config import settings
from app.services.user_service import get_user_by_email, verify_password, to_auth_user

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica o advogado com e-mail e senha.
    1º tenta banco real; se banco vazio cai no mock de desenvolvimento.
    """
    user = get_user_by_email(db, payload.email)

    if user:
        # ── Banco real ─────────────────────────────────────────────────────────
        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos.",
            )
        auth_user = to_auth_user(user)
    else:
        # ── Mock (desenvolvimento — remover em produção) ────────────────────────
        if len(payload.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos.",
            )
        auth_user = AuthUser(
            id=f"mock-{payload.email}",
            fullName=payload.email.split("@")[0].replace(".", " ").title(),
            email=payload.email,
            oab="OAB/SP 000.000",
        )

    token = create_access_token({"sub": auth_user.id, "email": auth_user.email})

    return LoginResponse(
        user=auth_user,
        accessToken=token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
def logout(current_user: Annotated[dict, Depends(get_current_user)]):
    return {"ok": True}
