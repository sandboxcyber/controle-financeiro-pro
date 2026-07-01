from PySide6.QtWidgets import QMessageBox
from PySide6.QtUiTools import QUiLoader
from PySide6.QtCore import QFile
from PySide6.QtGui import QGuiApplication

from app.controllers.dashboard_controller import DashboardController


class LoginController:
    def __init__(self):
        loader = QUiLoader()
        arquivo = QFile("app/ui/login.ui")
        arquivo.open(QFile.ReadOnly)

        self.tela = loader.load(arquivo)
        arquivo.close()

        self.tela.setFixedSize(600, 360)
        self.centralizar_tela()

        self.dashboard = None
        self.tela.btnEntrar.clicked.connect(self.fazer_login)

    def centralizar_tela(self):
        tela_disponivel = QGuiApplication.primaryScreen().availableGeometry()
        x = (tela_disponivel.width() - self.tela.width()) // 2
        y = (tela_disponivel.height() - self.tela.height()) // 2
        self.tela.move(x, y)

    def fazer_login(self):
        usuario = self.tela.inputUsuario.text()
        senha = self.tela.inputSenha.text()

        if usuario == "admin" and senha == "123":
            self.dashboard = DashboardController()
            self.dashboard.show()
            self.tela.close()
        else:
            QMessageBox.warning(
                self.tela,
                "Erro",
                "Usuário ou senha inválidos."
            )