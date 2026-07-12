import { api } from "./api";

export type IncomePayload = {
  description: string;
  amount: number;
  category?: string;
};

export const incomeService = {
  listar() {
    return api.get("/incomes/");
  },

  criar(data: IncomePayload) {
    return api.post("/incomes/", data);
  },

  editar(id: number, data: IncomePayload) {
    return api.put(`/incomes/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/incomes/${id}`);
  },
};