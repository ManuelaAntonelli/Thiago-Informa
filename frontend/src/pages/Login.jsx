import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/Logo_oficial.png";
import "../index.css"; 

function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Estados para o modal de recuperação de senha
  const [mostrarModal, setMostrarModal] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [recuperando, setRecuperando] = useState(false);
  const [msgRecuperacao, setMsgRecuperacao] = useState("");
  
  // Estado para visualização da senha
  const [verSenha, setVerSenha] = useState(false);

  const handleRecuperar = (e) => {
    e.preventDefault();
    if (!emailRecuperacao.trim()) {
      setMsgRecuperacao("Por favor, digite seu e-mail.");
      return;
    }
    setRecuperando(true);
    setMsgRecuperacao("");
    setTimeout(() => {
      setMsgRecuperacao("Se o e-mail estiver cadastrado, você receberá instruções para recuperar a senha.");
      setRecuperando(false);
      setTimeout(() => {
        setMostrarModal(false);
        setEmailRecuperacao("");
        setMsgRecuperacao("");
      }, 3000);
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    if (!usuario.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    setCarregando(true);

    try {
      const res = await api.post("/auth/login", {
        usuario: usuario.trim(),
        senha: senha.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.usuario.perfil);
      localStorage.setItem("nome", res.data.usuario.nome);

      if (res.data.usuario.perfil === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setErro(err.response?.data?.msg || "Usuário ou senha incorretos");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="wrapper">
        {/* Logo oficial dentro da caixa de login */}
        <div className="text-center mb-3 d-flex justify-content-center">
          <img
            src={logo}
            alt="Logo Thiago Informa"
            className="logo-login"
          />
        </div>

        <form onSubmit={handleLogin}>
          <h3 className="text-center mb-1">Login</h3>
          <p className="text-center mb-4 text-muted">
            Preencha os campos abaixo
          </p>

          <div className="mb-3">
            <label className="form-label">Usuário</label>
            <input
              type="text"
              className="form-control"
              placeholder="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={carregando}
              required
            />
          </div>

          <div className="mb-3" style={{ position: "relative" }}>
            <label className="form-label">Senha</label>
            <input
              type={verSenha ? "text" : "password"}
              className="form-control"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
              required
              style={{ paddingRight: "50px" }}
            />
            <button
              type="button"
              className="btn-ver-senha"
              onClick={() => setVerSenha(!verSenha)}
              style={{
                position: "absolute",
                right: "15px",
                top: "38px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "var(--cinza-texto)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {verSenha ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              )}
            </button>
          </div>

          {erro && (
            <div className="erro-login">
              {erro}
            </div>
          )}

          <div className="d-flex justify-content-center">
            <button
              type="submit"
              className="btn btn-login"
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Login"}
            </button>
          </div>

          <div className="text-center mt-3">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setMostrarModal(true);
              }}
            >
              Esqueceu a senha?
            </a>
          </div>

          <div className="text-center mt-4">
            <small className="text-muted">
              Dica: Use <strong>admin</strong> / <strong>admin123</strong>
            </small>
          </div>
        </form>
      </div>

      {/* Modal de Recuperação de Senha (Controlado por React para máxima compatibilidade) */}
      {mostrarModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card">
            <div className="custom-modal-header">
              <h5>Recuperar senha</h5>
              <button 
                type="button" 
                className="btn-close-custom" 
                onClick={() => setMostrarModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRecuperar}>
              <div className="custom-modal-body">
                <p>Digite seu e-mail para recuperar a senha:</p>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Seu e-mail"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  required
                  disabled={recuperando}
                />
                {msgRecuperacao && (
                  <div className="mt-3 alert alert-info-custom">
                    {msgRecuperacao}
                  </div>
                )}
              </div>
              <div className="custom-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary-custom"
                  onClick={() => setMostrarModal(false)}
                  disabled={recuperando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-login"
                  disabled={recuperando}
                >
                  {recuperando ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;