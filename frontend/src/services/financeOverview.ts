import { api } from "./api";

export type FinanceOverview = {
  receitas: number;
  despesas: number;
  fluxo_caixa: number;
  saldo_bancos: number;
  limite_cartoes: number;
  cartoes_utilizado: number;
  cartoes_disponivel: number;
  investimentos: number;
  patrimonio_total: number;
  metas: {
    atual: number;
    objetivo: number;
  };

  orcamentos: {
    total_limites: number;
    total_gasto: number;
    categorias: number;
    alertas: number;
  };
};

export const financeOverviewService = {
  carregar() {
    return api.get<FinanceOverview>("/finance/overview");
  },
};
