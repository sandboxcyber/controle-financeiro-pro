import {
  FiCheck,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import type {
  ExpenseDueInfo,
  ExpenseStatus,
  FixedExpense,
} from "./types";

type Props = {
  items: FixedExpense[];
  onPay: (id: number) => void;
  onDetails: (item: FixedExpense) => void;
  onEdit: (item: FixedExpense) => void;
  onDelete: (id: number) => void;
  getStatus: (item: FixedExpense) => ExpenseStatus;
  getDueInfo: (item: FixedExpense) => ExpenseDueInfo;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function ExpenseTable({
  items,
  onPay,
  onDetails,
  onEdit,
  onDelete,
  getStatus,
  getDueInfo,
}: Props) {
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #1f2937",
        borderRadius: 18,
        background: "#111827",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ background: "#0f172a" }}>
            <th style={{ padding: 15, textAlign: "left" }}>Descrição</th>
            <th style={{ padding: 15, textAlign: "left" }}>Categoria</th>
            <th style={{ padding: 15, textAlign: "left" }}>Vencimento</th>
            <th style={{ padding: 15, textAlign: "left" }}>Status</th>
            <th style={{ padding: 15, textAlign: "left" }}>Valor</th>
            <th style={{ padding: 15, textAlign: "right" }}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const status = getStatus(item);
            const dueInfo = getDueInfo(item);

            return (
              <tr
                key={item.id}
                style={{ borderTop: "1px solid #1f2937" }}
              >
                <td style={{ padding: 15 }}>{item.description}</td>

                <td style={{ padding: 15 }}>
                  {item.category || "Outros"}
                </td>

                <td style={{ padding: 15 }}>
                  <strong
                    style={{
                      display: "block",
                      color: "#f8fafc",
                    }}
                  >
                    {dueInfo.titulo}
                  </strong>

                  <small
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: dueInfo.cor,
                      fontWeight: 600,
                    }}
                  >
                    {dueInfo.detalhe}
                  </small>
                </td>

                <td style={{ padding: 15 }}>
                  <span
                    style={{
                      color: status.cor,
                      fontWeight: 700,
                    }}
                  >
                    {status.texto}
                  </span>
                </td>

                <td
                  style={{
                    padding: 15,
                    color: "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(Number(item.amount))}
                </td>

                <td
                  style={{
                    padding: 15,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    onClick={() => onPay(item.id)}
                    disabled={!item.is_active || item.paid_this_month}
                    style={{
                      marginRight: 8,
                      background:
                        !item.is_active || item.paid_this_month
                          ? "#475569"
                          : "#16a34a",
                      cursor:
                        !item.is_active || item.paid_this_month
                          ? "not-allowed"
                          : "pointer",
                    }}
                    title={
                      item.paid_this_month
                        ? "Já foi paga neste mês"
                        : "Marcar como paga"
                    }
                  >
                    <FiCheck />
                  </button>

                  <button
                    onClick={() => onDetails(item)}
                    style={{
                      marginRight: 8,
                      background: "#2563eb",
                    }}
                    title="Detalhes"
                  >
                    👁️
                  </button>

                  <button
                    onClick={() => onEdit(item)}
                    style={{
                      marginRight: 8,
                      background: "#f59e0b",
                    }}
                    title="Editar"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    style={{ background: "#dc2626" }}
                    title="Excluir"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            );
          })}

          {items.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Nenhuma despesa fixa cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
