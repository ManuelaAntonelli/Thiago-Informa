import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

// Componente auxiliar para carrossel interno de fotos nos posts
function ImageSlider({ imagens, fallbackImagem }) {
  const [slideIndex, setSlideIndex] = useState(0);

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
      <div className="slider-viewport" style={{ overflow: "hidden", position: "relative", width: "100%", height: "350px", borderRadius: "15px" }}>
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
                alt="Foto da Postagem"
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

export default function Home() {
  const [feedItems, setFeedItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Controle de paginação do carrossel de fixados (3 em 3)
  const [carouselPage, setCarouselPage] = useState(0);

  useEffect(() => {
    carregarHome();
  }, []);

  async function carregarHome() {
    try {
      const [resInfos, resProjs, resEvents] = await Promise.all([
        api.get("/informativos"),
        api.get("/projetos"),
        api.get("/eventos")
      ]);

      const infos = resInfos.data.map(i => ({ ...i, tipoPost: "informativo" }));
      const projs = resProjs.data.map(p => ({ ...p, tipoPost: "projeto" }));
      const events = resEvents.data.map(e => ({ ...e, tipoPost: "evento" }));

      // Junta itens fixados (informativos fixados, projetos fixados, feriados de calendário)
      const fixados = [
        ...infos.filter(i => i.fixado),
        ...projs.filter(p => p.fixado),
        ...events.filter(e => e.tipo === "feriado" || e.fixado)
      ];

      setPinnedItems(fixados);

      // Junta informativos e projetos para o feed geral, ordenando por data descrescente
      const feedGeral = [...infos, ...projs].sort((a, b) => new Date(b.data) - new Date(a.data));
      setFeedItems(feedGeral);
    } catch (err) {
      console.error("Erro ao carregar dados da Home:", err);
    } finally {
      setCarregando(false);
    }
  }

  // Cálculos do carrossel - 3
  const itemsPerPage = 3;
  const totalPages = Math.ceil(pinnedItems.length / itemsPerPage);

  const nextCarouselPage = () => {
    setCarouselPage((prev) => (prev + 1) % totalPages);
  };

  const prevCarouselPage = () => {
    setCarouselPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const startIndex = carouselPage * itemsPerPage;
  const currentPinnedItems = pinnedItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <Navbar />

      {/* 1. SEÇÃO DE FIXADOS (CARROSSEL) */}
      {pinnedItems.length > 0 && (
        <section className="pinned-section" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #ddd", padding: "20px 0" }}>
          <div className="container" style={{ padding: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0, color: "var(--azul-principal)", fontWeight: "bold", fontSize: "1.1rem" }}>
                 Avisos Fixados & Feriados
              </h4>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={prevCarouselPage} className="btn-carousel-nav">&#10094;</button>
                  <button onClick={nextCarouselPage} className="btn-carousel-nav">&#10095;</button>
                </div>
              )}
            </div>

            <div className="pinned-grid-container" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              {currentPinnedItems.map((item) => {
                // Estilo diferente se for feriado
                const isFeriado = item.tipoPost === "evento" && item.tipo === "feriado";
                return (
                  <div 
                    key={item._id} 
                    className="card-pinned-item"
                    style={{
                      border: "2px solid var(--vermelho-borda)",
                      borderRadius: "15px",
                      padding: "15px",
                      backgroundColor: isFeriado ? "#fff5f5" : "#ffffff",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "160px",
                      textAlign: "center",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "8px" }}>
                        <span style={{ 
                          fontSize: "0.65rem", 
                          fontWeight: "bold", 
                          padding: "2px 8px", 
                          borderRadius: "10px", 
                          color: "#fff", 
                          backgroundColor: isFeriado ? "#dc3545" : (item.tipoPost === "projeto" ? "#0359A4" : "#4895D9")
                        }}>
                          {isFeriado ? "FERIADO" : item.tipoPost.toUpperCase()}
                        </span>
                        {item.sala && (
                          <span style={{ fontSize: "0.65rem", color: "#666", fontWeight: "600", marginLeft: "6px" }}>
                            • {item.sala.nome}
                          </span>
                        )}
                      </div>
                      <h5 style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 5px 0", color: "var(--preto-texto)", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical", overflow: "hidden", width: "100%", textAlign: "center" }}>
                        {item.titulo}
                      </h5>
                      <p style={{ fontSize: "0.8rem", color: "var(--cinza-texto)", margin: 0, display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4", width: "100%", textAlign: "center" }}>
                        {item.descricao}
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid #eee", paddingTop: "8px", marginTop: "10px", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                      <small style={{ fontSize: "0.7rem", color: "#999", textAlign: "center" }}>
                        {isFeriado 
                          ? `Data: ${item.data.split("-").reverse().join("/")}`
                          : new Date(item.data).toLocaleDateString("pt-BR")
                        }
                      </small>
                    </div>
                  </div>
                );
              })}

              {/* Preenchimento se houver menos de 3 itens na página final */}
              {currentPinnedItems.length < itemsPerPage && 
                Array.from({ length: itemsPerPage - currentPinnedItems.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} style={{ visibility: "hidden" }}></div>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* 2. FEED DE POSTAGENS */}
      <section className="feed-section" style={{ padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: "600px", margin: "0 auto" }}>
          
          <h2 style={{ fontSize: "1.6rem", color: "var(--azul-principal)", marginBottom: "30px", textAlign: "center" }}>
            Feed Escolar
          </h2>

          {carregando ? (
            <p style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>Carregando publicações...</p>
          ) : feedItems.length === 0 ? (
            <p style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>Nenhum comunicado cadastrado no feed.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
              {feedItems.map((item) => (
                <div 
                  key={item._id} 
                  className="feed-post-card"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid var(--vermelho-borda)",
                    borderRadius: "20px",
                    boxShadow: "var(--sombra-card)",
                    overflow: "hidden"
                  }}
                >
                  
                  {/* Cabeçalho do Post */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ 
                        width: "38px", 
                        height: "38px", 
                        borderRadius: "50%", 
                        background: "linear-gradient(45deg, #0359A4, #4895D9)", 
                        color: "white", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "0.95rem"
                      }}>
                        T
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <strong style={{ fontSize: "0.9rem", color: "var(--preto-texto)", display: "block" }}>Thiago Informa</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--cinza-texto)", display: "block", textTransform: "capitalize" }}>
                          {item.tipoPost} {item.sala ? `• ${item.sala.nome}` : ""}
                        </span>
                      </div>
                    </div>
                    {item.fixado && (
                      <span style={{ fontSize: "0.65rem", backgroundColor: "#dc3545", color: "white", padding: "3px 8px", borderRadius: "12px", fontWeight: "bold" }}>
                        DESTAQUE
                      </span>
                    )}
                  </div>
                  
                  {/* Conteúdo Sequencial Reordenado e Centralizado: Imagem -> Título -> Descrição -> Data */}

                  {/* 1. Carrossel de Imagens */}
                  <div style={{ padding: "15px 20px 10px 20px" }}>
                    <ImageSlider imagens={item.imagens} fallbackImagem={item.imagem} />
                  </div>
                  
                  {/* 2. Título do Comunicado */}
                  <div style={{ padding: "5px 20px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0, color: "var(--azul-principal)" }}>
                      {item.titulo}
                    </h3>
                  </div>

                  {/* 3. Descrição */}
                  <div style={{ padding: "5px 20px 15px 20px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--preto-texto)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                      {item.descricao}
                    </p>
                  </div>

                  {/* 4. Data de publicação */}
                  <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", backgroundColor: "#fafafa", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "#888", fontWeight: "500" }}>
                      Publicado em {new Date(item.data).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}