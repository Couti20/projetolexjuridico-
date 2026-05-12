"""
Testes unitários — prazo_service.py
Executar: cd back-end && pytest tests/test_prazo_service.py -v
"""
from datetime import date
from unittest.mock import MagicMock
import pytest

from app.services.prazo_service import (
    obter_prazo_dias,
    calcular_data_prazo,
)


# ── obter_prazo_dias ──────────────────────────────────────────────────────────

def test_prazo_contestacao():
    dias, estimado = obter_prazo_dias("Contestação")
    assert dias == 15
    assert estimado is False


def test_prazo_embargos_declaracao():
    dias, estimado = obter_prazo_dias("Embargos de Declaração")
    assert dias == 5
    assert estimado is False


def test_prazo_apelacao_case_insensitive():
    dias, estimado = obter_prazo_dias("APELAÇÃO")
    assert dias == 15
    assert estimado is False


def test_prazo_busca_parcial():
    # "Agravo de Instrumento em Recurso de Revista" deve mapear para "agravo de instrumento"
    dias, estimado = obter_prazo_dias("Agravo de Instrumento em Recurso de Revista")
    assert dias == 15
    assert estimado is False


def test_prazo_classe_desconhecida():
    dias, estimado = obter_prazo_dias("Ação Inexistente XYZ 9999")
    assert dias == 15
    assert estimado is True


def test_prazo_none_retorna_default():
    dias, estimado = obter_prazo_dias(None)
    assert dias == 15
    assert estimado is True


def test_prazo_habeas_corpus_zero():
    dias, estimado = obter_prazo_dias("Habeas Corpus")
    assert dias == 0
    assert estimado is False


# ── calcular_data_prazo ───────────────────────────────────────────────────────

def _mock_db_sem_feriados():
    db = MagicMock()
    db.query.return_value.all.return_value = []
    return db


def test_prazo_zero_retorna_mesmo_dia():
    db = _mock_db_sem_feriados()
    inicio = date(2026, 5, 11)  # segunda-feira
    resultado = calcular_data_prazo(inicio, 0, db)
    assert resultado == inicio


def test_calculo_5_dias_uteis_sem_feriado():
    db = _mock_db_sem_feriados()
    # Sexta 08/05/2026 + 5 dias úteis → Sexta 15/05/2026
    inicio = date(2026, 5, 8)
    resultado = calcular_data_prazo(inicio, 5, db)
    assert resultado == date(2026, 5, 15)


def test_calculo_pula_fim_de_semana():
    db = _mock_db_sem_feriados()
    # Quinta 07/05/2026 + 1 dia útil → Sexta 08/05/2026 (não sábado)
    inicio = date(2026, 5, 7)
    resultado = calcular_data_prazo(inicio, 1, db)
    assert resultado == date(2026, 5, 8)


def test_calculo_pula_feriado():
    # Simula feriado na sexta 08/05/2026
    db = MagicMock()
    feriado_mock = MagicMock()
    feriado_mock.data = date(2026, 5, 8)
    db.query.return_value.all.return_value = [feriado_mock]

    # Quinta 07/05/2026 + 1 dia útil → pula sexta (feriado) → segunda 11/05/2026
    inicio = date(2026, 5, 7)
    resultado = calcular_data_prazo(inicio, 1, db)
    assert resultado == date(2026, 5, 11)
