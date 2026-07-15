from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer

from app.database.database import Base


class EmergencyFund(Base):
    __tablename__ = "emergency_fund"

    id = Column(Integer, primary_key=True, index=True)

    current_amount = Column(Float, default=0)

    target_amount = Column(Float, default=0)

    monthly_contribution = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
