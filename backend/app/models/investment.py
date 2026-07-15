from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    ticker = Column(String, default="")
    category = Column(String, default="Outros", nullable=False)
    institution = Column(String, default="")

    quantity = Column(Float, default=0, nullable=False)
    average_price = Column(Float, default=0, nullable=False)
    current_price = Column(Float, default=0, nullable=False)

    color = Column(String, default="#2563eb", nullable=False)


    asset_type = Column(String, default="stock")
    exchange = Column(String, default="")
    currency = Column(String, default="BRL")
    current_exchange_rate = Column(Float, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    user = relationship("User")
