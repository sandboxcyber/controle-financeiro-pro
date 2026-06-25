import sqlite3
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

conexao = sqlite3.connect("financeiro.db")
cursor = conexao.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    tipo TEXT,
    categoria TEXT,
    descricao TEXT,
    valor REAL
)
""")
conexao.commit()

def adicionar_movimentacao():
    data = entrada_data.get()
    tipo = combo_tipo.get()
    categoria = entrada_categoria.get()
    descricao = entrada_descricao.get()
    valor = entrada_valor.get()

    if not data or not tipo or not categoria or not descricao or not valor:
        messagebox.showwarning("Atenção", "Preencha todos os campos.")
        return

    try:
        valor = float(valor)
    except ValueError:
        messagebox.showerror("Erro", "Digite um valor válido.")
        return

    cursor.execute("""
    INSERT INTO movimentacoes (data, tipo, categoria, descricao, valor)
    VALUES (?, ?, ?, ?, ?)
    """, (data, tipo, categoria, descricao, valor))

    conexao.commit()

    limpar_campos()
    carregar_movimentacoes()
    atualizar_resumo()

def limpar_campos():
    entrada_categoria.delete(0, tk.END)
    entrada_descricao.delete(0, tk.END)
    entrada_valor.delete(0, tk.END)

def carregar_movimentacoes():
    for item in tabela.get_children():
        tabela.delete(item)

    cursor.execute("SELECT id, data, tipo, categoria, descricao, valor FROM movimentacoes ORDER BY id DESC")

    for linha in cursor.fetchall():
        tabela.insert("", tk.END, values=linha)

def atualizar_resumo():
    cursor.execute("SELECT SUM(valor) FROM movimentacoes WHERE tipo = 'Receita'")
    receitas = cursor.fetchone()[0] or 0

    cursor.execute("SELECT SUM(valor) FROM movimentacoes WHERE tipo = 'Despesa'")
    despesas = cursor.fetchone()[0] or 0

    saldo = receitas - despesas

    texto_receitas.config(text=f"Receitas: R$ {receitas:.2f}")
    texto_despesas.config(text=f"Despesas: R$ {despesas:.2f}")
    texto_saldo.config(text=f"Saldo: R$ {saldo:.2f}")

def excluir_movimentacao():
    selecionado = tabela.selection()

    if not selecionado:
        messagebox.showwarning("Atenção", "Selecione uma movimentação.")
        return

    item = tabela.item(selecionado)
    id_movimentacao = item["values"][0]

    cursor.execute("DELETE FROM movimentacoes WHERE id = ?", (id_movimentacao,))
    conexao.commit()

    carregar_movimentacoes()
    atualizar_resumo()

janela = tk.Tk()
janela.title("FinMaster PRO")
janela.geometry("900x600")

titulo = tk.Label(janela, text="FinMaster PRO", font=("Arial", 22, "bold"))
titulo.pack(pady=10)

frame_form = tk.Frame(janela)
frame_form.pack(pady=10)

tk.Label(frame_form, text="Data").grid(row=0, column=0)
entrada_data = tk.Entry(frame_form)
entrada_data.grid(row=1, column=0, padx=5)
entrada_data.insert(0, datetime.now().strftime("%d/%m/%Y"))

tk.Label(frame_form, text="Tipo").grid(row=0, column=1)
combo_tipo = ttk.Combobox(frame_form, values=["Receita", "Despesa"])
combo_tipo.grid(row=1, column=1, padx=5)
combo_tipo.set("Despesa")

tk.Label(frame_form, text="Categoria").grid(row=0, column=2)
entrada_categoria = tk.Entry(frame_form)
entrada_categoria.grid(row=1, column=2, padx=5)

tk.Label(frame_form, text="Descrição").grid(row=0, column=3)
entrada_descricao = tk.Entry(frame_form)
entrada_descricao.grid(row=1, column=3, padx=5)

tk.Label(frame_form, text="Valor").grid(row=0, column=4)
entrada_valor = tk.Entry(frame_form)
entrada_valor.grid(row=1, column=4, padx=5)

tk.Button(janela, text="Adicionar", command=adicionar_movimentacao).pack(pady=5)
tk.Button(janela, text="Excluir selecionado", command=excluir_movimentacao).pack(pady=5)

frame_resumo = tk.Frame(janela)
frame_resumo.pack(pady=10)

texto_receitas = tk.Label(frame_resumo, text="Receitas: R$ 0.00", font=("Arial", 13))
texto_receitas.grid(row=0, column=0, padx=20)

texto_despesas = tk.Label(frame_resumo, text="Despesas: R$ 0.00", font=("Arial", 13))
texto_despesas.grid(row=0, column=1, padx=20)

texto_saldo = tk.Label(frame_resumo, text="Saldo: R$ 0.00", font=("Arial", 13, "bold"))
texto_saldo.grid(row=0, column=2, padx=20)

colunas = ("ID", "Data", "Tipo", "Categoria", "Descrição", "Valor")
tabela = ttk.Treeview(janela, columns=colunas, show="headings")

for coluna in colunas:
    tabela.heading(coluna, text=coluna)
    tabela.column(coluna, width=130)

tabela.pack(fill="both", expand=True, padx=10, pady=10)

carregar_movimentacoes()
atualizar_resumo()

janela.mainloop()
