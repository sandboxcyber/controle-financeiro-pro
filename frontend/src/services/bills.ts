import { api } from "./api";

export type BillStatus =
  | "Pendente"
  | "Atrasada"
  | "Vence hoje"
  | "Paga";

export type Bill = {
  id: number;
  description: string;
  category: string;
  amount: number;
  updated_amount: number;
  due_date: string;
  status: BillStatus;
  installments: number;
  current_installment: number;
  interest: number;
  fine: number;
  days_overdue: number;
  created_at: string;
  user_id: number;
};

export type BillSummary = {
  total_atrasado: number;
  quantidade_atrasadas: number;
  vencendo_hoje: number;
  total_pendente: number;
  total_contas: number;
};

export type CreateBillPayload = {
  description: string;
  category: string;
  amount: number;
  due_date: string;
  status: "Pendente";
  installments: number;
  current_installment: number;
  interest: number;
  fine: number;
};

export type CreateInstallmentPayload = {
  description: string;
  category: string;
  total_amount: number;
  installments: number;
  first_due_date: string;
  interest: number;
  fine: number;
};

export const billService = {
  listar() {
    return api.get<Bill[]>("/bills/");
  },

  resumo() {
    return api.get<BillSummary>("/bills/summary");
  },

  criar(data: CreateBillPayload) {
    return api.post<Bill>("/bills/", data);
  },

  criarParcelado(data: CreateInstallmentPayload) {
    return api.post("/bills/installments", data);
  },

  pagar(id: number) {
    return api.patch(`/bills/${id}/pay`);
  },

  excluir(id: number) {
    return api.delete(`/bills/${id}`);
  },
};
