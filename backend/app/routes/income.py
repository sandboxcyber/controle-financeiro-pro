from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.income import Income
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeOut, IncomeUpdate

router = APIRouter(prefix="/incomes", tags=["Incomes"])


@router.post("/", response_model=IncomeOut, status_code=status.HTTP_201_CREATED)
def create_income(
    data: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = Income(
        description=data.description.strip(),
        amount=data.amount,
        category=data.category.strip() if data.category else "Outros",
        user_id=current_user.id,
    )

    db.add(income)
    db.commit()
    db.refresh(income)

    return income


@router.get("/", response_model=list[IncomeOut])
def list_incomes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Income)
        .filter(Income.user_id == current_user.id)
        .order_by(Income.received_at.desc())
        .all()
    )


@router.put("/{income_id}", response_model=IncomeOut)
def update_income(
    income_id: int,
    data: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == current_user.id,
        )
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Receita não encontrada",
        )

    income.description = data.description.strip()
    income.amount = data.amount
    income.category = data.category.strip() if data.category else "Outros"

    db.commit()
    db.refresh(income)

    return income


@router.delete("/{income_id}", status_code=status.HTTP_200_OK)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == current_user.id,
        )
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Receita não encontrada",
        )

    db.delete(income)
    db.commit()

    return {"message": "Receita excluída com sucesso"}