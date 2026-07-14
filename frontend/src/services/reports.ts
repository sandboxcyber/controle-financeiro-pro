import { api } from "./api";

export const reportService = {
  async baixarRelatorioFinanceiro() {
    const response = await api.get(
      "/reports/financial.pdf",
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/pdf",
      })
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `finmaster-relatorio-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },
};
