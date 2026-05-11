from sqlalchemy import Column, Integer, Date, String
from app.database import Base


class Feriado(Base):
    __tablename__ = "feriados"

    id:          int = Column(Integer, primary_key=True, index=True)
    data         = Column(Date, unique=True, nullable=False)
    nome:        str = Column(String(100), nullable=False)
    abrangencia: str = Column(String(20), default="nacional")  # nacional | estadual | municipal
