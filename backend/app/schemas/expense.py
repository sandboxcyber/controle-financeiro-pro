from datetime import datetime

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: str | None = None


class ExpenseUpdate(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: str | None = None


class ExpenseOut(BaseModel):
    id: int
    description: str
    amount: float
    category: str | None
    paid_at: datetime
    user_id: int

    class Config:
        from_attributes = True