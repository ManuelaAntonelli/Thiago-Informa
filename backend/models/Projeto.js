const mongoose = require("mongoose");

const ProjetoSchema = new mongoose.Schema(
  {
    titulo: String,
    descricao: String,
    imagem: String, // Mantido por compatibilidade legada
    imagens: {
      type: [String],
      default: []
    },
    fixado: {
      type: Boolean,
      default: false
    },
    sala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sala",
      default: null
    },
    data: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Projeto", ProjetoSchema);