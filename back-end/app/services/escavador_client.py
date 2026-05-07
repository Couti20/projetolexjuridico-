"""
Cliente para a API do Escavador.

Este arquivo está PREPARADO mas não ativo.
Quando a chave API estiver disponível, descomentar os métodos
e chamar a partir do process_service.py.

Documentação Escavador: https://api.escavador.com/docs
"""
import httpx
from app.config import settings


class EscavadorClient:
    def __init__(self):
        self.base_url = settings.ESCAVADOR_BASE_URL
        self.api_key = settings.ESCAVADOR_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    # TODO: descomentar quando a chave estiver disponível

    # async def buscar_processo(self, numero_cnj: str) -> dict:
    #     """Busca dados de um processo pelo número CNJ."""
    #     async with httpx.AsyncClient() as client:
    #         response = await client.get(
    #             f"{self.base_url}/processos/numero_cnj/{numero_cnj}",
    #             headers=self.headers,
    #         )
    #         response.raise_for_status()
    #         return response.json()

    # async def listar_movimentacoes(self, processo_id: int) -> list[dict]:
    #     """Lista movimentações de um processo."""
    #     async with httpx.AsyncClient() as client:
    #         response = await client.get(
    #             f"{self.base_url}/processos/{processo_id}/movimentacoes",
    #             headers=self.headers,
    #         )
    #         response.raise_for_status()
    #         return response.json().get("itens", [])

    # async def monitorar_processo(self, numero_cnj: str) -> dict:
    #     """Ativa monitoramento de um processo no Escavador."""
    #     async with httpx.AsyncClient() as client:
    #         response = await client.post(
    #             f"{self.base_url}/monitoramentos",
    #             headers=self.headers,
    #             json={"numero_cnj": numero_cnj},
    #         )
    #         response.raise_for_status()
    #         return response.json()


# Instância única — importar onde precisar
escavador = EscavadorClient()
