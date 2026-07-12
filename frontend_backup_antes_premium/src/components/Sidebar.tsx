import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiCreditCard,
  FiTarget,
  FiBriefcase,
  FiDollarSign,
  FiCpu,
  FiSettings,
  FiCalendar,
} from "react-icons/fi";

const menu = [
  { name: "Dashboard", path: "/", icon: <FiHome /> },
  { name: "Receitas", path: "/recebimentos", icon: <FiTrendingUp /> },
  { name: "Despesas", path: "/gastos-variaveis", icon: <FiTrendingDown /> },
  { name: "Despesas fixas", path: "/gastos-fixos", icon: <FiCalendar /> },
  { name: "Cartões", path: "/cartoes", icon: <FiCreditCard /> },
  { name: "Bancos", path: "/bancos", icon: <FiBriefcase /> },
  { name: "Metas", path: "/cofrinhos", icon: <FiTarget /> },
  { name: "Investimentos", path: "/investimentos", icon: <FiDollarSign /> },
  { name: "Vera IA", path: "/ia", icon: <FiCpu /> },
  { name: "Configurações", path: "/configuracoes", icon: <FiSettings /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1>FinMaster</h1>
      <p>PRO</p>

      <div className="mode-switch">
        <button>Pessoal</button>
        <button>Empresa</button>
      </div>

      <nav>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}