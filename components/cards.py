import ttkbootstrap as ttk


def criar_card(pai, titulo, valor):
    card = ttk.Frame(pai, padding=20)
    card.pack(side="left", padx=15)

    ttk.Label(card, text=titulo, font=("Segoe UI", 13, "bold")).pack()
    ttk.Label(card, text=valor, font=("Segoe UI", 22, "bold")).pack(pady=10)


def criar_cards(pai, saldo, receitas, despesas):
    cards = ttk.Frame(pai)
    cards.pack(pady=10)

    criar_card(cards, "💰 Saldo Total", f"R$ {saldo:.2f}")
    criar_card(cards, "📈 Receitas", f"R$ {receitas:.2f}")
    criar_card(cards, "📉 Despesas", f"R$ {despesas:.2f}")

    return cards