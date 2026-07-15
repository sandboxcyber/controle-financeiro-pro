from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.user import User
from app.schemas.budget import (
    BudgetCreate,
    BudgetResponse,
    BudgetUpdate,
)

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"],
)


def buscar_orcamento(
    budget_id: int,
    user_id: int,
    db: Session,
) -> Budget:
    orcamento = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
        .first()
    )

    if not orcamento:
        raise HTTPException(
            status_code=404,
            detail="Orçamento não encontrado.",
        )

    return orcamento


def inicio_mes_atual() -> datetime:
    agora = datetime.now()
    return datetime(agora.year, agora.month, 1)


@router.get("/")
def listar_orcamentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inicio_mes = inicio_mes_atual()

    orcamentos = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.category.asc())
        .all()
    )

    resultado = []

    for item in orcamentos:
        consulta_gasto = (
            db.query(func.coalesce(func.sum(Expense.amount), 0))
            .filter(
                Expense.user_id == current_user.id,
                Expense.category == item.category,
            )
        )

        if hasattr(Expense, "created_at"):
            consulta_gasto = consulta_gasto.filter(
                Expense.created_at >= inicio_mes
            )
        elif hasattr(Expense, "paid_at"):
            consulta_gasto = consulta_gasto.filter(
                Expense.paid_at >= inicio_mes
            )

        gasto = consulta_gasto.scalar()

        gasto = float(gasto or 0)
        limite = float(item.monthly_limit or 0)

        percentual = (
            min((gasto / limite) * 100, 999)
            if limite > 0
            else 0
        )

        resultado.append(
            {
                "id": item.id,
                "category": item.category,
                "monthly_limit": limite,
                "color": item.color,
                "created_at": item.created_at,
                "user_id": item.user_id,
                "spent": gasto,
                "remaining": max(limite - gasto, 0),
                "percentage": percentual,
                "exceeded": gasto > limite,
            }
        )

    return resultado


@router.post(
    "/",
    response_model=BudgetResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_orcamento(
    dados: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categoria = dados.category.strip()

    if not categoria:
        raise HTTPException(
            status_code=400,
            detail="Informe a categoria.",
        )

    existente = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category == categoria,
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Já existe um orçamento para essa categoria.",
        )

    if dados.monthly_limit <= 0:
        raise HTTPException(
            status_code=400,
            detail="O limite mensal deve ser maior que zero.",
        )

    novo = Budget(
        category=categoria,
        monthly_limit=dados.monthly_limit,
        color=dados.color,
        user_id=current_user.id,
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo


@router.put(
    "/{budget_id}",
    response_model=BudgetResponse,
)
def editar_orcamento(
    budget_id: int,
    dados: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orcamento = buscar_orcamento(
        budget_id,
        current_user.id,
        db,
    )

    categoria = dados.category.strip()

    conflito = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category == categoria,
            Budget.id != budget_id,
        )
        .first()
    )

    if conflito:
        raise HTTPException(
            status_code=400,
            detail="Já existe outro orçamento para essa categoria.",
        )

    orcamento.category = categoria
    orcamento.monthly_limit = dados.monthly_limit
    orcamento.color = dados.color

    db.commit()
    db.refresh(orcamento)

    return orcamento


@router.delete(
    "/{budget_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_orcamento(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orcamento = buscar_orcamento(
        budget_id,
        current_user.id,
        db,
    )

    db.delete(orcamento)
    db.commit()
