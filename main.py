import sys
from datetime import datetime

from PySide6.QtWidgets import QApplication, QMainWindow, QTableWidgetItem
from PySide6.QtUiTools import QUiLoader
from PySide6.QtCore import QFile, QTimer

from banco import buscar_resumo, buscar_movimentacoes


def formatar_moeda(valor):
    return f"R$ {valor:.2f}".replace(".", ",")


class FinMaster(QMainWindow):
    def __init__(self):
        super().__init__()

        loader = QUiLoader()
        arquivo_ui = QFile("app/ui/dashboard.ui")
        arquivo_ui.open(QFile.ReadOnly)

        self.tela = loader.load(arquivo_ui)
        arquivo_ui.close()

        self.setCentralWidget(self.tela.centralWidget())
        self.setWindowTitle("FinMaster PRO ERP")
        self.resize(1400, 900)

        self.configurar_cabecalho()
        self.carregar_dados()

        self.timer = QTimer()
        self.timer.timeout.connect(self.atualizar_data_hora)
        self.timer.start(1000)

    def configurar_cabecalho(self):
        self.tela.titleLabel.setText("Olá, Diego 👋")
        self.atualizar_data_hora()

    def atualizar_data_hora(self):
        agora = datetime.now()
        texto = agora.strftime("FinMaster PRO ERP • %d/%m/%Y • %H:%M:%S")
        self.tela.chartPlaceholder.setText(texto)

    def carregar_dados(self):
        saldo, receitas, despesas = buscar_resumo()

        self.tela.labelSaldoValor.setText(formatar_moeda(saldo))
        self.tela.labelReceitasValor.setText(formatar_moeda(receitas))
        self.tela.labelDespesasValor.setText(formatar_moeda(despesas))

        tabela = self.tela.tabelaMovimentacoes
        movimentacoes = buscar_movimentacoes()

        tabela.setRowCount(len(movimentacoes))
        tabela.setColumnCount(6)
        tabela.setHorizontalHeaderLabels(["ID", "Data", "Tipo", "Categoria", "Descrição", "Valor"])

        for linha, mov in enumerate(movimentacoes):
            id_mov, data, tipo, categoria, descricao, valor = mov
            dados = [str(id_mov), data, tipo, categoria, descricao, formatar_moeda(valor)]

            for coluna, item in enumerate(dados):
                tabela.setItem(linha, coluna, QTableWidgetItem(item))


if __name__ == "__main__":
    app = QApplication(sys.argv)

    janela = FinMaster()
    janela.show()

    sys.exit(app.exec())