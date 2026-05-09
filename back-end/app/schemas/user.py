"""Schemas de usuário para perfil e troca de senha."""
import re
from pydantic import BaseModel, Field, field_validator


class UserProfileResponse(BaseModel):
    """Retorno do GET /me."""
    id: str
    fullName: str
    email: str
    oab: str
    plan: str
    created_at: str  # ISO 8601


class ChangePasswordRequest(BaseModel):
    """Payload do PUT /me/password."""
    current_password: str = Field(min_length=1, description="Senha atual do usuário")
    new_password: str = Field(min_length=8, max_length=128, description="Nova senha")

    @field_validator("new_password")
    @classmethod
    def validate_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("A nova senha deve conter ao menos 1 letra maiúscula.")
        if not re.search(r"[a-z]", value):
            raise ValueError("A nova senha deve conter ao menos 1 letra minúscula.")
        if not re.search(r"\d", value):
            raise ValueError("A nova senha deve conter ao menos 1 número.")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("A nova senha deve conter ao menos 1 caractere especial.")
        return value
