from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.bill import Bill
from app.models.user import User

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

@router.get("/")
def listar_notificacoes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    hoje = datetime.now().date()

    notificacoes = []

    contas = (
        db.query(Bill)
        .filter(Bill.user_id == current_user.id)
        .all()
    )

    for conta in contas:

        vencimento = conta.due_date.date()

        if conta.status == "Paga":
            continue

        if vencimento < hoje:
            notificacoes.append({
                "tipo":"atrasada",
                "titulo":"Conta atrasada",
                "descricao":conta.description,
                "dias":(hoje-vencimento).days,
                "valor":conta.amount
            })

        elif vencimento == hoje:
            notificacoes.append({
                "tipo":"hoje",
                "titulo":"Vence hoje",
                "descricao":conta.description,
                "dias":0,
                "valor":conta.amount
            })

        elif vencimento <= hoje + timedelta(days=3):
            notificacoes.append({
                "tipo":"proxima",
                "titulo":"Vence em breve",
                "descricao":conta.description,
                "dias":(vencimento-hoje).days,
                "valor":conta.amount
            })

    return sorted(
        notificacoes,
        key=lambda x:x["dias"]
    )
