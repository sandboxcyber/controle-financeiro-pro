import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPieChart,
  FiPlus,
  FiTrash2,
  FiTrendingDown,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import {
  investmentService,
  type Investment,
  type InvestmentPayload,
} from "../services/investments";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Investments() {
  const [investimentos, setInvestimentos] = useState<Investment[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [category, setCategory] = useState("Ações");
  const [institution, setInstitution] = useState("");
  const [quantity, setQuantity] = useState("");
  const [averagePrice, setAveragePrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [color, setColor] = useState("#2563eb");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const resposta = await investmentService.listar();
      setInvestimentos(resposta.data);
    } catch {
      setErro("Não foi possível carregar os investimentos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function numero(valor: string) {
    return Number(
      valor.replace(/\./g, "").replace(",", ".")
    );
  }

  const resumo = useMemo(() => {
    const investido = investimentos.reduce(
      (soma, item) =>
        soma + Number(item.quantity) * Number(item.average_price),
      0
    );

    const atual = investimentos.reduce(
      (soma, item) =>
        soma + Number(item.quantity) * Number(item.current_price),
      0
    );

    const resultado = atual - investido;

    const percentual =
      investido > 0 ? (resultado / investido) * 100 : 0;

    return {
      investido,
      atual,
      resultado,
      percentual,
    };
  }, [investimentos]);

  function abrirNovo() {
    setEditandoId(null);
    setName("");
    setTicker("");
    setCategory("Ações");
    setInstitution("");
    setQuantity("");
    setAveragePrice("");
    setCurrentPrice("");
    setColor("#2563eb");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(item: Investment) {
    setEditandoId(item.id);
    setName(item.name);
    setTicker(item.ticker);
    setCategory(item.category);
    setInstitution(item.institution);
    setQuantity(String(item.quantity).replace(".", ","));
    setAveragePrice(String(item.average_price).replace(".", ","));
    setCurrentPrice(String(item.current_price).replace(".", ","));
    setColor(item.color);
    setErro("");
    setModalAberto(true);
  }

  async function salvar() {
    const quantidade = numero(quantity);
    const precoMedio = numero(averagePrice);
    const precoAtual = numero(currentPrice);

    if (!name.trim()) {
      setErro("Informe o nome do investimento.");
      return;
    }

    if (!Number.isFinite(quantidade) || quantidade < 0) {
      setErro("Informe uma quantidade válida.");
      return;
    }

    if (!Number.isFinite(precoMedio) || precoMedio < 0) {
      setErro("Informe um preço médio válido.");
      return;
    }

    if (!Number.isFinite(precoAtual) || precoAtual < 0) {
      setErro("Informe um preço atual válido.");
      return;
    }

    const dados: InvestmentPayload = {
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      category,
      institution: institution.trim(),
      quantity: quantidade,
      average_price: precoMedio,
      current_price: precoAtual,
      color,
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId !== null) {
        await investmentService.editar(editandoId, dados);
      } else {
        await investmentService.criar(dados);
      }

      await carregar();
      setModalAberto(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível salvar o investimento."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir este investimento?")) {
      return;
    }

    try {
      await investmentService.excluir(id);
      await carregar();
    } catch {
      setErro("Não foi possível excluir o investimento.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
            Patrimônio
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Investimentos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe patrimônio, preço médio e rentabilidade.
          </p>
        </div>

        <button
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          <FiPlus />
          Novo investimento
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Resumo
          titulo="Total investido"
          valor={moeda(resumo.investido)}
          cor="text-blue-400"
        />

        <Resumo
          titulo="Patrimônio atual"
          valor={moeda(resumo.atual)}
          cor="text-emerald-400"
        />

        <Resumo
          titulo="Resultado"
          valor={moeda(resumo.resultado)}
          cor={
            resumo.resultado >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }
        />

        <Resumo
          titulo="Rentabilidade"
          valor={`${resumo.percentual.toFixed(2)}%`}
          cor={
            resumo.percentual >= 0
              ? "text-emerald-400"
              : "text-red-400"
          }
        />
      </section>

      {erro && !modalAberto && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {investimentos.map((item) => {
          const investido =
            Number(item.quantity) * Number(item.average_price);

          const atual =
            Number(item.quantity) * Number(item.current_price);

          const resultado = atual - investido;

          const percentual =
            investido > 0 ? (resultado / investido) * 100 : 0;

          const positivo = resultado >= 0;

          return (
            <article
              key={item.id}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: item.color }}
              />

              <div className="flex items-start justify-between gap-4">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-xl"
                  style={{
                    color: item.color,
                    background: `${item.color}1f`,
                  }}
                >
                  <FiPieChart />
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

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.ticker || item.category}
                  </p>
                </div>

                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-400">
                  {item.category}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Info
                  titulo="Quantidade"
                  valor={Number(item.quantity).toLocaleString("pt-BR")}
                />

                <Info
                  titulo="Preço médio"
                  valor={moeda(Number(item.average_price))}
                />

                <Info
                  titulo="Preço atual"
                  valor={moeda(Number(item.current_price))}
                />

                <Info
                  titulo="Patrimônio"
                  valor={moeda(atual)}
                />
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2">
                  {positivo ? (
                    <FiTrendingUp className="text-emerald-400" />
                  ) : (
                    <FiTrendingDown className="text-red-400" />
                  )}

                  <span className="text-sm text-slate-500">
                    Resultado
                  </span>
                </div>

                <div className="text-right">
                  <strong
                    className={
                      positivo
                        ? "block text-sm font-black text-emerald-400"
                        : "block text-sm font-black text-red-400"
                    }
                  >
                    {moeda(resultado)}
                  </strong>

                  <span
                    className={
                      positivo
                        ? "mt-1 block text-xs text-emerald-500"
                        : "mt-1 block text-xs text-red-500"
                    }
                  >
                    {percentual.toFixed(2)}%
                  </span>
                </div>
              </div>

              {item.institution && (
                <p className="mt-4 text-xs text-slate-600">
                  Instituição: {item.institution}
                </p>
              )}
            </article>
          );
        })}
      </section>

      {investimentos.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-16 text-center text-slate-600">
          Nenhum investimento cadastrado.
        </div>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 z-[1500] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
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
                      ? "Editar investimento"
                      : "Novo investimento"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Informe os dados da sua posição.
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
                <Campo
                  label="Nome"
                  placeholder="Exemplo: Petrobras"
                  value={name}
                  onChange={setName}
                />

                <Campo
                  label="Código ou ticker"
                  placeholder="Exemplo: PETR4"
                  value={ticker}
                  onChange={setTicker}
                />

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
                    <option>Ações</option>
                    <option>Fundos imobiliários</option>
                    <option>Renda fixa</option>
                    <option>Criptomoedas</option>
                    <option>ETF</option>
                    <option>Previdência</option>
                    <option>Outros</option>
                  </select>
                </label>

                <Campo
                  label="Instituição"
                  placeholder="Exemplo: XP Investimentos"
                  value={institution}
                  onChange={setInstitution}
                />

                <Campo
                  label="Quantidade"
                  placeholder="Exemplo: 100"
                  value={quantity}
                  onChange={setQuantity}
                />

                <Campo
                  label="Preço médio"
                  placeholder="Exemplo: 32,50"
                  value={averagePrice}
                  onChange={setAveragePrice}
                />

                <Campo
                  label="Preço atual"
                  placeholder="Exemplo: 35,80"
                  value={currentPrice}
                  onChange={setCurrentPrice}
                />

                <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  Cor do investimento

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
                    : "Cadastrar investimento"}
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

function Info({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-slate-600">
        {titulo}
      </span>

      <strong className="mt-1 block text-sm text-white">
        {valor}
      </strong>
    </div>
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
