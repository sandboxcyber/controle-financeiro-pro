from sqlalchemy.orm import Session

from app.models.bank_account import BankAccount
from app.models.card import Card
from app.models.expense import Expense
from app.models.fixed_expense import FixedExpense
from app.models.goal import Goal
from app.models.income import Income


def moeda(valor: float) -> str:
    return (
        f"R$ {valor:,.2f}"
        .replace(",", "X")
        .replace(".", ",")
        .replace("X", ".")
    )


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

    total_receitas = sum(
        float(item.amount or 0)
        for item in receitas
    )

    total_despesas = sum(
        float(item.amount or 0)
        for item in despesas
    )

    total_fixas = sum(
        float(item.amount or 0)
        for item in despesas_fixas
    )

    saldo_bancos = sum(
        float(item.balance or 0)
        for item in bancos
    )

    limite_cartoes = sum(
        float(item.limit or 0)
        for item in cartoes
    )

    utilizado_cartoes = sum(
        float(item.used or 0)
        for item in cartoes
    )

    disponivel_cartoes = max(
        limite_cartoes - utilizado_cartoes,
        0,
    )

    objetivo_metas = sum(
        float(item.target_amount or 0)
        for item in metas
    )

    acumulado_metas = sum(
        float(item.current_amount or 0)
        for item in metas
    )

    falta_metas = max(
        objetivo_metas - acumulado_metas,
        0,
    )

    saldo_financeiro = total_receitas - total_despesas

    categorias: dict[str, float] = {}

    for item in despesas:
        categoria = item.category or "Outros"

        categorias[categoria] = (
            categorias.get(categoria, 0)
            + float(item.amount or 0)
        )

    maior_categoria = "Nenhuma"
    maior_categoria_valor = 0.0

    if categorias:
        maior_categoria, maior_categoria_valor = max(
            categorias.items(),
            key=lambda item: item[1],
        )

    pontos = 50

    if saldo_financeiro > 0:
        pontos += 15
    elif saldo_financeiro < 0:
        pontos -= 20

    if saldo_bancos > 0:
        pontos += 10

    if limite_cartoes > 0:
        percentual_cartao = (
            utilizado_cartoes / limite_cartoes
        )

        if percentual_cartao <= 0.30:
            pontos += 15
        elif percentual_cartao <= 0.60:
            pontos += 5
        elif percentual_cartao >= 0.80:
            pontos -= 15

    if objetivo_metas > 0:
        progresso_metas = (
            acumulado_metas / objetivo_metas
        )

        if progresso_metas >= 0.50:
            pontos += 10
        elif progresso_metas > 0:
            pontos += 5

    score = max(0, min(pontos, 100))

    insights: list[str] = []

    if saldo_financeiro > 0:
        insights.append(
            f"Seu resultado financeiro está positivo em "
            f"{moeda(saldo_financeiro)}."
        )
    elif saldo_financeiro < 0:
        insights.append(
            f"Atenção: suas despesas superam suas receitas em "
            f"{moeda(abs(saldo_financeiro))}."
        )
    else:
        insights.append(
            "Suas receitas e despesas estão equilibradas."
        )

    if saldo_bancos > 0:
        insights.append(
            f"Você possui {moeda(saldo_bancos)} distribuídos "
            f"em {len(bancos)} conta(s) bancária(s)."
        )

    if limite_cartoes > 0:
        percentual_utilizado = (
            utilizado_cartoes / limite_cartoes
        ) * 100

        insights.append(
            f"Seus cartões estão com "
            f"{percentual_utilizado:.1f}% do limite utilizado. "
            f"Você ainda possui {moeda(disponivel_cartoes)} disponíveis."
        )

        if percentual_utilizado >= 80:
            insights.append(
                "Alerta: o uso dos cartões está acima de 80%. "
                "Evite novas compras até reduzir a fatura."
            )

    if maior_categoria != "Nenhuma":
        insights.append(
            f"Sua maior categoria de gastos é "
            f"{maior_categoria}, com "
            f"{moeda(maior_categoria_valor)}."
        )

    if total_fixas > 0:
        insights.append(
            f"Suas despesas fixas ativas somam "
            f"{moeda(total_fixas)}."
        )

    if objetivo_metas > 0:
        percentual_metas = (
            acumulado_metas / objetivo_metas
        ) * 100

        insights.append(
            f"Você já alcançou {percentual_metas:.1f}% "
            f"das suas metas financeiras. "
            f"Faltam {moeda(falta_metas)}."
        )

    return {
        "score": score,
        "receitas": total_receitas,
        "despesas": total_despesas,
        "despesas_fixas": total_fixas,
        "saldo": saldo_financeiro,
        "saldo_bancos": saldo_bancos,
        "limite_cartoes": limite_cartoes,
        "utilizado_cartoes": utilizado_cartoes,
        "disponivel_cartoes": disponivel_cartoes,
        "objetivo_metas": objetivo_metas,
        "acumulado_metas": acumulado_metas,
        "falta_metas": falta_metas,
        "maior_categoria": maior_categoria,
        "maior_categoria_valor": maior_categoria_valor,
        "insights": insights,
    }


def responder_pergunta(
    pergunta: str,
    resumo: dict,
) -> str:
    texto = pergunta.lower().strip()

    if "saldo banc" in texto or "banco" in texto:
        return (
            f"Você possui {moeda(resumo['saldo_bancos'])} "
            f"nas suas contas bancárias."
        )

    if "saldo" in texto:
        return (
            f"Seu resultado entre receitas e despesas é "
            f"{moeda(resumo['saldo'])}. "
            f"Nos bancos você possui "
            f"{moeda(resumo['saldo_bancos'])}."
        )

    if "cartão" in texto or "cartao" in texto or "fatura" in texto:
        return (
            f"Você utilizou "
            f"{moeda(resumo['utilizado_cartoes'])} "
            f"de um limite total de "
            f"{moeda(resumo['limite_cartoes'])}. "
            f"Seu limite disponível é "
            f"{moeda(resumo['disponivel_cartoes'])}."
        )

    if "meta" in texto or "objetivo" in texto:
        return (
            f"Você acumulou "
            f"{moeda(resumo['acumulado_metas'])} "
            f"em metas. Ainda faltam "
            f"{moeda(resumo['falta_metas'])}."
        )

    if "receita" in texto or "recebi" in texto:
        return (
            f"Suas receitas registradas somam "
            f"{moeda(resumo['receitas'])}."
        )

    if "despesa fixa" in texto or "conta fixa" in texto:
        return (
            f"Suas despesas fixas ativas somam "
            f"{moeda(resumo['despesas_fixas'])}."
        )

    if "despesa" in texto or "gasto" in texto:
        return (
            f"Suas despesas registradas somam "
            f"{moeda(resumo['despesas'])}. "
            f"A maior categoria é "
            f"{resumo['maior_categoria']}."
        )

    if "saúde" in texto or "saude" in texto or "score" in texto:
        return (
            f"Sua saúde financeira está em "
            f"{resumo['score']} de 100."
        )

    if "economizar" in texto or "economia" in texto:
        sugestoes = []

        if resumo["utilizado_cartoes"] > 0:
            sugestoes.append(
                "reduzir novas compras no cartão"
            )

        if resumo["maior_categoria"] != "Nenhuma":
            sugestoes.append(
                f"revisar os gastos com "
                f"{resumo['maior_categoria']}"
            )

        if resumo["saldo"] > 0:
            reserva = resumo["saldo"] * 0.30

            sugestoes.append(
                f"separar {moeda(reserva)} para uma meta"
            )

        if not sugestoes:
            return (
                "Comece registrando suas receitas e despesas "
                "para que eu possa criar uma recomendação."
            )

        return (
            "Minha recomendação é: "
            + "; ".join(sugestoes)
            + "."
        )

    return (
        f"Sua saúde financeira está em "
        f"{resumo['score']} de 100. "
        f"Você possui {moeda(resumo['saldo_bancos'])} "
        f"nos bancos, utilizou "
        f"{moeda(resumo['utilizado_cartoes'])} "
        f"nos cartões e acumulou "
        f"{moeda(resumo['acumulado_metas'])} "
        f"em metas."
    )
