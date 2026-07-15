from fastapi import APIRouter
import requests

from app.services.coingecko_service import buscar_criptos

router = APIRouter(
    prefix="/market",
    tags=["Market Search"],
)


@router.get("/search/{query}")
def search(query: str):
    texto = query.strip()

    if len(texto) < 2:
        return []

    resultados = []

    try:
        url = (
            "https://query1.finance.yahoo.com/"
            f"v1/finance/search?q={texto}"
        )

        data = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0",
            },
        ).json()

        for item in data.get("quotes", [])[:10]:
            resultados.append({
                "symbol": item.get("symbol", ""),
                "name": (
                    item.get("shortname")
                    or item.get("longname")
                    or ""
                ),
                "exchange": item.get("exchange", ""),
                "type": item.get("quoteType", ""),
                "source": "yahoo",
                "coin_id": None,
            })

    except Exception:
        pass

    try:
        criptos = buscar_criptos(texto)

        for cripto in criptos:
            ja_existe = any(
                item["symbol"] == cripto["symbol"]
                for item in resultados
            )

            if not ja_existe:
                resultados.append({
                    "symbol": cripto["symbol"],
                    "name": cripto["name"],
                    "exchange": "CoinGecko",
                    "type": "CRYPTO",
                    "source": "coingecko",
                    "coin_id": cripto["id"],
                })

    except Exception:
        pass

    return resultados[:20]
