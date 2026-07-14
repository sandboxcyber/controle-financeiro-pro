import { useState } from "react";
import {
  FiDownload,
  FiFileText,
  FiPieChart,
} from "react-icons/fi";

import { reportService } from "../services/reports";

export default function Reports() {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");

  async function baixarPDF() {
    try {
      setBaixando(true);
      setErro("");

      await reportService.baixarRelatorioFinanceiro();
    } catch {
      setErro("Não foi possível gerar o relatório.");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
          Análises
        </span>

        <h1 className="mt-2 text-4xl font-black text-white">
          Relatórios
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Exporte sua situação financeira em documentos organizados.
        </p>
      </header>

      {erro && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
            <FiFileText />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Relatório financeiro
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Receitas, despesas, bancos, cartões, metas, investimentos e patrimônio.
          </p>

          <button
            onClick={baixarPDF}
            disabled={baixando}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:bg-slate-700"
          >
            <FiDownload />

            {baixando ? "Gerando PDF..." : "Baixar PDF"}
          </button>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 opacity-70">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-400">
            <FiPieChart />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Relatório detalhado
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gráficos, categorias e evolução mensal.
          </p>

          <button
            disabled
            className="mt-6 w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-500"
          >
            Em breve
          </button>
        </article>
      </section>
    </div>
  );
}
