import { FiX } from "react-icons/fi";

type Props = {
  open: boolean;
  editing: boolean;
  description: string;
  amount: string;
  category: string;
  dueDay: string;
  recurrence: string;
  isActive: boolean;
  error: string;
  saving: boolean;
  categories: string[];
  onClose: () => void;
  onSave: () => void;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDueDayChange: (value: string) => void;
  onRecurrenceChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
};

export default function ExpenseFormModal({
  open,
  editing,
  description,
  amount,
  category,
  dueDay,
  recurrence,
  isActive,
  error,
  saving,
  categories,
  onClose,
  onSave,
  onDescriptionChange,
  onAmountChange,
  onCategoryChange,
  onDueDayChange,
  onRecurrenceChange,
  onActiveChange,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(2, 6, 23, 0.78)",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(500px, 100%)",
          padding: 26,
          border: "1px solid #334155",
          borderRadius: 22,
          background: "#111827",
          boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              {editing ? "Editar despesa fixa" : "Nova despesa fixa"}
            </h2>

            <p style={{ color: "#94a3b8", marginBottom: 0 }}>
              Cadastre um gasto recorrente.
            </p>
          </div>

          <button onClick={onClose} style={{ background: "#334155" }}>
            <FiX />
          </button>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <input
            placeholder="Descrição"
            value={description}
            onChange={(event) =>
              onDescriptionChange(event.target.value)
            }
          />

          <input
            placeholder="Valor, exemplo: 150,00"
            inputMode="decimal"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
          />

          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Selecione a categoria</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            placeholder="Dia do vencimento"
            inputMode="numeric"
            value={dueDay}
            onChange={(event) => onDueDayChange(event.target.value)}
          />

          <select
            value={recurrence}
            onChange={(event) =>
              onRecurrenceChange(event.target.value)
            }
          >
            <option>Mensal</option>
            <option>Semanal</option>
            <option>Quinzenal</option>
            <option>Anual</option>
          </select>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                onActiveChange(event.target.checked)
              }
            />

            Despesa ativa
          </label>

          {error && (
            <p
              style={{
                margin: 0,
                padding: 11,
                borderRadius: 10,
                background: "#7f1d1d",
                color: "white",
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 8,
            }}
          >
            <button onClick={onClose} style={{ background: "#334155" }}>
              Cancelar
            </button>

            <button onClick={onSave} disabled={saving}>
              {saving
                ? "Salvando..."
                : editing
                ? "Salvar alterações"
                : "Cadastrar despesa fixa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
