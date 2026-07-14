import { useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  financialAlertsService,
  type FinancialAlert,
} from "../services/financialAlerts";

export default function Header() {
  const navigate = useNavigate();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  async function loadAlerts() {
    try {
      setLoadingAlerts(true);

      const response =
        await financialAlertsService.carregar();

      setAlerts(response.data.alerts);
    } catch (error) {
      console.error(
        "Não foi possível carregar as notificações:",
        error
      );
    } finally {
      setLoadingAlerts(false);
    }
  }

  useEffect(() => {
    loadAlerts();

    const interval = window.setInterval(
      loadAlerts,
      60000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function closeMenus(event: MouseEvent) {
      const target = event.target as Node;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenus);

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenus
      );
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");

    window.location.href = "/login";
  }

  const importantAlerts = alerts.filter(
    (alert) => alert.type !== "success"
  );

  const notificationCount =
    importantAlerts.length > 0
      ? importantAlerts.length
      : alerts.length;

  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
      <div>
        <h2 className="m-0 text-lg font-bold text-white">
          FinMaster Pessoal
        </h2>

        <p className="mt-1 text-sm capitalize text-slate-500">
          {today}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden min-w-[280px] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 lg:flex">
          <FiSearch className="text-slate-500" />

          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            placeholder="Pesquisar no FinMaster..."
          />
        </div>

        <div
          ref={notificationsRef}
          className="relative"
        >
          <button
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setUserMenuOpen(false);

              if (!notificationsOpen) {
                loadAlerts();
              }
            }}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Notificações"
          >
            <FiBell />

            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-14 w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/70">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
                <div>
                  <strong className="block text-sm text-white">
                    Notificações
                  </strong>

                  <span className="mt-1 block text-xs text-slate-500">
                    Alertas da sua vida financeira
                  </span>
                </div>

                <button
                  onClick={loadAlerts}
                  disabled={loadingAlerts}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  {loadingAlerts
                    ? "Atualizando..."
                    : "Atualizar"}
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-3">
                {loadingAlerts && alerts.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Carregando notificações...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Nenhuma notificação disponível.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((alert, index) => {
                      const config = {
                        success: {
                          icon: <FiCheckCircle />,
                          box:
                            "border-emerald-900/50 bg-emerald-950/30",
                          iconColor: "text-emerald-400",
                        },
                        warning: {
                          icon: <FiAlertTriangle />,
                          box:
                            "border-amber-900/50 bg-amber-950/30",
                          iconColor: "text-amber-400",
                        },
                        danger: {
                          icon: <FiXCircle />,
                          box:
                            "border-red-900/50 bg-red-950/30",
                          iconColor: "text-red-400",
                        },
                      }[alert.type];

                      return (
                        <div
                          key={`${alert.title}-${index}`}
                          className={`flex items-start gap-3 rounded-xl border p-3 ${config.box}`}
                        >
                          <div
                            className={`mt-0.5 shrink-0 text-lg ${config.iconColor}`}
                          >
                            {config.icon}
                          </div>

                          <div className="min-w-0">
                            <strong className="block text-sm text-white">
                              {alert.title}
                            </strong>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 p-3">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/");
                  }}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500"
                >
                  Ver painel financeiro
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 transition hover:border-slate-700 hover:text-white"
          title="Alternar tema"
        >
          <FiSun />
        </button>

        <div
          ref={userMenuRef}
          className="relative"
        >
          <button
            onClick={() => {
              setUserMenuOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-white transition hover:border-slate-700"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
              <FiUser />
            </div>

            <div className="hidden text-left sm:block">
              <strong className="block text-xs text-white">
                Diego
              </strong>

              <span className="block text-[10px] text-slate-500">
                Administrador
              </span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/70">
              <div className="border-b border-slate-800 px-4 py-4">
                <strong className="block text-sm text-white">
                  Diego
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  diego@email.com
                </span>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/configuracoes");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <FiSettings />
                  Configurações
                </button>

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-950/50"
                >
                  <FiLogOut />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
