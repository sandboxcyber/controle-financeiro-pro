import {
  FiAlertTriangle,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";

import type { FinancialForecast } from "../services/forecast";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function ForecastCard({
  forecast,
}: {
  forecast: FinancialForecast;
}) {
  const positivo = forecast.saldo_previsto >= 0;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div
        className={
          positivo
            ? "absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl"
            : "absolute -right-20 -top-20 h-52 w-52 rounded-full bg-red-500/10 blur-3xl"
        }
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
              Previsão financeira
            </span>

            <h2 className="mt-2 text-xl font-bold text-white">
              Projeção para o fim do mês
            </h2>
          </div>

          <div
            className={
              positivo
                ? "grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-xl text-emerald-400"
                : "grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-xl text-red-400"
            }
          >
            {positivo ? <FiTrendingUp /> : <FiAlertTriangle />}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-sm text-slate-500">
              Saldo previsto
            </span>

            <strong
              className={
                positivo
                  ? "mt-2 block text-2xl font-black text-emerald-400"
                  : "mt-2 block text-2xl font-black text-red-400"
              }
            >
              {moeda(forecast.saldo_previsto)}
            </strong>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-sm text-slate-500">
              Despesas previstas
            </span>

            <strong className="mt-2 block text-2xl font-black text-amber-400">
              {moeda(forecast.despesas_previstas)}
            </strong>
          </div>
        </div>

        <div
          className={
            positivo
              ? "mt-5 flex items-start gap-3 rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-4"
              : "mt-5 flex items-start gap-3 rounded-2xl border border-red-900/50 bg-red-950/30 p-4"
          }
        >
          {positivo ? (
            <FiTrendingUp className="mt-1 shrink-0 text-emerald-400" />
          ) : (
            <FiTrendingDown className="mt-1 shrink-0 text-red-400" />
          )}

          <p className="m-0 text-sm leading-6 text-slate-300">
            {forecast.mensagem}
          </p>
        </div>
      </div>
    </article>
  );
}
