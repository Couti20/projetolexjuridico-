"""
Seed de feriados nacionais brasileiros (2025–2027).
Executar uma única vez após criar a tabela `feriados`:

    cd back-end
    python -m scripts.seed_feriados
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import date
from app.database import SessionLocal
from app.models.feriado import Feriado

FERIADOS_NACIONAIS: list[tuple[date, str]] = [
    # 2025
    (date(2025,  1,  1), "Confraternização Universal"),
    (date(2025,  3,  3), "Carnaval"),
    (date(2025,  4, 18), "Sexta-Feira Santa"),
    (date(2025,  4, 21), "Tiradentes"),
    (date(2025,  5,  1), "Dia do Trabalho"),
    (date(2025,  6, 19), "Corpus Christi"),
    (date(2025,  9,  7), "Independência do Brasil"),
    (date(2025, 10, 12), "Nossa Sra. Aparecida"),
    (date(2025, 11,  2), "Finados"),
    (date(2025, 11, 15), "Proclamação da República"),
    (date(2025, 12, 25), "Natal"),
    # 2026
    (date(2026,  1,  1), "Confraternização Universal"),
    (date(2026,  2, 16), "Carnaval"),
    (date(2026,  4,  3), "Sexta-Feira Santa"),
    (date(2026,  4, 21), "Tiradentes"),
    (date(2026,  5,  1), "Dia do Trabalho"),
    (date(2026,  6,  4), "Corpus Christi"),
    (date(2026,  9,  7), "Independência do Brasil"),
    (date(2026, 10, 12), "Nossa Sra. Aparecida"),
    (date(2026, 11,  2), "Finados"),
    (date(2026, 11, 15), "Proclamação da República"),
    (date(2026, 12, 25), "Natal"),
    # 2027
    (date(2027,  1,  1), "Confraternização Universal"),
    (date(2027,  3,  1), "Carnaval"),
    (date(2027,  3, 26), "Sexta-Feira Santa"),
    (date(2027,  4, 21), "Tiradentes"),
    (date(2027,  5,  1), "Dia do Trabalho"),
    (date(2027,  5, 27), "Corpus Christi"),
    (date(2027,  9,  7), "Independência do Brasil"),
    (date(2027, 10, 12), "Nossa Sra. Aparecida"),
    (date(2027, 11,  2), "Finados"),
    (date(2027, 11, 15), "Proclamação da República"),
    (date(2027, 12, 25), "Natal"),
]


def seed():
    db = SessionLocal()
    inseridos = 0
    try:
        for data, nome in FERIADOS_NACIONAIS:
            existe = db.query(Feriado).filter(Feriado.data == data).first()
            if not existe:
                db.add(Feriado(data=data, nome=nome, abrangencia="nacional"))
                inseridos += 1
        db.commit()
        print(f"✅ Seed concluído: {inseridos} feriados inseridos.")
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao inserir feriados: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
