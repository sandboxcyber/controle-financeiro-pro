from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user

from app.models.bill import Bill
from app.models.card import Card
from app.models.goal import Goal
from app.models.user import User

router = APIRouter(
    prefix="/financial-score",
    tags=["Financial Score"],
)


@router.get("/")
def calcular_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    score = 1000

    contas = (
        db.query(Bill)
        .filter(Bill.user_id == current_user.id)
        .all()
    )

    cartoes = (
        db.query(Card)
        .filter(Card.user_id == current_user.id)
        .all()
    )

    metas = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    atrasadas = 0

    for conta in contas:
        if (
            conta.status != "Paga"
            and conta.due_date.date() < datetime.now().date()
        ):
            atrasadas += 1
            score -= 25

    utilizacao = 0

    limite = sum(float(c.limit or 0) for c in cartoes)
    usado = sum(float(c.used or 0) for c in cartoes)

    if limite > 0:
        utilizacao = round(usado / limite * 100, 1)

        if utilizacao > 90:
            score -= 100
        elif utilizacao > 70:
            score -= 50
        elif utilizacao < 30:
            score += 20

    metas_concluidas = 0

    for meta in metas:
        if (
            meta.target_amount > 0
            and meta.current_amount >= meta.target_amount
        ):
            metas_concluidas += 1
            score += 10

    score = max(0, min(1000, score))

    if score >= 900:
        nivel = "Excelente"

    elif score >= 750:
        nivel = "Muito Bom"

    elif score >= 600:
        nivel = "Bom"

    elif score >= 400:
        nivel = "Atenção"

    else:
        nivel = "Crítico"

    return {
        "score": score,
        "nivel": nivel,
        "contas_atrasadas": atrasadas,
        "utilizacao_cartoes": utilizacao,
        "metas_concluidas": metas_concluidas,
    }
