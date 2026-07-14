import { api } from "./api";

export type FinancialAlert = {
  type: "success" | "warning" | "danger";
  title: string;
  message: string;
};

export const financialAlertsService = {
  carregar() {
    return api.get<{ alerts: FinancialAlert[] }>(
      "/finance/alerts"
    );
  },
};
