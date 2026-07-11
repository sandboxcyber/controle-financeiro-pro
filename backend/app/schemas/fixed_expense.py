from datetime import datetime

from pydantic import BaseModel, Field


class FixedExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: str | None = None
    due_day: int = Field(ge=1, le=31)
    is_active: bool = True
    recurrence: str = "Mensal"


class FixedExpenseUpdate(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: str | None = None
    due_day: int = Field(ge=1, le=31)
    is_active: bool = True
    recurrence: str = "Mensal"


class FixedExpenseOut(BaseModel):
    id: int
    description: str
    amount: float
    category: str | None
    due_day: int
    is_active: bool
    created_at: datetime
    user_id: int
    paid_this_month: bool = False
    recurrence: str

    class Config:
        from_attributes = True