import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  saldoBancos: number;
  investimentos: number;
  cartoesUtilizado: number;
  cartoesDisponivel: number;
  receitas: number;
  despesas: number;
};

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function FinanceCharts({
  saldoBancos,
  investimentos,
  cartoesUtilizado,
  cartoesDisponivel,
  receitas,
  despesas,
}: Props) {
  const patrimonio = [
    { name: "Bancos", value: saldoBancos },
    { name: "Investimentos", value: investimentos },
  ];

  const cartoes = [
    { name: "Utilizado", value: cartoesUtilizado },
    { name: "Disponível", value: cartoesDisponivel },
  ];

  const fluxo = [
    { name: "Receitas", value: receitas },
    { name: "Despesas", value: despesas },
  ];

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
          Patrimônio
        </span>

        <h2 className="mt-2 text-xl font-bold text-white">
          Distribuição dos ativos
        </h2>

        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={patrimonio}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={4}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#22c55e" />
              </Pie>

              <Tooltip
                formatter={(value) => moeda(Number(value))}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Legenda
            titulo="Bancos"
            valor={moeda(saldoBancos)}
            cor="#3b82f6"
          />

          <Legenda
            titulo="Investimentos"
            valor={moeda(investimentos)}
            cor="#22c55e"
          />
        </div>
      </article>

      <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
          Cartões
        </span>

        <h2 className="mt-2 text-xl font-bold text-white">
          Uso do limite
        </h2>

        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cartoes}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={4}
              >
                <Cell fill="#ef4444" />
                <Cell fill="#22c55e" />
              </Pie>

              <Tooltip
                formatter={(value) => moeda(Number(value))}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Legenda
            titulo="Utilizado"
            valor={moeda(cartoesUtilizado)}
            cor="#ef4444"
          />

          <Legenda
            titulo="Disponível"
            valor={moeda(cartoesDisponivel)}
            cor="#22c55e"
          />
        </div>
      </article>

      <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
          Fluxo de caixa
        </span>

        <h2 className="mt-2 text-xl font-bold text-white">
          Receitas e despesas
        </h2>

        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fluxo}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
              />

              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(value))
                }
              />

              <Tooltip
                formatter={(value) => moeda(Number(value))}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: 12,
                }}
              />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

function Legenda({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: cor }}
        />

        <span className="text-xs text-slate-500">
          {titulo}
        </span>
      </div>

      <strong className="mt-2 block text-sm text-white">
        {valor}
      </strong>
    </div>
  );
}
