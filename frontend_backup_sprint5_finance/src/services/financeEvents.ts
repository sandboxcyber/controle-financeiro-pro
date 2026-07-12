export const FINANCE_UPDATED_EVENT = "finmaster:finance-updated";

export function avisarAtualizacaoFinanceira() {
  window.dispatchEvent(new Event(FINANCE_UPDATED_EVENT));
}