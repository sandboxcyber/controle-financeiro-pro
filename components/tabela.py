import ttkbootstrap as ttk
from tkinter import messagebox

from banco import excluir_movimentacao


def criar_tabela(pai, movimentacoes, ao_excluir=None):
    area = ttk.LabelFrame(pai, text="Últimas movimentações")
    area.pack(fill="both", expand=True, padx=20, pady=30)

    barra = ttk.Frame(area)
    barra.pack(fill="x", padx=10, pady=10)

    colunas = ("Data", "Tipo", "Categoria", "Descrição", "Valor")

    tabela = ttk.Treeview(
        area,
        columns=colunas,
        show="headings",
        height=10
    )

    for coluna in colunas:
        tabela.heading(coluna, text=coluna)
        tabela.column(coluna, width=150)

    tabela.pack(fill="both", expand=True, padx=10, pady=10)

    def excluir():
        selecionado = tabela.selection()

        if not selecionado:
            messagebox.showwarning("Atenção", "Selecione uma movimentação.")
            return

        valores = tabela.item(selecionado[0], "values")

        data = valores[0]
        tipo = valores[1]
        categoria = valores[2]
        descricao = valores[3]
        valor = float(valores[4].replace("R$ ", "").replace(",", "."))

        excluir_movimentacao(data, tipo, categoria, descricao, valor)

        if ao_excluir:
            ao_excluir()

    ttk.Button(
        barra,
        text="🗑 Excluir selecionado",
        command=excluir
    ).pack(side="right")

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