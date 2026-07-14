import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import type { FinancialAlert } from "../services/financialAlerts";

export default function FinancialAlerts({
  alerts,
}: {
  alerts: FinancialAlert[];
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
        Monitoramento automático
      </span>

      <h2 className="mt-2 text-xl font-bold text-white">
        Alertas financeiros
      </h2>

      <div className="mt-5 space-y-3">
        {alerts.map((alert, index) => {
          const config = {
            success: {
              icon: <FiCheckCircle />,
              box: "border-emerald-900/50 bg-emerald-950/30",
              iconColor: "text-emerald-400",
            },
            warning: {
              icon: <FiAlertTriangle />,
              box: "border-amber-900/50 bg-amber-950/30",
              iconColor: "text-amber-400",
            },
            danger: {
              icon: <FiXCircle />,
              box: "border-red-900/50 bg-red-950/30",
              iconColor: "text-red-400",
            },
          }[alert.type];

          return (
            <div
              key={`${alert.title}-${index}`}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${config.box}`}
            >
              <div
                className={`mt-1 shrink-0 text-lg ${config.iconColor}`}
              >
                {config.icon}
              </div>

              <div>
                <strong className="block text-sm text-white">
                  {alert.title}
                </strong>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
