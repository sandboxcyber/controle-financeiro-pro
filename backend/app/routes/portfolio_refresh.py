import requests
import yfinance as yf

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.investment import Investment
from app.models.user import User


router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


def cotacao_dolar() -> float:
    resposta = requests.get(
        "https://economia.awesomeapi.com.br/json/last/USD-BRL",
        timeout=10,
    )

    resposta.raise_for_status()

    return float(resposta.json()["USDBRL"]["bid"])


@router.put("/refresh")
def atualizar_carteira(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investimentos = (
        db.query(Investment)
        .filter(Investment.user_id == current_user.id)
        .all()
    )

    cambio = cotacao_dolar()
    atualizados = []
    erros = []

    for investimento in investimentos:
        try:
            if not investimento.ticker:
                continue

            ativo = yf.Ticker(investimento.ticker)
            info = ativo.fast_info

            preco_original = info.get("lastPrice")
            moeda_origem = str(
                info.get("currency") or "USD"
            ).upper()

            if preco_original is None:
                erros.append(investimento.ticker)
                continue

            preco_original = float(preco_original)
            moeda_exibicao = str(
                investimento.currency or "BRL"
            ).upper()

            if moeda_origem == moeda_exibicao:
                preco_salvo = preco_original

            elif moeda_origem == "USD" and moeda_exibicao == "BRL":
                preco_salvo = preco_original * cambio

            elif moeda_origem == "BRL" and moeda_exibicao == "USD":
                preco_salvo = preco_original / cambio

            else:
                preco_salvo = preco_original

            investimento.current_price = preco_salvo

            if moeda_origem == "USD" or moeda_exibicao == "USD":
                investimento.current_exchange_rate = cambio
            else:
                investimento.current_exchange_rate = 1

            atualizados.append({
                "ticker": investimento.ticker,
                "currency": moeda_exibicao,
                "price": round(preco_salvo, 8),
                "exchange_rate": round(cambio, 4),
            })

        except Exception:
            erros.append(investimento.ticker)

    db.commit()

    return {
        "updated": len(atualizados),
        "failed": len(erros),
        "exchange_rate": round(cambio, 4),
        "assets": atualizados,
        "errors": erros,
    }
