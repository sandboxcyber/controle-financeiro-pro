import ttkbootstrap as ttk
from tkinter import messagebox

from banco import excluir_movimentacao_por_id, buscar_movimentacao_por_id
from views.movimentacoes import abrir_movimentacoes


def criar_tabela(pai, movimentacoes, ao_excluir=None):
    area = ttk.LabelFrame(pai, text="Últimas movimentações")
    area.pack(fill="both", expand=True, padx=20, pady=30)

    barra = ttk.Frame(area)
    barra.pack(fill="x", padx=10, pady=10)

    colunas = ("ID", "Data", "Tipo", "Categoria", "Descrição", "Valor")

    tabela = ttk.Treeview(
        area,
        columns=colunas,
        show="headings",
        height=5
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
        id_movimentacao = int(valores[0])

        excluir_movimentacao_por_id(id_movimentacao)

        if ao_excluir:
            ao_excluir()

    def editar(event):
        selecionado = tabela.selection()

        if not selecionado:
            return

        valores = tabela.item(selecionado[0], "values")
        id_movimentacao = int(valores[0])

        dados = buscar_movimentacao_por_id(id_movimentacao)

        abrir_movimentacoes(ao_excluir, dados_edicao=dados)

    ttk.Button(
        barra,
        text="🗑 Excluir selecionado",
        command=excluir
    ).pack(side="right")

    for movimentacao in movimentacoes:
        id_mov, data, tipo, categoria, descricao, valor = movimentacao

        tabela.insert(
            "",
            "end",
            values=(
                id_mov,
                data,
                tipo,
                categoria,
                descricao,
                f"R$ {valor:.2f}"
            )
        )

    tabela.bind("<Double-1>", editar)

    return tabela