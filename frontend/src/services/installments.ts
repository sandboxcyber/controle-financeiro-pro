import { api } from "./api";

export type Installment = {
  id: number;
  description: string;
  card_id: number;
  installment: number;
  total_installments: number;
  amount: number;
  due_month: number;
  due_year: number;
  paid: number;
  created_at: string;
};

export const installmentService = {
  listar() {
    return api.get<Installment[]>("/installments/");
  },
};
