from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# MySQL com PyMySQL (sem precisar compilar C++)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # verifica conexão antes de usar
    pool_recycle=300,         # recicla conexões a cada 5 min (evita timeout MySQL)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependência do FastAPI — abre e fecha sessão do banco automaticamente."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
