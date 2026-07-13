import { api } from "./api";

export const cardService = {
  listar() {
    return api.get("/cards/");
  },

  criar(data: any) {
    return api.post("/cards/", data);
  },
};
