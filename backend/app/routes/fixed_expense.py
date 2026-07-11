from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.expense import Expense
from app.models.fixed_expense import FixedExpense
from app.models.fixed_expense_payment import FixedExpensePayment
from app.models.user import User
from app.schemas.fixed_expense import (
    FixedExpenseCreate,
    FixedExpenseOut,
    FixedExpenseUpdate,
)

router = APIRouter(
    prefix="/fixed-expenses",
    tags=["Fixed Expenses"],
)


def current_reference_month() -> str:
    return datetime.now().strftime("%Y-%m")


@router.post(
    "/",
    response_model=FixedExpenseOut,
    status_code=status.HTTP_201_CREATED,
)
def create_fixed_expense(
    data: FixedExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fixed_expense = FixedExpense(
        description=data.description.strip(),
        amount=data.amount,
        category=data.category.strip() if data.category else "Outros",
        due_day=data.due_day,
        recurrence=data.recurrence,
        is_active=data.is_active,
        user_id=current_user.id,
    )

    db.add(fixed_expense)
    db.commit()
    db.refresh(fixed_expense)

    fixed_expense.paid_this_month = False

    return fixed_expense


@router.get("/", response_model=list[FixedExpenseOut])
def list_fixed_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reference_month = current_reference_month()

    fixed_expenses = (
        db.query(FixedExpense)
        .filter(FixedExpense.user_id == current_user.id)
        .order_by(FixedExpense.due_day.asc())
        .all()
    )

    paid_ids = {
        payment.fixed_expense_id
        for payment in (
            db.query(FixedExpensePayment)
            .filter(
                FixedExpensePayment.user_id == current_user.id,
                FixedExpensePayment.reference_month == reference_month,
            )
            .all()
        )
    }

    return [
        {
            "id": item.id,
            "description": item.description,
            "amount": item.amount,
            "category": item.category,
            "due_day": item.due_day,
            "is_active": item.is_active,
            "created_at": item.created_at,
            "user_id": item.user_id,
            "paid_this_month": item.id in paid_ids,
            "recurrence": item.recurrence,
        }
        for item in fixed_expenses
    ]


@router.put("/{fixed_expense_id}", response_model=FixedExpenseOut)
def update_fixed_expense(
    fixed_expense_id: int,
    data: FixedExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fixed_expense = (
        db.query(FixedExpense)
        .filter(
            FixedExpense.id == fixed_expense_id,
            FixedExpense.user_id == current_user.id,
        )
        .first()
    )

    if not fixed_expense:
        raise HTTPException(
            status_code=404,
            detail="Despesa fixa não encontrada",
        )

    fixed_expense.description = data.description.strip()
    fixed_expense.amount = data.amount
    fixed_expense.category = (
        data.category.strip() if data.category else "Outros"
    )
    fixed_expense.due_day = data.due_day
    fixed_expense.recurrence = data.recurrence
    fixed_expense.is_active = data.is_active

    db.commit()
    db.refresh(fixed_expense)

    payment = (
        db.query(FixedExpensePayment)
        .filter(
            FixedExpensePayment.fixed_expense_id == fixed_expense.id,
            FixedExpensePayment.user_id == current_user.id,
            FixedExpensePayment.reference_month
            == current_reference_month(),
        )
        .first()
    )

    fixed_expense.paid_this_month = payment is not None

    return fixed_expense


@router.post("/{fixed_expense_id}/pay")
def pay_fixed_expense(
    fixed_expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fixed_expense = (
        db.query(FixedExpense)
        .filter(
            FixedExpense.id == fixed_expense_id,
            FixedExpense.user_id == current_user.id,
        )
        .first()
    )

    if not fixed_expense:
        raise HTTPException(
            status_code=404,
            detail="Despesa fixa não encontrada",
        )

    if not fixed_expense.is_active:
        raise HTTPException(
            status_code=400,
            detail="Essa despesa fixa está inativa",
        )

    reference_month = current_reference_month()

    already_paid = (
        db.query(FixedExpensePayment)
        .filter(
            FixedExpensePayment.fixed_expense_id == fixed_expense.id,
            FixedExpensePayment.user_id == current_user.id,
            FixedExpensePayment.reference_month == reference_month,
        )
        .first()
    )

    if already_paid:
        raise HTTPException(
            status_code=409,
            detail="Essa despesa já foi paga neste mês",
        )

    try:
        expense = Expense(
            description=fixed_expense.description,
            amount=fixed_expense.amount,
            category=fixed_expense.category or "Outros",
            user_id=current_user.id,
        )

        db.add(expense)
        db.flush()

        payment = FixedExpensePayment(
            fixed_expense_id=fixed_expense.id,
            expense_id=expense.id,
            user_id=current_user.id,
            reference_month=reference_month,
        )

        db.add(payment)
        db.commit()

        return {
            "message": "Despesa fixa paga com sucesso",
            "expense_id": expense.id,
            "reference_month": reference_month,
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Essa despesa já foi paga neste mês",
        )


@router.delete("/{fixed_expense_id}")
def delete_fixed_expense(
    fixed_expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fixed_expense = (
        db.query(FixedExpense)
        .filter(
            FixedExpense.id == fixed_expense_id,
            FixedExpense.user_id == current_user.id,
        )
        .first()
    )

    if not fixed_expense:
        raise HTTPException(
            status_code=404,
            detail="Despesa fixa não encontrada",
        )

    db.query(FixedExpensePayment).filter(
        FixedExpensePayment.fixed_expense_id == fixed_expense.id,
        FixedExpensePayment.user_id == current_user.id,
    ).delete()

    db.delete(fixed_expense)
    db.commit()

    return {"message": "Despesa fixa excluída com sucesso"}