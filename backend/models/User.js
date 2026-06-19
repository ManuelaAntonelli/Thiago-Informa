const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true
    },

    usuario: {
      type: String,
      required: true,
      unique: true
    },

    senha: {
      type: String,
      required: true
    },

    perfil: {
      type: String,
      enum: ["admin", "responsavel"],
      default: "responsavel"
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model("User", UserSchema);