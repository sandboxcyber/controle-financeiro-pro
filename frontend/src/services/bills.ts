import { api } from "./api";

export type Bill = {
  id:number;
  description:string;
  category:string;
  amount:number;
  updated_amount:number;
  due_date:string;
  status:string;
  installments:number;
  current_installment:number;
  interest:number;
  fine:number;
  days_overdue:number;
};

export const billService={
  listar(){ return api.get("/bills/"); },
  resumo(){ return api.get("/bills/summary"); },
  criar(data:any){ return api.post("/bills/",data); },
  criarParcelado(data:any){ return api.post("/bills/installments",data); },
  pagar(id:number){ return api.patch(`/bills/${id}/pay`); },
  excluir(id:number){ return api.delete(`/bills/${id}`); }
}
