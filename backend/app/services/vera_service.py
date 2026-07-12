from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.fixed_expense import FixedExpense
from app.models.income import Income


def gerar_resumo_financeiro(db: Session, user_id: int) -> dict:
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

    despesas_fixas = (
        db.query(FixedExpense)
        .filter(
            FixedExpense.user_id == user_id,
            FixedExpense.is_active.is_(True),
        )
        .all()
    )

    total_receitas = sum(float(item.amount) for item in receitas)
    total_despesas = sum(float(item.amount) for item in despesas)
    total_fixas = sum(float(item.amount) for item in despesas_fixas)

    saldo = total_receitas - total_despesas

    categorias: dict[str, float] = {}

    for item in despesas:
        categoria = item.category or "Outros"
        categorias[categoria] = (
            categorias.get(categoria, 0) + float(item.amount)
        )

    maior_categoria = "Nenhuma"
    maior_categoria_valor = 0.0

    if categorias:
        maior_categoria, maior_categoria_valor = max(
            categorias.items(),
            key=lambda item: item[1],
        )

    if total_receitas <= 0:
        score = 30
    else:
        percentual_gasto = total_despesas / total_receitas

        if percentual_gasto <= 0.5:
            score = 90
        elif percentual_gasto <= 0.7:
            score = 75
        elif percentual_gasto <= 0.9:
            score = 55
        else:
            score = 35

    insights = []

    if saldo > 0:
        insights.append(
            f"Seu saldo está positivo em R$ {saldo:,.2f}."
        )
    elif saldo < 0:
        insights.append(
            f"Atenção: suas despesas superam suas receitas em "
            f"R$ {abs(saldo):,.2f}."
        )
    else:
        insights.append(
            "Suas receitas e despesas estão equilibradas."
        )

    if maior_categoria != "Nenhuma":
        insights.append(
            f"Sua maior categoria de gastos é {maior_categoria}, "
            f"com R$ {maior_categoria_valor:,.2f}."
        )

    if total_fixas > 0:
        insights.append(
            f"Suas despesas fixas ativas somam "
            f"R$ {total_fixas:,.2f} por mês."
        )

    if total_receitas > 0 and saldo > 0:
        percentual_economia = (saldo / total_receitas) * 100

        insights.append(
            f"Você preservou aproximadamente "
            f"{percentual_economia:.1f}% das suas receitas."
        )

    return {
        "score": score,
        "receitas": total_receitas,
        "despesas": total_despesas,
        "despesas_fixas": total_fixas,
        "saldo": saldo,
        "maior_categoria": maior_categoria,
        "maior_categoria_valor": maior_categoria_valor,
        "insights": insights,
    }


def responder_pergunta(
    pergunta: str,
    resumo: dict,
) -> str:
    texto = pergunta.lower().strip()

    if "saldo" in texto:
        return (
            f"Seu saldo atual calculado é de "
            f"R$ {resumo['saldo']:,.2f}."
        )

    if "receita" in texto or "recebi" in texto:
        return (
            f"Suas receitas registradas somam "
            f"R$ {resumo['receitas']:,.2f}."
        )

    if "despesa" in texto or "gasto" in texto:
        return (
            f"Suas despesas registradas somam "
            f"R$ {resumo['despesas']:,.2f}. "
            f"A maior categoria é "
            f"{resumo['maior_categoria']}."
        )

    if "fixa" in texto or "conta" in texto:
        return (
            f"Suas despesas fixas ativas somam "
            f"R$ {resumo['despesas_fixas']:,.2f} por mês."
        )

    if "saúde" in texto or "score" in texto:
        return (
            f"Sua saúde financeira está em "
            f"{resumo['score']} de 100."
        )

    if "economizar" in texto or "economia" in texto:
        if resumo["saldo"] > 0:
            sugestao = resumo["saldo"] * 0.30

            return (
                f"Você pode começar reservando cerca de "
                f"R$ {sugestao:,.2f}, equivalente a 30% "
                f"do saldo positivo atual."
            )

        return (
            "No momento, o melhor primeiro passo é reduzir "
            "gastos variáveis antes de definir uma nova meta."
        )

    return (
        f"Seu saldo é de R$ {resumo['saldo']:,.2f}. "
        f"Você possui R$ {resumo['receitas']:,.2f} em receitas "
        f"e R$ {resumo['despesas']:,.2f} em despesas. "
        f"Sua maior categoria de gastos é "
        f"{resumo['maior_categoria']}."
    )
