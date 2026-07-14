from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.database.database import Base


class GoalContribution(Base):
    __tablename__ = "goal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, default="Depósito na meta")
    created_at = Column(DateTime, default=datetime.utcnow)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
