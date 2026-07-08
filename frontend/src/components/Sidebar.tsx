import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/" },
  { name: "Gastos fixos", path: "/gastos-fixos" },
  { name: "Gastos variáveis", path: "/gastos-variaveis" },
  { name: "Cartões", path: "/cartoes" },
  { name: "Recebimentos", path: "/recebimentos" },
  { name: "Cofrinhos", path: "/cofrinhos" },
  { name: "Bancos", path: "/bancos" },
  { name: "Investimentos", path: "/investimentos" },
  { name: "Vera IA", path: "/ia" },
  { name: "Configurações", path: "/configuracoes" },
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
          <NavLink key={item.path} to={item.path}>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}