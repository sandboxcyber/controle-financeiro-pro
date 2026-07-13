from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    brand = Column(String, default="Visa")

    color = Column(String, default="#2563eb")

    limit = Column(Float, default=0)

    closing_day = Column(Integer)

    due_day = Column(Integer)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User")

    used = Column(Float, default=0)