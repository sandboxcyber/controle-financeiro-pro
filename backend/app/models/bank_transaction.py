from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.database.database import Base


class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="Outros")
    created_at = Column(DateTime, default=datetime.utcnow)

    bank_account_id = Column(
        Integer,
        ForeignKey("bank_accounts.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )
