import { api } from "./api";

export type ExpensePayload = {
  description: string;
  amount: number;
  category?: string;
};

export const expenseService = {
  listar() {
    return api.get("/expenses/");
  },

  criar(data: ExpensePayload) {
    return api.post("/expenses/", data);
  },

  editar(id: number, data: ExpensePayload) {
    return api.put(`/expenses/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/expenses/${id}`);
  },
};