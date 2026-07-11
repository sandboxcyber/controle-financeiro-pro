import { useEffect, useMemo, useState } from "react";
import { avisarAtualizacaoFinanceira } from "../services/financeEvents";
import {
  FiCheck,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  fixedExpenseService,
  type FixedExpensePayload,
} from "../services/fixedExpense";

type FixedExpense = {
  id: number;
  description: string;
  amount: number;
  category?: string;
  due_day: number;
  is_active: boolean;
  paid_this_month: boolean;
  recurrence: string;
};

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

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function FixedExpenses() {
  const [lista, setLista] = useState<FixedExpense[]>([]);
  const [busca, setBusca] = useState("");

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

    if (!termo) return lista;

    return lista.filter((item) =>
      `${item.description} ${item.category ?? ""}`
        .toLowerCase()
        .includes(termo)
    );
  }, [lista, busca]);

  const total = useMemo(
    () =>
      lista
        .filter((item) => item.is_active)
        .reduce((soma, item) => soma + Number(item.amount), 0),
    [lista]
  );

  function abrirNova() {
    setEditandoId(null);
    setDescription("");
    setAmount("");
    setCategory("");
    setDueDay("");
    setIsActive(true);
    setErro("");
    setModalAberto(true);
    setRecurrence("Mensal");
  }

  function abrirEdicao(item: FixedExpense) {
    setEditandoId(item.id);
    setDescription(item.description);
    setAmount(String(item.amount).replace(".", ","));
    setCategory(item.category ?? "");
    setDueDay(String(item.due_day));
    setIsActive(item.is_active);
    setErro("");
    setModalAberto(true);
    setRecurrence(item.recurrence);
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
    const mensagem =
      error?.response?.data?.detail ||
      "Não foi possível registrar o pagamento.";

    setErro(mensagem);
  }
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: 20,
            border: "1px solid #1f2937",
            borderRadius: 18,
            background: "#111827",
          }}
        >
          <span style={{ color: "#94a3b8" }}>Total mensal ativo</span>

          <h2
            style={{
              margin: "10px 0 0",
              color: "#ef4444",
            }}
          >
            {moeda(total)}
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 15px",
            border: "1px solid #1f2937",
            borderRadius: 18,
            background: "#111827",
          }}
        >
          <FiSearch color="#94a3b8" />

          <input
            placeholder="Buscar por descrição ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: "100%",
              border: 0,
              outline: 0,
              background: "transparent",
              color: "white",
            }}
          />
        </div>
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

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #1f2937",
          borderRadius: 18,
          background: "#111827",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#0f172a" }}>
              <th style={{ padding: 15, textAlign: "left" }}>
                Descrição
              </th>
              <th style={{ padding: 15, textAlign: "left" }}>
                Categoria
              </th>
              <th style={{ padding: 15, textAlign: "left" }}>
                Vencimento
              </th>
              <th style={{ padding: 15, textAlign: "left" }}>
                Status
              </th>
              <th style={{ padding: 15, textAlign: "left" }}>
                Valor
              </th>
              <th style={{ padding: 15, textAlign: "right" }}>
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((item) => (
              <tr
                key={item.id}
                style={{ borderTop: "1px solid #1f2937" }}
              >
                <td style={{ padding: 15 }}>
                  {item.description}
                </td>

                <td style={{ padding: 15 }}>
                  {item.category || "Outros"}
                </td>

                <td style={{ padding: 15 }}>
                  Dia {item.due_day}
                </td>

                <td style={{ padding: 15 }}>
                  {!item.is_active
                    ? "Inativa"
                    : item.paid_this_month
                    ? "Paga este mês"
                    : "Pendente"}
                </td>

                <td
                  style={{
                    padding: 15,
                    color: "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {moeda(Number(item.amount))}
                </td>

                <td
                  style={{
                    padding: 15,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                  >
                  <button
                    onClick={() => pagar(item.id)}
                    disabled={!item.is_active || item.paid_this_month}
                    style={{
                      marginRight: 8,
                      background:
                        !item.is_active || item.paid_this_month
                          ? "#475569"
                          : "#16a34a",
                      cursor:
                        !item.is_active || item.paid_this_month
                          ? "not-allowed"
                          : "pointer",
                    }} 
                    title={
                      item.paid_this_month
                        ? "Já foi paga neste mês"
                        : "Marcar como paga"
                    }
                  >
                    <FiCheck />
                  </button>
                                                                   
                  <button
                    onClick={() => abrirEdicao(item)}
                    style={{
                      marginRight: 8,
                      background: "#2563eb",
                    }}
                    title="Editar"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => excluir(item.id)}
                    style={{ background: "#dc2626" }}
                    title="Excluir"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}

            {filtradas.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Nenhuma despesa fixa cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div
          onClick={fecharModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(2, 6, 23, 0.78)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(500px, 100%)",
              padding: 26,
              border: "1px solid #334155",
              borderRadius: 22,
              background: "#111827",
              boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {editandoId !== null
                    ? "Editar despesa fixa"
                    : "Nova despesa fixa"}
                </h2>

                <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                  Cadastre um gasto recorrente mensal.
                </p>
              </div>

              <button
                onClick={fecharModal}
                style={{ background: "#334155" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <input
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                placeholder="Valor, exemplo: 150,00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Selecione a categoria</option>

                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>

              <input
                placeholder="Dia do vencimento"
                inputMode="numeric"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />

               <select
                 value={recurrence}
                 onChange={(e) => setRecurrence(e.target.value)}
               >
                 <option>Mensal</option>
                 <option>Semanal</option>
                 <option>Quinzenal</option>
                 <option>Anual</option>
               </select>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />

                Despesa ativa
              </label>

              {erro && (
                <p
                  style={{
                    margin: 0,
                    padding: 11,
                    borderRadius: 10,
                    background: "#7f1d1d",
                    color: "white",
                  }}
                >
                  {erro}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  onClick={fecharModal}
                  style={{ background: "#334155" }}
                >
                  Cancelar
                </button>

                <button onClick={salvar} disabled={salvando}>
                  {salvando
                    ? "Salvando..."
                    : editandoId !== null
                    ? "Salvar alterações"
                    : "Cadastrar despesa fixa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}