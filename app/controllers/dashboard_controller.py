from datetime import datetime

from PySide6.QtCharts import QChart, QChartView, QBarSeries, QBarSet, QBarCategoryAxis, QValueAxis
from PySide6.QtGui import QPainter
from PySide6.QtCore import Qt
from PySide6.QtWidgets import QMainWindow, QTableWidgetItem, QHeaderView
from PySide6.QtUiTools import QUiLoader
from PySide6.QtCore import QFile, QTimer
from PySide6.QtGui import QColor

from banco import buscar_resumo, buscar_movimentacoes
from app.controllers.financeiro_controller import FinanceiroController

def formatar_moeda(valor):
    return f"R$ {valor:.2f}".replace(".", ",")


class DashboardController(QMainWindow):
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
        try:
            agora = datetime.now()
            texto = agora.strftime("FinMaster PRO ERP • %d/%m/%Y • %H:%M:%S")

            if hasattr(self.tela, "chartPlaceholder"):
                self.tela.chartPlaceholder.setText(texto)

        except RuntimeError:
            pass

    def configurar_menu(self):
        self.tela.btnDashboard.clicked.connect(self.recarregar_dashboard)
        self.tela.btnFinanceiro.clicked.connect(self.abrir_financeiro)
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

    def recarregar_dashboard(self):
        from app.controllers.dashboard_controller import DashboardController

        novo_dashboard = DashboardController()
        novo_dashboard.showMaximized()

        self.close()

    def atualizar_cards(self):
        saldo, receitas, despesas = buscar_resumo()

        self.tela.labelSaldoValor.setText(formatar_moeda(saldo))
        self.tela.labelReceitasValor.setText(formatar_moeda(receitas))
        self.tela.labelDespesasValor.setText(formatar_moeda(despesas))

    def abrir_financeiro(self):
        self.tela.titleLabel.setText("💰 Financeiro")

        self.financeiro_controller = FinanceiroController(self.atualizar_cards)

        layout = self.tela.chartLayout

        while layout.count():
            item = layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        layout.addWidget(self.financeiro_controller.tela)

    def carregar_dados(self):
        saldo, receitas, despesas = buscar_resumo()

        self.tela.labelSaldoValor.setText(formatar_moeda(saldo))
        self.tela.labelReceitasValor.setText(formatar_moeda(receitas))
        self.tela.labelDespesasValor.setText(formatar_moeda(despesas))
        self.criar_grafico_financeiro(receitas, despesas)

        tabela = self.tela.tabelaMovimentacoes
        movimentacoes = buscar_movimentacoes()

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
                
    def criar_grafico_financeiro(self, receitas, despesas):
        # Limpa o conteúdo antigo do bloco de gráfico
        layout = self.tela.chartLayout

        while layout.count():
            item = layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        receitas_barra = QBarSet("Receitas")
        despesas_barra = QBarSet("Despesas")

        receitas_barra.append(receitas)
        despesas_barra.append(despesas)

        receitas_barra.setColor("#22C55E")
        despesas_barra.setColor("#EF4444")

        series = QBarSeries()
        series.append(receitas_barra)
        series.append(despesas_barra)

        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("Receitas x Despesas")
        chart.setAnimationOptions(QChart.SeriesAnimations)
        chart.setBackgroundBrush(Qt.transparent)

        eixo_x = QBarCategoryAxis()
        eixo_x.append(["Resumo"])

        eixo_y = QValueAxis()
        eixo_y.setLabelFormat("R$ %.0f")

        chart.addAxis(eixo_x, Qt.AlignBottom)
        chart.addAxis(eixo_y, Qt.AlignLeft)

        series.attachAxis(eixo_x)
        series.attachAxis(eixo_y)

        chart.legend().setVisible(True)
        chart.legend().setAlignment(Qt.AlignBottom)

        chart_view = QChartView(chart)
        chart_view.setRenderHint(QPainter.Antialiasing)
        chart_view.setStyleSheet("background: transparent;")

        layout.addWidget(chart_view)        