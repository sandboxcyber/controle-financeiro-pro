from sqlalchemy.orm import Session

from app.models.bank_account import BankAccount
from app.models.card import Card
from app.models.expense import Expense
from app.models.income import Income
from app.models.investment import Investment
from app.models.goal import Goal


class FinanceEngine:

    def __init__(self, db: Session):
        self.db = db

    def saldo_bancos(self, user_id: int):
        return sum(
            float(x.balance or 0)
            for x in self.db.query(BankAccount)
            .filter(BankAccount.user_id == user_id)
            .all()
        )

    def receitas(self, user_id: int):
        return sum(
            float(x.amount or 0)
            for x in self.db.query(Income)
            .filter(Income.user_id == user_id)
            .all()
        )

    def despesas(self, user_id: int):
        return sum(
            float(x.amount or 0)
            for x in self.db.query(Expense)
            .filter(Expense.user_id == user_id)
            .all()
        )

    def limite_total_cartoes(self, user_id: int):
        return sum(
            float(x.limit or 0)
            for x in self.db.query(Card)
            .filter(Card.user_id == user_id)
            .all()
        )

    def utilizado_cartoes(self, user_id: int):
        return sum(
            float(x.used or 0)
            for x in self.db.query(Card)
            .filter(Card.user_id == user_id)
            .all()
        )

    def patrimonio_investimentos(self, user_id: int):
        return sum(
            float(x.quantity or 0)
            * float(x.current_price or 0)
            for x in self.db.query(Investment)
            .filter(Investment.user_id == user_id)
            .all()
        )

    def metas(self, user_id: int):
        atual = 0
        objetivo = 0

        for meta in (
            self.db.query(Goal)
            .filter(Goal.user_id == user_id)
            .all()
        ):
            atual += float(meta.current_amount or 0)
            objetivo += float(meta.target_amount or 0)

        return {
            "atual": atual,
            "objetivo": objetivo,
        }

    def patrimonio_total(self, user_id: int):

        bancos = self.saldo_bancos(user_id)

        investimentos = self.patrimonio_investimentos(user_id)

        return bancos + investimentos
