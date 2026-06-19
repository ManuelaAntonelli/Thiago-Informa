import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Admin() {
  const [informativos, setInformativos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [responsibles, setResponsibles] = useState([]);
  const [salas, setSalas] = useState([]);

  // Estado da aba ativa
  const [abaAtiva, setAbaAtiva] = useState(0);

  // Informativo states
  const [tituloInfo, setTituloInfo] = useState("");
  const [descricaoInfo, setDescricaoInfo] = useState("");
  const [imagensInfo, setImagensInfo] = useState([]);
  const [previewsInfo, setPreviewsInfo] = useState([]);
  const [fixadoInfo, setFixadoInfo] = useState(false);
  const [modoEdicaoInfo, setModoEdicaoInfo] = useState(false);
  const [editandoInfoId, setEditandoInfoId] = useState(null);

  // Projeto states
  const [tituloProj, setTituloProj] = useState("");
  const [descricaoProj, setDescricaoProj] = useState("");
  const [imagensProj, setImagensProj] = useState([]);
  const [previewsProj, setPreviewsProj] = useState([]);
  const [fixadoProj, setFixadoProj] = useState(false);
  const [salaSelecionadaProj, setSalaSelecionadaProj] = useState("");
  const [modoEdicaoProj, setModoEdicaoProj] = useState(false);
  const [editandoProjId, setEditandoProjId] = useState(null);

  // Sala states
  const [salaNome, setSalaNome] = useState("");
  const [salaImagem, setSalaImagem] = useState(null);
  const [previewSala, setPreviewSala] = useState("");
  const [msgSala, setMsgSala] = useState("");
  const [erroSala, setErroSala] = useState("");

  // Responsible user states
  const [respNome, setRespNome] = useState("");
  const [respUsuario, setRespUsuario] = useState("");
  const [respSenha, setRespSenha] = useState("");
  const [verSenhaResp, setVerSenhaResp] = useState(false);
  const [msgResp, setMsgResp] = useState("");
  const [erroResp, setErroResp] = useState("");

  // Password change states
  const [novaSenhaAdmin, setNovaSenhaAdmin] = useState("");
  const [verSenhaAdmin, setVerSenhaAdmin] = useState(false);
  const [msgSenha, setMsgSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({ mostrar: false, tipo: "sucesso", mensagem: "" });

  function mostrarAlerta(mensagem, tipo = "sucesso") {
    setToast({ mostrar: true, tipo, mensagem });
  }

  useEffect(() => {
    if (toast.mostrar) {
      const timer = setTimeout(() => {
        setToast({ mostrar: false, tipo: "sucesso", mensagem: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.mostrar]);

  useEffect(() => {
    carregarInformativos();
    carregarProjetos();
    carregarResponsibles();
    carregarSalas();
  }, []);

  async function carregarInformativos() {
    try {
      const res = await api.get("/informativos");
      setInformativos(res.data);
    } catch (err) {
      console.error("Erro ao carregar informativos:", err);
    }
  }

  async function carregarProjetos() {
    try {
      const res = await api.get("/projetos");
      setProjetos(res.data);
    } catch (err) {
      console.error("Erro ao carregar projetos:", err);
    }
  }

  async function carregarResponsibles() {
    try {
      const res = await api.get("/auth/responsibles");
      setResponsibles(res.data);
    } catch (err) {
      console.error("Erro ao carregar responsáveis:", err);
    }
  }

  async function carregarSalas() {
    try {
      const res = await api.get("/salas");
      setSalas(res.data);
    } catch (err) {
      console.error("Erro ao carregar salas:", err);
    }
  }

  // Preview de fotos selecionadas para Informativos
  function handleInfoImagensChange(e) {
    const files = Array.from(e.target.files);
    setImagensInfo(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewsInfo(urls);
  }

  // Preview de fotos selecionadas para Projetos
  function handleProjImagensChange(e) {
    const files = Array.from(e.target.files);
    setImagensProj(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewsProj(urls);
  }

  // Preview de foto selecionada para Salas
  function handleSalaImagemChange(e) {
    const file = e.target.files[0];
    setSalaImagem(file);
    if (file) {
      setPreviewSala(URL.createObjectURL(file));
    } else {
      setPreviewSala("");
    }
  }

  async function criarInformativo(e) {
    e.preventDefault();
    if (!tituloInfo.trim() || !descricaoInfo.trim()) return;

    try {
      const formData = new FormData();
      formData.append("titulo", tituloInfo.trim());
      formData.append("descricao", descricaoInfo.trim());
      formData.append("fixado", fixadoInfo);
      
      if (imagensInfo && imagensInfo.length > 0) {
        for (let i = 0; i < imagensInfo.length; i++) {
          formData.append("imagens", imagensInfo[i]);
        }
      }

      await api.post("/informativos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTituloInfo("");
      setDescricaoInfo("");
      setFixadoInfo(false);
      setImagensInfo([]);
      setPreviewsInfo([]);
      const fileInput = document.getElementById("fileInfoInput");
      if (fileInput) fileInput.value = "";

      carregarInformativos();
      mostrarAlerta("Informativo criado com sucesso!");
    } catch (err) {
      mostrarAlerta("Erro ao criar informativo.", "erro");
    }
  }

  async function criarProjeto(e) {
    e.preventDefault();
    if (!tituloProj.trim() || !descricaoProj.trim()) return;

    try {
      const formData = new FormData();
      formData.append("titulo", tituloProj.trim());
      formData.append("descricao", descricaoProj.trim());
      formData.append("fixado", fixadoProj);
      formData.append("sala", salaSelecionadaProj);
      
      if (imagensProj && imagensProj.length > 0) {
        for (let i = 0; i < imagensProj.length; i++) {
          formData.append("imagens", imagensProj[i]);
        }
      }

      await api.post("/projetos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTituloProj("");
      setDescricaoProj("");
      setFixadoProj(false);
      setSalaSelecionadaProj("");
      setImagensProj([]);
      setPreviewsProj([]);
      const fileInput = document.getElementById("fileProjInput");
      if (fileInput) fileInput.value = "";

      carregarProjetos();
      mostrarAlerta("Projeto criado com sucesso!");
    } catch (err) {
      mostrarAlerta("Erro ao criar projeto.", "erro");
    }
  }

  async function criarSala(e) {
    e.preventDefault();
    setMsgSala("");
    setErroSala("");

    if (!salaNome.trim()) {
      setErroSala("Preencha o nome da sala.");
      return;
    }
    if (!salaImagem) {
      setErroSala("Selecione a imagem de exibição da sala.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome", salaNome.trim());
      formData.append("imagem", salaImagem);

      await api.post("/salas", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSalaNome("");
      setSalaImagem(null);
      setPreviewSala("");
      const fileInput = document.getElementById("fileSalaInput");
      if (fileInput) fileInput.value = "";

      setMsgSala("Sala criada com sucesso!");
      carregarSalas();
    } catch (err) {
      setErroSala(err.response?.data?.msg || "Erro ao criar sala.");
    }
  }

  async function criarResponsavel(e) {
    e.preventDefault();
    setMsgResp("");
    setErroResp("");

    if (!respNome.trim() || !respUsuario.trim() || !respSenha.trim()) {
      setErroResp("Preencha todos os campos.");
      return;
    }

    try {
      await api.post("/auth/responsibles", {
        nome: respNome.trim(),
        usuario: respUsuario.trim(),
        senha: respSenha.trim()
      });
      setRespNome("");
      setRespUsuario("");
      setRespSenha("");
      setMsgResp("Responsável cadastrado com sucesso!");
      carregarResponsibles();
    } catch (err) {
      setErroResp(err.response?.data?.msg || "Erro ao cadastrar responsável.");
    }
  }

  async function alterarSenhaAdmin(e) {
    e.preventDefault();
    setMsgSenha("");
    setErroSenha("");

    if (!novaSenhaAdmin.trim()) {
      setErroSenha("A nova senha não pode estar em branco.");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        novaSenha: novaSenhaAdmin
      });
      setNovaSenhaAdmin("");
      setMsgSenha("Senha alterada com sucesso!");
    } catch (err) {
      setErroSenha("Erro ao alterar senha.");
    }
  }

  async function excluirInformativo(id) {
    if (!window.confirm("Deseja realmente excluir este informativo?")) return;
    try {
      await api.delete(`/informativos/${id}`);
      carregarInformativos();
      mostrarAlerta("Informativo excluído com sucesso!");
    } catch (err) {
      mostrarAlerta("Erro ao excluir informativo.", "erro");
    }
  }

  async function excluirProjeto(id) {
    if (!window.confirm("Deseja realmente excluir este projeto?")) return;
    try {
      await api.delete(`/projetos/${id}`);
      carregarProjetos();
      mostrarAlerta("Projeto excluído com sucesso!");
    } catch (err) {
      mostrarAlerta("Erro ao excluir projeto.", "erro");
    }
  }

  async function excluirSala(id) {
    if (!window.confirm("Deseja realmente excluir esta sala? Todos os projetos associados perderão a turma.")) return;
    try {
      await api.delete(`/salas/${id}`);
      carregarSalas();
      carregarProjetos(); 
      mostrarAlerta("Sala de aula e projetos associados excluídos!");
    } catch (err) {
      mostrarAlerta("Erro ao excluir sala.", "erro");
    }
  }

  async function excluirResponsavel(id) {
    if (!window.confirm("Deseja realmente excluir este acesso?")) return;
    try {
      await api.delete(`/auth/responsibles/${id}`);
      carregarResponsibles();
      mostrarAlerta("Acesso de responsável excluído!");
    } catch (err) {
      mostrarAlerta("Erro ao excluir responsável.", "erro");
    }
  }

  // Funções de edição de Informativos
  function iniciarEdicaoInfo(item) {
    setModoEdicaoInfo(true);
    setEditandoInfoId(item._id);
    setTituloInfo(item.titulo);
    setDescricaoInfo(item.descricao);
    setFixadoInfo(item.fixado || false);
    setImagensInfo([]);
    setPreviewsInfo([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicaoInfo() {
    setModoEdicaoInfo(false);
    setEditandoInfoId(null);
    setTituloInfo("");
    setDescricaoInfo("");
    setFixadoInfo(false);
    setImagensInfo([]);
    setPreviewsInfo([]);
    const fileInput = document.getElementById("fileInfoInput");
    if (fileInput) fileInput.value = "";
  }

  async function salvarEdicaoInformativo(e) {
    e.preventDefault();
    if (!tituloInfo.trim() || !descricaoInfo.trim()) return;

    try {
      await api.put(`/informativos/${editandoInfoId}`, {
        titulo: tituloInfo.trim(),
        descricao: descricaoInfo.trim(),
        fixado: fixadoInfo
      });

      cancelarEdicaoInfo();
      carregarInformativos();
      mostrarAlerta("Informativo atualizado com sucesso!");
    } catch (err) {
      mostrarAlerta("Erro ao atualizar informativo.", "erro");
    }
  }

  // Funções de edição de Projetos
  function iniciarEdicaoProj(item) {
    setModoEdicaoProj(true);
    setEditandoProjId(item._id);
    setTituloProj(item.titulo);
    setDescricaoProj(item.descricao);
    setFixadoProj(item.fixado || false);
    setSalaSelecionadaProj(item.sala ? (item.sala._id || item.sala) : "");
    setImagensProj([]);
    setPreviewsProj([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicaoProj() {
    setModoEdicaoProj(false);
    setEditandoProjId(null);
    setTituloProj("");
    setDescricaoProj("");
    setFixadoProj(false);
    setSalaSelecionadaProj("");
    setImagensProj([]);
    setPreviewsProj([]);
    const fileInput = document.getElementById("fileProjInput");
    if (fileInput) fileInput.value = "";
  }

  async function salvarEdicaoProjeto(e) {
    e.preventDefault();
    if (!tituloProj.trim() || !descricaoProj.trim()) return;

    try {
      await api.put(`/projetos/${editandoProjId}`, {
        titulo: tituloProj.trim(),
        descricao: descricaoProj.trim(),
        fixado: fixadoProj,
        sala: salaSelecionadaProj || null
      });

      cancelarEdicaoProj();
      carregarProjetos();
      mostrarAlerta("Projeto atualizado com sucesso!");
    } catch (err) {
      mostrarAlerta("Erro ao atualizar projeto.", "erro");
    }
  }

  return (
    <>
      <Navbar />

      <div className="container">
        <h1 style={{ color: "var(--azul-principal)", marginBottom: "25px" }}>Painel Administrativo</h1>

        {/* NAVEGAÇÃO POR ABAS (TABS) */}
        <div className="admin-tabs" style={{ display: "flex", gap: "10px", borderBottom: "2px solid #ddd", marginBottom: "30px", overflowX: "auto", paddingBottom: "5px" }}>
          <button 
            type="button" 
            className={`admin-tab-btn ${abaAtiva === 0 ? "active" : ""}`} 
            onClick={() => setAbaAtiva(0)}
          >
            Informativos
          </button>
          <button 
            type="button" 
            className={`admin-tab-btn ${abaAtiva === 1 ? "active" : ""}`} 
            onClick={() => setAbaAtiva(1)}
          >
            Projetos
          </button>
          <button 
            type="button" 
            className={`admin-tab-btn ${abaAtiva === 2 ? "active" : ""}`} 
            onClick={() => setAbaAtiva(2)}
          >
            Salas de Aula
          </button>
          <button 
            type="button" 
            className={`admin-tab-btn ${abaAtiva === 3 ? "active" : ""}`} 
            onClick={() => setAbaAtiva(3)}
          >
            Segurança & Acesso
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        
        {/* ABA 0: INFORMATIVOS */}
        {abaAtiva === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
            <div className="card-fixado" style={{ padding: "25px" }}>
              <h2 style={{ color: "var(--azul-escuro)", fontSize: "1.3rem", marginBottom: "20px" }}>
                {modoEdicaoInfo ? "Editar Informativo" : "Novo Informativo"}
              </h2>
              <form onSubmit={modoEdicaoInfo ? salvarEdicaoInformativo : criarInformativo} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                  className="form-control"
                  value={tituloInfo}
                  onChange={(e) => setTituloInfo(e.target.value)}
                  placeholder="Título"
                  required
                />
                <textarea
                  className="form-control"
                  value={descricaoInfo}
                  onChange={(e) => setDescricaoInfo(e.target.value)}
                  placeholder="Descrição"
                  style={{ height: "100px", resize: "none", borderRadius: "20px" }}
                  required
                />
                {!modoEdicaoInfo ? (
                  <div>
                    <label className="form-label">Imagens (máx 5):</label>
                    <input
                      id="fileInfoInput"
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleInfoImagensChange}
                      style={{ borderRadius: "15px" }}
                    />
                    {previewsInfo.length > 0 && (
                      <div className="image-preview-container" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                        {previewsInfo.map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt="preview" 
                            className="image-preview-thumbnail" 
                            style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "#666", fontStyle: "italic", margin: 0 }}>
                    Nota: O upload de novas fotos não está disponível na edição rápida. As fotos existentes serão preservadas.
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                  <input
                    type="checkbox"
                    id="fixadoInfo"
                    checked={fixadoInfo}
                    onChange={(e) => setFixadoInfo(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="fixadoInfo" style={{ cursor: "pointer", fontSize: "0.9rem", color: "#555" }}>
                    Fixar no topo (Carrossel da Home)
                  </label>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                  {modoEdicaoInfo && (
                    <button 
                      type="button" 
                      onClick={cancelarEdicaoInfo} 
                      className="btn-cancelar"
                      style={{ 
                        backgroundColor: "#6c757d", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "20px", 
                        padding: "8px 20px", 
                        cursor: "pointer", 
                        fontWeight: "bold",
                        transition: "background-color 0.2s"
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button className="btn-entrar" style={{ width: "fit-content" }}>
                    {modoEdicaoInfo ? "Salvar Alterações" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>

            <div className="card-fixado" style={{ padding: "25px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--azul-escuro)", marginBottom: "15px" }}>Informativos Cadastrados</h3>
              <div className="lista-admin" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {informativos.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "#888", fontSize: "0.9rem" }}>Nenhum informativo cadastrado.</p>
                ) : (
                  informativos.map((item) => (
                    <div key={item._id} className="item-admin" style={{ display: "flex", justifyContent: "space-between", padding: "12px 10px", borderBottom: "1px solid #eee", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "0.9rem", color: "#333" }}>{item.titulo}</strong>
                        {item.fixado && <span style={{ fontSize: "0.65rem", backgroundColor: "#dc3545", color: "white", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>FIXADO</span>}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => iniciarEdicaoInfo(item)} 
                          style={{ 
                            border: "none", 
                            backgroundColor: "#e8f0fe", 
                            color: "var(--azul-principal)", 
                            padding: "6px 12px", 
                            borderRadius: "15px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--azul-principal)";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#e8f0fe";
                            e.currentTarget.style.color = "var(--azul-principal)";
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          Editar
                        </button>
                        <button 
                          onClick={() => excluirInformativo(item._id)} 
                          style={{ 
                            border: "none", 
                            backgroundColor: "#fce8e6", 
                            color: "#c5221f", 
                            padding: "6px 12px", 
                            borderRadius: "15px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#c5221f";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fce8e6";
                            e.currentTarget.style.color = "#c5221f";
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 1: PROJETOS */}
        {abaAtiva === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
            <div className="card-fixado" style={{ padding: "25px" }}>
              <h2 style={{ color: "var(--azul-escuro)", fontSize: "1.3rem", marginBottom: "20px" }}>
                {modoEdicaoProj ? "Editar Projeto" : "Novo Projeto"}
              </h2>
              <form onSubmit={modoEdicaoProj ? salvarEdicaoProjeto : criarProjeto} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                  className="form-control"
                  value={tituloProj}
                  onChange={(e) => setTituloProj(e.target.value)}
                  placeholder="Título"
                  required
                />
                <textarea
                  className="form-control"
                  value={descricaoProj}
                  onChange={(e) => setDescricaoProj(e.target.value)}
                  placeholder="Descrição"
                  style={{ height: "100px", resize: "none", borderRadius: "20px" }}
                  required
                />
                <div>
                  <label className="form-label">Sala/Turma do Projeto:</label>
                  <select
                    className="form-control"
                    value={salaSelecionadaProj}
                    onChange={(e) => setSalaSelecionadaProj(e.target.value)}
                    style={{ borderRadius: "15px", padding: "8px 20px" }}
                    required
                  >
                    <option value="">Selecione uma sala...</option>
                    {salas.map((sala) => (
                      <option key={sala._id} value={sala._id}>
                        {sala.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                {!modoEdicaoProj ? (
                  <div>
                    <label className="form-label">Imagens (máx 5):</label>
                    <input
                      id="fileProjInput"
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleProjImagensChange}
                      style={{ borderRadius: "15px" }}
                    />
                    {previewsProj.length > 0 && (
                      <div className="image-preview-container" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                        {previewsProj.map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt="preview" 
                            className="image-preview-thumbnail" 
                            style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "#666", fontStyle: "italic", margin: 0 }}>
                    Nota: O upload de novas fotos não está disponível na edição rápida. As fotos existentes serão preservadas.
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                  <input
                    type="checkbox"
                    id="fixadoProj"
                    checked={fixadoProj}
                    onChange={(e) => setFixadoProj(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="fixadoProj" style={{ cursor: "pointer", fontSize: "0.9rem", color: "#555" }}>
                     Fixar no topo (Carrossel da Home)
                  </label>
                </div>
                
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                  {modoEdicaoProj && (
                    <button 
                      type="button" 
                      onClick={cancelarEdicaoProj} 
                      className="btn-cancelar"
                      style={{ 
                        backgroundColor: "#6c757d", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "20px", 
                        padding: "8px 20px", 
                        cursor: "pointer", 
                        fontWeight: "bold",
                        transition: "background-color 0.2s"
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button className="btn-entrar" style={{ width: "fit-content" }}>
                    {modoEdicaoProj ? "Salvar Alterações" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>

            <div className="card-fixado" style={{ padding: "25px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--azul-escuro)", marginBottom: "15px" }}>Projetos Cadastrados</h3>
              <div className="lista-admin" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {projetos.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "#888", fontSize: "0.9rem" }}>Nenhum projeto cadastrado.</p>
                ) : (
                  projetos.map((item) => (
                    <div key={item._id} className="item-admin" style={{ display: "flex", justifyContent: "space-between", padding: "12px 10px", borderBottom: "1px solid #eee", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "0.9rem", color: "#333" }}>{item.titulo}</strong>
                        {item.sala && <span style={{ fontSize: "0.75rem", color: "#0359A4", fontWeight: "600" }}>({item.sala.nome || "Sala"})</span>}
                        {item.fixado && <span style={{ fontSize: "0.7rem", backgroundColor: "#dc3545", color: "white", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>FIXADO</span>}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => iniciarEdicaoProj(item)} 
                          style={{ 
                            border: "none", 
                            backgroundColor: "#e8f0fe", 
                            color: "var(--azul-principal)", 
                            padding: "6px 12px", 
                            borderRadius: "15px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--azul-principal)";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#e8f0fe";
                            e.currentTarget.style.color = "var(--azul-principal)";
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          Editar
                        </button>
                        <button 
                          onClick={() => excluirProjeto(item._id)} 
                          style={{ 
                            border: "none", 
                            backgroundColor: "#fce8e6", 
                            color: "#c5221f", 
                            padding: "6px 12px", 
                            borderRadius: "15px", 
                            cursor: "pointer", 
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#c5221f";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fce8e6";
                            e.currentTarget.style.color = "#c5221f";
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SALAS DE AULA */}
        {abaAtiva === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
            <div className="card-fixado" style={{ padding: "25px" }}>
              <h2 style={{ color: "var(--azul-escuro)", fontSize: "1.3rem", marginBottom: "20px" }}>Nova Sala de Aula</h2>
              <form onSubmit={criarSala} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                  className="form-control"
                  value={salaNome}
                  onChange={(e) => setSalaNome(e.target.value)}
                  placeholder="Ex: Sala 1 A"
                  required
                />
                <div>
                  <label className="form-label">Imagem de Exibição da Sala:</label>
                  <input
                    id="fileSalaInput"
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleSalaImagemChange}
                    style={{ borderRadius: "15px" }}
                    required
                  />
                  {previewSala && (
                    <div style={{ marginTop: "12px" }}>
                      <img 
                        src={previewSala} 
                        alt="preview" 
                        style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--azul-principal)" }}
                      />
                    </div>
                  )}
                </div>
                
                {msgSala && <div style={{ color: "green", fontSize: "0.85rem" }}>{msgSala}</div>}
                {erroSala && <div style={{ color: "var(--vermelho-borda)", fontSize: "0.85rem" }}>{erroSala}</div>}
                
                <button className="btn-entrar" style={{ width: "fit-content", alignSelf: "flex-end" }}>Salvar Sala</button>
              </form>
            </div>

            <div className="card-fixado" style={{ padding: "25px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--azul-escuro)", marginBottom: "15px" }}>Salas de Aula Cadastradas</h3>
              <div className="lista-admin" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {salas.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "#888", fontSize: "0.9rem" }}>Nenhuma sala cadastrada.</p>
                ) : (
                  salas.map((sala) => (
                    <div key={sala._id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 10px", borderBottom: "1px solid #eee", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img 
                          src={`http://localhost:5000/uploads/${sala.imagem}`} 
                          alt={sala.nome} 
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" }}
                        />
                        <strong style={{ fontSize: "0.95rem", color: "#333" }}>{sala.nome}</strong>
                      </div>
                       <button 
                        onClick={() => excluirSala(sala._id)} 
                        style={{ 
                          border: "none", 
                          backgroundColor: "#fce8e6", 
                          color: "#c5221f", 
                          padding: "6px 12px", 
                          borderRadius: "15px", 
                          cursor: "pointer", 
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#c5221f";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#fce8e6";
                          e.currentTarget.style.color = "#c5221f";
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: SEGURANÇA E ACESSO */}
        {abaAtiva === 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
            
            {/* Responsibles Manager */}
            <div className="card-fixado" style={{ padding: "25px" }}>
              <h2 style={{ color: "var(--azul-escuro)", fontSize: "1.3rem", marginBottom: "20px" }}>Cadastrar Responsável (Família)</h2>
              
              <form onSubmit={criarResponsavel} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
                <input
                  className="form-control"
                  value={respNome}
                  onChange={(e) => setRespNome(e.target.value)}
                  placeholder="Nome Completo"
                  required
                />
                <input
                  className="form-control"
                  value={respUsuario}
                  onChange={(e) => setRespUsuario(e.target.value)}
                  placeholder="Usuário de Acesso"
                  required
                />
                <div style={{ position: "relative" }}>
                  <input
                    type={verSenhaResp ? "text" : "password"}
                    className="form-control"
                    value={respSenha}
                    onChange={(e) => setRespSenha(e.target.value)}
                    placeholder="Senha inicial"
                    required
                    style={{ paddingRight: "50px" }}
                  />
                  <button
                    type="button"
                    className="btn-ver-senha"
                    onClick={() => setVerSenhaResp(!verSenhaResp)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "10px",
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
                    {verSenhaResp ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>

                {msgResp && <div style={{ color: "green", fontSize: "0.85rem" }}>{msgResp}</div>}
                {erroResp && <div style={{ color: "var(--vermelho-borda)", fontSize: "0.85rem" }}>{erroResp}</div>}

                <button className="btn-entrar" style={{ width: "fit-content", alignSelf: "flex-end" }}>Cadastrar</button>
              </form>

              <h3 style={{ fontSize: "1.1rem", color: "var(--azul-escuro)", marginBottom: "15px" }}>Responsáveis Cadastrados</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {responsibles.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "#888", fontSize: "0.9rem" }}>Nenhum responsável cadastrado.</p>
                ) : (
                  responsibles.map((resp) => (
                    <div key={resp._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "#333" }}>{resp.nome}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>Usuário: {resp.usuario}</div>
                      </div>
                       <button 
                        onClick={() => excluirResponsavel(resp._id)} 
                        style={{ 
                          border: "none", 
                          backgroundColor: "#fce8e6", 
                          color: "#c5221f", 
                          padding: "6px 12px", 
                          borderRadius: "15px", 
                          cursor: "pointer", 
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#c5221f";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#fce8e6";
                          e.currentTarget.style.color = "#c5221f";
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Password Change Card */}
            <div className="card-fixado" style={{ padding: "25px", height: "fit-content" }}>
              <h2 style={{ color: "var(--azul-escuro)", fontSize: "1.3rem", marginBottom: "20px" }}>Alterar Senha do Admin</h2>
              <form onSubmit={alterarSenhaAdmin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ position: "relative" }}>
                  <input
                    type={verSenhaAdmin ? "text" : "password"}
                    className="form-control"
                    value={novaSenhaAdmin}
                    onChange={(e) => setNovaSenhaAdmin(e.target.value)}
                    placeholder="Nova Senha"
                    required
                    style={{ paddingRight: "50px" }}
                  />
                  <button
                    type="button"
                    className="btn-ver-senha"
                    onClick={() => setVerSenhaAdmin(!verSenhaAdmin)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "10px",
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
                    {verSenhaAdmin ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>

                {msgSenha && <div style={{ color: "green", fontSize: "0.85rem" }}>{msgSenha}</div>}
                {erroSenha && <div style={{ color: "var(--vermelho-borda)", fontSize: "0.85rem" }}>{erroSenha}</div>}

                <button className="btn-entrar" style={{ width: "fit-content", alignSelf: "flex-end" }}>Salvar Nova Senha</button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* TOAST NOTIFICATION */}
      {toast.mostrar && (
        <div style={{
          position: "fixed",
          top: "80px",
          right: "20px",
          backgroundColor: toast.tipo === "sucesso" ? "#e6f4ea" : "#fce8e6",
          color: toast.tipo === "sucesso" ? "#137333" : "#c5221f",
          borderLeft: `5px solid ${toast.tipo === "sucesso" ? "#137333" : "#c5221f"}`,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
          padding: "15px 25px",
          borderRadius: "8px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideInToast 0.3s ease-out",
          fontWeight: "600",
          fontSize: "0.9rem"
        }}>
          {toast.tipo === "sucesso" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span>{toast.mensagem}</span>
        </div>
      )}
    </>
  );
}

export default Admin;