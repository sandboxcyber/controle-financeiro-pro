from app.routes.backup import router as backup_router
from app.routes.reports import router as reports_router
from app.routes.finance import router as finance_router
from app.routes.investments import router as investments_router
from app.routes.goals import router as goals_router
from app.routes.bank_accounts import router as bank_accounts_router
from app.routes.ai import router as ai_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.expense import Expense
from app.models.fixed_expense import FixedExpense
from app.models.fixed_expense_payment import FixedExpensePayment
from app.routes.fixed_expense import router as fixed_expense_router
from app.routes.cards import router as cards_router

from app.database.database import Base, engine
from app.models.user import User
from app.routes.users import router as users_router
from app.routes.auth import router as auth_router
from app.models.income import Income
from app.routes.income import router as income_router

from fastapi import Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.income import Income

from app.models.expense import Expense
from app.routes.expense import router as expense_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinMaster PRO API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(income_router)
app.include_router(expense_router)
app.include_router(fixed_expense_router)
app.include_router(ai_router)
app.include_router(cards_router)

@app.get("/")
def home():
    return {
        "app": "FinMaster PRO",
        "status": "online",
        "message": "API funcionando"
    }



@app.get("/health")
def health():
    return {"status": "ok"}

def formatar_real(valor: float) -> str:
    texto = f"{valor:,.2f}"
    texto = texto.replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"


@app.get("/dashboard/resumo")
def dashboard_resumo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_receitas = (
        db.query(func.coalesce(func.sum(Income.amount), 0))
        .filter(Income.user_id == current_user.id)
        .scalar()
    )

    total_despesas = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == current_user.id)
        .scalar()
    )

    saldo = float(total_receitas) - float(total_despesas)
    falta_pagar = 0.0

    return {
        "receitas": formatar_real(float(total_receitas)),
        "despesas": formatar_real(float(total_despesas)),
        "saldo": formatar_real(saldo),
        "falta_pagar": formatar_real(falta_pagar),
    }
app.include_router(bank_accounts_router)

app.include_router(goals_router)

app.include_router(investments_router)

app.include_router(finance_router)

app.include_router(reports_router)

app.include_router(backup_router)
