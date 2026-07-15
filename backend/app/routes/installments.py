from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user

from app.models.installment import Installment
from app.models.card import Card
from app.models.user import User

router = APIRouter(
    prefix="/installments",
    tags=["Installments"],
)


@router.post("/")
def criar_parcelamento(
    dados: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    card = (
        db.query(Card)
        .filter(
            Card.id == dados["card_id"],
            Card.user_id == current_user.id,
        )
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Cartão não encontrado.",
        )

    parcelas = int(dados["installments"])

    if parcelas < 1:
        parcelas = 1

    valor_total = float(dados["amount"])

    valor_parcela = round(
        valor_total / parcelas,
        2,
    )

    hoje = datetime.now()

    for i in range(parcelas):

        mes = hoje.month + i
        ano = hoje.year

        while mes > 12:
            mes -= 12
            ano += 1

        db.add(
            Installment(
                description=dados["description"],
                card_id=card.id,
                installment=i + 1,
                total_installments=parcelas,
                amount=valor_parcela,
                due_month=mes,
                due_year=ano,
                user_id=current_user.id,
            )
        )

    card.used = float(card.used or 0) + valor_total

    db.commit()

    return {
        "message": "Parcelamento criado com sucesso."
    }


@router.get("/")
def listar_parcelas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Installment)
        .filter(
            Installment.user_id == current_user.id,
        )
        .order_by(
            Installment.due_year,
            Installment.due_month,
            Installment.installment,
        )
        .all()
    )
