from datetime import datetime

from pydantic import BaseModel, Field


class BankAccountBase(BaseModel):
    bank_name: str = Field(min_length=1, max_length=100)
    account_name: str = Field(min_length=1, max_length=100)
    account_type: str = "Conta corrente"
    balance: float = 0
    color: str = "#2563eb"


class BankAccountCreate(BankAccountBase):
    pass


class BankAccountUpdate(BankAccountBase):
    pass


class BankAccountResponse(BankAccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BankTransactionCreate(BaseModel):
    transaction_type: str
    description: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: str = "Outros"


class BankTransactionResponse(BankTransactionCreate):
    id: int
    bank_account_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BankTransferCreate(BaseModel):
    from_account_id: int
    to_account_id: int
    amount: float = Field(gt=0)
    description: str = Field(
        default="Transferência entre contas",
        min_length=1,
        max_length=150,
    )
