import { api } from "./api";

export type BankPayload = {
  bank_name: string;
  account_name: string;
  account_type: string;
  balance: number;
  color: string;
};

export type BankAccount = BankPayload & {
  id: number;
  user_id: number;
  created_at: string;
};

export type BankTransactionPayload = {
  transaction_type: "entrada" | "saida";
  description: string;
  amount: number;
  category: string;
};



export type BankTransferPayload = {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description: string;
};

export const bankService = {
  listar() {
    return api.get<BankAccount[]>("/banks/");
  },

  criar(data: BankPayload) {
    return api.post<BankAccount>("/banks/", data);
  },

  editar(id: number, data: BankPayload) {
    return api.put<BankAccount>(`/banks/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/banks/${id}`);
  },

  movimentar(id: number, data: BankTransactionPayload) {
    return api.post(`/banks/${id}/transactions`, data);
  },



  transferir(data: BankTransferPayload) {
    return api.post("/banks/transfer", data);
  },

  listarMovimentacoes(id: number) {
    return api.get(`/banks/${id}/transactions`);
  },
};
