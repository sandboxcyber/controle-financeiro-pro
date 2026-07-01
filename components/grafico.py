import ttkbootstrap as ttk
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


def criar_grafico_resumo(pai, receitas, despesas):
    area = ttk.LabelFrame(pai, text="Resumo visual")
    area.pack(fill="x", padx=20, pady=10)

    figura = Figure(figsize=(5, 1.2), dpi=100)
    grafico = figura.add_subplot(111)

    categorias = ["Receitas", "Despesas"]
    valores = [receitas, despesas]

    grafico.bar(categorias, valores)
    grafico.set_title("Receitas x Despesas")
    grafico.set_ylabel("Valor em R$")

    canvas = FigureCanvasTkAgg(figura, master=area)
    canvas.draw()
    canvas.get_tk_widget().pack(fill="both", expand=True)

    return canvas