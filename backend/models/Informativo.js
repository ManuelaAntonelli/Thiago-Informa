const mongoose = require("mongoose");

const InformativoSchema = new mongoose.Schema(
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
    data: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Informativo", InformativoSchema);