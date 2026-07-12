import { FiSearch } from "react-icons/fi";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ExpenseSearch({ value, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 58,
        padding: "0 18px",
        marginBottom: 20,
        border: "1px solid #1f2937",
        borderRadius: 18,
        background: "#111827",
      }}
    >
      <FiSearch color="#94a3b8" />

      <input
        placeholder="Buscar por descrição ou categoria..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          border: 0,
          outline: 0,
          background: "transparent",
          color: "white",
        }}
      />
    </div>
  );
}
