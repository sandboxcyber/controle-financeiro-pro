import requests
import yfinance as yf

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.investment import Investment
from app.models.user import User


router = APIRouter(
    prefix="/market",
    tags=["Market Update"],
)


def cotacao_dolar() -> float:
    resposta = requests.get(
        "https://economia.awesomeapi.com.br/json/last/USD-BRL",
        timeout=10,
    )

    resposta.raise_for_status()

    return float(resposta.json()["USDBRL"]["bid"])


@router.put("/investment/{investment_id}/refresh")
def atualizar_investimento(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investimento = (
        db.query(Investment)
        .filter(
            Investment.id == investment_id,
            Investment.user_id == current_user.id,
        )
        .first()
    )

    if not investimento:
        raise HTTPException(
            status_code=404,
            detail="Investimento não encontrado.",
        )

    try:
        ativo = yf.Ticker(investimento.ticker)
        info = ativo.fast_info

        preco_original = info.get("lastPrice")
        moeda_origem = str(
            info.get("currency") or "USD"
        ).upper()

        if preco_original is None:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível obter a cotação.",
            )

        cambio = cotacao_dolar()
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

        db.commit()
        db.refresh(investimento)

        return investimento

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível atualizar a cotação.",
        )
