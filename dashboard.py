import ttkbootstrap as ttk


def iniciar():
    app = ttk.Window(themename="darkly")

    app.title("FinMaster PRO")
    app.geometry("1200x700")

    titulo = ttk.Label(
        app,
        text="FinMaster PRO",
        font=("Segoe UI", 26, "bold"),
    )
    titulo.pack(pady=30)

    card_saldo = ttk.Frame(app)
    card_saldo.pack(pady=20)

    ttk.Label(
        card_saldo,
        text="Saldo",
        font=("Segoe UI", 14, "bold"),
    ).pack(padx=30, pady=(20, 5))

    ttk.Label(
        card_saldo,
        text="R$ 0,00",
        font=("Segoe UI", 22, "bold"),
    ).pack(padx=30, pady=(5, 20))

    app.mainloop()


if __name__ == "__main__":
    iniciar()