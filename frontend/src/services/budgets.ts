import { api } from "./api";

export type BudgetPayload = {
  category: string;
  monthly_limit: number;
  color: string;
};

export type Budget = BudgetPayload & {
  id: number;
  user_id: number;
  created_at: string;
  spent: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
};

export const budgetService = {
  listar() {
    return api.get<Budget[]>("/budgets/");
  },

  criar(data: BudgetPayload) {
    return api.post("/budgets/", data);
  },

  editar(id: number, data: BudgetPayload) {
    return api.put(`/budgets/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/budgets/${id}`);
  },
};
