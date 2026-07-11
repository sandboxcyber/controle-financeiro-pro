import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { avisarAtualizacaoFinanceira } from "../services/financeEvents";

import {
  incomeService,
  type IncomePayload,
} from "../services/income";

type Receita = {
  id: number;
  description: string;
  amount: number;
  category?: string;
  received_at: string;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Income() {
  const [lista, setLista] = useState<Receita[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const resposta = await incomeService.listar();
      setLista(resposta.data);
    } catch {
      setErro("Não foi possível carregar os recebimentos.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const listaFiltrada = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return lista;

    return lista.filter((item) =>
      `${item.description} ${item.category ?? ""}`
        .toLowerCase()
        .includes(termo)
    );
  }, [lista, busca]);

  const total = useMemo(
    () => lista.reduce((soma, item) => soma + Number(item.amount), 0),
    [lista]
  );

  function abrirNovo() {
    setEditandoId(null);
    setDescription("");
    setAmount("");
    setCategory("");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(item: Receita) {
    setEditandoId(item.id);
    setDescription(item.description);
    setAmount(String(item.amount).replace(".", ","));
    setCategory(item.category ?? "");
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
  }

  async function salvar() {
    const valor = Number(
      amount.replace(/\./g, "").replace(",", ".")
    );

    if (!description.trim()) {
      setErro("Informe a descrição.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    const dados: IncomePayload = {
      description: description.trim(),
      amount: valor,
      category: category.trim() || "Outros",
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId) {
        await incomeService.editar(editandoId, dados);
      } else {
        await incomeService.criar(dados);
      }

      await carregar();
      avisarAtualizacaoFinanceira();
      setModalAberto(false);
    } catch {
      setErro("Não foi possível salvar o recebimento.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    const confirmou = window.confirm(
      "Deseja realmente excluir este recebimento?"
    );

    if (!confirmou) return;

    try {
      await incomeService.excluir(id);
      await carregar();
    } catch {
      setErro("Não foi possível excluir o recebimento.");
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Recebimentos</h1>

          <p style={{ color: "#94a3b8", margin: "6px 0 0" }}>
            Controle todas as entradas da sua conta.
          </p>
        </div>

        <button onClick={abrirNovo}>
          <FiPlus /> Nova receita
        </button>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            padding: 22,
            borderRadius: 18,
            border: "1px solid #1f2937",
            background: "#111827",
          }}
        >
          <span style={{ color: "#94a3b8" }}>Total recebido</span>

          <strong
            style={{
              display: "block",
              marginTop: 8,
              fontSize: 30,
              color: "#22c55e",
            }}
          >
            {formatarMoeda(total)}
          </strong>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
            borderRadius: 18,
            border: "1px solid #1f2937",
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
      </section>

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
          borderRadius: 18,
          border: "1px solid #1f2937",
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
              <th style={{ padding: 15, textAlign: "left" }}>Descrição</th>
              <th style={{ padding: 15, textAlign: "left" }}>Categoria</th>
              <th style={{ padding: 15, textAlign: "left" }}>Data</th>
              <th style={{ padding: 15, textAlign: "left" }}>Valor</th>
              <th style={{ padding: 15, textAlign: "right" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {listaFiltrada.map((item) => (
              <tr
                key={item.id}
                style={{ borderTop: "1px solid #1f2937" }}
              >
                <td style={{ padding: 15 }}>{item.description}</td>

                <td style={{ padding: 15 }}>
                  {item.category || "Outros"}
                </td>

                <td style={{ padding: 15, color: "#94a3b8" }}>
                  {new Date(item.received_at).toLocaleDateString("pt-BR")}
                </td>

                <td
                  style={{
                    padding: 15,
                    color: "#22c55e",
                    fontWeight: 700,
                  }}
                >
                  {formatarMoeda(Number(item.amount))}
                </td>

                <td
                  style={{
                    padding: 15,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    onClick={() => abrirEdicao(item)}
                    title="Editar"
                    style={{
                      marginRight: 8,
                      background: "#2563eb",
                    }}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => excluir(item.id)}
                    title="Excluir"
                    style={{ background: "#dc2626" }}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}

            {listaFiltrada.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Nenhum recebimento encontrado.
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
              width: "min(480px, 100%)",
              padding: 26,
              border: "1px solid #334155",
              borderRadius: 22,
              background: "#111827",
              boxShadow: "0 30px 90px rgba(0,0,0,.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {editandoId ? "Editar receita" : "Nova receita"}
                </h2>

                <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>
                  Preencha os dados do recebimento.
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
                placeholder="Valor, exemplo: 1.500,00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <input
                placeholder="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

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
                    : editandoId
                    ? "Salvar alterações"
                    : "Cadastrar receita"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}