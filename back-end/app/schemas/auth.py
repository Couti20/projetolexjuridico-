import re
from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=5, max_length=120)
    email: EmailStr
    oab: str = Field(min_length=6, max_length=30)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("oab")
    @classmethod
    def validate_oab(cls, value: str) -> str:
        normalized = re.sub(r"\s+", " ", value.strip().upper())
        if not re.fullmatch(r"[A-Z]{2}\s?\d{4,6}", normalized):
            raise ValueError("OAB inválida. Use o formato UF 123456.")
        return normalized.replace(" ", "")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("A senha deve conter ao menos 1 letra maiúscula.")
        if not re.search(r"[a-z]", value):
            raise ValueError("A senha deve conter ao menos 1 letra minúscula.")
        if not re.search(r"\d", value):
            raise ValueError("A senha deve conter ao menos 1 número.")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("A senha deve conter ao menos 1 caractere especial.")
        return value


class AuthUser(BaseModel):
    id: str
    fullName: str
    email: str
    oab: str


class LoginResponse(BaseModel):
    user: AuthUser
    accessToken: str
    expiresIn: int
