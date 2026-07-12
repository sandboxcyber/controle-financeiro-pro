import { useState } from "react";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import { api } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    const dados = new FormData();
    dados.append("username", email.trim());
    dados.append("password", password);

    try {
      setCarregando(true);
      setErro("");

      const resposta = await api.post("/auth/login", dados);

      localStorage.setItem(
        "token",
        resposta.data.access_token
      );

      window.location.href = "/";
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "E-mail ou senha inválidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[140px]" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden border-r border-slate-800/80 p-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-xl font-black shadow-lg shadow-blue-950/40">
                F
              </div>

              <div>
                <div className="text-2xl font-black tracking-tight">
                  FinMaster
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-blue-400">
                  Pro
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-blue-400">
              Controle. Clareza. Crescimento.
            </span>

            <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight xl:text-6xl">
              Sua vida financeira
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                sob controle.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Organize receitas, despesas, contas, metas e investimentos em um só lugar com a ajuda da Vera IA.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
                <FiTrendingUp className="text-xl text-emerald-400" />
                <strong className="mt-3 block text-sm">
                  Visão completa
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Tudo em um único painel.
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
                <FiZap className="text-xl text-amber-400" />
                <strong className="mt-3 block text-sm">
                  Mais agilidade
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Lance e acompanhe em segundos.
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
                <FiShield className="text-xl text-blue-400" />
                <strong className="mt-3 block text-sm">
                  Seus dados
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Acesso protegido e privado.
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            FinMaster PRO · Inteligência financeira para pessoas e empresas
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-lg font-black">
                  F
                </div>

                <div>
                  <div className="text-xl font-black">
                    FinMaster
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">
                    Pro
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={entrar}
              className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-xl sm:p-8"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
                  Acesso seguro
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  Bem-vindo de volta
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Entre para continuar cuidando da sua vida financeira.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    E-mail
                  </span>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
                    <FiMail className="shrink-0 text-slate-500" />

                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="email"
                      className="min-h-12 w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-700"
                    />
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-300">
                      Senha
                    </span>

                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
                    <FiLock className="shrink-0 text-slate-500" />

                    <input
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      className="min-h-12 w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-700"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarSenha((valor) => !valor)
                      }
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
                      aria-label={
                        mostrarSenha
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </label>
              </div>

              {erro && (
                <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-black text-white shadow-lg shadow-blue-950/40 transition hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no FinMaster
                    <FiArrowRight />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                  FinMaster Pro
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-600">
                Ao entrar, você confirma que está acessando sua conta com segurança.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
