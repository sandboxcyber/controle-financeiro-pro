from datetime import datetime

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QLabel, QLineEdit,
    QPushButton, QHBoxLayout, QMessageBox
)

from banco import adicionar_movimentacao, atualizar_movimentacao


class MovimentacaoDialog(QDialog):
    def __init__(self, tipo, ao_salvar=None, dados_edicao=None):
        super().__init__()

        self.tipo = tipo
        self.ao_salvar = ao_salvar
        self.id_edicao = None

        if dados_edicao:
            self.id_edicao = dados_edicao[0]
            self.tipo = dados_edicao[2]
            self.setWindowTitle("Editar movimentação")
        else:
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

        if dados_edicao:
            self.data.setText(dados_edicao[1])
            self.categoria.setText(dados_edicao[3])
            self.descricao.setText(dados_edicao[4])
            self.valor.setText(str(dados_edicao[5]))

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

            if self.id_edicao:
                atualizar_movimentacao(
                    self.id_edicao,
                    self.data.text(),
                    self.tipo,
                    self.categoria.text(),
                    self.descricao.text(),
                    valor
                )
            else:
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