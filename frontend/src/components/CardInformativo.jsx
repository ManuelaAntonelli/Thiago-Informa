import { useState } from "react";

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
                alt="Imagem do Informativo"
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

export default function CardInformativo({ item }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center", alignItems: "center" }}>
      
      {/* 1. Imagens */}
      <ImageSlider imagens={item.imagens} fallbackImagem={item.imagem} />

      {/* 2. Título */}
      <h3 style={{ margin: "5px 0 0 0", width: "100%" }}>{item.titulo}</h3>

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
  );
}