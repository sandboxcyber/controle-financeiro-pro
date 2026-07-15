from pycoingecko import CoinGeckoAPI


cg = CoinGeckoAPI()


def buscar_criptos(texto: str) -> list[dict]:
    termo = texto.lower().strip()

    if len(termo) < 2:
        return []

    resposta = cg.search(termo)
    moedas = resposta.get("coins", [])

    resultados = []

    for moeda in moedas[:15]:
        resultados.append(
            {
                "symbol": f"{moeda.get('symbol', '').upper()}-USD",
                "name": moeda.get("name", ""),
                "exchange": "CoinGecko",
                "type": "CRYPTO",
                "id": moeda.get("id", ""),
            }
        )

    return resultados
