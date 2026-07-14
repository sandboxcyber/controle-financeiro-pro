import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  bankService,
  type BankAccount,
  type BankPayload,
} from "../services/banks";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Banks() {
  const [contas, setContas] = useState<BankAccount[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Conta corrente");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#2563eb");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [modalTransferencia, setModalTransferencia] =
    useState(false);

  const [modalHistorico, setModalHistorico] = useState(false);
  const [contaHistorico, setContaHistorico] =
    useState<BankAccount | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] =
    useState(false);
  const [contaOrigemId, setContaOrigemId] = useState("");
  const [contaDestinoId, setContaDestinoId] = useState("");
  const [valorTransferencia, setValorTransferencia] =
    useState("");
  const [descricaoTransferencia, setDescricaoTransferencia] =
    useState("Transferência entre contas");

  const [modalMovimento, setModalMovimento] = useState(false);
  const [contaMovimentoId, setContaMovimentoId] =
    useState<number | null>(null);
  const [tipoMovimento, setTipoMovimento] =
    useState<"entrada" | "saida">("entrada");
  const [descricaoMovimento, setDescricaoMovimento] = useState("");
  const [valorMovimento, setValorMovimento] = useState("");
  const [categoriaMovimento, setCategoriaMovimento] =
    useState("Outros");

  async function carregar() {
    try {
      const resposta = await bankService.listar();
      setContas(resposta.data);
    } catch {
      setErro("Não foi possível carregar as contas bancárias.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const saldoTotal = useMemo(
    () =>
      contas.reduce(
        (soma, conta) => soma + Number(conta.balance),
        0
      ),
    [contas]
  );

  function numero(valor: string) {
    return Number(
      valor.replace(/\./g, "").replace(",", ".")
    );
  }

  function abrirNova() {
    setEditandoId(null);
    setBankName("");
    setAccountName("");
    setAccountType("Conta corrente");
    setBalance("0");
    setColor("#2563eb");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(conta: BankAccount) {
    setEditandoId(conta.id);
    setBankName(conta.bank_name);
    setAccountName(conta.account_name);
    setAccountType(conta.account_type);
    setBalance(String(conta.balance).replace(".", ","));
    setColor(conta.color);
    setErro("");
    setModalAberto(true);
  }

  async function salvar() {
    const saldo = numero(balance);

    if (!bankName.trim()) {
      setErro("Informe o nome do banco.");
      return;
    }

    if (!accountName.trim()) {
      setErro("Informe um nome para a conta.");
      return;
    }

    if (!Number.isFinite(saldo)) {
      setErro("Informe um saldo válido.");
      return;
    }

    const dados: BankPayload = {
      bank_name: bankName.trim(),
      account_name: accountName.trim(),
      account_type: accountType,
      balance: saldo,
      color,
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId !== null) {
        await bankService.editar(editandoId, dados);
      } else {
        await bankService.criar(dados);
      }

      await carregar();
      setModalAberto(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível salvar a conta."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirMovimentacao(
    conta: BankAccount,
    tipo: "entrada" | "saida"
  ) {
    setContaMovimentoId(conta.id);
    setTipoMovimento(tipo);
    setDescricaoMovimento("");
    setValorMovimento("");
    setCategoriaMovimento("Outros");
    setErro("");
    setModalMovimento(true);
  }

  async function salvarMovimentacao() {
    if (contaMovimentoId === null) return;

    const valor = numero(valorMovimento);

    if (!descricaoMovimento.trim()) {
      setErro("Informe a descrição da movimentação.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await bankService.movimentar(contaMovimentoId, {
        transaction_type: tipoMovimento,
        description: descricaoMovimento.trim(),
        amount: valor,
        category: categoriaMovimento,
      });

      await carregar();
      setModalMovimento(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível registrar a movimentação."
      );
    } finally {
      setSalvando(false);
    }
  }



  async function abrirHistorico(conta: BankAccount) {
    try {
      setContaHistorico(conta);
      setMovimentacoes([]);
      setCarregandoHistorico(true);
      setErro("");
      setModalHistorico(true);

      const resposta =
        await bankService.listarMovimentacoes(conta.id);

      setMovimentacoes(resposta.data);
    } catch {
      setErro("Não foi possível carregar o histórico.");
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function abrirTransferencia() {
    setContaOrigemId("");
    setContaDestinoId("");
    setValorTransferencia("");
    setDescricaoTransferencia("Transferência entre contas");
    setErro("");
    setModalTransferencia(true);
  }

  async function salvarTransferencia() {
    const origem = Number(contaOrigemId);
    const destino = Number(contaDestinoId);
    const valor = numero(valorTransferencia);

    if (!origem || !destino) {
      setErro("Selecione as contas de origem e destino.");
      return;
    }

    if (origem === destino) {
      setErro("Escolha contas diferentes.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await bankService.transferir({
        from_account_id: origem,
        to_account_id: destino,
        amount: valor,
        description:
          descricaoTransferencia.trim() ||
          "Transferência entre contas",
      });

      await carregar();
      setModalTransferencia(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível realizar a transferência."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm("Deseja excluir esta conta bancária?")) {
      return;
    }

    try {
      await bankService.excluir(id);
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
            Patrimônio
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Bancos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Gerencie suas contas e saldos em um só lugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={abrirTransferencia}
            disabled={contas.length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Transferir
          </button>

          <button
            onClick={abrirNova}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
          >
            <FiPlus />
            Nova conta
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Resumo
          titulo="Saldo total"
          valor={moeda(saldoTotal)}
          cor="text-emerald-400"
        />

        <Resumo
          titulo="Contas cadastradas"
          valor={String(contas.length)}
          cor="text-blue-400"
        />

        <Resumo
          titulo="Maior saldo"
          valor={moeda(
            Math.max(
              0,
              ...contas.map((conta) => Number(conta.balance))
            )
          )}
          cor="text-amber-400"
        />
      </section>

      {erro && !modalAberto && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {contas.map((conta) => (
          <article
            key={conta.id}
            className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
          >
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ background: conta.color }}
            />

            <div className="flex items-start justify-between gap-4">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl text-xl"
                style={{
                  color: conta.color,
                  background: `${conta.color}1f`,
                }}
              >
                <FiBriefcase />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => abrirEdicao(conta)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  title="Editar"
                >
                  <FiEdit2 />
                </button>

                <button
                  onClick={() => excluir(conta.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  title="Excluir"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              {conta.bank_name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {conta.account_name} · {conta.account_type}
            </p>

            <div className="mt-7">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Saldo disponível
              </span>

              <strong className="mt-2 block text-3xl font-black text-white">
                {moeda(Number(conta.balance))}
              </strong>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-800 pt-5">
              <button
                onClick={() => abrirMovimentacao(conta, "entrada")}
                className="rounded-xl bg-emerald-500/10 px-3 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20"
              >
                + Entrada
              </button>

              <button
                onClick={() => abrirMovimentacao(conta, "saida")}
                className="rounded-xl bg-red-500/10 px-3 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20"
              >
                - Saída
              </button>

              <button
                onClick={() => abrirHistorico(conta)}
                className="col-span-2 rounded-xl bg-blue-500/10 px-3 py-3 text-sm font-bold text-blue-400 hover:bg-blue-500/20"
              >
                Ver movimentações
              </button>
            </div>
          </article>
        ))}
      </section>

      {contas.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-16 text-center text-slate-600">
          Nenhuma conta bancária cadastrada.
        </div>
      )}



      {modalHistorico && contaHistorico && (
        <div
          className="fixed inset-0 z-[1300] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setModalHistorico(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                    Histórico bancário
                  </span>

                  <h2 className="mt-2 text-2xl font-black text-white">
                    {contaHistorico.bank_name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {contaHistorico.account_name}
                    {" · "}
                    Saldo atual:{" "}
                    {moeda(Number(contaHistorico.balance))}
                  </p>
                </div>

                <button
                  onClick={() => setModalHistorico(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <FiX />
                </button>
              </div>

              {carregandoHistorico ? (
                <div className="rounded-2xl border border-dashed border-slate-700 px-5 py-12 text-center text-sm text-slate-500">
                  Carregando movimentações...
                </div>
              ) : movimentacoes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 px-5 py-12 text-center text-sm text-slate-500">
                  Nenhuma movimentação registrada.
                </div>
              ) : (
                <div className="space-y-3">
                  {movimentacoes.map((item) => {
                    const entrada =
                      item.transaction_type === "entrada";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-white">
                            {item.description}
                          </strong>

                          <span className="mt-1 block text-xs text-slate-500">
                            {item.category || "Outros"}
                            {" · "}
                            {new Date(
                              item.created_at
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <strong
                          className={
                            entrada
                              ? "shrink-0 text-sm font-black text-emerald-400"
                              : "shrink-0 text-sm font-black text-red-400"
                          }
                        >
                          {entrada ? "+" : "-"}{" "}
                          {moeda(Number(item.amount))}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalTransferencia && (
        <div
          className="fixed inset-0 z-[1200] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() =>
            !salvando && setModalTransferencia(false)
          }
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Transferir dinheiro
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Os dois saldos serão atualizados automaticamente.
                  </p>
                </div>

                <button
                  onClick={() => setModalTransferencia(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Conta de origem
                  </span>

                  <select
                    value={contaOrigemId}
                    onChange={(event) =>
                      setContaOrigemId(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione</option>

                    {contas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.bank_name} · {conta.account_name}
                        {" · "}
                        {moeda(Number(conta.balance))}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Conta de destino
                  </span>

                  <select
                    value={contaDestinoId}
                    onChange={(event) =>
                      setContaDestinoId(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione</option>

                    {contas
                      .filter(
                        (conta) =>
                          String(conta.id) !== contaOrigemId
                      )
                      .map((conta) => (
                        <option key={conta.id} value={conta.id}>
                          {conta.bank_name} · {conta.account_name}
                        </option>
                      ))}
                  </select>
                </label>

                <Campo
                  label="Valor da transferência"
                  placeholder="Exemplo: 500,00"
                  value={valorTransferencia}
                  onChange={setValorTransferencia}
                />

                <Campo
                  label="Descrição"
                  placeholder="Exemplo: Reserva mensal"
                  value={descricaoTransferencia}
                  onChange={setDescricaoTransferencia}
                />
              </div>

              {erro && (
                <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setModalTransferencia(false)}
                  className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarTransferencia}
                  disabled={salvando}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:bg-slate-700"
                >
                  {salvando
                    ? "Transferindo..."
                    : "Confirmar transferência"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMovimento && (
        <div
          className="fixed inset-0 z-[1100] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => !salvando && setModalMovimento(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">
                  {tipoMovimento === "entrada"
                    ? "Nova entrada"
                    : "Nova saída"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  O saldo será atualizado automaticamente.
                </p>
              </div>

              <div className="grid gap-4">
                <Campo
                  label="Descrição"
                  placeholder={
                    tipoMovimento === "entrada"
                      ? "Exemplo: Salário"
                      : "Exemplo: Pagamento de aluguel"
                  }
                  value={descricaoMovimento}
                  onChange={setDescricaoMovimento}
                />

                <Campo
                  label="Valor"
                  placeholder="Exemplo: 500,00"
                  value={valorMovimento}
                  onChange={setValorMovimento}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Categoria
                  </span>

                  <select
                    value={categoriaMovimento}
                    onChange={(event) =>
                      setCategoriaMovimento(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  >
                    <option>Salário</option>
                    <option>Transferência</option>
                    <option>Alimentação</option>
                    <option>Moradia</option>
                    <option>Transporte</option>
                    <option>Saúde</option>
                    <option>Lazer</option>
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
                  onClick={() => setModalMovimento(false)}
                  className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarMovimentacao}
                  disabled={salvando}
                  className={
                    tipoMovimento === "entrada"
                      ? "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:bg-slate-700"
                      : "rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:bg-slate-700"
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : tipoMovimento === "entrada"
                    ? "Confirmar entrada"
                    : "Confirmar saída"}
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
                      ? "Editar conta"
                      : "Nova conta bancária"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Informe os dados da conta.
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
                  label="Banco"
                  placeholder="Exemplo: Nubank"
                  value={bankName}
                  onChange={setBankName}
                />

                <Campo
                  label="Nome da conta"
                  placeholder="Exemplo: Conta principal"
                  value={accountName}
                  onChange={setAccountName}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Tipo de conta
                  </span>

                  <select
                    value={accountType}
                    onChange={(event) =>
                      setAccountType(event.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
                  >
                    <option>Conta corrente</option>
                    <option>Conta digital</option>
                    <option>Conta poupança</option>
                    <option>Carteira</option>
                    <option>Conta investimento</option>
                  </select>
                </label>

                <Campo
                  label="Saldo atual"
                  placeholder="Exemplo: 2500,00"
                  value={balance}
                  onChange={setBalance}
                />

                <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  Cor da conta

                  <input
                    type="color"
                    value={color}
                    onChange={(event) =>
                      setColor(event.target.value)
                    }
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
