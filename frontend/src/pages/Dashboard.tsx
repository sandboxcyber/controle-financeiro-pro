import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBriefcase,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

import BalanceChart from "../components/BalanceChart";
import FinanceCharts from "../components/FinanceCharts";
import ForecastCard from "../components/ForecastCard";
import FinancialAlerts from "../components/FinancialAlerts";

import { api } from "../services/api";
import { bankService, type BankAccount } from "../services/banks";
import { cardService, type CardPayload } from "../services/cards";
import { FINANCE_UPDATED_EVENT } from "../services/financeEvents";
import { fixedExpenseService } from "../services/fixedExpense";
import { financeOverviewService, type FinanceOverview } from "../services/financeOverview";
import { forecastService, type FinancialForecast } from "../services/forecast";
import { financialAlertsService, type FinancialAlert } from "../services/financialAlerts";
import { goalService, type Goal } from "../services/goals";

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

type CardItem = CardPayload & {
  id: number;
};

type MetricCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  color: string;
};

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-sm text-slate-500">{title}</p>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-600">{subtitle}</p>
        </div>

        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
          style={{
            color,
            background: `${color}1f`,
          }}
        >
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

  const [bancos, setBancos] = useState<BankAccount[]>([]);
  const [cartoes, setCartoes] = useState<CardItem[]>([]);
  const [metas, setMetas] = useState<Goal[]>([]);
  const [proximos, setProximos] = useState<ProximoVencimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [overview, setOverview] =
    useState<FinanceOverview | null>(null);
  const [forecast, setForecast] =
    useState<FinancialForecast | null>(null);
  const [financialAlerts, setFinancialAlerts] =
    useState<FinancialAlert[]>([]);


  async function carregarDashboard() {
    try {
      setCarregando(true);

      const [
        resumoResposta,
        bancosResposta,
        cartoesResposta,
        metasResposta,
        vencimentosResposta,
        overviewResposta,
        forecastResposta,
        alertsResposta,
      ] = await Promise.all([
        api.get("/dashboard/resumo"),
        bankService.listar(),
        cardService.listar(),
        goalService.listar(),
        fixedExpenseService.proximosVencimentos(),
        financeOverviewService.carregar(),
        forecastService.carregar(),
        financialAlertsService.carregar(),
      ]);

      setResumo(resumoResposta.data);
      setBancos(bancosResposta.data);
      setCartoes(cartoesResposta.data);
      setMetas(metasResposta.data);
      setProximos(vencimentosResposta.data);
      setOverview(overviewResposta.data);
      setForecast(forecastResposta.data);
      setFinancialAlerts(alertsResposta.data.alerts);
    } catch (erro) {
      console.error("Erro ao carregar o Dashboard:", erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();

    window.addEventListener(
      FINANCE_UPDATED_EVENT,
      carregarDashboard
    );

    window.addEventListener("focus", carregarDashboard);

    return () => {
      window.removeEventListener(
        FINANCE_UPDATED_EVENT,
        carregarDashboard
      );

      window.removeEventListener("focus", carregarDashboard);
    };
  }, []);

  const dadosConsolidados = useMemo(() => {
    const saldoBancos = bancos.reduce(
      (soma, conta) => soma + Number(conta.balance),
      0
    );

    const limiteCartoes = cartoes.reduce(
      (soma, cartao) => soma + Number(cartao.limit),
      0
    );

    const utilizadoCartoes = cartoes.reduce(
      (soma, cartao) => soma + Number(cartao.used),
      0
    );

    const objetivoMetas = metas.reduce(
      (soma, meta) => soma + Number(meta.target_amount),
      0
    );

    const acumuladoMetas = metas.reduce(
      (soma, meta) => soma + Number(meta.current_amount),
      0
    );

    return {
      saldoBancos,
      limiteCartoes,
      utilizadoCartoes,
      disponivelCartoes: limiteCartoes - utilizadoCartoes,
      objetivoMetas,
      acumuladoMetas,
      faltaMetas: Math.max(objetivoMetas - acumuladoMetas, 0),
    };
  }, [bancos, cartoes, metas]);

  const mostrar = (valor: string) =>
    carregando ? "Carregando..." : valor;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-7">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-blue-400">
              Central financeira
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-4xl">
              Olá, Diego 👋
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Seus bancos, cartões, receitas e contas reunidos em um único painel.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-slate-950/50 px-6 py-4 text-center">
            <div className="text-sm text-slate-500">
              Patrimônio em bancos
            </div>

            <div className="mt-2 text-3xl font-black text-blue-400">
              {carregando
                ? "Carregando..."
                : moeda(dadosConsolidados.saldoBancos)}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {bancos.length} conta(s) cadastrada(s)
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Saldo atual"
          value={mostrar(resumo.saldo)}
          subtitle="Resultado das movimentações"
          icon={<FiDollarSign />}
          color="#3b82f6"
        />

        <MetricCard
          title="Receitas"
          value={mostrar(resumo.receitas)}
          subtitle="Entradas registradas"
          icon={<FiArrowUpRight />}
          color="#22c55e"
        />

        <MetricCard
          title="Despesas"
          value={mostrar(resumo.despesas)}
          subtitle="Saídas registradas"
          icon={<FiArrowDownRight />}
          color="#ef4444"
        />

        <MetricCard
          title="Contas pendentes"
          value={mostrar(resumo.falta_pagar)}
          subtitle="Falta pagar"
          icon={<FiCreditCard />}
          color="#f59e0b"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Saldo nos bancos"
          value={
            carregando
              ? "Carregando..."
              : moeda(dadosConsolidados.saldoBancos)
          }
          subtitle={`${bancos.length} conta(s)`}
          icon={<FiBriefcase />}
          color="#06b6d4"
        />

        <MetricCard
          title="Limite dos cartões"
          value={
            carregando
              ? "Carregando..."
              : moeda(dadosConsolidados.limiteCartoes)
          }
          subtitle={`${cartoes.length} cartão(ões)`}
          icon={<FiCreditCard />}
          color="#8b5cf6"
        />

        <MetricCard
          title="Fatura utilizada"
          value={
            carregando
              ? "Carregando..."
              : moeda(dadosConsolidados.utilizadoCartoes)
          }
          subtitle="Total utilizado nos cartões"
          icon={<FiTrendingUp />}
          color="#ef4444"
        />

        <MetricCard
          title="Limite disponível"
          value={
            carregando
              ? "Carregando..."
              : moeda(dadosConsolidados.disponivelCartoes)
          }
          subtitle="Disponível para novas compras"
          icon={<FiDollarSign />}
          color="#22c55e"
        />
      </section>

      {forecast && (
        <ForecastCard forecast={forecast} />
      )}

      {financialAlerts.length > 0 && (
        <FinancialAlerts alerts={financialAlerts} />
      )}



      {overview && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Orçamentos definidos"
            value={moeda(overview.orcamentos.total_limites)}
            subtitle={`${overview.orcamentos.categorias} categoria(s)`}
            icon={<FiDollarSign />}
            color="#3b82f6"
          />

          <MetricCard
            title="Gasto nos orçamentos"
            value={moeda(overview.orcamentos.total_gasto)}
            subtitle="Total utilizado no mês"
            icon={<FiArrowDownRight />}
            color="#ef4444"
          />

          <MetricCard
            title="Disponível nos orçamentos"
            value={moeda(
              Math.max(
                overview.orcamentos.total_limites -
                  overview.orcamentos.total_gasto,
                0
              )
            )}
            subtitle="Valor ainda disponível"
            icon={<FiTrendingUp />}
            color="#22c55e"
          />

          <MetricCard
            title="Categorias em alerta"
            value={String(overview.orcamentos.alertas)}
            subtitle="Acima de 80% do limite"
            icon={<FiCreditCard />}
            color="#f59e0b"
          />
        </section>
      )}

      {overview && (
        <FinanceCharts
          saldoBancos={overview.saldo_bancos}
          investimentos={overview.investimentos}
          cartoesUtilizado={overview.cartoes_utilizado}
          cartoesDisponivel={overview.cartoes_disponivel}
          receitas={overview.receitas}
          despesas={overview.despesas}
        />
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <article className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                Visão financeira
              </span>

              <h2 className="mt-2 text-xl font-bold text-white">
                Evolução do saldo
              </h2>
            </div>

            <select className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none">
              <option>Este mês</option>
              <option>Últimos 3 meses</option>
              <option>Este ano</option>
            </select>
          </div>

          <BalanceChart />
        </article>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            Resumo consolidado
          </span>

          <h2 className="mt-2 text-xl font-bold text-white">
            Situação financeira
          </h2>

          <div className="mt-5 space-y-3">
            <ResumoItem
              titulo="Dinheiro nos bancos"
              valor={moeda(dadosConsolidados.saldoBancos)}
              cor="text-emerald-400"
            />

            <ResumoItem
              titulo="Cartões utilizados"
              valor={moeda(dadosConsolidados.utilizadoCartoes)}
              cor="text-red-400"
            />

            <ResumoItem
              titulo="Limite livre"
              valor={moeda(dadosConsolidados.disponivelCartoes)}
              cor="text-blue-400"
            />
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            Metas financeiras
          </span>

          <h2 className="mt-2 text-xl font-bold text-white">
            Progresso geral
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <ResumoItem
              titulo="Objetivo total"
              valor={moeda(dadosConsolidados.objetivoMetas)}
              cor="text-blue-400"
            />

            <ResumoItem
              titulo="Valor acumulado"
              valor={moeda(dadosConsolidados.acumuladoMetas)}
              cor="text-emerald-400"
            />

            <ResumoItem
              titulo="Falta alcançar"
              valor={moeda(dadosConsolidados.faltaMetas)}
              cor="text-amber-400"
            />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                Seus objetivos
              </span>

              <h2 className="mt-2 text-xl font-bold text-white">
                Metas em andamento
              </h2>
            </div>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
              {metas.length} meta(s)
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {metas.length === 0 ? (
              <Empty text="Nenhuma meta cadastrada." />
            ) : (
              metas.slice(0, 4).map((meta) => {
                const objetivo = Number(meta.target_amount);
                const atual = Number(meta.current_amount);

                const percentual =
                  objetivo > 0
                    ? Math.min((atual / objetivo) * 100, 100)
                    : 0;

                return (
                  <div
                    key={meta.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                          style={{
                            background: `${meta.color}1f`,
                          }}
                        >
                          {meta.icon}
                        </div>

                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-white">
                            {meta.name}
                          </strong>

                          <span className="mt-1 block text-xs text-slate-500">
                            {moeda(atual)} de {moeda(objetivo)}
                          </span>
                        </div>
                      </div>

                      <strong
                        className="shrink-0 text-sm font-black"
                        style={{ color: meta.color }}
                      >
                        {percentual.toFixed(0)}%
                      </strong>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentual}%`,
                          background: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            Contas bancárias
          </span>

          <h2 className="mt-2 text-xl font-bold text-white">
            Saldos por conta
          </h2>

          <div className="mt-5 space-y-3">
            {bancos.length === 0 ? (
              <Empty text="Nenhuma conta bancária cadastrada." />
            ) : (
              bancos.slice(0, 5).map((conta) => (
                <div
                  key={conta.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div>
                    <strong className="block text-sm text-white">
                      {conta.bank_name}
                    </strong>

                    <span className="mt-1 block text-xs text-slate-500">
                      {conta.account_name}
                    </span>
                  </div>

                  <strong className="text-sm font-black text-emerald-400">
                    {moeda(Number(conta.balance))}
                  </strong>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            Alertas
          </span>

          <h2 className="mt-2 text-xl font-bold text-white">
            Próximas contas
          </h2>

          <div className="mt-5 space-y-3">
            {proximos.length === 0 ? (
              <Empty text="Nenhuma conta próxima do vencimento." />
            ) : (
              proximos.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-white">
                      {item.description}
                    </strong>

                    <small
                      className={
                        item.is_overdue
                          ? "mt-2 block text-xs font-bold text-red-400"
                          : "mt-2 block text-xs text-slate-500"
                      }
                    >
                      {item.is_overdue
                        ? `Atrasada há ${Math.abs(
                            item.days_until_due
                          )} dia(s)`
                        : item.days_until_due === 0
                        ? "Vence hoje"
                        : item.days_until_due === 1
                        ? "Vence amanhã"
                        : `Vence em ${item.days_until_due} dias`}
                    </small>
                  </div>

                  <strong className="shrink-0 text-sm font-black text-red-400">
                    {moeda(Number(item.amount))}
                  </strong>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function ResumoItem({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <span className="text-sm text-slate-500">{titulo}</span>

      <strong className={`mt-2 block text-xl font-black ${cor}`}>
        {valor}
      </strong>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 px-5 py-10 text-center text-sm text-slate-600">
      {text}
    </div>
  );
}
