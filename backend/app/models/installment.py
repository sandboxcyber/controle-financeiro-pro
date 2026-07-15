from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.database.database import Base


class Installment(Base):
    __tablename__ = "installments"

    id = Column(Integer, primary_key=True, index=True)

    description = Column(String, nullable=False)

    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)

    installment = Column(Integer, nullable=False)
    total_installments = Column(Integer, nullable=False)

    amount = Column(Float, nullable=False)

    due_month = Column(Integer, nullable=False)
    due_year = Column(Integer, nullable=False)

    paid = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
