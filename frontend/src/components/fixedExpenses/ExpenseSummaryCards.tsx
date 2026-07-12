type Props = {
  total: number;
  pagas: number;
  pendentes: number;
  atrasadas: number;
};

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function ExpenseSummaryCards({
  total,
  pagas,
  pendentes,
  atrasadas,
}: Props) {
  const cards = [
    {
      titulo: "Total mensal ativo",
      valor: moeda(total),
      cor: "#ef4444",
    },
    {
      titulo: "Pagas",
      valor: String(pagas),
      cor: "#22c55e",
    },
    {
      titulo: "Pendentes",
      valor: String(pendentes),
      cor: "#f59e0b",
    },
    {
      titulo: "Atrasadas",
      valor: String(atrasadas),
      cor: "#ef4444",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(150px, 1fr))",
        gap: 16,
        marginBottom: 20,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.titulo}
          style={{
            minHeight: 105,
            padding: 20,
            border: "1px solid #1f2937",
            borderRadius: 18,
            background: "#111827",
          }}
        >
          <span style={{ color: "#94a3b8" }}>
            {card.titulo}
          </span>

          <h2
            style={{
              margin: "10px 0 0",
              color: card.cor,
              fontSize: 26,
            }}
          >
            {card.valor}
          </h2>
        </div>
      ))}
    </div>
  );
}