/**
 * ============================================================================
 * PADRÃO DE PROJETO: FACTORY METHOD (MÉTODO FÁBRICA)
 * ============================================================================
 * O padrão Factory fornece uma interface para criar objetos em uma superclasse,
 * mas permite que as subclasses alterem o tipo de objetos que serão criados.
 * Na prática, centraliza o processo de instanciação de objetos complexos.
 * 
 * Por que esta pasta se chama "factories"?
 * Esta pasta contém fábricas responsáveis por criar instâncias de modelos.
 * Em vez de criar um objeto User manualmente em várias partes do sistema e ter
 * que lembrar de criptografar a senha toda vez e validar o perfil, delegamos essa
 * responsabilidade ao método `UserFactory.createUser`. Isso mantém a criação de
 * usuários padronizada, segura e isolada.
 * ============================================================================
 */
const bcrypt = require("bcryptjs");
const User = require("../models/User");

class UserFactory {
  /**
   * Factory method to create a User instance with hashed password.
   * @param {string} nome - Name of the user
   * @param {string} usuario - Username
   * @param {string} senha - Plain text password
   * @param {string} perfil - Profile type ('admin' or 'responsavel')
   * @returns {Promise<User>} A mongoose User instance (not saved yet)
   */
  static async createUser(nome, usuario, senha, perfil) {
    if (!["admin", "responsavel"].includes(perfil)) {
      throw new Error("Perfil de usuário inválido.");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    return new User({
      nome,
      usuario,
      senha: senhaHash,
      perfil
    });
  }
}

module.exports = UserFactory;
