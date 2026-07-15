from datetime import datetime
from pydantic import BaseModel


class BudgetBase(BaseModel):
    category: str
    monthly_limit: float
    color: str = "#2563eb"


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
