from datetime import datetime

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = ""
    target_amount: float = Field(gt=0)
    current_amount: float = Field(default=0, ge=0)
    deadline: str | None = None
    color: str = "#2563eb"
    icon: str = "🎯"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(GoalBase):
    pass


class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GoalContributionCreate(BaseModel):
    amount: float = Field(gt=0)
    description: str = "Depósito na meta"


class GoalContributionResponse(BaseModel):
    id: int
    amount: float
    description: str
    created_at: datetime
    goal_id: int
    user_id: int

    class Config:
        from_attributes = True
