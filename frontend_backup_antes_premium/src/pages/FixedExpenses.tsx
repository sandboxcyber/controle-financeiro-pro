import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";

import {
  ExpenseDetailsDrawer,
  ExpenseFormModal,
  ExpenseSearch,
  ExpenseSummaryCards,
  ExpenseTable,
  type FixedExpense,
} from "../components/fixedExpenses";

import { avisarAtualizacaoFinanceira } from "../services/financeEvents";

import {
  fixedExpenseService,
  type FixedExpensePayload,
} from "../services/fixedExpense";

const categorias = [
  "Moradia",
  "Água",
  "Energia",
  "Internet",
  "Telefone",
  "Aluguel",
  "Financiamento",
  "Condomínio",
  "Plano de Saúde",
  "Seguro",
  "Streaming",
  "Educação",
  "Transporte",
  "Alimentação",
  "Outros",
];

export default function FixedExpenses() {
  const [lista, setLista] = useState<FixedExpense[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todas" | "pendentes" | "pagas" | "atrasadas" | "inativas"
  >("todas");
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState("Mensal");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<FixedExpense | null>(null);

  async function carregar() {
    try {
      const resposta = await fixedExpenseService.listar();
      setLista(resposta.data);
    } catch {
      setErro("Não foi possível carregar as despesas fixas.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = useMemo(() => {
  const termo = busca.toLowerCase().trim();
  const hoje = new Date().getDate();

  return lista.filter((item) => {
    const combinaBusca =
      !termo ||
      `${item.description} ${item.category ?? ""}`
        .toLowerCase()
        .includes(termo);

    const estaPaga =
      item.is_active && item.paid_this_month;

    const estaAtrasada =
      item.is_active &&
      !item.paid_this_month &&
      hoje > item.due_day;

    const estaPendente =
      item.is_active &&
      !item.paid_this_month &&
      hoje <= item.due_day;

    const estaInativa = !item.is_active;

    const combinaFiltro =
      filtroStatus === "todas" ||
      (filtroStatus === "pagas" && estaPaga) ||
      (filtroStatus === "atrasadas" && estaAtrasada) ||
      (filtroStatus === "pendentes" && estaPendente) ||
      (filtroStatus === "inativas" && estaInativa);

    return combinaBusca && combinaFiltro;
  });
}, [lista, busca, filtroStatus]);

  const total = useMemo(
    () =>
      lista
        .filter((item) => item.is_active)
        .reduce((soma, item) => soma + Number(item.amount), 0),
    [lista]
  );

  const resumo = useMemo(() => {
    const hoje = new Date().getDate();

    return {
      pagas: lista.filter(
        (item) => item.is_active && item.paid_this_month
      ).length,

      atrasadas: lista.filter(
        (item) =>
          item.is_active &&
          !item.paid_this_month &&
          hoje > item.due_day
      ).length,

      pendentes: lista.filter(
        (item) =>
          item.is_active &&
          !item.paid_this_month &&
          hoje <= item.due_day
      ).length,
    };
  }, [lista]);

  function abrirNova() {
    setEditandoId(null);
    setDescription("");
    setAmount("");
    setCategory("");
    setDueDay("");
    setIsActive(true);
    setRecurrence("Mensal");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(item: FixedExpense) {
    setEditandoId(item.id);
    setDescription(item.description);
    setAmount(String(item.amount).replace(".", ","));
    setCategory(item.category ?? "");
    setDueDay(String(item.due_day));
    setIsActive(item.is_active);
    setRecurrence(item.recurrence);
    setErro("");
    setModalAberto(true);
  }

  function abrirDetalhes(item: FixedExpense) {
    setSelectedExpense(item);
    setDrawerOpen(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setErro("");
  }

  async function salvar() {
    const valor = Number(
      amount.replace(/\./g, "").replace(",", ".")
    );

    const dia = Number(dueDay);

    if (!description.trim()) {
      setErro("Informe a descrição.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      setErro("Informe um dia entre 1 e 31.");
      return;
    }

    const dados: FixedExpensePayload = {
      description: description.trim(),
      amount: valor,
      category: category.trim() || "Outros",
      due_day: dia,
      is_active: isActive,
      recurrence,
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId !== null) {
        await fixedExpenseService.editar(editandoId, dados);
      } else {
        await fixedExpenseService.criar(dados);
      }

      await carregar();
      avisarAtualizacaoFinanceira();
      setModalAberto(false);
    } catch {
      setErro("Não foi possível salvar a despesa fixa.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    const confirmou = window.confirm(
      "Deseja realmente excluir esta despesa fixa?"
    );

    if (!confirmou) return;

    try {
      await fixedExpenseService.excluir(id);
      await carregar();
      avisarAtualizacaoFinanceira();
    } catch {
      setErro("Não foi possível excluir a despesa fixa.");
    }
  }

  async function pagar(id: number) {
    const confirmou = window.confirm(
      "Confirmar o pagamento desta despesa fixa?"
    );

    if (!confirmou) return;

    try {
      setErro("");
      await fixedExpenseService.pagar(id);
      await carregar();
      avisarAtualizacaoFinanceira();
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível registrar o pagamento."
      );
    }
  }

  function calcularStatus(item: FixedExpense) {
    if (!item.is_active) {
      return { texto: "Inativa", cor: "#64748b" };
    }

    if (item.paid_this_month) {
      return { texto: "Paga este mês", cor: "#22c55e" };
    }

    if (new Date().getDate() > item.due_day) {
      return { texto: "Atrasada", cor: "#ef4444" };
    }

    return { texto: "Pendente", cor: "#f59e0b" };
  }

  function calcularVencimento(item: FixedExpense) {
    if (item.paid_this_month) {
      return {
        titulo: `Dia ${item.due_day}`,
        detalhe: "Pago neste mês",
        cor: "#22c55e",
      };
    }

    const diferenca = item.due_day - new Date().getDate();

    if (diferenca === 0) {
      return {
        titulo: `Dia ${item.due_day}`,
        detalhe: "Vence hoje",
        cor: "#f59e0b",
      };
    }

    if (diferenca > 0) {
      return {
        titulo: `Dia ${item.due_day}`,
        detalhe:
          diferenca === 1
            ? "Vence amanhã"
            : `Vence em ${diferenca} dias`,
        cor: "#94a3b8",
      };
    }

    const atraso = Math.abs(diferenca);

    return {
      titulo: `Dia ${item.due_day}`,
      detalhe:
        atraso === 1
          ? "Atrasada há 1 dia"
          : `Atrasada há ${atraso} dias`,
      cor: "#ef4444",
    };
  }

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          marginBottom: 25,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Despesas Fixas</h1>

          <p style={{ color: "#94a3b8", margin: "6px 0 0" }}>
            Controle seus gastos recorrentes.
          </p>
        </div>

        <button onClick={abrirNova}>
          <FiPlus />
          Nova despesa fixa
        </button>
      </div>

      <ExpenseSummaryCards
        total={total}
        pagas={resumo.pagas}
        pendentes={resumo.pendentes}
        atrasadas={resumo.atrasadas}
      />

      <ExpenseSearch value={busca} onChange={setBusca} />

    <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  }}
>
  {[
    ["todas", "Todas"],
    ["pendentes", "Pendentes"],
    ["pagas", "Pagas"],
    ["atrasadas", "Atrasadas"],
    ["inativas", "Inativas"],
  ].map(([valor, label]) => (
    <button
      key={valor}
      onClick={() =>
        setFiltroStatus(
          valor as
            | "todas"
            | "pendentes"
            | "pagas"
            | "atrasadas"
            | "inativas"
        )
      }
      style={{
        background:
          filtroStatus === valor ? "#2563eb" : "#1e293b",
      }}
    >
      {label}
    </button>
  ))}
</div>

      {erro && !modalAberto && (
        <p
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#7f1d1d",
            color: "white",
          }}
        >
          {erro}
        </p>
      )}

      <ExpenseTable
        items={filtradas}
        onPay={pagar}
        onDetails={abrirDetalhes}
        onEdit={abrirEdicao}
        onDelete={excluir}
        getStatus={calcularStatus}
        getDueInfo={calcularVencimento}
      />

      <ExpenseFormModal
        open={modalAberto}
        editing={editandoId !== null}
        description={description}
        amount={amount}
        category={category}
        dueDay={dueDay}
        recurrence={recurrence}
        isActive={isActive}
        error={erro}
        saving={salvando}
        categories={categorias}
        onClose={fecharModal}
        onSave={salvar}
        onDescriptionChange={setDescription}
        onAmountChange={setAmount}
        onCategoryChange={setCategory}
        onDueDayChange={setDueDay}
        onRecurrenceChange={setRecurrence}
        onActiveChange={setIsActive}
      />

      <ExpenseDetailsDrawer
        open={drawerOpen}
        expense={selectedExpense}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedExpense(null);
        }}
      />
    </div>
  );
}
