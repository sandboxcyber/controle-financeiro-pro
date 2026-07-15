from datetime import datetime

from pydantic import BaseModel, Field


class InvestmentBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    ticker: str = ""
    category: str = "Outros"
    institution: str = ""

    quantity: float = Field(default=0, ge=0)
    average_price: float = Field(default=0, ge=0)
    current_price: float = Field(default=0, ge=0)

    color: str = "#2563eb"

    asset_type: str = "stock"
    exchange: str = ""
    currency: str = "BRL"
    current_exchange_rate: float = Field(default=1, gt=0)


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
