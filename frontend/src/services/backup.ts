import { api } from "./api";

export async function baixarBackup() {
  const response = await api.get("/backup/download", {
    responseType: "blob",
  });

  const contentDisposition =
    response.headers["content-disposition"] || "";

  const match = contentDisposition.match(
    /filename="?([^"]+)"?/
  );

  const filename =
    match?.[1] ||
    `FinMaster_Backup_${new Date()
      .toISOString()
      .slice(0, 10)}.db`;

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/octet-stream",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
