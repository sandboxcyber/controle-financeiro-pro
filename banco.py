import sqlite3

BANCO = "financeiro.db"


def conectar():
    return sqlite3.connect(BANCO)


def buscar_resumo():
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("SELECT COALESCE(SUM(valor), 0) FROM movimentacoes WHERE tipo='Receita'")
    receitas = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(valor), 0) FROM movimentacoes WHERE tipo='Despesa'")
    despesas = cursor.fetchone()[0]

    conexao.close()

    saldo = receitas - despesas
    return saldo, receitas, despesas


def buscar_movimentacoes(limite=10):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("""
        SELECT id, data, tipo, categoria, descricao, valor
        FROM movimentacoes
        ORDER BY id DESC
        LIMIT ?
    """, (limite,))

    dados = cursor.fetchall()
    conexao.close()

    return dados


def adicionar_movimentacao(data, tipo, categoria, descricao, valor):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("""
        INSERT INTO movimentacoes (data, tipo, categoria, descricao, valor)
        VALUES (?, ?, ?, ?, ?)
    """, (data, tipo, categoria, descricao, valor))

    conexao.commit()
    conexao.close()


def excluir_movimentacao(data, tipo, categoria, descricao, valor):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("""
        DELETE FROM movimentacoes
        WHERE data=?
        AND tipo=?
        AND categoria=?
        AND descricao=?
        AND valor=?
        LIMIT 1
    """, (data, tipo, categoria, descricao, valor))

    conexao.commit()
    conexao.close()

def excluir_movimentacao_por_id(id_movimentacao):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        "DELETE FROM movimentacoes WHERE id = ?",
        (id_movimentacao,)
    )

    conexao.commit()
    conexao.close()   

def buscar_movimentacao_por_id(id_movimentacao):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("""
        SELECT id, data, tipo, categoria, descricao, valor
        FROM movimentacoes
        WHERE id = ?
    """, (id_movimentacao,))

    dados = cursor.fetchone()

    conexao.close()

    return dados    

def atualizar_movimentacao(id_movimentacao, data, tipo, categoria, descricao, valor):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("""
        UPDATE movimentacoes
        SET data = ?,
            tipo = ?,
            categoria = ?,
            descricao = ?,
            valor = ?
        WHERE id = ?
    """, (
        data,
        tipo,
        categoria,
        descricao,
        valor,
        id_movimentacao
    ))

    conexao.commit()
    conexao.close()