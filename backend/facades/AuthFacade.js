/**
 * ============================================================================
 * PADRÃO DE PROJETO: FACADE (FACHADA)
 * ============================================================================
 * O padrão Facade fornece uma interface unificada e simplificada para um conjunto
 * de interfaces em um subsistema. Ele define uma interface de nível mais alto que
 * torna o subsistema mais fácil de usar.
 * 
 * Por que esta pasta se chama "facades"?
 * Esta pasta contém classes Fachada que agrupam fluxos complexos de regras de
 * negócio (neste caso, autenticação, criptografia, geração de JWT, consultas no
 * banco de dados e controle de acesso) em métodos de classe simples. As rotas
 * do Express (como /auth/login e /auth/register) chamam apenas estes métodos,
 * sem precisar saber os detalhes de implementação das camadas inferiores.
 * ============================================================================
 */
const User = require("../models/User");
const UserFactory = require("../factories/UserFactory");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthFacade {
  /**
   * Registers a new user using the UserFactory.
   */
  static async register(nome, usuario, senha, perfil) {
    const existe = await User.findOne({ usuario });
    if (existe) {
      throw new Error("Nome de usuário já cadastrado.");
    }

    const user = await UserFactory.createUser(nome, usuario, senha, perfil);
    await user.save();

    return {
      id: user._id,
      nome: user.nome,
      usuario: user.usuario,
      perfil: user.perfil
    };
  }

  /**
   * Logs in a user, returning a JWT token and user info.
   */
  static async login(usuario, senha) {
    const user = await User.findOne({ usuario });
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const valida = await bcrypt.compare(senha, user.senha);
    if (!valida) {
      throw new Error("Senha incorreta.");
    }

    const token = jwt.sign(
      {
        id: user._id,
        perfil: user.perfil
      },
      process.env.JWT_SECRET || "segredo",
      {
        expiresIn: "1d"
      }
    );

    return {
      token,
      usuario: {
        id: user._id,
        nome: user.nome,
        usuario: user.usuario,
        perfil: user.perfil
      }
    };
  }

  /**
   * Updates a user's password.
   */
  static async changePassword(userId, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const senhaHash = await bcrypt.hash(newPassword, 10);
    user.senha = senhaHash;
    await user.save();

    return { msg: "Senha alterada com sucesso." };
  }

  /**
   * Lists all users with 'responsavel' profile.
   */
  static async listResponsibles() {
    return await User.find({ perfil: "responsavel" }).select("-senha");
  }

  /**
   * Deletes a user by ID, preventing deletion of the admin.
   */
  static async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.perfil === "admin") {
      throw new Error("Não é possível remover o administrador do sistema.");
    }

    await User.findByIdAndDelete(userId);
    return { msg: "Usuário responsável excluído com sucesso." };
  }
}

module.exports = AuthFacade;
