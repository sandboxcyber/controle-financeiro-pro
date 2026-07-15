from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.database.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)

    description = Column(String, nullable=False)

    category = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    due_date = Column(DateTime, nullable=False)

    status = Column(String, default="Pendente")

    installments = Column(Integer, default=1)

    current_installment = Column(Integer, default=1)

    interest = Column(Float, default=0)

    fine = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
