import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  billService,
  type Bill,
  type BillSummary,
  type CreateBillPayload,
  type CreateInstallmentPayload,
} from "../services/bills";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

function numero(valor: string) {
  return Number(
    valor
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

function dataParaApi(data: string) {
  return `${data}T12:00:00`;
}

export default function Bills() {
  const [contas, setContas] = useState<Bill[]>([]);
  const [resumo, setResumo] = useState<BillSummary | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoCadastro, setTipoCadastro] =
    useState<"unica" | "parcelada">("unica");

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outros");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [installments, setInstallments] = useState("2");
  const [interest, setInterest] = useState("0");
  const [fine, setFine] = useState("0");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    try {
      setCarregando(true);
      setErro("");

      const [contasResposta, resumoResposta] = await Promise.all([
        billService.listar(),
        billService.resumo(),
      ]);

      setContas(contasResposta.data);
      setResumo(resumoResposta.data);
    } catch {
      setErro("Não foi possível carregar as contas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const totais = useMemo(() => {
    const pagas = contas
      .filter((item) => item.status === "Paga")
      .reduce(
        (soma, item) =>
          soma + Number(item.updated_amount || item.amount),
        0
      );

    const atrasadas = contas
      .filter((item) => item.status === "Atrasada")
      .reduce(
        (soma, item) =>
          soma + Number(item.updated_amount || item.amount),
        0
      );

    return { pagas, atrasadas };
  }, [contas]);

  function abrirCadastro() {
    setDescription("");
    setCategory("Outros");
    setAmount("");
    setDueDate("");
    setInstallments("2");
    setInterest("0");
    setFine("0");
    setTipoCadastro("unica");
    setErro("");
    setMensagem("");
    setModalAberto(true);
  }

  async function salvar() {
    const valor = numero(amount);
    const juros = numero(interest);
    const multa = numero(fine);
    const totalParcelas = Number(installments);

    if (!description.trim()) {
      setErro("Informe a descrição da conta.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    if (!dueDate) {
      setErro("Informe a data de vencimento.");
      return;
    }

    if (
      tipoCadastro === "parcelada" &&
      (!Number.isInteger(totalParcelas) || totalParcelas < 2)
    ) {
      setErro("Informe pelo menos 2 parcelas.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      if (tipoCadastro === "parcelada") {
        const dados: CreateInstallmentPayload = {
          description: description.trim(),
          category,
          total_amount: valor,
          installments: totalParcelas,
          first_due_date: dataParaApi(dueDate),
          interest: juros,
          fine: multa,
        };

        await billService.criarParcelado(dados);

        setMensagem(
          `${totalParcelas} parcelas criadas com sucesso.`
        );
      } else {
        const dados: CreateBillPayload = {
          description: description.trim(),
          category,
          amount: valor,
          due_date: dataParaApi(dueDate),
          status: "Pendente",
          installments: 1,
          current_installment: 1,
          interest: juros,
          fine: multa,
        };

        await billService.criar(dados);

        setMensagem("Conta cadastrada com sucesso.");
      }

      await carregar();
      setModalAberto(false);
    } catch (error: any) {
      const detalhe = error?.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível salvar a conta."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function pagar(conta: Bill) {
    const confirmar = window.confirm(
      `Marcar "${conta.description}" como paga por ${moeda(
        conta.updated_amount || conta.amount
      )}?`
    );

    if (!confirmar) return;

    try {
      setErro("");
      await billService.pagar(conta.id);
      setMensagem("Conta marcada como paga.");
      await carregar();
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível pagar a conta."
      );
    }
  }

  async function excluir(conta: Bill) {
    const confirmar = window.confirm(
      `Excluir a conta "${conta.description}"?`
    );

    if (!confirmar) return;

    try {
      setErro("");
      await billService.excluir(conta.id);
      setMensagem("Conta excluída.");
      await carregar();
    } catch {
      setErro("Não foi possível excluir a conta.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
            Compromissos financeiros
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Contas a pagar
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre boletos, contas vencidas e parcelamentos.
          </p>
        </div>

        <button
          onClick={abrirCadastro}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          <FiPlus />
          Nova conta
        </button>
      </header>

      {mensagem && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-sm text-emerald-300">
          <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />
          {mensagem}
        </div>
      )}

      {erro && !modalAberto && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Resumo
          titulo="Contas atrasadas"
          valor={moeda(resumo?.total_atrasado || totais.atrasadas)}
          cor="text-red-400"
        />

        <Resumo
          titulo="Quantidade atrasada"
          valor={String(resumo?.quantidade_atrasadas || 0)}
          cor="text-red-400"
        />

        <Resumo
          titulo="Total pendente"
          valor={moeda(resumo?.total_pendente || 0)}
          cor="text-amber-400"
        />

        <Resumo
          titulo="Total já pago"
          valor={moeda(totais.pagas)}
          cor="text-emerald-400"
        />
      </section>

      {carregando ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-20 text-center text-slate-500">
          Carregando contas...
        </div>
      ) : contas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-16 text-center text-slate-600">
          Nenhuma conta cadastrada.
        </div>
      ) : (
        <section className="grid gap-4">
          {contas.map((conta) => {
            const valorAtual =
              Number(conta.updated_amount) || Number(conta.amount);

            return (
              <article
                key={conta.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <StatusIcon status={conta.status} />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-white">
                          {conta.description}
                        </h2>

                        <StatusBadge status={conta.status} />
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {conta.category}
                        {conta.installments > 1 &&
                          ` · Parcela ${conta.current_installment}/${conta.installments}`}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        Vencimento:{" "}
                        {new Date(conta.due_date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>

                      {conta.days_overdue > 0 && (
                        <p className="mt-2 text-sm font-bold text-red-400">
                          Vencida há {conta.days_overdue} dia(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[500px]">
                    <Valor
                      titulo="Valor original"
                      valor={moeda(Number(conta.amount))}
                    />

                    <Valor
                      titulo="Juros e multa"
                      valor={moeda(
                        Number(conta.interest) + Number(conta.fine)
                      )}
                    />

                    <Valor
                      titulo="Total atualizado"
                      valor={moeda(valorAtual)}
                      destaque
                    />
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {conta.status !== "Paga" && (
                      <button
                        onClick={() => pagar(conta)}
                        title="Marcar como paga"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <FiCheckCircle />
                        Pagar
                      </button>
                    )}

                    <button
                      onClick={() => excluir(conta)}
                      title="Excluir"
                      className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 z-[1800] overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => !salvando && setModalAberto(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Nova conta
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    A data pode ser futura ou já vencida.
                  </p>
                </div>

                <button
                  onClick={() => setModalAberto(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300"
                >
                  <FiX />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTipoCadastro("unica")}
                  className={
                    tipoCadastro === "unica"
                      ? "rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                      : "rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-400"
                  }
                >
                  Conta única
                </button>

                <button
                  onClick={() => setTipoCadastro("parcelada")}
                  className={
                    tipoCadastro === "parcelada"
                      ? "rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                      : "rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-400"
                  }
                >
                  Boleto parcelado
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                <Campo
                  label="Descrição"
                  placeholder="Exemplo: Energia, Notebook, Aluguel..."
                  value={description}
                  onChange={setDescription}
                />

                <label>
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
                    <option>Moradia</option>
                    <option>Água</option>
                    <option>Energia</option>
                    <option>Internet</option>
                    <option>Telefone</option>
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Transporte</option>
                    <option>Financiamento</option>
                    <option>Assinaturas</option>
                    <option>Compras</option>
                    <option>Outros</option>
                  </select>
                </label>

                <Campo
                  label={
                    tipoCadastro === "parcelada"
                      ? "Valor total do parcelamento"
                      : "Valor da conta"
                  }
                  placeholder="Exemplo: 350,00"
                  value={amount}
                  onChange={setAmount}
                />

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    {tipoCadastro === "parcelada"
                      ? "Primeiro vencimento"
                      : "Data de vencimento"}
                  </span>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  />
                </label>

                {tipoCadastro === "parcelada" && (
                  <Campo
                    label="Quantidade de parcelas"
                    placeholder="Exemplo: 12"
                    value={installments}
                    onChange={setInstallments}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    label="Juros em reais"
                    placeholder="Exemplo: 5,00"
                    value={interest}
                    onChange={setInterest}
                  />

                  <Campo
                    label="Multa em reais"
                    placeholder="Exemplo: 10,00"
                    value={fine}
                    onChange={setFine}
                  />
                </div>

                <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-200">
                  Para cadastrar uma conta já atrasada, escolha uma data
                  de vencimento anterior a hoje.
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
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:bg-slate-700"
                >
                  {salvando
                    ? "Salvando..."
                    : tipoCadastro === "parcelada"
                    ? "Criar parcelamento"
                    : "Cadastrar conta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  const base =
    "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl";

  if (status === "Paga") {
    return (
      <div className={`${base} bg-emerald-500/10 text-emerald-400`}>
        <FiCheckCircle />
      </div>
    );
  }

  if (status === "Atrasada") {
    return (
      <div className={`${base} bg-red-500/10 text-red-400`}>
        <FiAlertTriangle />
      </div>
    );
  }

  if (status === "Vence hoje") {
    return (
      <div className={`${base} bg-amber-500/10 text-amber-400`}>
        <FiClock />
      </div>
    );
  }

  return (
    <div className={`${base} bg-blue-500/10 text-blue-400`}>
      <FiFileText />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classe =
    status === "Paga"
      ? "bg-emerald-500/10 text-emerald-400"
      : status === "Atrasada"
      ? "bg-red-500/10 text-red-400"
      : status === "Vence hoje"
      ? "bg-amber-500/10 text-amber-400"
      : "bg-blue-500/10 text-blue-400";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${classe}`}
    >
      {status}
    </span>
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

function Valor({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-slate-600">
        {titulo}
      </span>

      <strong
        className={
          destaque
            ? "mt-1 block text-sm font-black text-white"
            : "mt-1 block text-sm text-slate-300"
        }
      >
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
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none placeholder:text-slate-700 focus:border-blue-500"
      />
    </label>
  );
}
