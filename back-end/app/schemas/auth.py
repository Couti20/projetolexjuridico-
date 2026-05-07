from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    oab: str
    password: str


class AuthUser(BaseModel):
    id: str
    fullName: str
    email: str
    oab: str


class LoginResponse(BaseModel):
    user: AuthUser
    accessToken: str
    expiresIn: int
