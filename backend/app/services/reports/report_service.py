from datetime import datetime

from app.services.finance_engine import FinanceEngine


class ReportService:

    def __init__(self, db, user_id):
        self.engine = FinanceEngine(db)
        self.user_id = user_id

    def resumo(self):

        receitas = self.engine.receitas(self.user_id)
        despesas = self.engine.despesas(self.user_id)

        bancos = self.engine.saldo_bancos(self.user_id)

        investimentos = self.engine.patrimonio_investimentos(
            self.user_id
        )

        patrimonio = self.engine.patrimonio_total(
            self.user_id
        )

        metas = self.engine.metas(self.user_id)

        return {
            "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "receitas": receitas,
            "despesas": despesas,
            "saldo": receitas - despesas,
            "bancos": bancos,
            "investimentos": investimentos,
            "patrimonio": patrimonio,
            "metas": metas,
        }
