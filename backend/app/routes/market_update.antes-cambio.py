from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user

from app.models.investment import Investment
from app.models.user import User

import yfinance as yf

router = APIRouter(
    prefix="/market",
    tags=["Market Update"],
)

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
        raise HTTPException(404, "Investimento não encontrado.")

    ticker = investimento.ticker

    ativo = yf.Ticker(ticker)

    preco = ativo.fast_info.get("lastPrice")

    if preco is None:
        raise HTTPException(
            400,
            "Não foi possível obter a cotação."
        )

    investimento.current_price = float(preco)

    db.commit()
    db.refresh(investimento)

    return investimento
