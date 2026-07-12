import { useEffect, useState } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";

import { api } from "../services/api";
import { FINANCE_UPDATED_EVENT } from "../services/financeEvents";
import { fixedExpenseService } from "../services/fixedExpense";

import BalanceChart from "../components/BalanceChart";
import StatCard from "../components/dashboard/StatCard";
import WelcomeCard from "../components/dashboard/WelcomeCard";

import "../styles/dashboard.css";

type Resumo = {
  receitas: string;
  despesas: string;
  saldo: string;
  falta_pagar: string;
};

type ProximoVencimento = {
  id: number;
  description: string;
  amount: number;
  category?: string;
  due_day: number;
  days_until_due: number;
  is_overdue: boolean;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Dashboard() {
  const [resumo, setResumo] = useState<Resumo>({
    receitas: "R$ 0,00",
    despesas: "R$ 0,00",
    saldo: "R$ 0,00",
    falta_pagar: "R$ 0,00",
  });

  const [carregando, setCarregando] = useState(true);

  const [proximosVencimentos, setProximosVencimentos] = useState<
    ProximoVencimento[]
  >([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);

        const [resumoResposta, vencimentosResposta] = await Promise.all([
          api.get("/dashboard/resumo"),
          fixedExpenseService.proximosVencimentos(),
        ]);

        setResumo(resumoResposta.data);
        setProximosVencimentos(vencimentosResposta.data);
      } catch (erro) {
        console.error("Erro ao carregar o Dashboard:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();

    window.addEventListener(
      FINANCE_UPDATED_EVENT,
      carregarDashboard
    );

    window.addEventListener("focus", carregarDashboard);

    return () => {
      window.removeEventListener(
        FINANCE_UPDATED_EVENT,
        carregarDashboard
      );

      window.removeEventListener("focus", carregarDashboard);
    };
  }, []);

  return (
    <div className="premium-dashboard">
      <WelcomeCard />

      <section className="premium-stats-grid">
        <StatCard
          title="Saldo atual"
          value={carregando ? "Carregando..." : resumo.saldo}
          subtitle="Disponível no momento"
          icon={<FiDollarSign />}
          tone="blue"
        />

        <StatCard
          title="Receitas"
          value={carregando ? "Carregando..." : resumo.receitas}
          subtitle="Entradas neste mês"
          icon={<FiArrowUpRight />}
          tone="green"
        />

        <StatCard
          title="Despesas"
          value={carregando ? "Carregando..." : resumo.despesas}
          subtitle="Saídas neste mês"
          icon={<FiArrowDownRight />}
          tone="red"
        />

        <StatCard
          title="Falta pagar"
          value={carregando ? "Carregando..." : resumo.falta_pagar}
          subtitle="Contas pendentes"
          icon={<FiCreditCard />}
          tone="orange"
        />
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                VISÃO FINANCEIRA
              </span>

              <h2>Evolução do saldo</h2>
            </div>

            <select defaultValue="mes">
              <option value="mes">Este mês</option>
              <option value="trimestre">Últimos 3 meses</option>
              <option value="ano">Este ano</option>
            </select>
          </div>

          <BalanceChart />
        </div>

        <aside className="dashboard-panel insight-panel">
          <span className="panel-eyebrow">
            ANÁLISE AUTOMÁTICA
          </span>

          <h2>FinMaster IA</h2>

          <div className="insight-item">
            <strong>Seu saldo está positivo</strong>

            <p>
              Você ainda tem margem para investir ou antecipar contas.
            </p>
          </div>

          <div className="insight-item">
            <strong>Atenção às contas pendentes</strong>

            <p>
              Revise o valor em “Falta pagar” antes do fim do mês.
            </p>
          </div>

          <button>Ver análise completa</button>
        </aside>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                MOVIMENTAÇÕES
              </span>

              <h2>Últimos lançamentos</h2>
            </div>
          </div>

          <div className="empty-state">
            Seus próximos lançamentos aparecerão aqui.
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">ALERTAS</span>

              <h2>Próximas contas</h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#94a3b8",
                  fontSize: 14,
                }}
              >
                {proximosVencimentos.length === 0
                  ? "Nenhuma pendência."
                  : `${proximosVencimentos.length} conta(s) aguardando pagamento.`}
              </p>
            </div>
          </div>

          {proximosVencimentos.length === 0 ? (
            <div className="empty-state">
              Nenhuma conta próxima do vencimento.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {proximosVencimentos.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    padding: 14,
                    border: "1px solid #1f2937",
                    borderRadius: 14,
                    background: "#0f172a",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 15,
                        color: "#f8fafc",
                      }}
                    >
                      {item.description}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      {item.category || "Outros"}
                    </span>

                    <small
                      style={{
                        display: "block",
                        marginTop: 6,
                        color: item.is_overdue
                          ? "#ef4444"
                          : "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {item.is_overdue
                        ? `Atrasada há ${Math.abs(
                            item.days_until_due
                          )} dia(s)`
                        : item.days_until_due === 0
                        ? "Vence hoje"
                        : item.days_until_due === 1
                        ? "Vence amanhã"
                        : `Vence em ${item.days_until_due} dias`}
                    </small>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#ef4444",
                      }}
                    >
                      {formatarMoeda(Number(item.amount))}
                    </strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: 4,
                        color: "#94a3b8",
                      }}
                    >
                      Dia {item.due_day}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}