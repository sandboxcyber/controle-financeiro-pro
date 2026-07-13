from datetime import datetime

from pydantic import BaseModel, Field


class CardBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    brand: str = "Visa"
    color: str = "#2563eb"
    limit: float = Field(ge=0)
    used: float = Field(default=0, ge=0)
    closing_day: int = Field(ge=1, le=31)
    due_day: int = Field(ge=1, le=31)


class CardCreate(CardBase):
    pass


class CardUpdate(CardBase):
    pass


class CardResponse(CardBase):
    id: int
    user_id: int | None = None

    class Config:
        from_attributes = True


class CardExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: str = "Outros"


class CardExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    purchased_at: datetime
    card_id: int
    user_id: int

    class Config:
        from_attributes = True
