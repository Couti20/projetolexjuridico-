"""
Serviço de integração com a API Escavador V2.
Documentação: https://api.escavador.com/v2/docs/
Rate limit: 500 req/min.
"""
import httpx
from app.config import settings

BASE_URL = settings.ESCAVADOR_BASE_URL


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.ESCAVADOR_API_KEY}",
        "X-Requested-With": "XMLHttpRequest",
    }


async def buscar_processo(numero_cnj: str) -> dict:
    """
    Busca dados de um processo pelo número CNJ.
    Endpoint: GET /processos/numero_cnj/{numero}
    Retorna instâncias com classe, área, movimentações, partes.
    """
    url = f"{BASE_URL}/processos/numero_cnj/{numero_cnj}"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=_headers())
        response.raise_for_status()
        return response.json()


async def solicitar_atualizacao(numero_cnj: str) -> dict:
    """
    Solicita atualização assíncrona do processo no Tribunal.
    Endpoint: POST /processos/numero_cnj/{numero}/solicitar-atualizacao
    Retorna: { id, status: 'PENDENTE', numero_cnj, criado_em }
    """
    url = f"{BASE_URL}/processos/numero_cnj/{numero_cnj}/solicitar-atualizacao"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            url,
            headers=_headers(),
            json={"enviar_callback": 1},
        )
        response.raise_for_status()
        return response.json()


async def verificar_status_atualizacao(numero_cnj: str) -> dict:
    """
    Verifica status de uma atualização solicitada.
    Endpoint: GET /processos/numero_cnj/{numero}/status-atualizacao
    Status possíveis: PENDENTE | SUCESSO | NAO_ENCONTRADO | ERRO
    """
    url = f"{BASE_URL}/processos/numero_cnj/{numero_cnj}/status-atualizacao"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=_headers())
        response.raise_for_status()
        return response.json()


def extrair_dados_relevantes(payload: dict) -> dict:
    """
    Normaliza o payload bruto do Escavador para o modelo do Lex.
    Extrai da primeira instância encontrada (grau mais baixo).
    """
    instancias = payload.get("instancias", [])
    if not instancias:
        return {}

    inst = instancias[0]
    movimentacoes = inst.get("movimentacoes", [])
    ultima_mov = movimentacoes[0] if movimentacoes else {}

    return {
        "numero_cnj":        payload.get("numero_unico"),
        "classe_escavador":  inst.get("classe"),
        "area_escavador":    inst.get("area"),
        "orgao_julgador":    inst.get("orgao_julgador"),
        "data_distribuicao": inst.get("data_distribuicao"),
        "ultima_movimentacao": ultima_mov.get("conteudo"),
        "data_ultima_mov":   ultima_mov.get("data"),
    }
