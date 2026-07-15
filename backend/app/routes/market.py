import requests
import yfinance as yf

from fastapi import APIRouter

router = APIRouter(
    prefix="/market",
    tags=["Market"],
)


@router.get("/asset/{ticker}")
def asset(ticker: str):

    ticker = ticker.upper()

    try:

        ativo = yf.Ticker(ticker)

        info = ativo.fast_info

        moeda = info.get("currency", "USD")

        preco = info.get("lastPrice")

        nome = ticker

        try:
            nome = ativo.info.get("longName", ticker)
        except Exception:
            pass

        dolar = requests.get(
            "https://economia.awesomeapi.com.br/json/last/USD-BRL",
            timeout=10,
        ).json()

        cambio = float(
            dolar["USDBRL"]["bid"]
        )

        if moeda == "BRL":
            preco_brl = preco
        else:
            preco_brl = preco * cambio

        return {
            "ticker": ticker,
            "name": nome,
            "currency": moeda,
            "price": round(preco,2),
            "exchange_rate": round(cambio,4),
            "price_brl": round(preco_brl,2)
        }

    except Exception as e:

        return {
            "error": str(e)
        }
