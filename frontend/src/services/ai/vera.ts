import { api } from "../api";

export type VeraSummary = {
  score: number;
  receitas: number;
  despesas: number;
  despesas_fixas: number;
  saldo: number;
  maior_categoria: string;
  maior_categoria_valor: number;
  insights: string[];
};

export type VeraChatResponse = {
  resposta: string;
  resumo: VeraSummary;
};

export const veraService = {
  resumo() {
    return api.get<VeraSummary>("/ai/summary");
  },

  conversar(mensagem: string) {
    return api.post<VeraChatResponse>("/ai/chat", { mensagem });
  },
};
