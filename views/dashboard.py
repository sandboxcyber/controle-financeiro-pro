import ttkbootstrap as ttk

from banco import buscar_resumo, buscar_movimentacoes
from views.movimentacoes import abrir_movimentacoes
from components.cards import criar_cards
from components.tabela import criar_tabela


def limpar_frame(frame):
    for widget in frame.winfo_children():
        widget.destroy()


def iniciar():
    app = ttk.Window(themename="darkly")
    app.title("FinMaster PRO")
    app.geometry("1200x800")

    menu = ttk.Frame(app, width=250)
    menu.pack(side="left", fill="y", padx=10, pady=10)

    ttk.Label(menu, text="FinMaster", font=("Segoe UI", 20, "bold")).pack(pady=25)

    conteudo = ttk.Frame(app)
    conteudo.pack(side="left", fill="both", expand=True, padx=20, pady=20)

    def atualizar_dashboard():
        limpar_frame(conteudo)

        saldo, receitas, despesas = buscar_resumo()
        movimentacoes = buscar_movimentacoes()

        topo = ttk.Frame(conteudo)
        topo.pack(fill="x")

        ttk.Label(topo, text="FinMaster PRO", font=("Segoe UI", 24, "bold")).pack(side="left")
        ttk.Label(topo, text="by DBS", font=("Segoe UI", 12)).pack(side="right")

        ttk.Label(conteudo, text="Dashboard", font=("Segoe UI", 28, "bold")).pack(pady=30)

        criar_cards(conteudo, saldo, receitas, despesas)
        criar_tabela(conteudo, movimentacoes, atualizar_dashboard)

    ttk.Button(menu, text="🏠 Dashboard", command=atualizar_dashboard).pack(fill="x", padx=10, pady=6)

    ttk.Button(
        menu,
        text="💰 Receitas",
        command=lambda: abrir_movimentacoes(atualizar_dashboard, "Receita")
    ).pack(fill="x", padx=10, pady=6)

    ttk.Button(
        menu,
        text="💸 Despesas",
        command=lambda: abrir_movimentacoes(atualizar_dashboard, "Despesa")
    ).pack(fill="x", padx=10, pady=6)

    ttk.Button(menu, text="📊 Relatórios").pack(fill="x", padx=10, pady=6)
    ttk.Button(menu, text="⚙️ Configurações").pack(fill="x", padx=10, pady=6)

    atualizar_dashboard()

    app.mainloop()


if __name__ == "__main__":
    iniciar()