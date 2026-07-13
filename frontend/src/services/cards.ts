import { api } from "./api";

export type CardPayload = {
  name: string;
  brand: string;
  color: string;
  limit: number;
  used: number;
  closing_day: number;
  due_day: number;
};

export type CardExpensePayload = {
  description: string;
  amount: number;
  category: string;
};

export const cardService = {
  listar() {
    return api.get("/cards/");
  },

  criar(data: CardPayload) {
    return api.post("/cards/", data);
  },

  editar(id: number, data: CardPayload) {
    return api.put(`/cards/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/cards/${id}`);
  },

  lancarGasto(id: number, data: CardExpensePayload) {
    return api.post(`/cards/${id}/expenses`, data);
  },

  listarGastos(id: number) {
    return api.get(`/cards/${id}/expenses`);
  },
};
