"""Regras de negócio para usuários."""
import uuid
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models.user import User
from app.schemas.auth import AuthUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, full_name: str, email: str, oab: str, plain_password: str) -> User:
    user = User(
        id=str(uuid.uuid4()),
        full_name=full_name,
        email=email.lower(),
        oab=oab,
        hashed_password=hash_password(plain_password),
        plan="light",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def to_auth_user(user: User) -> AuthUser:
    return AuthUser(
        id=user.id,
        fullName=user.full_name,
        email=user.email,
        oab=user.oab,
    )
