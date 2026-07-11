import { api } from "./api";

export type FixedExpensePayload = {
  description: string;
  amount: number;
  category?: string;
  due_day: number;
  is_active: boolean;
  recurrence: string;
};

export const fixedExpenseService = {
  listar() {
    return api.get("/fixed-expenses/");
  },

  criar(data: FixedExpensePayload) {
    return api.post("/fixed-expenses/", data);
  },

  editar(id: number, data: FixedExpensePayload) {
    return api.put(`/fixed-expenses/${id}`, data);
  },

  pagar(id: number) {
    return api.post(`/fixed-expenses/${id}/pay`);
  },

  excluir(id: number) {
    return api.delete(`/fixed-expenses/${id}`);
  },
};