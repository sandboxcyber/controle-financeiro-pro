export type FixedExpense = {
  id: number;
  description: string;
  amount: number;
  category?: string;
  due_day: number;
  is_active: boolean;
  paid_this_month: boolean;
  recurrence: string;
};

export type ExpenseStatus = {
  texto: string;
  cor: string;
};

export type ExpenseDueInfo = {
  titulo: string;
  detalhe: string;
  cor: string;
};
