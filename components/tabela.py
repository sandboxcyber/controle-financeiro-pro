import ttkbootstrap as ttk


def criar_tabela(pai, movimentacoes):
    area = ttk.LabelFrame(pai, text="Últimas movimentações")
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

    return tabela
