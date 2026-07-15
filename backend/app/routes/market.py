import requests
import yfinance as yf

from fastapi import APIRouter, HTTPException

from app.services.coingecko_service import cotacao_cripto


router = APIRouter(
    prefix="/market",
    tags=["Market"],
)


def cotacao_dolar() -> float:
    resposta = requests.get(
        "https://economia.awesomeapi.com.br/json/last/USD-BRL",
        timeout=10,
    )

    resposta.raise_for_status()

    return float(resposta.json()["USDBRL"]["bid"])


@router.get("/asset/{ticker}")
def asset(ticker: str):
    simbolo = ticker.upper().strip()

    try:
        ativo = yf.Ticker(simbolo)
        info = ativo.fast_info
        preco = info.get("lastPrice")

        if preco is not None:
            moeda = info.get("currency", "USD")
            cambio = cotacao_dolar()

            try:
                nome = ativo.info.get("longName", simbolo)
            except Exception:
                nome = simbolo

            preco_brl = (
                float(preco)
                if moeda == "BRL"
                else float(preco) * cambio
            )

            return {
                "ticker": simbolo,
                "name": nome,
                "currency": moeda,
                "price": round(float(preco), 8),
                "exchange_rate": round(cambio, 4),
                "price_brl": round(preco_brl, 8),
                "exchange": str(info.get("exchange", "")),
                "source": "yahoo",
                "change_24h": 0,
            }

    except Exception:
        pass

    try:
        cripto = cotacao_cripto(simbolo)

        if cripto:
            return cripto
    except Exception:
        pass

    raise HTTPException(
        status_code=404,
        detail="Não foi possível localizar a cotação desse ativo.",
    )
