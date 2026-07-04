from PySide6.QtWidgets import QWidget, QTableWidgetItem, QHeaderView
from PySide6.QtUiTools import QUiLoader
from PySide6.QtCore import QFile
from PySide6.QtGui import QColor

from banco import buscar_movimentacoes
from app.controllers.movimentacao_dialog import MovimentacaoDialog


def formatar_moeda(valor):
    return f"R$ {valor:.2f}".replace(".", ",")


class FinanceiroController(QWidget):
    def __init__(self, ao_atualizar_dashboard=None):
        super().__init__()
        
        self.ao_atualizar_dashboard = ao_atualizar_dashboard
        
        loader = QUiLoader()
        arquivo = QFile("app/ui/financeiro.ui")
        arquivo.open(QFile.ReadOnly)

        self.tela = loader.load(arquivo)
        arquivo.close()

        self.configurar_eventos()
        self.carregar_tabela()
    def atualizar_tudo(self):
        self.carregar_tabela()

        if self.ao_atualizar_dashboard:
            self.ao_atualizar_dashboard()

    def configurar_eventos(self):
        self.tela.btnNovaReceita.clicked.connect(self.nova_receita)
        self.tela.btnNovaDespesa.clicked.connect(self.nova_despesa)
        self.tela.btnExportar.clicked.connect(self.exportar)

    def nova_receita(self):
        self.janela_movimentacao = MovimentacaoDialog("Receita", self.atualizar_tudo)
        self.janela_movimentacao.exec()

    def nova_despesa(self):
        self.janela_movimentacao = MovimentacaoDialog("Despesa", self.atualizar_tudo)
        self.janela_movimentacao.exec()

    def carregar_tabela(self):
        tabela = self.tela.tabelaFinanceiro
        movimentacoes = buscar_movimentacoes(100)

        tabela.setSortingEnabled(False)
        tabela.setRowCount(len(movimentacoes))
        tabela.setColumnCount(6)
        tabela.setHorizontalHeaderLabels(["ID", "Data", "Tipo", "Categoria", "Descrição", "Valor"])

        for linha, mov in enumerate(movimentacoes):
            id_mov, data, tipo, categoria, descricao, valor = mov
            dados = [str(id_mov), data, tipo, categoria, descricao, formatar_moeda(valor)]

            for coluna, item in enumerate(dados):
                celula = QTableWidgetItem(item)

                if tipo == "Receita":
                    celula.setForeground(QColor("#22C55E"))
                elif tipo == "Despesa":
                    celula.setForeground(QColor("#EF4444"))

                tabela.setItem(linha, coluna, celula)

        tabela.setColumnHidden(0, True)
        tabela.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        tabela.setAlternatingRowColors(True)
        tabela.verticalHeader().setVisible(False)
        tabela.setSortingEnabled(True)

    def exportar(self):
        print("Exportar")