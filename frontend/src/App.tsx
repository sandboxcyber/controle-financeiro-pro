import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FixedExpenses from "./pages/FixedExpenses";
import VariableExpenses from "./pages/VariableExpenses";
import Cards from "./pages/Cards";
import Income from "./pages/Income";
import Goals from "./pages/Goals";
import Banks from "./pages/Banks";
import Investments from "./pages/Investments";
import AI from "./pages/AI";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Imports from "./pages/Imports";
import Budgets from "./pages/Budgets";
import Bills from "./pages/Bills";
import FinancialCalendar from "./pages/FinancialCalendar";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gastos-fixos" element={<FixedExpenses />} />
        <Route path="/gastos-variaveis" element={<VariableExpenses />} />
        <Route path="/cartoes" element={<Cards />} />
        <Route path="/recebimentos" element={<Income />} />
        <Route path="/cofrinhos" element={<Goals />} />
        <Route path="/bancos" element={<Banks />} />
        <Route path="/investimentos" element={<Investments />} />
        <Route path="/ia" element={<AI />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/importar" element={<Imports />} />
        <Route path="/orcamentos" element={<Budgets />} />
<Route path="/contas" element={<Bills />} />
        <Route path="/calendario" element={<FinancialCalendar />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
