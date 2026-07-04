from datetime import datetime

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QLabel, QLineEdit,
    QPushButton, QHBoxLayout, QMessageBox
)

from banco import adicionar_movimentacao


class MovimentacaoDialog(QDialog):
    def __init__(self, tipo, ao_salvar=None):
        super().__init__()

        self.tipo = tipo
        self.ao_salvar = ao_salvar

        self.setWindowTitle(f"Nova {tipo}")
        self.setFixedSize(420, 360)

        layout = QVBoxLayout(self)

        self.data = QLineEdit()
        self.data.setText(datetime.now().strftime("%d/%m/%Y"))

        self.categoria = QLineEdit()
        self.descricao = QLineEdit()
        self.valor = QLineEdit()

        layout.addWidget(QLabel("Data"))
        layout.addWidget(self.data)

        layout.addWidget(QLabel("Categoria"))
        layout.addWidget(self.categoria)

        layout.addWidget(QLabel("Descrição"))
        layout.addWidget(self.descricao)

        layout.addWidget(QLabel("Valor"))
        layout.addWidget(self.valor)

        botoes = QHBoxLayout()

        btn_cancelar = QPushButton("Cancelar")
        btn_salvar = QPushButton("Salvar")

        btn_cancelar.clicked.connect(self.close)
        btn_salvar.clicked.connect(self.salvar)

        botoes.addWidget(btn_cancelar)
        botoes.addWidget(btn_salvar)

        layout.addLayout(botoes)

    def salvar(self):
        try:
            valor = float(self.valor.text().replace(",", "."))

            adicionar_movimentacao(
                self.data.text(),
                self.tipo,
                self.categoria.text(),
                self.descricao.text(),
                valor
            )

            if self.ao_salvar:
                self.ao_salvar()

            self.close()

        except ValueError:
            QMessageBox.warning(self, "Erro", "Digite um valor válido.")