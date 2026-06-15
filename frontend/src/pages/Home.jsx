import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />

      <section className="hero">

        <div className="hero-content">

          <h1>
            Bem-vindo ao Thiago Informa
          </h1>

          <p>
            Plataforma oficial de comunicação
            entre escola e família.
          </p>

        </div>

      </section>

      <section className="container">

        <h2>
          Últimos Informativos
        </h2>

        <div className="cards-grid">

          <div className="card">
            <h3>Reunião de Pais</h3>

            <p>
              Convocação para reunião
              pedagógica.
            </p>
          </div>

          <div className="card">
            <h3>Festa Junina</h3>

            <p>
              Confira a programação
              completa do evento.
            </p>
          </div>

          <div className="card">
            <h3>Calendário Escolar</h3>

            <p>
              Datas importantes do semestre.
            </p>
          </div>

        </div>

      </section>

      <section className="container">

        <h2>
          Projetos Pedagógicos
        </h2>

        <div className="cards-grid">

          <div className="card">
            <h3>Meio Ambiente</h3>

            <p>
              Atividades voltadas à
              sustentabilidade.
            </p>
          </div>

          <div className="card">
            <h3>Mundo da Leitura</h3>

            <p>
              Incentivo à leitura infantil.
            </p>
          </div>

          <div className="card">
            <h3>Arte e Cultura</h3>

            <p>
              Expressão artística das crianças.
            </p>
          </div>

        </div>

      </section>
    </>
  );
}

export default Home;