import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Calendario() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  
  // Form CRUD states
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("evento");
  const [erro, setErro] = useState("");

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    carregarEventos();
    // Default select current day
    const hojeStr = formatarDataStr(new Date());
    setDiaSelecionado(hojeStr);
  }, []);

  const carregarEventos = async () => {
    try {
      const res = await api.get("/eventos");
      setEventos(res.data);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    }
  };

  // Helper to format Date to YYYY-MM-DD
  const formatarDataStr = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  // Calendar calculations
  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  // Total days in current month
  const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

  const navegarMes = (offset) => {
    setDataAtual(new Date(ano, mes + offset, 1));
  };

  const handleSalvarEvento = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro("O título é obrigatório.");
      return;
    }
    setErro("");

    try {
      await api.post("/eventos", {
        titulo,
        descricao,
        data: diaSelecionado,
        tipo
      });
      setTitulo("");
      setDescricao("");
      carregarEventos();
    } catch (err) {
      setErro(err.response?.data?.msg || "Erro ao salvar evento");
    }
  };

  const handleExcluirEvento = async (id) => {
    if (!window.confirm("Deseja realmente excluir este evento?")) return;
    try {
      await api.delete(`/eventos/${id}`);
      carregarEventos();
    } catch (err) {
      alert("Erro ao excluir evento.");
    }
  };

  // Get events for the selected day
  const eventosDoDia = eventos.filter((ev) => ev.data === diaSelecionado);

  // Render days
  const diasGrid = [];
  // Padding for empty spots before the 1st of the month
  for (let i = 0; i < primeiroDiaSemana; i++) {
    diasGrid.push(<div key={`empty-${i}`} className="dia-data opacity-25"></div>);
  }

  // Days of the month
  for (let dia = 1; dia <= totalDiasNoMes; dia++) {
    const diaDate = new Date(ano, mes, dia);
    const dataStr = formatarDataStr(diaDate);
    const isAtivo = diaSelecionado === dataStr;

    // Check if this day has events or holidays
    const eventosDia = eventos.filter((ev) => ev.data === dataStr);
    const temFeriado = eventosDia.some((ev) => ev.tipo === "feriado");
    const temEvento = eventosDia.some((ev) => ev.tipo === "evento");

    // Dot indicators styling
    let indicatorClass = "";
    if (temFeriado) {
      indicatorClass = "border border-danger border-2";
    } else if (temEvento) {
      indicatorClass = "border border-primary border-2";
    }

    diasGrid.push(
      <div
        key={`dia-${dia}`}
        className={`dia-data ${isAtivo ? "ativo" : ""} ${indicatorClass}`}
        onClick={() => setDiaSelecionado(dataStr)}
      >
        {dia}
      </div>
    );
  }

  // Format selected day for readable display
  const formatarDataExibicao = (str) => {
    if (!str) return "";
    const [a, m, d] = str.split("-");
    return `${d}/${m}/${a}`;
  };

  return (
    <>
      <Navbar />

      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ color: "var(--azul-principal)", marginBottom: "30px" }}>Calendário Escolar</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          
          {/* Calendar Widget */}
          <div className="calendario-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <button 
                onClick={() => navegarMes(-1)} 
                className="btn-entrar" 
                style={{ padding: "5px 15px", borderRadius: "10px" }}
              >
                &lt;
              </button>
              <h3 style={{ margin: 0, fontWeight: "bold", color: "var(--azul-escuro)" }}>
                {nomesMeses[mes]} de {ano}
              </h3>
              <button 
                onClick={() => navegarMes(1)} 
                className="btn-entrar" 
                style={{ padding: "5px 15px", borderRadius: "10px" }}
              >
                &gt;
              </button>
            </div>

            <div className="calendario-grid">
              {diasSemana.map((d) => (
                <div key={d} className="dia-semana">{d}</div>
              ))}
              {diasGrid}
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "15px", justifyContent: "center", fontSize: "0.8rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", border: "2px solid #dc3545" }}></span>
                Feriado
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", border: "2px solid #1a73e8" }}></span>
                Evento
              </span>
            </div>
          </div>

          {/* Details & Actions Panel */}
          <div className="card-fixado" style={{ padding: "20px" }}>
            <h3 style={{ color: "var(--azul-escuro)", borderBottom: "2px solid var(--azul-principal)", paddingBottom: "10px", marginBottom: "15px" }}>
              Compromissos ({formatarDataExibicao(diaSelecionado)})
            </h3>

            {/* List of Events */}
            <div style={{ marginBottom: "25px", maxHeight: "200px", overflowY: "auto" }}>
              {eventosDoDia.length === 0 ? (
                <p style={{ color: "#666", fontSize: "0.9rem", fontStyle: "italic" }}>
                  Nenhum compromisso marcado para este dia.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {eventosDoDia.map((ev) => (
                    <div 
                      key={ev._id} 
                      style={{ 
                        padding: "10px", 
                        borderRadius: "8px", 
                        borderLeft: `5px solid ${ev.tipo === "feriado" ? "var(--vermelho-borda)" : "var(--azul-principal)"}`,
                        background: "#f8f9fa",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start"
                      }}
                    >
                      <div>
                        <strong style={{ display: "block", color: "#333", fontSize: "0.9rem" }}>{ev.titulo}</strong>
                        {ev.descricao && <span style={{ display: "block", color: "#666", fontSize: "0.8rem", marginTop: "3px" }}>{ev.descricao}</span>}
                        <span style={{ 
                          fontSize: "0.7rem", 
                          textTransform: "uppercase", 
                          fontWeight: "bold",
                          color: ev.tipo === "feriado" ? "var(--vermelho-borda)" : "var(--azul-principal)" 
                        }}>
                          {ev.tipo}
                        </span>
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleExcluirEvento(ev._id)} 
                          style={{ 
                            background: "none", 
                            border: "none", 
                            color: "var(--vermelho-borda)", 
                            cursor: "pointer", 
                            fontWeight: "bold",
                            fontSize: "0.8rem" 
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Event Form (Admin Only) */}
            {isAdmin ? (
              <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px" }}>
                <h4 style={{ color: "var(--azul-principal)", marginBottom: "10px", fontSize: "1rem" }}>Adicionar Compromisso</h4>
                
                <form onSubmit={handleSalvarEvento} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Título do compromisso"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      style={{ padding: "8px 15px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <textarea
                      className="form-control"
                      placeholder="Descrição (opcional)"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      style={{ padding: "8px 15px", fontSize: "0.85rem", borderRadius: "15px", height: "60px", resize: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontSize: "0.85rem", color: "#555" }}>Tipo:</label>
                    <select 
                      value={tipo} 
                      onChange={(e) => setTipo(e.target.value)}
                      className="form-control"
                      style={{ padding: "5px 15px", fontSize: "0.85rem", width: "auto" }}
                    >
                      <option value="evento">Evento</option>
                      <option value="feriado">Feriado</option>
                    </select>
                  </div>

                  {erro && <div style={{ color: "var(--vermelho-borda)", fontSize: "0.8rem" }}>{erro}</div>}

                  <button 
                    type="submit" 
                    className="btn-entrar" 
                    style={{ width: "100%", padding: "8px 0", fontSize: "0.9rem", borderRadius: "20px" }}
                  >
                    Salvar no Calendário
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px", fontSize: "0.85rem", color: "#666", textAlign: "center" }}>
                Apenas administradores podem adicionar ou remover compromissos.
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
