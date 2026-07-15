from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user

from app.models.investment import Investment
from app.models.user import User

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.get("/summary")
def resumo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    investimentos = (
        db.query(Investment)
        .filter(
            Investment.user_id == current_user.id
        )
        .all()
    )

    total = 0

    categorias = {}
    moedas = {}

    for ativo in investimentos:

        valor = float(
            ativo.quantity * ativo.current_price
        )

        total += valor

        categoria = getattr(
            ativo,
            "category",
            "Outros",
        )

        categorias[categoria] = (
            categorias.get(categoria, 0)
            + valor
        )

        moeda = getattr(
            ativo,
            "currency",
            "BRL",
        )

        moedas[moeda] = (
            moedas.get(moeda, 0)
            + valor
        )

    distribuicao = []

    for categoria, valor in categorias.items():

        percentual = 0

        if total > 0:
            percentual = round(
                valor / total * 100,
                2,
            )

        distribuicao.append({
            "categoria": categoria,
            "valor": valor,
            "percentual": percentual,
        })

    return {
        "patrimonio": round(total,2),
        "categorias": distribuicao,
        "moedas": moedas,
    }
