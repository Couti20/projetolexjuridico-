"""
Serviço de cálculo de prazos processuais em dias úteis.
Desconta sábados, domingos e feriados cadastrados na tabela `feriados`.
"""
from datetime import date, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.feriado import Feriado


# ── Tabela de prazos por classe processual (CPC + CLT + leis especiais) ──────
PRAZO_POR_CLASSE: dict[str, int] = {
    # Recursos
    "apelação":                             15,
    "agravo de instrumento":                15,
    "agravo interno":                       15,
    "agravo regimental":                    15,
    "embargos de declaração":               5,
    "recurso especial":                     15,
    "recurso extraordinário":               15,
    "recurso ordinário":                    15,
    "recurso ordinário trabalhista":        8,
    # Defesas / Manifestações
    "contestação":                          15,
    "réplica":                              15,
    "manifestação":                         5,
    "impugnação":                           15,
    # Ações originárias
    "ação trabalhista - rito ordinário":    8,
    "ação trabalhista - rito sumaríssimo":  5,
    "mandado de segurança":                 120,
    "habeas corpus":                        0,   # urgência — mesmo dia
    "execução fiscal":                      30,
    "exceção de pré-executividade":         5,
    "embargos à execução":                  15,
    "embargos de terceiro":                 15,
    # Fallback para classes não mapeadas
    "__default__":                          15,
}


def obter_prazo_dias(classe_escavador: Optional[str]) -> tuple[int, bool]:
    """
    Retorna (prazo_dias, prazo_estimado).
    prazo_estimado=True quando a classe não está na tabela → requer revisão manual.
    """
    if not classe_escavador:
        return (PRAZO_POR_CLASSE["__default__"], True)

    chave = classe_escavador.lower().strip()

    # Busca exata
    if chave in PRAZO_POR_CLASSE:
        return (PRAZO_POR_CLASSE[chave], False)

    # Busca parcial: "agravo de instrumento em recurso de revista" → "agravo de instrumento"
    for key, dias in PRAZO_POR_CLASSE.items():
        if key != "__default__" and key in chave:
            return (dias, False)

    return (PRAZO_POR_CLASSE["__default__"], True)


def calcular_data_prazo(
    data_inicio: date,
    prazo_dias: int,
    db: Session,
) -> date:
    """
    Calcula a data-limite somando `prazo_dias` dias ÚTEIS a partir de data_inicio.
    Feriados cadastrados no banco são tratados como dias não úteis.
    prazo_dias == 0 → retorna data_inicio (urgência).
    """
    if prazo_dias == 0:
        return data_inicio

    feriados_set = _carregar_feriados(db)
    dias_contados = 0
    data_atual = data_inicio

    while dias_contados < prazo_dias:
        data_atual += timedelta(days=1)
        if _e_dia_util(data_atual, feriados_set):
            dias_contados += 1

    return data_atual


def _e_dia_util(data: date, feriados: set) -> bool:
    """Retorna True se o dia é útil (seg–sex e não é feriado)."""
    return data.weekday() < 5 and data not in feriados


def _carregar_feriados(db: Session) -> set:
    """Carrega todos os feriados cadastrados no banco como um set de datas."""
    rows = db.query(Feriado.data).all()
    return {r.data for r in rows}
