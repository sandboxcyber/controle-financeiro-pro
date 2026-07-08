import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { dia: "01", saldo: 1200 },
  { dia: "05", saldo: 2800 },
  { dia: "10", saldo: 1600 },
  { dia: "15", saldo: 4200 },
  { dia: "20", saldo: 3900 },
  { dia: "25", saldo: 6100 },
  { dia: "30", saldo: 5728 },
];

export default function BalanceChart() {
  return (
    <div className="chart-card">
      <h3>Evolução do saldo</h3>
      <p>Acumulado no período selecionado</p>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <XAxis dataKey="dia" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="saldo" stroke="#2563eb" fill="#2563eb33" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}