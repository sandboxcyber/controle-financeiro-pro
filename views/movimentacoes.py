import ttkbootstrap as ttk
from datetime import datetime
from tkinter import messagebox

from banco import adicionar_movimentacao


def abrir_movimentacoes(ao_salvar=None):
    janela = ttk.Toplevel()
    janela.title("Nova Receita")
    janela.geometry("600x450")

    ttk.Label(
        janela,
        text="Nova Receita",
        font=("Segoe UI", 22, "bold")
    ).pack(pady=20)

    frame = ttk.Frame(janela)
    frame.pack(pady=10)

    ttk.Label(frame, text="Data").grid(row=0, column=0, sticky="w")
    entrada_data = ttk.Entry(frame, width=30)
    entrada_data.grid(row=1, column=0, pady=5)
    entrada_data.insert(0, datetime.now().strftime("%d/%m/%Y"))

    ttk.Label(frame, text="Categoria").grid(row=2, column=0, sticky="w")
    entrada_categoria = ttk.Entry(frame, width=30)
    entrada_categoria.grid(row=3, column=0, pady=5)

    ttk.Label(frame, text="Descrição").grid(row=4, column=0, sticky="w")
    entrada_descricao = ttk.Entry(frame, width=30)
    entrada_descricao.grid(row=5, column=0, pady=5)

    ttk.Label(frame, text="Valor").grid(row=6, column=0, sticky="w")
    entrada_valor = ttk.Entry(frame, width=30)
    entrada_valor.grid(row=7, column=0, pady=5)

    def salvar():
        try:
            valor = float(entrada_valor.get().replace(",", "."))

            adicionar_movimentacao(
                entrada_data.get(),
                "Receita",
                entrada_categoria.get(),
                entrada_descricao.get(),
                valor
            )

            messagebox.showinfo(
                "Sucesso",
                "Receita salva com sucesso!"
            )

            # Atualiza o dashboard, se existir uma função de atualização
            if ao_salvar:
                ao_salvar()

            # Fecha apenas esta janela
            janela.destroy()

        except ValueError:
            messagebox.showerror(
                "Erro",
                "Digite um valor válido."
            )

    ttk.Button(
        janela,
        text="Salvar Receita",
        command=salvar
    ).pack(pady=20)

    janela.grab_set()