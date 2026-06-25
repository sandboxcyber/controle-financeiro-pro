import sqlite3

BANCO = "financeiro.db"


def conectar():
    return sqlite3.connect(BANCO)


def buscar_resumo():
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        "SELECT COALESCE(SUM(valor), 0) FROM movimentacoes WHERE tipo='Receita'"
    )
    receitas = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COALESCE(SUM(valor), 0) FROM movimentacoes WHERE tipo='Despesa'"
    )
    despesas = cursor.fetchone()[0]

    conexao.close()

    saldo = receitas - despesas

    return saldo, receitas, despesas