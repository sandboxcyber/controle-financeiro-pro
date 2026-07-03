from PySide6.QtWidgets import QWidget
from PySide6.QtUiTools import QUiLoader
from PySide6.QtCore import QFile


class FinanceiroController(QWidget):
    def __init__(self):
        super().__init__()

        loader = QUiLoader()

        arquivo = QFile("app/ui/financeiro.ui")
        arquivo.open(QFile.ReadOnly)

        self.tela = loader.load(arquivo)
        arquivo.close()

        self.configurar_eventos()

    def configurar_eventos(self):
        self.tela.btnNovaReceita.clicked.connect(self.nova_receita)
        self.tela.btnNovaDespesa.clicked.connect(self.nova_despesa)
        self.tela.btnExportar.clicked.connect(self.exportar)

    def nova_receita(self):
        print("Nova Receita")

    def nova_despesa(self):
        print("Nova Despesa")

    def exportar(self):
        print("Exportar")