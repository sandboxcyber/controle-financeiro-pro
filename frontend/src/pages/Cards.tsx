import { useEffect, useState } from "react";
import { cardService } from "../services/cards";
import { FiCreditCard, FiPlus } from "react-icons/fi";

export default function Cards() {
  const [cards, setCards] = useState<any[]>([]);

  async function carregar() {
    const resposta = await cardService.listar();
    setCards(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function novoCartao() {
    const nome = prompt("Nome do cartão");

    if (!nome) return;

    await cardService.criar({
      name: nome,
      brand: "Visa",
      color: "#2563eb",
      limit: 5000,
      closing_day: 10,
      due_day: 17,
    });

    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-blue-400 font-bold uppercase">
            Financeiro
          </span>

          <h1 className="text-4xl font-black text-white">
            Cartões
          </h1>
        </div>

        <button
          onClick={novoCartao}
          className="bg-blue-600 hover:bg-blue-500 rounded-xl px-5 py-3 flex items-center gap-2"
        >
          <FiPlus />
          Novo Cartão
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-3xl p-6 text-white shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${card.color}, #0f172a)`
            }}
          >
            <div className="flex justify-between">
              <FiCreditCard size={34} />
              <strong>{card.brand}</strong>
            </div>

            <div className="mt-10 text-2xl font-black">
              {card.name}
            </div>

            <div className="mt-8 flex justify-between">
              <div>
                <small>Limite</small>

                <h3>
                  R$ {Number(card.limit).toLocaleString("pt-BR")}
                </h3>

                <div
                  style={{
                    marginTop:12,
                    height:10,
                    background:"#1e293b",
                    borderRadius:30,
                    overflow:"hidden",
                  }}
                >
                  <div
                    style={{
                      width:`${(card.used/card.limit)*100}%`,
                      height:"100%",
                      background:
                        (card.used/card.limit)>0.8
                          ? "#ef4444"
                          : (card.used/card.limit)>0.5
                          ? "#f59e0b"
                          : "#22c55e",
                      transition:"0.4s"
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop:10,
                    display:"flex",
                    justifyContent:"space-between",
                    fontSize:13
                  }}
                >
                  <span>
                    Usado:
                    {" "}
                    R$
                    {Number(card.used).toLocaleString("pt-BR")}
                  </span>

                  <span>
                    Livre:
                    {" "}
                    R$
                    {(card.limit-card.used).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div>
                <small>Fecha</small>

                <h3>{card.closing_day}</h3>
              </div>

              <div>
                <small>Vence</small>

                <h3>{card.due_day}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center text-slate-400 mt-16">
          Nenhum cartão cadastrado.
        </div>
      )}
    </div>
  );
}
