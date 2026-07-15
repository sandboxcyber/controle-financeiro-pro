from pycoingecko import CoinGeckoAPI


cg = CoinGeckoAPI()


def buscar_criptos(texto: str) -> list[dict]:
    termo = texto.lower().strip()

    if len(termo) < 2:
        return []

    resposta = cg.search(termo)
    moedas = resposta.get("coins", [])

    return [
        {
            "symbol": f"{moeda.get('symbol', '').upper()}-USD",
            "name": moeda.get("name", ""),
            "exchange": "CoinGecko",
            "type": "CRYPTO",
            "id": moeda.get("id", ""),
        }
        for moeda in moedas[:15]
    ]


def encontrar_cripto(ticker: str) -> dict | None:
    simbolo = (
        ticker.upper()
        .replace("-USD", "")
        .replace("-BRL", "")
        .strip()
    )

    resultados = cg.search(simbolo).get("coins", [])

    for moeda in resultados:
        if moeda.get("symbol", "").upper() == simbolo:
            return {
                "id": moeda.get("id", ""),
                "symbol": moeda.get("symbol", "").upper(),
                "name": moeda.get("name", simbolo),
            }

    return None


def cotacao_cripto(ticker: str) -> dict | None:
    moeda = encontrar_cripto(ticker)

    if not moeda or not moeda["id"]:
        return None

    precos = cg.get_price(
        ids=moeda["id"],
        vs_currencies=["usd", "brl"],
        include_24hr_change=True,
    )

    dados = precos.get(moeda["id"], {})

    preco_usd = dados.get("usd")
    preco_brl = dados.get("brl")

    if preco_usd is None or preco_brl is None:
        return None

    cambio = (
        float(preco_brl) / float(preco_usd)
        if float(preco_usd) > 0
        else 1
    )

    return {
        "ticker": f'{moeda["symbol"]}-USD',
        "name": moeda["name"],
        "currency": "USD",
        "price": float(preco_usd),
        "exchange_rate": cambio,
        "price_brl": float(preco_brl),
        "exchange": "CoinGecko",
        "source": "coingecko",
        "change_24h": float(dados.get("usd_24h_change") or 0),
    }
