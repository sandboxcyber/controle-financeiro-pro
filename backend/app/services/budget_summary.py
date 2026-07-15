from sqlalchemy import func

from app.models.budget import Budget
from app.models.expense import Expense


def resumo_orcamentos(db, user_id):
    orcamentos = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .all()
    )

    resultado = {
        "total_limites": 0,
        "total_gasto": 0,
        "categorias": 0,
        "alertas": 0,
    }

    for item in orcamentos:
        gasto = (
            db.query(func.coalesce(func.sum(Expense.amount), 0))
            .filter(
                Expense.user_id == user_id,
                Expense.category == item.category,
            )
            .scalar()
        ) or 0

        resultado["categorias"] += 1
        resultado["total_limites"] += item.monthly_limit
        resultado["total_gasto"] += gasto

        if item.monthly_limit > 0:
            percentual = (gasto / item.monthly_limit) * 100

            if percentual >= 80:
                resultado["alertas"] += 1

    return resultado
