import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import CardInformativo from "../components/CardInformativo";

export default function Informativos() {

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/informativos")
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