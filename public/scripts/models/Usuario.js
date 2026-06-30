/**
 * Classe Usuario
 * Responsabilidade única: representar os dados de um usuário do sistema.
 */
class Usuario {
    constructor(nome, email, senha) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = "Administrador";
        this.turmas = [];
    }
}
