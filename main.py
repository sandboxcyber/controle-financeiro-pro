from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, QPushButton, QLabel, QFrame
from PySide6.QtCore import Qt
import sys

from banco import buscar_resumo

class FinMaster(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("FinMaster PRO ERP")
        self.resize(1400, 900)

        central = QWidget()
        self.setCentralWidget(central)

        layout_principal = QHBoxLayout(central)

        menu = QFrame()
        menu.setFixedWidth(240)
        menu.setStyleSheet("background-color: #111827;")

        menu_layout = QVBoxLayout(menu)

        titulo_menu = QLabel("FinMaster")
        titulo_menu.setStyleSheet("color: white; font-size: 24px; font-weight: bold;")
        titulo_menu.setAlignment(Qt.AlignCenter)

        menu_layout.addWidget(titulo_menu)

        botoes = ["Dashboard", "Financeiro", "Clientes", "Relatórios", "Configurações"]

        for texto in botoes:
            botao = QPushButton(texto)
            botao.setStyleSheet("""
                QPushButton {
                    background-color: #1F2937;
                    color: white;
                    padding: 12px;
                    border-radius: 8px;
                    text-align: left;
                    font-size: 15px;
                }
                QPushButton:hover {
                    background-color: #2563EB;
                }
            """)
            menu_layout.addWidget(botao)

        menu_layout.addStretch()

        conteudo = QFrame()
        conteudo.setStyleSheet("background-color: #0F172A;")

        conteudo_layout = QVBoxLayout(conteudo)

        titulo = QLabel("Dashboard")
        titulo.setStyleSheet("color: white; font-size: 32px; font-weight: bold;")
        conteudo_layout.addWidget(titulo)

        subtitulo = QLabel("Bem-vindo ao FinMaster PRO ERP")
        subtitulo.setStyleSheet("color: #CBD5E1; font-size: 18px;")
        conteudo_layout.addWidget(subtitulo)

        cards = QHBoxLayout()

        saldo, receitas, despesas = buscar_resumo()

        for nome, valor in [
            ("Saldo Total", f"R$ {saldo:.2f}"),
            ("Receitas", f"R$ {receitas:.2f}"),
            ("Despesas", f"R$ {despesas:.2f}"),
            ("Resultado", f"R$ {saldo:.2f}")
        ]:
       
            card = QFrame()
            card.setStyleSheet("""
                QFrame {
                    background-color: #1E293B;
                    border-radius: 14px;
                    padding: 20px;
                }
            """)

            card_layout = QVBoxLayout(card)

            lbl_nome = QLabel(nome)
            lbl_nome.setStyleSheet("color: #94A3B8; font-size: 14px;")

            lbl_valor = QLabel(valor)
            lbl_valor.setStyleSheet("color: white; font-size: 24px; font-weight: bold;")

            card_layout.addWidget(lbl_nome)
            card_layout.addWidget(lbl_valor)

            cards.addWidget(card)

        conteudo_layout.addLayout(cards)
        conteudo_layout.addStretch()

        layout_principal.addWidget(menu)
        layout_principal.addWidget(conteudo)


if __name__ == "__main__":
    app = QApplication(sys.argv)

    janela = FinMaster()
    janela.show()

    sys.exit(app.exec())