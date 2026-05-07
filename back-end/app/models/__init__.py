# Importa todos os modelos para o Alembic detectar automaticamente
from app.models.user import User
from app.models.process import Process
from app.models.monitoring import Monitoring

__all__ = ["User", "Process", "Monitoring"]
