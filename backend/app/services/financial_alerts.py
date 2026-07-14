from sqlalchemy.orm import Session

from app.models.bank_account import BankAccount
from app.models.card import Card
from app.models.expense import Expense
from app.models.goal import Goal
from app.models.income import Income


def gerar_alertas(db: Session, user_id: int) -> list[dict]:
    alertas: list[dict] = []

    bancos = (
        db.query(BankAccount)
        .filter(BankAccount.user_id == user_id)
        .all()
    )

    cartoes = (
        db.query(Card)
        .filter(Card.user_id == user_id)
        .all()
    )

    metas = (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .all()
    )

    receitas = (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .all()
    )

    despesas = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .all()
    )

    total_receitas = sum(
        float(item.amount or 0)
        for item in receitas
    )

    total_despesas = sum(
        float(item.amount or 0)
        for item in despesas
    )

    if total_despesas > total_receitas and total_receitas > 0:
        diferenca = total_despesas - total_receitas

        alertas.append({
            "type": "danger",
            "title": "Despesas acima das receitas",
            "message": (
                f"Você gastou R$ {diferenca:.2f} "
                "a mais do que recebeu."
            ),
        })

    for conta in bancos:
        saldo = float(conta.balance or 0)

        if saldo < 0:
            alertas.append({
                "type": "danger",
                "title": f"Saldo negativo em {conta.bank_name}",
                "message": (
                    f"A conta {conta.account_name} está com "
                    f"saldo de R$ {saldo:.2f}."
                ),
            })

        elif saldo <= 100:
            alertas.append({
                "type": "warning",
                "title": f"Saldo baixo em {conta.bank_name}",
                "message": (
                    f"A conta {conta.account_name} possui apenas "
                    f"R$ {saldo:.2f}."
                ),
            })

    for cartao in cartoes:
        limite = float(cartao.limit or 0)
        utilizado = float(cartao.used or 0)

        if limite <= 0:
            continue

        percentual = (utilizado / limite) * 100

        if percentual >= 90:
            alertas.append({
                "type": "danger",
                "title": f"Cartão {cartao.name} quase no limite",
                "message": (
                    f"Você já utilizou {percentual:.1f}% "
                    "do limite disponível."
                ),
            })

        elif percentual >= 70:
            alertas.append({
                "type": "warning",
                "title": f"Atenção ao cartão {cartao.name}",
                "message": (
                    f"O cartão está com {percentual:.1f}% "
                    "do limite utilizado."
                ),
            })

    for meta in metas:
        objetivo = float(meta.target_amount or 0)
        atual = float(meta.current_amount or 0)

        if objetivo <= 0:
            continue

        percentual = (atual / objetivo) * 100

        if percentual >= 100:
            alertas.append({
                "type": "success",
                "title": f"Meta concluída: {meta.name}",
                "message": "Parabéns! Você alcançou seu objetivo.",
            })

        elif percentual >= 80:
            falta = objetivo - atual

            alertas.append({
                "type": "success",
                "title": f"Meta quase concluída: {meta.name}",
                "message": (
                    f"Faltam apenas R$ {falta:.2f} "
                    "para alcançar essa meta."
                ),
            })

    if not alertas:
        alertas.append({
            "type": "success",
            "title": "Tudo sob controle",
            "message": (
                "Nenhum alerta financeiro importante foi "
                "identificado neste momento."
            ),
        })

    return alertas
