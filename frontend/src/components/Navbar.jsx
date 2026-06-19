import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/Logo_oficial.png";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  // Estados do Modal Rápido (FAB)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoItem, setTipoItem] = useState("informativo"); // "informativo" | "projeto" | "compromisso"
  const [salas, setSalas] = useState([]);

  // Estados do Informativo
  const [tituloInfo, setTituloInfo] = useState("");
  const [descricaoInfo, setDescricaoInfo] = useState("");
  const [imagensInfo, setImagensInfo] = useState([]);
  const [previewsInfo, setPreviewsInfo] = useState([]);
  const [fixadoInfo, setFixadoInfo] = useState(false);

  // Estados do Projeto
  const [tituloProj, setTituloProj] = useState("");
  const [descricaoProj, setDescricaoProj] = useState("");
  const [imagensProj, setImagensProj] = useState([]);
  const [previewsProj, setPreviewsProj] = useState([]);
  const [fixadoProj, setFixadoProj] = useState(false);
  const [salaProj, setSalaProj] = useState("");

  // Estados do Evento
  const [tituloEv, setTituloEv] = useState("");
  const [descricaoEv, setDescricaoEv] = useState("");
  const [dataEv, setDataEv] = useState("");
  const [tipoEv, setTipoEv] = useState("evento");
  const [fixadoEv, setFixadoEv] = useState(false);

  useEffect(() => {
    if (role === "admin") {
      carregarSalas();
    }
  }, [role]);

  async function carregarSalas() {
    try {
      const res = await api.get("/salas");
      setSalas(res.data);
    } catch (err) {
      console.error("Erro ao carregar salas na Navbar:", err);
    }
  }

  function handleInfoImagens(e) {
    const files = Array.from(e.target.files);
    setImagensInfo(files);
    setPreviewsInfo(files.map((file) => URL.createObjectURL(file)));
  }

  function handleProjImagens(e) {
    const files = Array.from(e.target.files);
    setImagensProj(files);
    setPreviewsProj(files.map((file) => URL.createObjectURL(file)));
  }

  async function salvarInformativo(e) {
    e.preventDefault();
    if (!tituloInfo.trim() || !descricaoInfo.trim()) return;

    try {
      const formData = new FormData();
      formData.append("titulo", tituloInfo.trim());
      formData.append("descricao", descricaoInfo.trim());
      formData.append("fixado", fixadoInfo);
      
      for (let i = 0; i < imagensInfo.length; i++) {
        formData.append("imagens", imagensInfo[i]);
      }

      await api.post("/informativos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      fecharModal();
      window.location.reload();
    } catch (err) {
      alert("Erro ao criar informativo.");
    }
  }

  async function salvarProjeto(e) {
    e.preventDefault();
    if (!tituloProj.trim() || !descricaoProj.trim() || !salaProj) return;

    try {
      const formData = new FormData();
      formData.append("titulo", tituloProj.trim());
      formData.append("descricao", descricaoProj.trim());
      formData.append("fixado", fixadoProj);
      formData.append("sala", salaProj);
      
      for (let i = 0; i < imagensProj.length; i++) {
        formData.append("imagens", imagensProj[i]);
      }

      await api.post("/projetos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      fecharModal();
      window.location.reload();
    } catch (err) {
      alert("Erro ao criar projeto.");
    }
  }

  async function salvarEvento(e) {
    e.preventDefault();
    if (!tituloEv.trim() || !dataEv) return;

    try {
      await api.post("/eventos", {
        titulo: tituloEv.trim(),
        descricao: descricaoEv.trim(),
        data: dataEv,
        tipo: tipoEv,
        fixado: fixadoEv
      });

      fecharModal();
      window.location.reload();
    } catch (err) {
      alert("Erro ao salvar compromisso.");
    }
  }

  function fecharModal() {
    setMostrarModal(false);
    
    // Reseta Informativo
    setTituloInfo("");
    setDescricaoInfo("");
    setImagensInfo([]);
    setPreviewsInfo([]);
    setFixadoInfo(false);

    // Reseta Projeto
    setTituloProj("");
    setDescricaoProj("");
    setImagensProj([]);
    setPreviewsProj([]);
    setFixadoProj(false);
    setSalaProj("");

    // Reseta Evento
    setTituloEv("");
    setDescricaoEv("");
    setDataEv("");
    setTipoEv("evento");
    setFixadoEv(false);
  }

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const abrirModal = () => {
    if (location.pathname === "/informativos") {
      setTipoItem("informativo");
    } else if (location.pathname === "/projetos") {
      setTipoItem("projeto");
    } else {
      setTipoItem("informativo");
    }
    setMostrarModal(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <img
            src={logo}
            alt="Logo Thiago Informa"
            className="navbar-logo"
          />
          <span>Thiago Informa</span>
        </div>

        <ul>
          <li>
            <Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link>
          </li>
          <li>
            <Link to="/informativos" className={location.pathname === "/informativos" ? "active" : ""}>Informativos</Link>
          </li>
          <li>
            <Link to="/projetos" className={location.pathname === "/projetos" ? "active" : ""}>Projetos</Link>
          </li>
          <li>
            <Link to="/calendario" className={location.pathname === "/calendario" ? "active" : ""}>Calendário</Link>
          </li>
          {role === "admin" && (
            <li>
              <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>Administração</Link>
            </li>
          )}
          <li>
            <button
              className="logout-btn"
              onClick={logout}
            >
              Sair
            </button>
          </li>
        </ul>
      </nav>

      {/* BOTÃO FLUTUANTE (FAB) - VISÍVEL APENAS PARA ADMINS NAS ABAS PERMITIDAS */}
      {role === "admin" && (location.pathname === "/home" || location.pathname === "/informativos" || location.pathname === "/projetos") && (
        <button 
          className="fab-btn" 
          onClick={abrirModal}
          title="Adicionar Conteúdo Rápido"
        >
          +
        </button>
      )}

      {/* MODAL DE CRIAÇÃO RÁPIDA (FAB MODAL) */}
      {mostrarModal && (
        <div className="fab-modal-overlay" onClick={fecharModal}>
          <div className="fab-modal-card" onClick={(e) => e.stopPropagation()}>
            
            <div className="fab-modal-header">
              <h5>Nova Publicação Rápida</h5>
              <button className="fab-modal-close-btn" onClick={fecharModal}>&times;</button>
            </div>

            {/* ABAS DO MODAL */}
            {location.pathname === "/home" && (
              <div className="fab-modal-tabs">
                <button 
                  type="button" 
                  className={`fab-modal-tab-btn ${tipoItem === "informativo" ? "active" : ""}`}
                  onClick={() => setTipoItem("informativo")}
                >
                  Informativo
                </button>
                <button 
                  type="button" 
                  className={`fab-modal-tab-btn ${tipoItem === "projeto" ? "active" : ""}`}
                  onClick={() => setTipoItem("projeto")}
                >
                  Projeto
                </button>
              </div>
            )}

            <div className="fab-modal-body">
              {/* FORMULÁRIO: AVISO / INFORMATIVO */}
              {tipoItem === "informativo" && (
                <form onSubmit={salvarInformativo} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Título do informativo"
                    value={tituloInfo}
                    onChange={(e) => setTituloInfo(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-control"
                    placeholder="Descrição do informativo"
                    value={descricaoInfo}
                    onChange={(e) => setDescricaoInfo(e.target.value)}
                    style={{ height: "90px", resize: "none", borderRadius: "15px" }}
                    required
                  />
                  <div>
                    <label className="form-label">Imagens (máx 5):</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleInfoImagens}
                      style={{ borderRadius: "15px" }}
                    />
                    {previewsInfo.length > 0 && (
                      <div className="image-preview-container" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                        {previewsInfo.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt="preview" 
                            style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                    <input
                      type="checkbox"
                      id="fixadoInfoFab"
                      checked={fixadoInfo}
                      onChange={(e) => setFixadoInfo(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="fixadoInfoFab" style={{ cursor: "pointer", fontSize: "0.85rem", color: "#555" }}>
                      Fixar post no topo
                    </label>
                  </div>
                  <button type="submit" className="btn-entrar" style={{ width: "100%", marginTop: "10px" }}>Postar Informativo</button>
                </form>
              )}

              {/* FORMULÁRIO: PROJETO */}
              {tipoItem === "projeto" && (
                <form onSubmit={salvarProjeto} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Título do projeto"
                    value={tituloProj}
                    onChange={(e) => setTituloProj(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-control"
                    placeholder="Descrição do projeto"
                    value={descricaoProj}
                    onChange={(e) => setDescricaoProj(e.target.value)}
                    style={{ height: "90px", resize: "none", borderRadius: "15px" }}
                    required
                  />
                  <div>
                    <label className="form-label">Sala/Turma do Projeto:</label>
                    <select
                      className="form-control"
                      value={salaProj}
                      onChange={(e) => setSalaProj(e.target.value)}
                      style={{ borderRadius: "15px", padding: "6px 20px" }}
                      required
                    >
                      <option value="">Selecione a turma...</option>
                      {salas.map((sala) => (
                        <option key={sala._id} value={sala._id}>
                          {sala.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Imagens (máx 5):</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleProjImagens}
                      style={{ borderRadius: "15px" }}
                    />
                    {previewsProj.length > 0 && (
                      <div className="image-preview-container" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                        {previewsProj.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt="preview" 
                            style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                    <input
                      type="checkbox"
                      id="fixadoProjFab"
                      checked={fixadoProj}
                      onChange={(e) => setFixadoProj(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="fixadoProjFab" style={{ cursor: "pointer", fontSize: "0.85rem", color: "#555" }}>
                      Fixar post no topo
                    </label>
                  </div>
                  <button type="submit" className="btn-entrar" style={{ width: "100%", marginTop: "10px" }}>Postar Projeto</button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;