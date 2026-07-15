import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiTarget,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  budgetService,
  type Budget,
  type BudgetPayload,
} from "../services/budgets";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Budgets() {
  const [orcamentos, setOrcamentos] = useState<Budget[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [category, setCategory] = useState("Alimentação");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [color, setColor] = useState("#2563eb");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const resposta = await budgetService.listar();
      setOrcamentos(resposta.data);
    } catch {
      setErro("Não foi possível carregar os orçamentos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(() => {
    const totalLimites = orcamentos.reduce(
      (soma, item) => soma + Number(item.monthly_limit),
      0
    );

    const totalGasto = orcamentos.reduce(
      (soma, item) => soma + Number(item.spent),
      0
    );

    return {
      totalLimites,
      totalGasto,
      disponivel: Math.max(totalLimites - totalGasto, 0),
    };
  }, [orcamentos]);

  function numero(valor: string) {
    return Number(
      valor.replace(/\./g, "").replace(",", ".")
    );
  }

  function abrirNovo() {
    setEditandoId(null);
    setCategory("Alimentação");
    setMonthlyLimit("");
    setColor("#2563eb");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(item: Budget) {
    setEditandoId(item.id);
    setCategory(item.category);
    setMonthlyLimit(
      String(item.monthly_limit).replace(".", ",")
    );
    setColor(item.color);
    setErro("");
    setModalAberto(true);
  }

  async function salvar() {
    const limite = numero(monthlyLimit);

    if (!category.trim()) {
      setErro("Informe a categoria.");
      return;
    }

    if (!Number.isFinite(limite) || limite <= 0) {
      setErro("Informe um limite mensal válido.");
      return;
    }

    const dados: BudgetPayload = {
      category: category.trim(),
      monthly_limit: limite,
      color,
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId !== null) {
        await budgetService.editar(editandoId, dados);
      } else {
        await budgetService.criar(dados);
      }

      await carregar();
      setModalAberto(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível salvar o orçamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir este orçamento?")) {
      return;
    }

    try {
      await budgetService.excluir(id);
      await carregar();
    } catch {
      setErro("Não foi possível excluir o orçamento.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
            Planejamento mensal
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Orçamentos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Defina limites por categoria e acompanhe seus gastos.
          </p>
        </div>

        <button
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          <FiPlus />
          Novo orçamento
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Resumo
          titulo="Limites definidos"
          valor={moeda(resumo.totalLimites)}
          cor="text-blue-400"
        />

        <Resumo
          titulo="Valor utilizado"
          valor={moeda(resumo.totalGasto)}
          cor="text-red-400"
        />

        <Resumo
          titulo="Disponível"
          valor={moeda(resumo.disponivel)}
          cor="text-emerald-400"
        />
      </section>

      {erro && !modalAberto && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {orcamentos.map((item) => {
          const percentual = Number(item.percentage);
          const atingiuAlerta = percentual >= 80;
          const ultrapassou = item.exceeded;

          const corBarra = ultrapassou
            ? "#ef4444"
            : atingiuAlerta
            ? "#f59e0b"
            : item.color;

          return (
            <article
              key={item.id}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: corBarra }}
              />

              <div className="flex items-start justify-between gap-4">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-xl"
                  style={{
                    color: corBarra,
                    background: `${corBarra}1f`,
                  }}
                >
                  <FiTarget />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirEdicao(item)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => excluir(item.id)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                {item.category}
              </h2>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-600">
                    Gasto no mês
                  </span>

                  <strong className="mt-1 block text-2xl font-black text-white">
                    {moeda(Number(item.spent))}
                  </strong>
                </div>

                <strong
                  className="text-xl font-black"
                  style={{ color: corBarra }}
                >
                  {percentual.toFixed(0)}%
                </strong>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(percentual, 100)}%`,
                    background: corBarra,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>
                  Limite: {moeda(Number(item.monthly_limit))}
                </span>

                <span>
                  Restante: {moeda(Number(item.remaining))}
                </span>
              </div>

              {ultrapassou && (
                <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                  Orçamento ultrapassado.
                </div>
              )}

              {!ultrapassou && atingiuAlerta && (
                <div className="mt-5 rounded-xl border border-amber-900/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
                  Você já utilizou mais de 80% desse orçamento.
                </div>
              )}
            </article>
          );
        })}
      </section>

      {orcamentos.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-16 text-center text-slate-600">
          Nenhum orçamento mensal cadastrado.
        </div>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 z-[1600] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => !salvando && setModalAberto(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {editandoId !== null
                      ? "Editar orçamento"
                      : "Novo orçamento"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Defina o limite mensal da categoria.
                  </p>
                </div>

                <button
                  onClick={() => setModalAberto(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Categoria
                  </span>

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  >
                    <option>Alimentação</option>
                    <option>Mercado</option>
                    <option>Moradia</option>
                    <option>Transporte</option>
                    <option>Combustível</option>
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Lazer</option>
                    <option>Assinaturas</option>
                    <option>Compras</option>
                    <option>Outros</option>
                  </select>
                </label>

                <Campo
                  label="Limite mensal"
                  placeholder="Exemplo: 800,00"
                  value={monthlyLimit}
                  onChange={setMonthlyLimit}
                />

                <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  Cor do orçamento

                  <input
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="h-8 w-14 cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>

              {erro && (
                <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvar}
                  disabled={salvando}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:bg-slate-700"
                >
                  {salvando
                    ? "Salvando..."
                    : editandoId !== null
                    ? "Salvar alterações"
                    : "Cadastrar orçamento"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Resumo({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <span className="text-sm text-slate-500">{titulo}</span>

      <strong className={`mt-3 block text-2xl font-black ${cor}`}>
        {valor}
      </strong>
    </article>
  );
}

function Campo({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none placeholder:text-slate-700 focus:border-blue-500"
      />
    </label>
  );
}
