from datetime import datetime

from PySide6.QtWidgets import (
    QWidget, QTableWidgetItem, QHeaderView,
    QPushButton, QHBoxLayout, QComboBox, QMessageBox
)
from PySide6.QtUiTools import QUiLoader
from PySide6.QtCore import QFile
from PySide6.QtGui import QColor

from banco import (
    buscar_movimentacoes,
    excluir_movimentacao_por_id,
    buscar_movimentacao_por_id
)
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

        self.combo_tipo = QComboBox()
        self.combo_tipo.addItems(["Todos os tipos", "Receita", "Despesa"])
        self.combo_tipo.currentTextChanged.connect(self.pesquisar)
        self.tela.mainLayout.insertWidget(2, self.combo_tipo)

        self.combo_periodo = QComboBox()
        self.combo_periodo.addItems(["Todo período", "Hoje", "Este mês", "Este ano"])
        self.combo_periodo.currentTextChanged.connect(self.pesquisar)
        self.tela.mainLayout.insertWidget(3, self.combo_periodo)

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
        self.tela.inputPesquisa.textChanged.connect(self.pesquisar)

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
        tabela.setColumnCount(7)
        tabela.setHorizontalHeaderLabels(
            ["ID", "Data", "Tipo", "Categoria", "Descrição", "Valor", "Ações"]
        )

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

            container = QWidget()
            layout = QHBoxLayout(container)
            layout.setContentsMargins(4, 2, 4, 2)

            btn_editar = QPushButton("Editar")
            btn_excluir = QPushButton("Excluir")

            btn_editar.setMinimumWidth(70)
            btn_excluir.setMinimumWidth(70)

            btn_editar.setStyleSheet("""
            QPushButton {
                background: #2563EB;
                color: white;
                border-radius: 6px;
                padding: 6px;
            }
            """)

            btn_excluir.setStyleSheet("""
            QPushButton {
                background: #DC2626;
                color: white;
                border-radius: 6px;
                padding: 6px;
            }
            """)

            btn_editar.clicked.connect(
                lambda _, id_mov=id_mov: self.editar_movimentacao(id_mov)
            )

            btn_excluir.clicked.connect(
                lambda _, id_mov=id_mov: self.excluir_movimentacao(id_mov)
            )

            layout.addWidget(btn_editar)
            layout.addWidget(btn_excluir)

            tabela.setCellWidget(linha, 6, container)

        tabela.setColumnHidden(0, True)
        tabela.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        tabela.setColumnWidth(6, 180)
        tabela.setAlternatingRowColors(True)
        tabela.verticalHeader().setVisible(False)
        tabela.setSortingEnabled(True)

        self.pesquisar()

    def editar_movimentacao(self, id_movimentacao):
        dados = buscar_movimentacao_por_id(id_movimentacao)

        self.janela_movimentacao = MovimentacaoDialog(
            dados[2],
            self.atualizar_tudo,
            dados_edicao=dados
        )

        self.janela_movimentacao.exec()

    def excluir_movimentacao(self, id_movimentacao):
        msg = QMessageBox(self.tela)
        msg.setWindowTitle("Excluir movimentação")
        msg.setText("Deseja realmente excluir esta movimentação?")
        msg.setIcon(QMessageBox.Icon.Warning)

        btn_sim = msg.addButton("Sim", QMessageBox.ButtonRole.YesRole)
        msg.addButton("Não", QMessageBox.ButtonRole.NoRole)

        msg.exec()

        if msg.clickedButton() == btn_sim:
            excluir_movimentacao_por_id(id_movimentacao)
            self.atualizar_tudo()

    def pesquisar(self):
        texto = self.tela.inputPesquisa.text().lower()
        tipo_filtro = self.combo_tipo.currentText()
        periodo_filtro = self.combo_periodo.currentText()
        hoje = datetime.now()

        for linha in range(self.tela.tabelaFinanceiro.rowCount()):
            mostrar = True

            if tipo_filtro != "Todos os tipos":
                item_tipo = self.tela.tabelaFinanceiro.item(linha, 2)
                if not item_tipo or item_tipo.text() != tipo_filtro:
                    mostrar = False

            if periodo_filtro != "Todo período":
                item_data = self.tela.tabelaFinanceiro.item(linha, 1)

                try:
                    data_linha = datetime.strptime(item_data.text(), "%d/%m/%Y")

                    if periodo_filtro == "Hoje" and data_linha.date() != hoje.date():
                        mostrar = False

                    if periodo_filtro == "Este mês":
                        if data_linha.month != hoje.month or data_linha.year != hoje.year:
                            mostrar = False

                    if periodo_filtro == "Este ano" and data_linha.year != hoje.year:
                        mostrar = False

                except Exception:
                    mostrar = False

            if texto:
                encontrou_texto = False

                for coluna in range(self.tela.tabelaFinanceiro.columnCount() - 1):
                    item = self.tela.tabelaFinanceiro.item(linha, coluna)

                    if item and texto in item.text().lower():
                        encontrou_texto = True
                        break

                if not encontrou_texto:
                    mostrar = False

            self.tela.tabelaFinanceiro.setRowHidden(linha, not mostrar)

    def exportar(self):
        print("Exportar")
