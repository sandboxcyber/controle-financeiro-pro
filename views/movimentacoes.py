import ttkbootstrap as ttk
from datetime import datetime
from tkinter import messagebox

from banco import adicionar_movimentacao, atualizar_movimentacao


def abrir_movimentacoes(ao_salvar=None, tipo="Receita", dados_edicao=None):
    janela = ttk.Toplevel()
    janela.geometry("600x560")

    if dados_edicao:
        janela.title("Editar movimentação")
        tipo = dados_edicao[2]
    else:
        janela.title(f"Nova {tipo}")

    ttk.Label(
        janela,
        text="Editar movimentação" if dados_edicao else f"Nova {tipo}",
        font=("Segoe UI", 22, "bold")
    ).pack(pady=20)

    frame = ttk.Frame(janela)
    frame.pack(pady=10)

    ttk.Label(frame, text="Data").grid(row=0, column=0, sticky="w")
    entrada_data = ttk.Entry(frame, width=30)
    entrada_data.grid(row=1, column=0, pady=5)
    entrada_data.insert(0, datetime.now().strftime("%d/%m/%Y"))

    ttk.Label(frame, text="Tipo").grid(row=2, column=0, sticky="w")
    tipo_var = ttk.StringVar(value=tipo)

    ttk.Radiobutton(frame, text="Receita", variable=tipo_var, value="Receita").grid(row=3, column=0, sticky="w")
    ttk.Radiobutton(frame, text="Despesa", variable=tipo_var, value="Despesa").grid(row=3, column=1, sticky="w")

    ttk.Label(frame, text="Categoria").grid(row=4, column=0, sticky="w")
    entrada_categoria = ttk.Entry(frame, width=30)
    entrada_categoria.grid(row=5, column=0, pady=5)

    ttk.Label(frame, text="Descrição").grid(row=6, column=0, sticky="w")
    entrada_descricao = ttk.Entry(frame, width=30)
    entrada_descricao.grid(row=7, column=0, pady=5)

    ttk.Label(frame, text="Valor").grid(row=8, column=0, sticky="w")
    entrada_valor = ttk.Entry(frame, width=30)
    entrada_valor.grid(row=9, column=0, pady=5)

    id_edicao = None

    if dados_edicao:
        id_edicao = dados_edicao[0]

        entrada_data.delete(0, "end")
        entrada_data.insert(0, dados_edicao[1])

        tipo_var.set(dados_edicao[2])
        entrada_categoria.insert(0, dados_edicao[3])
        entrada_descricao.insert(0, dados_edicao[4])
        entrada_valor.insert(0, str(dados_edicao[5]))

    def salvar():
        try:
            valor = float(entrada_valor.get().replace(",", "."))
            tipo_atual = tipo_var.get()

            if id_edicao:
                atualizar_movimentacao(
                    id_edicao,
                    entrada_data.get(),
                    tipo_atual,
                    entrada_categoria.get(),
                    entrada_descricao.get(),
                    valor
                )
                mensagem = "Movimentação atualizada com sucesso!"
            else:
                adicionar_movimentacao(
                    entrada_data.get(),
                    tipo_atual,
                    entrada_categoria.get(),
                    entrada_descricao.get(),
                    valor
                )
                mensagem = f"{tipo_atual} salva com sucesso!"

            messagebox.showinfo("Sucesso", mensagem)

            if ao_salvar:
                ao_salvar()

            janela.destroy()

        except ValueError:
            messagebox.showerror("Erro", "Digite um valor válido.")

    ttk.Button(
        janela,
        text="Salvar alteração" if dados_edicao else f"Salvar {tipo}",
        command=salvar
    ).pack(pady=20)

    janela.grab_set()
