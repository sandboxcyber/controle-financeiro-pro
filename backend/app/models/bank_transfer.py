from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.database.database import Base


class BankTransfer(Base):
    __tablename__ = "bank_transfers"

    id = Column(Integer, primary_key=True)

    description = Column(String)

    amount = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    from_account = Column(Integer, ForeignKey("bank_accounts.id"))

    to_account = Column(Integer, ForeignKey("bank_accounts.id"))

    user_id = Column(Integer, ForeignKey("users.id"))
