import { FiBell, FiSearch, FiSun, FiUser } from "react-icons/fi";

export default function Header() {
  const hoje = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "2-digit", month: "long"
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
      <div>
        <h2 className="m-0 text-lg font-bold text-white">Dashboard Pessoal</h2>
        <p className="mt-1 text-sm capitalize text-slate-500">{hoje}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden min-w-[280px] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 lg:flex">
          <FiSearch className="text-slate-500" />
          <input className="w-full bg-transparent text-sm text-white outline-none" placeholder="Pesquisar..." />
        </div>

        {[FiBell, FiSun, FiUser].map((Icon, i) => (
          <button key={i} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 hover:text-white">
            <Icon />
          </button>
        ))}
      </div>
    </header>
  );
}
