import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // ADMIN DEMONSTRAÇÃO
    if (email === "admin@escola.com" && senha === "123456") {
      localStorage.setItem("token", "admin-token");
      localStorage.setItem("role", "admin");

      navigate("/admin");
      return;
    }

    // USUÁRIO DEMONSTRAÇÃO
    if (email === "usuario@escola.com" && senha === "123456") {
      localStorage.setItem("token", "user-token");
      localStorage.setItem("role", "user");

      navigate("/home");
      return;
    }

    setErro("Usuário ou senha inválidos");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Thiago Informa</h1>
          <p>Comunicação Escolar Inteligente</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>E-mail</label>

            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Senha</label>

            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <div className="erro-login">
              {erro}
            </div>
          )}

          <button type="submit" className="btn-login">
            Entrar
          </button>

        </form>

        <div className="login-info">
          <small>
            Admin:
            admin@escola.com / 123456
          </small>

          <small>
            Usuário:
            usuario@escola.com / 123456
          </small>
        </div>

      </div>
    </div>
  );
}

export default Login;