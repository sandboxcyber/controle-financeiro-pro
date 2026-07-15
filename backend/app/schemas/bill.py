from datetime import datetime

from pydantic import BaseModel, Field


class BillBase(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    category: str = "Outros"
    amount: float = Field(gt=0)
    due_date: datetime
    status: str = "Pendente"
    installments: int = Field(default=1, ge=1, le=120)
    current_installment: int = Field(default=1, ge=1)
    interest: float = Field(default=0, ge=0)
    fine: float = Field(default=0, ge=0)


class BillCreate(BillBase):
    pass


class BillUpdate(BillBase):
    pass


class BillResponse(BillBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BillInstallmentCreate(BaseModel):
    description: str = Field(min_length=1, max_length=150)
    category: str = "Outros"
    total_amount: float = Field(gt=0)
    installments: int = Field(ge=2, le=120)
    first_due_date: datetime
    interest: float = Field(default=0, ge=0)
    fine: float = Field(default=0, ge=0)
