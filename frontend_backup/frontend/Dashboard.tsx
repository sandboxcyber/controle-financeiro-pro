import { useEffect, useState } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";

import { api } from "../services/api";
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

export default function Dashboard() {
  const [resumo, setResumo] = useState<Resumo>({
    receitas: "R$ 0,00",
    despesas: "R$ 0,00",
    saldo: "R$ 0,00",
    falta_pagar: "R$ 0,00",
  });

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/resumo")
      .then((resposta) => setResumo(resposta.data))
      .catch(() => console.error("Erro ao carregar o resumo financeiro"))
      .finally(() => setCarregando(false));
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
              <span className="panel-eyebrow">VISÃO FINANCEIRA</span>
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
          <span className="panel-eyebrow">ANÁLISE AUTOMÁTICA</span>
          <h2>FinMaster IA</h2>

          <div className="insight-item">
            <strong>Seu saldo está positivo</strong>
            <p>Você ainda tem margem para investir ou antecipar contas.</p>
          </div>

          <div className="insight-item">
            <strong>Atenção às contas pendentes</strong>
            <p>Revise o valor em “Falta pagar” antes do fim do mês.</p>
          </div>

          <button>Ver análise completa</button>
        </aside>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">MOVIMENTAÇÕES</span>
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
            </div>
          </div>

          <div className="empty-state">
            Nenhuma conta próxima do vencimento.
          </div>
        </div>
      </section>
    </div>
  );
}