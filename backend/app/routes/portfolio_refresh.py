from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import yfinance as yf

from app.database.database import get_db
from app.core.dependencies import get_current_user
from app.models.investment import Investment
from app.models.user import User

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)

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

    atualizados = []

    for investimento in investimentos:

        try:

            ticker = yf.Ticker(investimento.ticker)

            preco = ticker.fast_info.get("lastPrice")

            if preco is None:
                continue

            investimento.current_price = float(preco)

            atualizados.append({
                "ticker": investimento.ticker,
                "price": round(float(preco),2)
            })

        except Exception:
            continue

    db.commit()

    return {
        "updated": len(atualizados),
        "assets": atualizados
    }
