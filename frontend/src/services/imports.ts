import { api } from "./api";

export type CsvImportResult = {
  message: string;
  importados: number;
  ignorados: number;
  total_entradas: number;
  total_saidas: number;
  saldo_atual: number;
  errors: string[];
};

export const importService = {
  importarExtrato(
    accountId: number,
    file: File
  ) {
    const formData = new FormData();

    formData.append("account_id", String(accountId));
    formData.append("file", file);

    return api.post<CsvImportResult>(
      "/imports/bank-csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
