export default function WelcomeCard() {
  const hora = new Date().getHours();

  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <section className="welcome-card">
      <div>
        <span className="welcome-badge">FINMASTER PRO</span>

        <h1>{saudacao}, Diego 👋</h1>

        <p>Veja como está sua vida financeira neste mês.</p>
      </div>

      <div className="health-score">
        <span>Saúde financeira</span>
        <strong>82</strong>
        <small>Boa</small>
      </div>
    </section>
  );
}