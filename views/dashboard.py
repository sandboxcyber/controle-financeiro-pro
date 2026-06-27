import ttkbootstrap as ttk

from banco import buscar_resumo, buscar_movimentacoes
from views.movimentacoes import abrir_movimentacoes
from components.cards import criar_cards
from components.tabela import criar_tabela

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

    criar_cards(conteudo, saldo, receitas, despesas)

    criar_tabela(conteudo, movimentacoes)


    app.mainloop()


if __name__ == "__main__":
    iniciar()