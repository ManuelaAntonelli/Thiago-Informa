const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true
    },
    descricao: {
      type: String,
      default: ""
    },
    data: {
      type: String, // formato YYYY-MM-DD para evitar problemas de timezone
      required: true
    },
    tipo: {
      type: String,
      enum: ["evento", "feriado"],
      default: "evento"
    },
    fixado: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Evento", EventoSchema);
