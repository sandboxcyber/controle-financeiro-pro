import { useEffect, useState } from "react";
import {
  FiArrowDownRight, FiArrowUpRight, FiCreditCard,
  FiDollarSign, FiTrendingUp
} from "react-icons/fi";

import BalanceChart from "../components/BalanceChart";
import { api } from "../services/api";
import { FINANCE_UPDATED_EVENT } from "../services/financeEvents";
import { fixedExpenseService } from "../services/fixedExpense";

type Resumo = {
  receitas: string;
  despesas: string;
  saldo: string;
  falta_pagar: string;
};

type ProximoVencimento = {
  id: number;
  description: string;
  amount: number;
  category?: string;
  due_day: number;
  days_until_due: number;
  is_overdue: boolean;
};

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

function Card({
  title, value, subtitle, icon, color
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="m-0 text-sm text-slate-500">{title}</p>
          <h3 className="mt-3 text-2xl font-black text-white">{value}</h3>
          <p className="mt-2 text-xs text-slate-600">{subtitle}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl text-xl" style={{ background: `${color}1f`, color }}>
          {icon}
        </div>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [resumo, setResumo] = useState<Resumo>({
    receitas: "R$ 0,00",
    despesas: "R$ 0,00",
    saldo: "R$ 0,00",
    falta_pagar: "R$ 0,00",
  });

  const [carregando, setCarregando] = useState(true);
  const [proximos, setProximos] = useState<ProximoVencimento[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const [r, p] = await Promise.all([
          api.get("/dashboard/resumo"),
          fixedExpenseService.proximosVencimentos(),
        ]);
        setResumo(r.data);
        setProximos(p.data);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
    window.addEventListener(FINANCE_UPDATED_EVENT, carregar);
    window.addEventListener("focus", carregar);

    return () => {
      window.removeEventListener(FINANCE_UPDATED_EVENT, carregar);
      window.removeEventListener("focus", carregar);
    };
  }, []);

  const mostrar = (v: string) => carregando ? "Carregando..." : v;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-7">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-blue-400">FinMaster Pro</span>
            <h1 className="mt-3 text-4xl font-black text-white">Boa tarde, Diego 👋</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Veja sua situação financeira, contas próximas e evolução do mês em um único lugar.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-slate-950/50 px-6 py-4 text-center">
            <div className="text-sm text-slate-500">Saúde financeira</div>
            <div className="mt-1 text-4xl font-black text-blue-400">82</div>
            <div className="mt-1 text-xs font-semibold text-emerald-400">Boa</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Saldo atual" value={mostrar(resumo.saldo)} subtitle="Disponível no momento" icon={<FiDollarSign />} color="#3b82f6" />
        <Card title="Receitas" value={mostrar(resumo.receitas)} subtitle="Entradas neste mês" icon={<FiArrowUpRight />} color="#22c55e" />
        <Card title="Despesas" value={mostrar(resumo.despesas)} subtitle="Saídas neste mês" icon={<FiArrowDownRight />} color="#ef4444" />
        <Card title="Falta pagar" value={mostrar(resumo.falta_pagar)} subtitle="Contas pendentes" icon={<FiCreditCard />} color="#f59e0b" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <article className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Visão financeira</span>
              <h2 className="mt-2 text-xl font-bold text-white">Evolução do saldo</h2>
            </div>
            <select className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
              <option>Este mês</option>
              <option>Últimos 3 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <BalanceChart />
        </article>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
              <FiTrendingUp />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Vera IA</span>
              <h2 className="mt-1 text-lg font-bold text-white">Análise automática</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <strong className="text-sm text-white">Seu saldo está positivo</strong>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Você ainda tem margem para investir ou antecipar contas.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <strong className="text-sm text-white">Atenção às pendências</strong>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Revise os próximos vencimentos para manter seu planejamento em dia.
              </p>
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500">
            Ver análise completa
          </button>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Movimentações</span>
          <h2 className="mt-2 text-xl font-bold text-white">Últimos lançamentos</h2>
          <div className="mt-5 rounded-2xl border border-dashed border-slate-800 px-5 py-12 text-center text-sm text-slate-600">
            Seus próximos lançamentos aparecerão aqui.
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Alertas</span>
          <h2 className="mt-2 text-xl font-bold text-white">Próximas contas</h2>

          <div className="mt-5 space-y-3">
            {proximos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 px-5 py-10 text-center text-sm text-slate-600">
                Nenhuma conta próxima do vencimento.
              </div>
            ) : (
              proximos.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-white">{item.description}</strong>
                    <span className="mt-1 block text-xs text-slate-600">{item.category || "Outros"}</span>
                    <small className={item.is_overdue ? "mt-2 block text-xs font-bold text-red-400" : "mt-2 block text-xs text-slate-500"}>
                      {item.is_overdue
                        ? `Atrasada há ${Math.abs(item.days_until_due)} dia(s)`
                        : item.days_until_due === 0
                        ? "Vence hoje"
                        : item.days_until_due === 1
                        ? "Vence amanhã"
                        : `Vence em ${item.days_until_due} dias`}
                    </small>
                  </div>

                  <div className="shrink-0 text-right">
                    <strong className="block text-sm font-black text-red-400">
                      {moeda(Number(item.amount))}
                    </strong>
                    <small className="mt-1 block text-xs text-slate-600">
                      Dia {item.due_day}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
