import { NavLink } from "react-router-dom";
import {
  FiBarChart2, FiBriefcase, FiCpu, FiCreditCard, FiDollarSign,
  FiHome, FiSettings, FiTarget, FiTrendingDown, FiTrendingUp
} from "react-icons/fi";

const menu = [
  { name: "Dashboard", path: "/", icon: FiHome },
  { name: "Receitas", path: "/recebimentos", icon: FiTrendingUp },
  { name: "Despesas", path: "/gastos-variaveis", icon: FiTrendingDown },
  { name: "Despesas fixas", path: "/gastos-fixos", icon: FiBarChart2 },
  { name: "Cartões", path: "/cartoes", icon: FiCreditCard },
  { name: "Bancos", path: "/bancos", icon: FiBriefcase },
  { name: "Metas", path: "/cofrinhos", icon: FiTarget },
  { name: "Investimentos", path: "/investimentos", icon: FiDollarSign },
  { name: "Vera IA", path: "/ia", icon: FiCpu },
  { name: "Configurações", path: "/configuracoes", icon: FiSettings },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col border-r border-slate-800 bg-slate-950/95 px-4 py-5">
      <div className="mb-6 px-2">
        <div className="text-2xl font-black text-white">FinMaster</div>
        <div className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-blue-400">Pro</div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-1.5">
        <button className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Pessoal</button>
        <button className="rounded-xl px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white">Empresa</button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <Icon className="text-lg" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
