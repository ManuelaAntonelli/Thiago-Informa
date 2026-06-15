const mongoose = require("mongoose");

const ProjetoSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  imagem: String,
  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Projeto", ProjetoSchema);