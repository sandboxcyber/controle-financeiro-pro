from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0, nullable=False)
    deadline = Column(String, nullable=True)
    color = Column(String, default="#2563eb", nullable=False)
    icon = Column(String, default="🎯", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User")
