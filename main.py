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
        self.configurar_menu()
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

    def configurar_menu(self):
        self.tela.btnDashboard.clicked.connect(self.mostrar_dashboard)
        self.tela.btnFinanceiro.clicked.connect(lambda: self.mostrar_tela("💰 Financeiro", "Módulo financeiro em construção."))
        self.tela.btnClientes.clicked.connect(lambda: self.mostrar_tela("👥 Clientes", "Cadastro de clientes em construção."))
        self.tela.btnFornecedores.clicked.connect(lambda: self.mostrar_tela("🚚 Fornecedores", "Cadastro de fornecedores em construção."))
        self.tela.btnEstoque.clicked.connect(lambda: self.mostrar_tela("📦 Estoque", "Controle de estoque em construção."))
        self.tela.btnVendas.clicked.connect(lambda: self.mostrar_tela("🛒 Vendas", "Módulo de vendas em construção."))
        self.tela.btnRelatorios.clicked.connect(lambda: self.mostrar_tela("📊 Relatórios", "Relatórios em construção."))
        self.tela.btnConfiguracoes.clicked.connect(lambda: self.mostrar_tela("⚙️ Configurações", "Configurações em construção."))

    def mostrar_dashboard(self):
        self.tela.titleLabel.setText("Olá, Diego 👋")
        self.tela.chartTitle.setText("Evolução Financeira")
        self.carregar_dados()

    def mostrar_tela(self, titulo, mensagem):
        self.tela.titleLabel.setText(titulo)
        self.tela.chartTitle.setText(mensagem)
        self.tela.chartPlaceholder.setText("Em breve este módulo terá recursos completos.")

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