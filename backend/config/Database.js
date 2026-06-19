const mongoose = require("mongoose");

class Database {
  constructor() {
    if (!Database.instance) {
      this._connect();
      Database.instance = this;
    }
    return Database.instance;
  }

  _connect() {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/thiago-informa";

    mongoose
      .connect(mongoUri)
      .then(() => {
        console.log("MongoDB conectado com sucesso via Singleton Database.");
        this.seedAdmin();
      })
      .catch((err) => {
        console.error("Erro ao conectar ao MongoDB:", err);
      });
  }

  async seedAdmin() {
    try {
      const User = require("../models/User");
      const bcrypt = require("bcryptjs");

      // Verifica se já existe um admin no banco de dados
      const adminExists = await User.findOne({ perfil: "admin" });
      if (!adminExists) {
        const passwordHash = await bcrypt.hash("admin123", 10);
        await User.create({
          nome: "Administrador",
          usuario: "admin",
          senha: passwordHash,
          perfil: "admin"
        });
        console.log("Usuário administrador semeado com sucesso! Usuário: admin / Senha: admin123");
      }
    } catch (err) {
      console.error("Erro ao semear administrador inicial:", err);
    }
  }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;
