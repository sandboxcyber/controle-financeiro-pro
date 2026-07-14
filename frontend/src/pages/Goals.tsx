import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  goalService,
  type Goal,
  type GoalPayload,
} from "../services/goals";

const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export default function Goals() {
  const [metas, setMetas] = useState<Goal[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDeposito, setModalDeposito] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [metaDeposito, setMetaDeposito] = useState<Goal | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [icon, setIcon] = useState("🎯");

  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] =
    useState("Depósito na meta");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const resposta = await goalService.listar();
      setMetas(resposta.data);
    } catch {
      setErro("Não foi possível carregar as metas.");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(() => {
    const objetivo = metas.reduce(
      (soma, meta) => soma + Number(meta.target_amount),
      0
    );

    const acumulado = metas.reduce(
      (soma, meta) => soma + Number(meta.current_amount),
      0
    );

    return {
      objetivo,
      acumulado,
      falta: objetivo - acumulado,
    };
  }, [metas]);

  function numero(valor: string) {
    return Number(
      valor.replace(/\./g, "").replace(",", ".")
    );
  }

  function abrirNova() {
    setEditandoId(null);
    setName("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("0");
    setDeadline("");
    setColor("#2563eb");
    setIcon("🎯");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(meta: Goal) {
    setEditandoId(meta.id);
    setName(meta.name);
    setDescription(meta.description);
    setTargetAmount(
      String(meta.target_amount).replace(".", ",")
    );
    setCurrentAmount(
      String(meta.current_amount).replace(".", ",")
    );
    setDeadline(meta.deadline || "");
    setColor(meta.color);
    setIcon(meta.icon);
    setErro("");
    setModalAberto(true);
  }

  function abrirDeposito(meta: Goal) {
    setMetaDeposito(meta);
    setDepositAmount("");
    setDepositDescription("Depósito na meta");
    setErro("");
    setModalDeposito(true);
  }

  async function salvar() {
    const objetivo = numero(targetAmount);
    const atual = numero(currentAmount);

    if (!name.trim()) {
      setErro("Informe o nome da meta.");
      return;
    }

    if (!Number.isFinite(objetivo) || objetivo <= 0) {
      setErro("Informe um valor objetivo válido.");
      return;
    }

    if (!Number.isFinite(atual) || atual < 0) {
      setErro("Informe um valor atual válido.");
      return;
    }

    if (atual > objetivo) {
      setErro("O valor atual não pode superar a meta.");
      return;
    }

    const dados: GoalPayload = {
      name: name.trim(),
      description: description.trim(),
      target_amount: objetivo,
      current_amount: atual,
      deadline: deadline || null,
      color,
      icon: icon.trim() || "🎯",
    };

    try {
      setSalvando(true);
      setErro("");

      if (editandoId !== null) {
        await goalService.editar(editandoId, dados);
      } else {
        await goalService.criar(dados);
      }

      await carregar();
      setModalAberto(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível salvar a meta."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function depositar() {
    if (!metaDeposito) return;

    const valor = numero(depositAmount);

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um valor válido.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      await goalService.depositar(metaDeposito.id, {
        amount: valor,
        description:
          depositDescription.trim() || "Depósito na meta",
      });

      await carregar();
      setModalDeposito(false);
    } catch (error: any) {
      setErro(
        error?.response?.data?.detail ||
          "Não foi possível adicionar o valor."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm("Deseja realmente excluir esta meta?")) {
      return;
    }

    try {
      await goalService.excluir(id);
      await carregar();
    } catch {
      setErro("Não foi possível excluir a meta.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-400">
            Planejamento
          </span>

          <h1 className="mt-2 text-4xl font-black text-white">
            Metas
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Transforme seus planos em objetivos alcançáveis.
          </p>
        </div>

        <button
          onClick={abrirNova}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          <FiPlus />
          Nova meta
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Resumo
          titulo="Objetivo total"
          valor={moeda(resumo.objetivo)}
          cor="text-blue-400"
        />

        <Resumo
          titulo="Valor acumulado"
          valor={moeda(resumo.acumulado)}
          cor="text-emerald-400"
        />

        <Resumo
          titulo="Falta alcançar"
          valor={moeda(resumo.falta)}
          cor="text-amber-400"
        />
      </section>

      {erro && !modalAberto && !modalDeposito && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {metas.map((meta) => {
          const objetivo = Number(meta.target_amount);
          const atual = Number(meta.current_amount);
          const percentual =
            objetivo > 0
              ? Math.min((atual / objetivo) * 100, 100)
              : 0;

          return (
            <article
              key={meta.id}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: meta.color }}
              />

              <div className="flex items-start justify-between gap-4">
                <div
                  className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                  style={{
                    background: `${meta.color}1f`,
                  }}
                >
                  {meta.icon}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirEdicao(meta)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => excluir(meta.id)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                {meta.name}
              </h2>

              <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                {meta.description || "Sem descrição."}
              </p>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-600">
                    Acumulado
                  </span>

                  <strong className="mt-1 block text-2xl font-black text-white">
                    {moeda(atual)}
                  </strong>
                </div>

                <strong
                  className="text-xl font-black"
                  style={{ color: meta.color }}
                >
                  {percentual.toFixed(0)}%
                </strong>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentual}%`,
                    background: meta.color,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Meta: {moeda(objetivo)}</span>

                <span>
                  Falta: {moeda(Math.max(objetivo - atual, 0))}
                </span>
              </div>

              {meta.deadline && (
                <p className="mt-4 text-xs text-slate-600">
                  Prazo:{" "}
                  {new Date(
                    `${meta.deadline}T12:00:00`
                  ).toLocaleDateString("pt-BR")}
                </p>
              )}

              <button
                onClick={() => abrirDeposito(meta)}
                disabled={percentual >= 100}
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-emerald-700"
              >
                {percentual >= 100
                  ? "Meta concluída"
                  : "Adicionar valor"}
              </button>
            </article>
          );
        })}
      </section>

      {metas.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-800 px-6 py-16 text-center text-slate-600">
          Nenhuma meta cadastrada.
        </div>
      )}

      {modalDeposito && metaDeposito && (
        <Modal
          title={`Adicionar em ${metaDeposito.name}`}
          subtitle="O progresso será atualizado automaticamente."
          error={erro}
          saving={salvando}
          onClose={() => setModalDeposito(false)}
          onConfirm={depositar}
          confirmText="Confirmar depósito"
        >
          <Campo
            label="Valor"
            placeholder="Exemplo: 500,00"
            value={depositAmount}
            onChange={setDepositAmount}
          />

          <Campo
            label="Descrição"
            placeholder="Exemplo: Economia do mês"
            value={depositDescription}
            onChange={setDepositDescription}
          />
        </Modal>
      )}

      {modalAberto && (
        <Modal
          title={editandoId !== null ? "Editar meta" : "Nova meta"}
          subtitle="Informe os detalhes do seu objetivo."
          error={erro}
          saving={salvando}
          onClose={() => setModalAberto(false)}
          onConfirm={salvar}
          confirmText={
            editandoId !== null
              ? "Salvar alterações"
              : "Cadastrar meta"
          }
        >
          <Campo
            label="Nome da meta"
            placeholder="Exemplo: Viagem"
            value={name}
            onChange={setName}
          />

          <Campo
            label="Descrição"
            placeholder="Exemplo: Viagem em família"
            value={description}
            onChange={setDescription}
          />

          <Campo
            label="Valor objetivo"
            placeholder="Exemplo: 10000,00"
            value={targetAmount}
            onChange={setTargetAmount}
          />

          <Campo
            label="Valor já acumulado"
            placeholder="Exemplo: 1000,00"
            value={currentAmount}
            onChange={setCurrentAmount}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Data limite
            </span>

            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-blue-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Campo
              label="Ícone"
              placeholder="🎯"
              value={icon}
              onChange={setIcon}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Cor
              </span>

              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-12 w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-950 p-2"
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Resumo({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <span className="text-sm text-slate-500">{titulo}</span>

      <strong className={`mt-3 block text-2xl font-black ${cor}`}>
        {valor}
      </strong>
    </article>
  );
}

function Campo({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none placeholder:text-slate-700 focus:border-blue-500"
      />
    </label>
  );
}

function Modal({
  title,
  subtitle,
  children,
  error,
  saving,
  onClose,
  onConfirm,
  confirmText,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  error: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[1400] overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                {title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {subtitle}
              </p>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-slate-300"
            >
              <FiX />
            </button>
          </div>

          <div className="grid gap-4">{children}</div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:bg-slate-700"
            >
              {saving ? "Salvando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
