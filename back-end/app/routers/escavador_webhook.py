"""
Webhook para receber callbacks da API Escavador.
Quando o Escavador conclui a atualização de um processo, este endpoint é
chamado e o processo correspondente no banco é atualizado automaticamente.

Configurar no painel Escavador:
  URL: https://<seu-dominio>/api/v1/escavador/callback
  Token de segurança: valor de ESCAVADOR_CALLBACK_SECRET no .env
"""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.process import Process
from app.services.escavador_service import extrair_dados_relevantes
from app.services.prazo_service import calcular_data_prazo, obter_prazo_dias

router = APIRouter(prefix="/api/v1/escavador", tags=["Escavador Webhook"])


@router.post("/callback", summary="Webhook — recebe atualizações do Escavador")
async def receber_callback(request: Request, db: Session = Depends(get_db)):
    """
    1. Valida o token de segurança enviado pelo Escavador.
    2. Ignora eventos que não sejam de atualização de processo.
    3. Localiza o processo pelo número CNJ.
    4. Atualiza classe, área, movimentação, prazo e data-limite.
    """
    # 1. Autenticar callback
    auth_header = request.headers.get("Authorization", "")
    if auth_header != settings.ESCAVADOR_CALLBACK_SECRET:
        raise HTTPException(status_code=401, detail="Callback não autorizado")

    payload = await request.json()
    evento = payload.get("event", "")

    # 2. Filtrar eventos relevantes
    if evento not in ("resultado_processo_async", "update_time"):
        return {"status": "ignored", "evento": evento}

    dados = extrair_dados_relevantes(payload.get("processo", payload))
    numero_cnj = dados.get("numero_cnj")
    if not numero_cnj:
        raise HTTPException(status_code=422, detail="numero_cnj ausente no payload")

    # 3. Localizar processo
    processo = db.query(Process).filter(Process.numero_cnj == numero_cnj).first()
    if not processo:
        return {"status": "not_tracked", "numero_cnj": numero_cnj}

    # 4. Atualizar campos
    processo.classe_escavador   = dados.get("classe_escavador")
    processo.area_escavador     = dados.get("area_escavador")
    processo.orgao_julgador     = dados.get("orgao_julgador")
    processo.ultima_movimentacao = dados.get("ultima_movimentacao")
    processo.data_ultima_mov    = dados.get("data_ultima_mov")

    prazo_dias, estimado = obter_prazo_dias(dados.get("classe_escavador"))
    processo.prazo_dias      = prazo_dias
    processo.prazo_estimado  = estimado
    processo.data_prazo      = calcular_data_prazo(date.today(), prazo_dias, db)
    processo.escavador_sync_at = date.today()

    db.commit()
    return {"status": "updated", "numero_cnj": numero_cnj}
