"""Regras de negócio para usuários."""
import uuid
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models.user import User
from app.schemas.auth import AuthUser

pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__type="ID",
)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except (ValueError, TypeError):
        return False


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    """Busca usuário pelo UUID (chave primária). O(1) por índice."""
    return db.get(User, user_id)


def create_user(
    db: Session,
    full_name: str,
    email: str,
    plain_password: str,
    oab: str = "",
) -> User:
    user = User(
        id=str(uuid.uuid4()),
        full_name=full_name.strip(),
        email=email.lower(),
        oab=oab.strip().upper().replace(" ", ""),
        hashed_password=hash_password(plain_password),
        plan="light",
        setup_completed=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def complete_setup(db: Session, user_id: str, oab: str) -> User | None:
    """
    Marca o setup como concluído e persiste o OAB definitivo.
    Chamado pelo endpoint PUT /users/me/setup.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.oab = oab.strip().upper().replace(" ", "")
    user.setup_completed = True
    db.commit()
    db.refresh(user)
    return user


def to_auth_user(user: User) -> AuthUser:
    return AuthUser(
        id=user.id,
        fullName=user.full_name,
        email=user.email,
        oab=user.oab,
        setupCompleted=user.setup_completed,
    )
