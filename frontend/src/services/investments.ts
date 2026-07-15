import { api } from "./api";

export type InvestmentPayload = {
  name: string;
  ticker: string;
  category: string;
  institution: string;
  quantity: number;
  average_price: number;
  current_price: number;
  color: string;
};

export type Investment = InvestmentPayload & {
  id: number;
  user_id: number;
  created_at: string;
};

export const investmentService = {
  listar() {
    return api.get<Investment[]>("/investments/");
  },

  criar(data: InvestmentPayload) {
    return api.post<Investment>("/investments/", data);
  },

  editar(id: number, data: InvestmentPayload) {
    return api.put<Investment>(`/investments/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/investments/${id}`);
  },

  atualizarCotacao(id: number) {
    return api.put(`/market/investment/${id}/refresh`);
  },

  atualizarCarteira() {
    return api.put("/portfolio/refresh");
  },
};
