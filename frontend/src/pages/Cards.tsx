import { useEffect, useMemo, useState } from "react";
import {
  FiCreditCard,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  cardService,
  type CardPayload,
} from "../services/cards";

type CardItem = CardPayload & {
  id: number;
};


const logos: Record<string,string> = {
  Visa:"💳 VISA",
  Mastercard:"🔴🟡 Mastercard",
  Elo:"🟢 Elo",
  "American Express":"🟦 Amex",
  Hipercard:"🔴 Hipercard"
};

const moeda = (valor: number) =>

  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Cards() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Visa");
  const [color, setColor] = useState("#2563eb");
  const [limit, setLimit] = useState("");
  const [used, setUsed] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [cartaoGastoId, setCartaoGastoId] = useState<number | null>(null);
  const [gastoDescription, setGastoDescription] = useState("");
  const [gastoAmount, setGastoAmount] = useState("");
  const [gastoCategory, setGastoCategory] = useState("Outros");

  async function carregar() {
    try {
      const resposta = await cardService.listar();
      setCards(resposta.data);
    } catch {
      setErro("Não foi possível carregar os cartões.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(() => {
    const limiteTotal = cards.reduce(
      (soma, item) => soma + Number(item.limit),
      0
    );

    const utilizado = cards.reduce(
      (soma, item) => soma + Number(item.used),
      0
    );

    return {
      limiteTotal,
      utilizado,
      disponivel: limiteTotal - utilizado,
    };
  }, [cards]);

  function abrirNovo() {
    setEditandoId(null);
    setName("");
    setBrand("Visa");
    setColor("#2563eb");
    setLimit("");
    setUsed("0");
    setClosingDay("");
    setDueDay("");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(card: CardItem) {
    setEditandoId(card.id);
    setName(card.name);
    setBrand(card.brand);
    setColor(card.color);
    setLimit(String(card.limit).replace(".", ","));
    setUsed(String(card.used).replace(".", ","));
    setClosingDay(String(card.closing_day));
    setDueDay(String(card.due_day));
    setErro("");
    setModalAberto(true);
  }

  function numero(valor: string) {
    return Number(
      valor.replace(/\./g, "").replace(",", ".")
    );
  }

  async function salvar() {
    const limiteNumero = numero(limit);
    const usadoNumero = numero(used);
    const fechamentoNumero = Number(closingDay);
    const vencimentoNumero = Number(dueDay);

    if (!name.trim()) {
      setErro("Informe o nome do cartão.");
      return;
    }

    if (!Number.isFinite(limiteNumero) || limiteNumero < 0) {
      setErro("Informe um limite válido.");
      return;
    }

    if (!Number.isFinite(usadoNumero) || usadoNumero < 0) {
      setErro("Informe um valor utilizado válido.");
      return;
    }

    if (usadoNumero > limiteNumero) {
      setErro("O valor utilizado não pode superar o limite.");
      return;
    }

    if (
      !Number.isInteger(fechamentoNumero) ||
      fechamentoNumero < 1 ||
      fechamentoNumero > 31
    ) {
      setErro("Informe um dia de fechamento entre 1 e 31.");
      return;
    }

    if (
      !Number.isInteger(vencimentoNumero) ||
      vencimentoNumero < 1 ||
      vencimentoNumero > 31
    ) {
      setErro("Informe um dia de vencimento entre 1 e 31.");
      return;
    }

    const dados: CardPayload = {
      name: name.trim(),
      brand,
      color,
      limit: limiteNumero,
      used: usadoNumero,
      closing_day: fechamentoNumero,
      due_day: vencimentoNumero,
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId !== null) {
        await cardService.editar(editandoId, dados);
      } else {
        await cardService.criar(dados);
      }

      await carregar();
      setModalAberto(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível salvar o cartão."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirGasto(card: CardItem) {
    setCartaoGastoId(card.id);
    setGastoDescription("");
    setGastoAmount("");
    setGastoCategory("Outros");
    setErro("");
    setModalGastoAberto(true);
  }

  async function salvarGasto() {
    if (cartaoGastoId === null) return;

    const valor = numero(gastoAmount);

    if (!gastoDescription.trim()) {
      setErro("Informe a descrição do gasto.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await cardService.lancarGasto(cartaoGastoId, {
        description: gastoDescription.trim(),
        amount: valor,
        category: gastoCategory.trim() || "Outros",
      });

      await carregar();
      setModalGastoAberto(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível lançar o gasto."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm("Deseja realmente excluir este cartão?")) {
      return;
    }

    try {
      await cardService.excluir(id);
      await carregar();
    } catch {
      setErro("Não foi possível excluir o cartão.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
            Financeiro
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Cartões
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Controle limites, utilização e vencimentos.
          </p>
        </div>

        <button
          onClick={abrirNovo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          <FiPlus />
          Novo cartão
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <ResumoCard
          titulo="Limite Total total"
          valor={moeda(resumo.limiteTotal)}
          cor="text-blue-400"
        />

        <ResumoCard
          titulo="Utilizado"
          valor={moeda(resumo.utilizado)}
          cor="text-red-400"
        />

        <ResumoCard
          titulo="Limite Disponível"
          valor={moeda(resumo.disponivel)}
          cor="text-emerald-400"
        />
      </section>

      {erro && !modalAberto && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const limite = Number(card.limit);
          const utilizado = Number(card.used);
          const disponivel = Math.max(limite - utilizado, 0);
          const percentual =
            limite > 0
              ? Math.min((utilizado / limite) * 100, 100)
              : 0;

          const corBarra =
            percentual >= 80
              ? "#ef4444"
              : percentual >= 50
              ? "#f59e0b"
              : "#22c55e";

          return (
            <article
              key={card.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${card.color}, #0f172a 82%)`,
              }}
            >
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <FiCreditCard size={34} />

                  <strong className="text-sm uppercase tracking-wider">
                    {logos[card.brand] ?? card.brand}
                  </strong>
                </div>

                <h2 className="mt-9 text-2xl font-black">
                  {card.name}
                </h2>

                <p className="mt-2 font-mono tracking-[0.18em] text-white/70">
                  5478 •••• •••• {String(card.id).padStart(4, "0")}
                </p>

                <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-950/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentual}%`,
                      background: corBarra,
                    }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-white/70">
                  <span>Usado: {moeda(utilizado)}</span>
                  <span>{percentual.toFixed(0)}%</span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Informacao
                    titulo="Limite Total"
                    valor={moeda(limite)}
                  />

                  <Informacao
                    titulo="Limite Disponível"
                    valor={moeda(disponivel)}
                  />

                  <Informacao
                    titulo="Vencimento da Fatura"
                    valor={`Dia ${card.due_day}`}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-white/60">
                    Fechamento {card.closing_day}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirGasto(card)}
                      className="rounded-xl bg-emerald-500/20 px-3 text-xs font-bold text-emerald-100 hover:bg-emerald-500/30"
                      title="Lançar gasto"
                    >
                      + Gasto
                    </button>
                    <button
                      onClick={() => abrirEdicao(card)}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => excluir(card.id)}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30"
                      title="Excluir"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {cards.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-16 text-center text-slate-600">
          Nenhum cartão cadastrado.
        </div>
      )}

      {modalGastoAberto && (
        <div
          className="fixed inset-0 z-[1100] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => !salvando && setModalGastoAberto(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Lançar gasto
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    O limite utilizado será atualizado automaticamente.
                  </p>
                </div>

                <button
                  onClick={() => setModalGastoAberto(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid gap-4">
                <Campo
                  label="Descrição do gasto"
                  placeholder="Exemplo: Supermercado"
                  value={gastoDescription}
                  onChange={setGastoDescription}
                />

                <Campo
                  label="Valor gasto"
                  placeholder="Exemplo: 250,00"
                  value={gastoAmount}
                  onChange={setGastoAmount}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Categoria
                  </span>

                  <select
                    value={gastoCategory}
                    onChange={(event) =>
                      setGastoCategory(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  >
                    <option>Alimentação</option>
                    <option>Transporte</option>
                    <option>Compras</option>
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Lazer</option>
                    <option>Assinaturas</option>
                    <option>Outros</option>
                  </select>
                </label>
              </div>

              {erro && (
                <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setModalGastoAberto(false)}
                  className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarGasto}
                  disabled={salvando}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:bg-slate-700"
                >
                  {salvando ? "Lançando..." : "Confirmar gasto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
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
                    ? "Editar cartão"
                    : "Novo cartão"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Informe os dados do cartão.
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
                label="Nome do cartão"
                placeholder="Exemplo: Nubank"
                value={name}
                onChange={setName}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Bandeira
                </span>

                <select
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                >
                <option>Visa</option>
                <option>Mastercard</option>
                <option>Elo</option>
                <option>American Express</option>
                  <option>Hipercard</option>
                </select>
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                Cor do cartão

                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-8 w-14 cursor-pointer border-0 bg-transparent"
                />
              </label>

              <Campo
                label="Limite Total total"
                placeholder="Exemplo: 5000,00"
                value={limit}
                onChange={setLimit}
              />

              <Campo
                label="Valor utilizado"
                placeholder="Exemplo: 1250,00"
                value={used}
                onChange={setUsed}
              />

              <div className="grid grid-cols-2 gap-4">
                <Campo
                  label="Dia do fechamento"
                  placeholder="Exemplo: 10"
                  value={closingDay}
                  onChange={setClosingDay}
                />

                <Campo
                  label="Dia do vencimento"
                  placeholder="Exemplo: 17"
                  value={dueDay}
                  onChange={setDueDay}
                />
              </div>
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
                  : "Cadastrar cartão"}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumoCard({
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

function Informacao({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wider text-white/50">
        {titulo}
      </span>

      <strong className="mt-1 block truncate text-xs">
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
  onChange: (valor: string) => void;
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
