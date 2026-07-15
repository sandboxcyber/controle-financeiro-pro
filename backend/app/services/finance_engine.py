from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.bank_account import BankAccount
from app.models.card import Card
from app.models.expense import Expense
from app.models.goal import Goal
from app.models.income import Income


class FinanceEngine:
    def __init__(self, db: Session):
        self.db = db

    def saldo_bancos(self, user_id: int) -> float:
        contas = (
            self.db.query(BankAccount)
            .filter(BankAccount.user_id == user_id)
            .all()
        )

        return sum(
            float(conta.balance or 0)
            for conta in contas
        )

    def receitas(self, user_id: int) -> float:
        receitas = (
            self.db.query(Income)
            .filter(Income.user_id == user_id)
            .all()
        )

        return sum(
            float(receita.amount or 0)
            for receita in receitas
        )

    def despesas(self, user_id: int) -> float:
        despesas = (
            self.db.query(Expense)
            .filter(Expense.user_id == user_id)
            .all()
        )

        return sum(
            float(despesa.amount or 0)
            for despesa in despesas
        )

    def limite_total_cartoes(self, user_id: int) -> float:
        cartoes = (
            self.db.query(Card)
            .filter(Card.user_id == user_id)
            .all()
        )

        return sum(
            float(cartao.limit or 0)
            for cartao in cartoes
        )

    def utilizado_cartoes(self, user_id: int) -> float:
        cartoes = (
            self.db.query(Card)
            .filter(Card.user_id == user_id)
            .all()
        )

        return sum(
            float(cartao.used or 0)
            for cartao in cartoes
        )

    def patrimonio_investimentos(self, user_id: int) -> float:
        resultado = self.db.execute(
            text(
                """
                SELECT COALESCE(
                    SUM(
                        CASE
                            WHEN current_amount IS NOT NULL
                                 AND current_amount > 0
                            THEN current_amount

                            WHEN quantity IS NOT NULL
                                 AND current_price IS NOT NULL
                            THEN quantity * current_price

                            ELSE 0
                        END
                    ),
                    0
                )
                FROM investments
                WHERE user_id = :user_id
                """
            ),
            {"user_id": user_id},
        ).scalar()

        return float(resultado or 0)

    def metas(self, user_id: int) -> dict:
        metas = (
            self.db.query(Goal)
            .filter(Goal.user_id == user_id)
            .all()
        )

        atual = sum(
            float(meta.current_amount or 0)
            for meta in metas
        )

        objetivo = sum(
            float(meta.target_amount or 0)
            for meta in metas
        )

        return {
            "atual": atual,
            "objetivo": objetivo,
        }

    def patrimonio_total(self, user_id: int) -> float:
        return (
            self.saldo_bancos(user_id)
            + self.patrimonio_investimentos(user_id)
        )
