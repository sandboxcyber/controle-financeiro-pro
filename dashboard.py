import ttkbootstrap as ttk


def criar_card(pai, titulo, valor):
    card = ttk.Frame(pai, padding=20)
    card.pack(side="left", padx=15)

    ttk.Label(
        card,
        text=titulo,
        font=("Segoe UI", 13, "bold")
    ).pack()

    ttk.Label(
        card,
        text=valor,
        font=("Segoe UI", 22, "bold")
    ).pack(pady=10)


def iniciar():
    app = ttk.Window(themename="darkly")
    app.title("FinMaster PRO")
    app.geometry("1200x700")

    menu = ttk.Frame(app, width=250)
    menu.pack(side="left", fill="y", padx=10, pady=10)

    ttk.Label(
        menu,
        text="FinMaster",
        font=("Segoe UI", 20, "bold")
    ).pack(pady=25)

    botoes = [
        "🏠 Dashboard",
        "💰 Receitas",
        "💸 Despesas",
        "📊 Relatórios",
        "⚙️ Configurações"
    ]

    for botao in botoes:
        ttk.Button(menu, text=botao).pack(fill="x", padx=10, pady=6)

    conteudo = ttk.Frame(app)
    conteudo.pack(side="left", fill="both", expand=True, padx=20, pady=20)

    topo = ttk.Frame(conteudo)
    topo.pack(fill="x")

    ttk.Label(
        topo,
        text="FinMaster PRO",
        font=("Segoe UI", 24, "bold")
    ).pack(side="left")

    ttk.Label(
        topo,
        text="by DBS",
        font=("Segoe UI", 12)
    ).pack(side="right")

    ttk.Label(
        conteudo,
        text="Dashboard",
        font=("Segoe UI", 28, "bold")
    ).pack(pady=30)

    cards = ttk.Frame(conteudo)
    cards.pack(pady=10)

    criar_card(cards, "💰 Saldo Total", "R$ 0,00")
    criar_card(cards, "📈 Receitas", "R$ 0,00")
    criar_card(cards, "📉 Despesas", "R$ 0,00")

    area = ttk.LabelFrame(conteudo, text="Últimas movimentações")
    area.pack(fill="both", expand=True, padx=20, pady=30)

    ttk.Label(
        area,
        text="Nenhuma movimentação cadastrada ainda.",
        font=("Segoe UI", 12)
    ).pack(pady=40)

    app.mainloop()


if __name__ == "__main__":
    iniciar()