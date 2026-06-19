const mongoose = require("mongoose");

const SalaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      unique: true
    },
    imagem: {
      type: String, // Nome do arquivo de imagem principal da sala
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Sala", SalaSchema);
