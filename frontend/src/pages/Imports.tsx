import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiUploadCloud,
} from "react-icons/fi";

import {
  bankService,
  type BankAccount,
} from "../services/banks";

import {
  importService,
  type CsvImportResult,
} from "../services/imports";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Imports() {
  const [contas, setContas] = useState<BankAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] =
    useState<CsvImportResult | null>(null);

  useEffect(() => {
    bankService
      .listar()
      .then((resposta) => setContas(resposta.data))
      .catch(() =>
        setErro("Não foi possível carregar as contas.")
      );
  }, []);

  async function importar() {
    if (!accountId) {
      setErro("Selecione uma conta bancária.");
      return;
    }

    if (!arquivo) {
      setErro("Selecione um arquivo CSV.");
      return;
    }

    try {
      setImportando(true);
      setErro("");
      setResultado(null);

      const resposta = await importService.importarExtrato(
        Number(accountId),
        arquivo
      );

      setResultado(resposta.data);
      setArquivo(null);
    } catch (error: any) {
      const detalhe = error?.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : detalhe?.message ||
              "Não foi possível importar o extrato."
      );
    } finally {
      setImportando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
          Automação
        </span>

        <h1 className="mt-2 text-4xl font-black text-white">
          Importar extrato
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Importe movimentações bancárias através de um arquivo CSV.
        </p>
      </header>

      {erro && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {erro}
        </div>
      )}

      {resultado && (
        <div className="rounded-3xl border border-emerald-900/50 bg-emerald-950/30 p-6">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="mt-1 shrink-0 text-2xl text-emerald-400" />

            <div>
              <h2 className="text-lg font-black text-white">
                Importação concluída
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {resultado.message}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Resumo
              titulo="Importados"
              valor={String(resultado.importados)}
            />

            <Resumo
              titulo="Ignorados"
              valor={String(resultado.ignorados)}
            />

            <Resumo
              titulo="Entradas"
              valor={moeda(resultado.total_entradas)}
            />

            <Resumo
              titulo="Saídas"
              valor={moeda(resultado.total_saidas)}
            />
          </div>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
            <FiUploadCloud />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Enviar arquivo CSV
          </h2>

          <div className="mt-6 grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Conta bancária
              </span>

              <select
                value={accountId}
                onChange={(event) =>
                  setAccountId(event.target.value)
                }
                className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
              >
                <option value="">Selecione uma conta</option>

                {contas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.bank_name} · {conta.account_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Arquivo CSV
              </span>

              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) =>
                    setArquivo(
                      event.target.files?.[0] || null
                    )
                  }
                  className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:font-bold file:text-white hover:file:bg-blue-500"
                />

                {arquivo && (
                  <p className="mt-4 text-sm text-emerald-400">
                    Arquivo selecionado: {arquivo.name}
                  </p>
                )}
              </div>
            </label>

            <button
              onClick={importar}
              disabled={importando}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {importando
                ? "Importando movimentações..."
                : "Importar extrato"}
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-2xl text-amber-400">
            <FiFileText />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            Formato do arquivo
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            A primeira linha deve conter os nomes das colunas.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-300">
{`data;descricao;valor;tipo;categoria
01/07/2026;Salário;3500,00;entrada;Salário
02/07/2026;Mercado;250,90;saida;Alimentação
03/07/2026;Combustível;120,00;saida;Transporte`}
          </pre>

          <div className="mt-5 space-y-3 text-sm text-slate-500">
            <p>
              <strong className="text-slate-300">tipo:</strong>{" "}
              use “entrada” ou “saida”.
            </p>

            <p>
              <strong className="text-slate-300">valor:</strong>{" "}
              aceita 150,00 ou 150.00.
            </p>

            <p>
              O saldo bancário, as receitas e as despesas serão
              atualizados automaticamente.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

function Resumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-900/40 bg-slate-950/50 p-4">
      <span className="text-xs uppercase tracking-wider text-slate-500">
        {titulo}
      </span>

      <strong className="mt-2 block text-lg font-black text-white">
        {valor}
      </strong>
    </div>
  );
}
