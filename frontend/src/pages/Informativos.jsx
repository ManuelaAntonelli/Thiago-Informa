import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import CardInformativo from "../components/CardInformativo";

export default function Informativos() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/informativos")
      .then(res => setData(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div className="container">

        <h2>Informativos</h2>

        <div className="grid">

          {data.map(item => (
            <CardInformativo key={item._id} item={item} />
          ))}

        </div>

      </div>
    </>
  );
}