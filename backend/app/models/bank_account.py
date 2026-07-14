from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String, nullable=False)
    account_name = Column(String, nullable=False)
    account_type = Column(String, default="Conta corrente", nullable=False)
    balance = Column(Float, default=0, nullable=False)
    color = Column(String, default="#2563eb", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User")
