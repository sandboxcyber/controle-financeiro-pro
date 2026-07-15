import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

import { billService, type Bill } from "../services/bills";
import {
  installmentService,
  type Installment,
} from "../services/installments";

type CalendarItem = {
  id: string;
  day: number;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  type: "bill" | "card";
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const weekDays = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

export default function FinancialCalendar() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [bills, setBills] = useState<Bill[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [billsResponse, installmentsResponse] =
        await Promise.all([
          billService.listar(),
          installmentService.listar(),
        ]);

      setBills(billsResponse.data);
      setInstallments(installmentsResponse.data);
    } catch {
      setError(
        "Não foi possível carregar o calendário financeiro."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const items = useMemo<CalendarItem[]>(() => {
    const billItems = bills
      .filter((bill) => {
        const date = new Date(bill.due_date);

        return (
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      })
      .map((bill) => {
        const date = new Date(bill.due_date);

        return {
          id: `bill-${bill.id}`,
          day: date.getDate(),
          title: bill.description,
          subtitle:
            bill.installments > 1
              ? `Parcela ${bill.current_installment}/${bill.installments}`
              : bill.category,
          amount: Number(
            bill.updated_amount || bill.amount
          ),
          status: bill.status,
          type: "bill" as const,
        };
      });

    const cardItems = installments
      .filter(
        (item) =>
          item.due_month === month + 1 &&
          item.due_year === year
      )
      .map((item) => ({
        id: `card-${item.id}`,
        day: 1,
        title: item.description,
        subtitle:
          `Cartão · Parcela ${item.installment}/${item.total_installments}`,
        amount: Number(item.amount),
        status: item.paid ? "Paga" : "Pendente",
        type: "card" as const,
      }));

    return [...billItems, ...cardItems].sort(
      (a, b) => a.day - b.day
    );
  }, [bills, installments, month, year]);

  const monthSummary = useMemo(() => {
    const pending = items.filter(
      (item) => item.status !== "Paga"
    );

    const overdue = items.filter(
      (item) => item.status === "Atrasada"
    );

    return {
      total: pending.reduce(
        (sum, item) => sum + item.amount,
        0
      ),
      events: items.length,
      overdue: overdue.length,
    };
  }, [items]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const result: Array<number | null> = [];

    for (let index = 0; index < firstDay; index += 1) {
      result.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      result.push(day);
    }

    while (result.length % 7 !== 0) {
      result.push(null);
    }

    return result;
  }, [month, year]);

  function previousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((value) => value - 1);
      return;
    }

    setMonth((value) => value - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((value) => value + 1);
      return;
    }

    setMonth((value) => value + 1);
  }

  function goToToday() {
    const now = new Date();

    setMonth(now.getMonth());
    setYear(now.getFullYear());
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
            Planejamento
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Calendário financeiro
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Visualize boletos, parcelas e vencimentos do mês.
          </p>
        </div>

        <button
          onClick={goToToday}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          Ir para hoje
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Compromissos do mês"
          value={String(monthSummary.events)}
          className="text-blue-400"
        />

        <SummaryCard
          title="Total pendente"
          value={money(monthSummary.total)}
          className="text-amber-400"
        />

        <SummaryCard
          title="Contas atrasadas"
          value={String(monthSummary.overdue)}
          className="text-red-400"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <button
            onClick={previousMonth}
            className="grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <FiChevronLeft />
          </button>

          <h2 className="text-xl font-black text-white">
            {monthNames[month]} de {year}
          </h2>

          <button
            onClick={nextMonth}
            className="grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="px-6 py-20 text-center text-slate-500">
            Carregando calendário...
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayItems = day
                ? items.filter((item) => item.day === day)
                : [];

              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  key={`${day}-${index}`}
                  className="min-h-32 border-b border-r border-slate-800 p-2"
                >
                  {day && (
                    <>
                      <div
                        className={
                          isToday
                            ? "grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-xs font-black text-white"
                            : "grid h-7 w-7 place-items-center text-xs font-bold text-slate-500"
                        }
                      >
                        {day}
                      </div>

                      <div className="mt-2 space-y-2">
                        {dayItems.slice(0, 3).map((item) => (
                          <CalendarEvent
                            key={item.id}
                            item={item}
                          />
                        ))}

                        {dayItems.length > 3 && (
                          <div className="text-[10px] font-bold text-blue-400">
                            + {dayItems.length - 3} compromisso(s)
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
          Agenda do mês
        </span>

        <h2 className="mt-2 text-xl font-black text-white">
          Próximos compromissos
        </h2>

        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 px-5 py-12 text-center text-sm text-slate-600">
              Nenhum compromisso neste mês.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`list-${item.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={
                      item.type === "card"
                        ? "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400"
                        : "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400"
                    }
                  >
                    {item.type === "card" ? (
                      <FiCreditCard />
                    ) : (
                      <FiFileText />
                    )}
                  </div>

                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-white">
                      Dia {item.day} · {item.title}
                    </strong>

                    <span className="mt-1 block text-xs text-slate-500">
                      {item.subtitle} · {item.status}
                    </span>
                  </div>
                </div>

                <strong
                  className={
                    item.status === "Atrasada"
                      ? "shrink-0 text-sm font-black text-red-400"
                      : item.status === "Paga"
                      ? "shrink-0 text-sm font-black text-emerald-400"
                      : "shrink-0 text-sm font-black text-amber-400"
                  }
                >
                  {money(item.amount)}
                </strong>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CalendarEvent({
  item,
}: {
  item: CalendarItem;
}) {
  const className =
    item.status === "Atrasada"
      ? "border-red-900/50 bg-red-950/50 text-red-300"
      : item.status === "Paga"
      ? "border-emerald-900/50 bg-emerald-950/40 text-emerald-300"
      : item.type === "card"
      ? "border-violet-900/50 bg-violet-950/40 text-violet-300"
      : "border-blue-900/50 bg-blue-950/40 text-blue-300";

  return (
    <div
      title={`${item.title} · ${money(item.amount)}`}
      className={`truncate rounded-lg border px-2 py-1.5 text-[10px] font-bold ${className}`}
    >
      {item.title}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <span className="text-sm text-slate-500">
        {title}
      </span>

      <strong
        className={`mt-3 block text-2xl font-black ${className}`}
      >
        {value}
      </strong>
    </article>
  );
}
