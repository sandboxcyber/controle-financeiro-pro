import ttkbootstrap as ttk


def abrir_movimentacoes():

    janela = ttk.Toplevel()

    janela.title("Movimentações")

    janela.geometry("800x500")

    ttk.Label(
        janela,
        text="Cadastro de Receitas e Despesas",
        font=("Segoe UI", 20, "bold")
    ).pack(pady=20)

    ttk.Label(
        janela,
        text="Esta será nossa próxima tela.",
        font=("Segoe UI", 12)
    ).pack()

    janela.grab_set()