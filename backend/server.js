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
  express.static(path.join(__dirname, "..", "uploads"))
);

// Conexão com MongoDB via Singleton
require("./config/Database");

app.use("/auth", require("./routes/authRoutes"));
app.use("/salas", require("./routes/salaRoutes"));

app.use(
  "/informativos",
  require("./routes/informativoRoutes")
);

app.use(
  "/projetos",
  require("./routes/projetoRoutes")
);

app.use(
  "/eventos",
  require("./routes/eventoRoutes")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});