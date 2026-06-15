import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import CardInformativo from "../components/CardInformativo";

export default function Projetos() {

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/projetos")
      .then(res => setData(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div className="container">

        <h2>Projetos</h2>

        <div className="grid">

          {data.map(item => (
            <div className="card" key={item._id}>

              {item.imagem && (
                <img src={item.imagem} />
              )}

              <div className="card-body">

                <h3>{item.titulo}</h3>

                <p>{item.descricao}</p>

                <small>
                  {new Date(item.data).toLocaleDateString()}
                </small>

              </div>

            </div>
          ))}

        </div>

      </div>
    </>
  );
}