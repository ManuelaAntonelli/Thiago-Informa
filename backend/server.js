const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/*
// Conexão com MongoDB (desativada temporariamente)

mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/thiago-informa"
  )
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log(err));
*/

app.use("/auth", require("./routes/authRoutes"));

app.use(
  "/informativos",
  require("./routes/informativoRoutes")
);

app.use(
  "/projetos",
  require("./routes/projetoRoutes")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});