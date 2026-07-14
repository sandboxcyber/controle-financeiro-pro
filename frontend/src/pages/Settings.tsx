import { useState } from "react";
import {
  FiCheckCircle,
  FiDatabase,
  FiDownload,
  FiLock,
  FiShield,
} from "react-icons/fi";

import { baixarBackup } from "../services/backup";

export default function Settings() {
  const [baixando, setBaixando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function criarBackup() {
    try {
      setBaixando(true);
      setMensagem("");
      setErro("");

      await baixarBackup();

      setMensagem(
        "Backup baixado com sucesso. Guarde o arquivo em um local seguro."
      );
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível gerar o backup."
      );
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
          Preferências
        </span>

        <h1 className="mt-2 text-4xl font-black text-white">
          Configurações
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Segurança, proteção dos dados e opções do FinMaster.
        </p>
      </header>

      {mensagem && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-sm text-emerald-300">
          <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
              <FiDatabase />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Backup dos dados
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Baixe uma cópia do banco de dados com suas receitas,
                despesas, cartões, bancos, metas e investimentos.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-start gap-3">
              <FiShield className="mt-1 shrink-0 text-blue-400" />

              <p className="m-0 text-sm leading-6 text-slate-400">
                O arquivo contém informações financeiras. Não envie
                para desconhecidos e não deixe em computador público.
              </p>
            </div>
          </div>

          <button
            onClick={criarBackup}
            disabled={baixando}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            <FiDownload />

            {baixando
              ? "Gerando backup..."
              : "Baixar backup agora"}
          </button>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-400">
              <FiLock />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Segurança da conta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sua sessão é protegida por autenticação e cada usuário
                acessa apenas os próprios registros.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Status
              title="Autenticação"
              description="Token obrigatório para acessar os dados."
            />

            <Status
              title="Dados separados"
              description="Registros vinculados ao usuário conectado."
            />

            <Status
              title="Backup protegido"
              description="O download exige uma sessão válida."
            />
          </div>
        </article>
      </section>
    </div>
  );
}

function Status({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <FiCheckCircle className="mt-1 shrink-0 text-emerald-400" />

      <div>
        <strong className="block text-sm text-white">
          {title}
        </strong>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </div>
    </div>
  );
}
