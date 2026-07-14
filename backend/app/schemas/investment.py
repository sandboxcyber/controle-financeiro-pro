from datetime import datetime

from pydantic import BaseModel, Field


class InvestmentBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    ticker: str = ""
    category: str = "Outros"
    institution: str = ""
    quantity: float = Field(ge=0)
    average_price: float = Field(ge=0)
    current_price: float = Field(ge=0)
    color: str = "#2563eb"


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(InvestmentBase):
    pass


class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
