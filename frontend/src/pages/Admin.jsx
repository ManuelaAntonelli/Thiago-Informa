import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Admin() {
  const [informativos, setInformativos] = useState([]);
  const [projetos, setProjetos] = useState([]);

  const [tituloInfo, setTituloInfo] = useState("");
  const [descricaoInfo, setDescricaoInfo] = useState("");

  const [tituloProj, setTituloProj] = useState("");
  const [descricaoProj, setDescricaoProj] = useState("");

  const API = "http://localhost:5000";

  useEffect(() => {
    carregarInformativos();
    carregarProjetos();
  }, []);

  async function carregarInformativos() {
    const res = await axios.get(`${API}/informativos`);
    setInformativos(res.data);
  }

  async function carregarProjetos() {
    const res = await axios.get(`${API}/projetos`);
    setProjetos(res.data);
  }

  async function criarInformativo(e) {
    e.preventDefault();

    await axios.post(`${API}/informativos`, {
      titulo: tituloInfo,
      descricao: descricaoInfo
    });

    setTituloInfo("");
    setDescricaoInfo("");

    carregarInformativos();
  }

  async function criarProjeto(e) {
    e.preventDefault();

    await axios.post(`${API}/projetos`, {
      titulo: tituloProj,
      descricao: descricaoProj
    });

    setTituloProj("");
    setDescricaoProj("");

    carregarProjetos();
  }

  async function excluirInformativo(id) {
    await axios.delete(`${API}/informativos/${id}`);
    carregarInformativos();
  }

  async function excluirProjeto(id) {
    await axios.delete(`${API}/projetos/${id}`);
    carregarProjetos();
  }

  return (
    <>
      <Navbar />

      <div className="container">

        <h1>Painel Administrativo</h1>

        <div className="admin-grid">

          <div className="crud-card">
            <h2>Novo Informativo</h2>

            <form onSubmit={criarInformativo}>
              <input
                value={tituloInfo}
                onChange={(e)=>setTituloInfo(e.target.value)}
                placeholder="Título"
              />

              <textarea
                value={descricaoInfo}
                onChange={(e)=>setDescricaoInfo(e.target.value)}
                placeholder="Descrição"
              />

              <button>Salvar</button>
            </form>

            <div className="lista-admin">
              {informativos.map(item => (
                <div key={item._id} className="item-admin">

                  <strong>{item.titulo}</strong>

                  <button
                    onClick={() => excluirInformativo(item._id)}
                  >
                    Excluir
                  </button>

                </div>
              ))}
            </div>

          </div>

          <div className="crud-card">

            <h2>Novo Projeto</h2>

            <form onSubmit={criarProjeto}>

              <input
                value={tituloProj}
                onChange={(e)=>setTituloProj(e.target.value)}
                placeholder="Título"
              />

              <textarea
                value={descricaoProj}
                onChange={(e)=>setDescricaoProj(e.target.value)}
                placeholder="Descrição"
              />

              <button>Salvar</button>

            </form>

            <div className="lista-admin">

              {projetos.map(item => (
                <div key={item._id} className="item-admin">

                  <strong>{item.titulo}</strong>

                  <button
                    onClick={() => excluirProjeto(item._id)}
                  >
                    Excluir
                  </button>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Admin;