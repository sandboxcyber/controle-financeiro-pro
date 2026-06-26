import ttkbootstrap as ttk

from banco import buscar_resumo, buscar_movimentacoes
from views.movimentacoes import abrir_movimentacoes


def criar_card(pai, titulo, valor):
    card = ttk.Frame(pai, padding=20)
    card.pack(side="left", padx=15)

    ttk.Label(card, text=titulo, font=("Segoe UI", 13, "bold")).pack()
    ttk.Label(card, text=valor, font=("Segoe UI", 22, "bold")).pack(pady=10)


def iniciar():
    saldo, receitas, despesas = buscar_resumo()
    movimentacoes = buscar_movimentacoes()

    app = ttk.Window(themename="darkly")
    app.title("FinMaster PRO")
    app.geometry("1200x700")

    menu = ttk.Frame(app, width=250)
    menu.pack(side="left", fill="y", padx=10, pady=10)

    ttk.Label(menu, text="FinMaster", font=("Segoe UI", 20, "bold")).pack(pady=25)

    ttk.Button(menu, text="🏠 Dashboard").pack(fill="x", padx=10, pady=6)
    ttk.Button(menu, text="💰 Receitas", command=lambda: abrir_movimentacoes(app)).pack(fill="x", padx=10, pady=6)
    ttk.Button(menu, text="💸 Despesas").pack(fill="x", padx=10, pady=6)
    ttk.Button(menu, text="📊 Relatórios").pack(fill="x", padx=10, pady=6)
    ttk.Button(menu, text="⚙️ Configurações").pack(fill="x", padx=10, pady=6)

    conteudo = ttk.Frame(app)
    conteudo.pack(side="left", fill="both", expand=True, padx=20, pady=20)

    topo = ttk.Frame(conteudo)
    topo.pack(fill="x")

    ttk.Label(topo, text="FinMaster PRO", font=("Segoe UI", 24, "bold")).pack(side="left")
    ttk.Label(topo, text="by DBS", font=("Segoe UI", 12)).pack(side="right")

    ttk.Label(conteudo, text="Dashboard", font=("Segoe UI", 28, "bold")).pack(pady=30)

    cards = ttk.Frame(conteudo)
    cards.pack(pady=10)

    criar_card(cards, "💰 Saldo Total", f"R$ {saldo:.2f}")
    criar_card(cards, "📈 Receitas", f"R$ {receitas:.2f}")
    criar_card(cards, "📉 Despesas", f"R$ {despesas:.2f}")

    area = ttk.LabelFrame(conteudo, text="Últimas movimentações")
    area.pack(fill="both", expand=True, padx=20, pady=30)

    colunas = ("Data", "Tipo", "Categoria", "Descrição", "Valor")

    tabela = ttk.Treeview(
        area,
        columns=colunas,
        show="headings"
    )

    for coluna in colunas:
        tabela.heading(coluna, text=coluna)
        tabela.column(coluna, width=150)

    tabela.pack(fill="both", expand=True, padx=10, pady=10)

    for movimentacao in movimentacoes:
        data, tipo, categoria, descricao, valor = movimentacao

        tabela.insert(
            "",
            "end",
            values=(
                data,
                tipo,
                categoria,
                descricao,
                f"R$ {valor:.2f}"
            )
        )

    app.mainloop()


if __name__ == "__main__":
    iniciar()