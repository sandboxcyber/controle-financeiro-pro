import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    const dados = new FormData();
    dados.append("username", email);
    dados.append("password", password);

    try {
      const resposta = await api.post("/auth/login", dados);
      localStorage.setItem("token", resposta.data.access_token);
      window.location.href = `${window.location.origin}/`;
    } catch {
      alert("E-mail ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={entrar}>
        <h1>FinMaster PRO</h1>
        <p>Entre na sua conta</p>

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
