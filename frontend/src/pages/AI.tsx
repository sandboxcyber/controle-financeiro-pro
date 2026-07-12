import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FiCpu,
  FiDollarSign,
  FiMessageCircle,
  FiSend,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";

import { veraService, type VeraSummary } from "../services/ai/vera";

type Message = {
  id: number;
  author: "user" | "vera";
  text: string;
};

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-sm text-slate-500">{title}</span>
          <strong className="mt-3 block text-2xl font-black text-white">
            {value}
          </strong>
        </div>

        <div
          className="grid h-11 w-11 place-items-center rounded-xl text-xl"
          style={{ color, background: `${color}1f` }}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

export default function AI() {
  const [summary, setSummary] = useState<VeraSummary | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      author: "vera",
      text:
        "Olá, Diego. Eu sou a Vera. Pergunte sobre seu saldo, receitas, despesas, contas fixas ou como economizar.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setError("");
        const response = await veraService.resumo();
        setSummary(response.data);
      } catch (requestError: any) {
        const status = requestError?.response?.status;

        setError(
          status === 401
            ? "Sua sessão expirou. Entre novamente."
            : "Não foi possível carregar a análise da Vera."
        );
      }
    }

    loadSummary();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage() {
    const text = input.trim();

    if (!text || sending) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        author: "user",
        text,
      },
    ]);

    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await veraService.conversar(text);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          author: "vera",
          text: response.data.resposta,
        },
      ]);

      setSummary(response.data.resumo);
    } catch (requestError: any) {
      const status = requestError?.response?.status;

      setError(
        status === 401
          ? "Sua sessão expirou. Entre novamente."
          : "A Vera não conseguiu responder agora."
      );
    } finally {
      setSending(false);
    }
  }

  const suggestions = [
    "Qual é meu saldo?",
    "Quanto eu gastei?",
    "Qual minha maior categoria?",
    "Como posso economizar?",
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-7">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-blue-400">
              Assistente financeiro
            </span>

            <h1 className="mt-3 text-4xl font-black text-white">
              Vera IA
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Respostas baseadas nos dados reais registrados no FinMaster.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-blue-400/20 bg-slate-950/50 px-6 py-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
              <FiCpu />
            </div>

            <div>
              <span className="block text-sm text-slate-500">
                Saúde financeira
              </span>
              <strong className="text-3xl font-black text-blue-400">
                {summary?.score ?? "--"}
              </strong>
              <span className="ml-1 text-sm text-slate-600">/100</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Saldo"
          value={summary ? currency(summary.saldo) : "Carregando..."}
          icon={<FiDollarSign />}
          color="#3b82f6"
        />
        <SummaryCard
          title="Receitas"
          value={summary ? currency(summary.receitas) : "Carregando..."}
          icon={<FiTrendingUp />}
          color="#22c55e"
        />
        <SummaryCard
          title="Despesas"
          value={summary ? currency(summary.despesas) : "Carregando..."}
          icon={<FiTrendingDown />}
          color="#ef4444"
        />
        <SummaryCard
          title="Despesas fixas"
          value={summary ? currency(summary.despesas_fixas) : "Carregando..."}
          icon={<FiCpu />}
          color="#f59e0b"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            Análise automática
          </span>
          <h2 className="mt-2 text-xl font-bold text-white">
            Insights da Vera
          </h2>

          <div className="mt-5 space-y-3">
            {summary?.insights?.length ? (
              summary.insights.map((insight, index) => (
                <div
                  key={`${insight}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <p className="m-0 text-sm leading-6 text-slate-300">
                    {insight}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-600">
                Carregando análise...
              </div>
            )}
          </div>
        </aside>

        <article className="flex min-h-[590px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
          <header className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white">
              <FiMessageCircle />
            </div>

            <div>
              <h2 className="font-black text-white">Converse com a Vera</h2>
              <p className="mt-1 text-xs text-emerald-400">
                Online e analisando seus dados
              </p>
            </div>
          </header>

          <div className="border-b border-slate-800 px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-blue-500 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.author === "user"
                    ? "ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white"
                    : "max-w-[82%] rounded-2xl rounded-bl-md border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-slate-300"
                }
              >
                {message.text}
              </div>
            ))}

            {sending && (
              <div className="max-w-[82%] rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-500">
                Vera está analisando...
              </div>
            )}

            <div ref={endRef} />
          </div>

          {error && (
            <div className="mx-6 mb-3 rounded-xl border border-red-900/60 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <footer className="border-t border-slate-800 p-4">
            <div className="flex items-end gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-2 focus-within:border-blue-500">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Pergunte sobre seu saldo, gastos ou economia..."
                rows={2}
                className="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-700"
              />

              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                title="Enviar mensagem"
              >
                <FiSend />
              </button>
            </div>
          </footer>
        </article>
      </section>
    </div>
  );
}
