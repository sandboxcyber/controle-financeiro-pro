import SummaryCard from "../components/SummaryCard";
import BalanceChart from "../components/BalanceChart";

export default function Dashboard() {
  return (
    <div style={{ padding: 30 }}>

      <h1 style={{ marginBottom: 5 }}>
        Dashboard Pessoal
      </h1>

      <p style={{ color: "#888", marginBottom: 25 }}>
        Visão geral • Este mês
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <SummaryCard
          title="Receitas"
          value="R$ 13.700"
          color="#00C853"
        />

        <SummaryCard
          title="Despesas"
          value="R$ 10.108"
          color="#FF5252"
        />

        <SummaryCard
          title="Saldo"
          value="R$ 3.591"
          color="#2196F3"
        />

        <SummaryCard
          title="Falta pagar"
          value="R$ 5.980"
          color="#FF9800"
        />
      </div>

      <BalanceChart />
    </div>
  );
}