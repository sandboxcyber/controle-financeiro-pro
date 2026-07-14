from datetime import date

from app.services.finance_engine import FinanceEngine


def gerar_previsao(db, user_id):
    engine = FinanceEngine(db)

    receitas = engine.receitas(user_id)
    despesas = engine.despesas(user_id)

    saldo = receitas - despesas

    hoje = date.today().day

    dias_mes = 30

    dias_restantes = max(dias_mes - hoje, 1)

    gasto_diario = despesas / max(hoje, 1)

    previsao_despesas = despesas + gasto_diario * dias_restantes

    saldo_final = receitas - previsao_despesas

    if saldo_final > 0:
        mensagem = (
            f"Se continuar nesse ritmo, você terminará o mês com "
            f"R$ {saldo_final:,.2f}"
        )
    else:
        mensagem = (
            f"Atenção: mantendo esse ritmo você terminará o mês com "
            f"R$ {saldo_final:,.2f}"
        )

    return {
        "saldo_previsto": saldo_final,
        "despesas_previstas": previsao_despesas,
        "mensagem": mensagem,
    }
