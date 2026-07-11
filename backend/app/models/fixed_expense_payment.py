from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)

from app.database.database import Base


class FixedExpensePayment(Base):
    __tablename__ = "fixed_expense_payments"

    id = Column(Integer, primary_key=True, index=True)

    fixed_expense_id = Column(
        Integer,
        ForeignKey("fixed_expenses.id"),
        nullable=False,
    )

    expense_id = Column(
        Integer,
        ForeignKey("expenses.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    reference_month = Column(
        String,
        nullable=False,
    )

    paid_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "fixed_expense_id",
            "reference_month",
            name="uq_fixed_expense_payment_month",
        ),
    )