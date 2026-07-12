import { useEffect, useState } from "react";
import { fixedExpenseService } from "../../services/fixedExpense";

type Props = {
  open: boolean;
  expense: any;
  onClose: () => void;
};

export default function ExpenseDetailsDrawer({
  open,
  expense,
  onClose,
}: Props) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!expense || !open) return;

    fixedExpenseService
      .historico(expense.id)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]));
  }, [expense, open]);

  if (!open || !expense) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 420,
        height: "100vh",
        background: "#0f172a",
        borderLeft: "1px solid #1e293b",
        padding: 25,
        zIndex: 9999,
        overflowY: "auto",
        boxShadow: "-10px 0 40px rgba(0,0,0,.4)",
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h2>{expense.description}</h2>

      <p style={{ color: "#94a3b8" }}>
        {expense.category}
      </p>

      <h1 style={{ color: "#38bdf8" }}>
        R$ {Number(expense.amount).toFixed(2)}
      </h1>

      <hr />

      <h3>Histórico de pagamentos</h3>

      {history.length === 0 ? (
        <p>Nenhum pagamento registrado.</p>
      ) : (
        history.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 15,
              border: "1px solid #1e293b",
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <strong>{item.reference_month}</strong>

            <br />

            <small>
              Pago em{" "}
              {new Date(item.paid_at).toLocaleDateString("pt-BR")}
            </small>
          </div>
        ))
      )}
    </div>
  );
}