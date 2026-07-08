import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
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

function App() {
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
        <Route path="/configuracoes" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}

export default App;