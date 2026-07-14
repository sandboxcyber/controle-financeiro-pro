import { api } from "./api";

export type GoalPayload = {
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  icon: string;
};

export type Goal = GoalPayload & {
  id: number;
  user_id: number;
  created_at: string;
};

export const goalService = {
  listar() {
    return api.get<Goal[]>("/goals/");
  },

  criar(data: GoalPayload) {
    return api.post<Goal>("/goals/", data);
  },

  editar(id: number, data: GoalPayload) {
    return api.put<Goal>(`/goals/${id}`, data);
  },

  excluir(id: number) {
    return api.delete(`/goals/${id}`);
  },

  depositar(
    id: number,
    data: { amount: number; description: string }
  ) {
    return api.post(`/goals/${id}/contributions`, data);
  },

  listarDepositos(id: number) {
    return api.get(`/goals/${id}/contributions`);
  },
};
