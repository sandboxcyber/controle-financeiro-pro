from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.services.finance_engine import FinanceEngine


def moeda(valor: float) -> str:
    return (
        f"R$ {valor:,.2f}"
        .replace(",", "X")
        .replace(".", ",")
        .replace("X", ".")
    )


def gerar_relatorio_pdf(db, user_id: int, nome_usuario: str) -> BytesIO:
    engine = FinanceEngine(db)

    receitas = engine.receitas(user_id)
    despesas = engine.despesas(user_id)
    fluxo = receitas - despesas
    bancos = engine.saldo_bancos(user_id)
    investimentos = engine.patrimonio_investimentos(user_id)
    patrimonio = engine.patrimonio_total(user_id)
    limite_cartoes = engine.limite_total_cartoes(user_id)
    utilizado_cartoes = engine.utilizado_cartoes(user_id)
    disponivel_cartoes = max(
        limite_cartoes - utilizado_cartoes,
        0,
    )

    metas = engine.metas(user_id)

    buffer = BytesIO()

    documento = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.7 * cm,
        leftMargin=1.7 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="Relatório Financeiro FinMaster",
        author="FinMaster PRO",
    )

    estilos = getSampleStyleSheet()

    titulo = ParagraphStyle(
        "TituloFinMaster",
        parent=estilos["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=colors.HexColor("#2563EB"),
        alignment=TA_CENTER,
        spaceAfter=8,
    )

    subtitulo = ParagraphStyle(
        "SubtituloFinMaster",
        parent=estilos["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=22,
    )

    secao = ParagraphStyle(
        "SecaoFinMaster",
        parent=estilos["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=10,
    )

    texto = ParagraphStyle(
        "TextoFinMaster",
        parent=estilos["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#334155"),
    )

    elementos = []

    elementos.append(Paragraph("FinMaster PRO", titulo))
    elementos.append(
        Paragraph(
            "Relatório financeiro consolidado",
            subtitulo,
        )
    )

    elementos.append(
        Paragraph(
            f"<b>Usuário:</b> {nome_usuario}<br/>"
            f"<b>Emitido em:</b> "
            f"{datetime.now().strftime('%d/%m/%Y às %H:%M')}",
            texto,
        )
    )

    elementos.append(Spacer(1, 18))

    elementos.append(Paragraph("Resumo financeiro", secao))

    dados_resumo = [
        ["Indicador", "Valor"],
        ["Receitas", moeda(receitas)],
        ["Despesas", moeda(despesas)],
        ["Fluxo de caixa", moeda(fluxo)],
        ["Saldo nos bancos", moeda(bancos)],
        ["Investimentos", moeda(investimentos)],
        ["Patrimônio total", moeda(patrimonio)],
    ]

    tabela_resumo = Table(
        dados_resumo,
        colWidths=[10.5 * cm, 6 * cm],
        repeatRows=1,
    )

    tabela_resumo.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#0F172A"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (0, -1),
                    "Helvetica-Bold",
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.HexColor("#F8FAFC"),
                        colors.white,
                    ],
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    9,
                ),
            ]
        )
    )

    elementos.append(tabela_resumo)

    elementos.append(Paragraph("Cartões", secao))

    dados_cartoes = [
        ["Indicador", "Valor"],
        ["Limite total", moeda(limite_cartoes)],
        ["Limite utilizado", moeda(utilizado_cartoes)],
        ["Limite disponível", moeda(disponivel_cartoes)],
    ]

    tabela_cartoes = Table(
        dados_cartoes,
        colWidths=[10.5 * cm, 6 * cm],
        repeatRows=1,
    )

    tabela_cartoes.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#1D4ED8"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (0, -1),
                    "Helvetica-Bold",
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.HexColor("#EFF6FF"),
                        colors.white,
                    ],
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    9,
                ),
            ]
        )
    )

    elementos.append(tabela_cartoes)

    elementos.append(Paragraph("Metas financeiras", secao))

    dados_metas = [
        ["Indicador", "Valor"],
        ["Objetivo total", moeda(metas["objetivo"])],
        ["Valor acumulado", moeda(metas["atual"])],
        [
            "Falta alcançar",
            moeda(max(metas["objetivo"] - metas["atual"], 0)),
        ],
    ]

    tabela_metas = Table(
        dados_metas,
        colWidths=[10.5 * cm, 6 * cm],
        repeatRows=1,
    )

    tabela_metas.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#059669"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (0, -1),
                    "Helvetica-Bold",
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.HexColor("#ECFDF5"),
                        colors.white,
                    ],
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    9,
                ),
            ]
        )
    )

    elementos.append(tabela_metas)

    elementos.append(Spacer(1, 24))

    if fluxo >= 0:
        mensagem = (
            "Seu fluxo de caixa está positivo. "
            "Mantenha o controle dos gastos e considere "
            "direcionar parte do saldo para metas ou investimentos."
        )
    else:
        mensagem = (
            "Seu fluxo de caixa está negativo. "
            "Revise despesas variáveis e o uso dos cartões "
            "antes de assumir novos compromissos financeiros."
        )

    elementos.append(Paragraph("Análise automática", secao))
    elementos.append(Paragraph(mensagem, texto))

    documento.build(elementos)

    buffer.seek(0)
    return buffer
