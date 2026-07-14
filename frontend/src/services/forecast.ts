import { api } from "./api";

export type FinancialForecast = {
  saldo_previsto: number;
  despesas_previstas: number;
  mensagem: string;
};

export const forecastService = {
  carregar() {
    return api.get<FinancialForecast>("/finance/forecast");
  },
};
