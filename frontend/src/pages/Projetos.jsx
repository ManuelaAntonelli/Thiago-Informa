import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

// Componente auxiliar para carrossel interno de fotos nos posts
function ImageSlider({ imagens, fallbackImagem }) {
  const [slideIndex, setSlideIndex] = useState(0);

  // Mapeia imagens: se existirem múltiplas, usamos elas; senão, a imagem legada; senão, vazio
  const list = (imagens && imagens.length > 0) ? imagens : (fallbackImagem ? [fallbackImagem] : []);

  if (list.length === 0) return null;

  const nextSlide = (e) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % list.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  return (
    <div className="post-image-slider">
      <div className="slider-viewport" style={{ overflow: "hidden", position: "relative", width: "100%", height: "280px", borderRadius: "10px" }}>
        <div 
          className="slider-wrapper" 
          style={{ 
            display: "flex", 
            width: `${list.length * 100}%`, 
            height: "100%", 
            transform: `translateX(-${(slideIndex * 100) / list.length}%)`,
            transition: "transform 0.4s ease"
          }}
        >
          {list.map((img, idx) => (
            <div key={idx} style={{ width: `${100 / list.length}%`, height: "100%" }}>
              <img
                src={`http://localhost:5000/uploads/${img}`}
                alt="Imagem do Projeto"
                className="slider-image"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {list.length > 1 && (
        <>
          <button type="button" className="slider-btn prev" onClick={prevSlide}>&#10094;</button>
          <button type="button" className="slider-btn next" onClick={nextSlide}>&#10095;</button>
          <div className="slider-dots">
            {list.map((_, idx) => (
              <span
                key={idx}
                className={`slider-dot ${idx === slideIndex ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIndex(idx);
                }}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Projetos() {
  const [data, setData] = useState([]);
  const [salas, setSalas] = useState([]);
  const [salaAtiva, setSalaAtiva] = useState(null);

  useEffect(() => {
    carregarProjetos();
    carregarSalas();
  }, []);

  async function carregarProjetos() {
    try {
      const res = await api.get("/projetos");
      setData(res.data);
    } catch (err) {
      console.error("Erro ao carregar projetos:", err);
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

  // Filtragem dos projetos pelo ID da sala ativa
  const projetosFiltrados = salaAtiva 
    ? data.filter(proj => proj.sala && proj.sala._id === salaAtiva)
    : data;

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Projetos Pedagógicos</h2>

        {/* Seletor de salas circular estilo Instagram Stories */}
        <div className="salas-stories-container">
          <div 
            className={`sala-story-item ${!salaAtiva ? "active" : ""}`}
            onClick={() => setSalaAtiva(null)}
          >
            <div className="sala-story-circle all-salas">
              <span>★</span>
            </div>
            <span className="sala-story-name">Ver Todas</span>
          </div>

          {salas.map((sala) => (
            <div 
              key={sala._id}
              className={`sala-story-item ${salaAtiva === sala._id ? "active" : ""}`}
              onClick={() => setSalaAtiva(sala._id)}
            >
              <div className="sala-story-circle">
                <img src={`http://localhost:5000/uploads/${sala.imagem}`} alt={sala.nome} />
              </div>
              <span className="sala-story-name">{sala.nome}</span>
            </div>
          ))}
        </div>

        {/* Feed de Projetos */}
        <div className="grid">
          {projetosFiltrados.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
              Nenhum projeto cadastrado para esta turma.
            </p>
          ) : (
            projetosFiltrados.map((item) => (
              <div className="card" key={item._id} style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center", alignItems: "center" }}>
                
                {/* 1. Imagens */}
                <ImageSlider imagens={item.imagens} fallbackImagem={item.imagem} />

                {/* 2. Título */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "100%" }}>
                  <h3 style={{ margin: 0 }}>{item.titulo}</h3>
                  {item.sala && (
                    <span className="badge-sala" style={{ fontSize: "0.75rem", backgroundColor: "#e8f0fe", color: "var(--azul-principal)", padding: "4px 10px", borderRadius: "10px", fontWeight: "bold" }}>
                      {item.sala.nome}
                    </span>
                  )}
                </div>

                {/* 3. Descrição */}
                <div className="card-body" style={{ flexGrow: 1, padding: 0, width: "100%" }}>
                  <p style={{ margin: 0 }}>{item.descricao}</p>
                </div>

                {/* 4. Data */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: "10px", marginTop: "5px", width: "100%" }}>
                  <small style={{ color: "#888" }}>
                    Publicado em: {new Date(item.data).toLocaleDateString("pt-BR")}
                  </small>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}