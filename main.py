import sys

from PySide6.QtWidgets import QApplication

from app.controllers.login_controller import LoginController


if __name__ == "__main__":
    app = QApplication(sys.argv)

    login = LoginController()
    login.tela.show()

    sys.exit(app.exec())