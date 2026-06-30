/**
 * Classe Fabrica (Factory Pattern)
 * Responsabilidade única: centralizar a criação de objetos do sistema.
 * Depende das classes: Usuario, Projeto, Informativo.
 */
class Fabrica {

    /**
     * Cria uma nova instância de Projeto.
     * @param {string} nome
     * @param {string} descricao
     * @returns {Projeto}
     */
    static criarProjeto(nome, descricao, turma, imagem) {
        return new Projeto(nome, descricao, turma, imagem);
    }

    /**
     * Cria uma nova instância de Informativo.
     * @param {string} titulo
     * @param {string} descricao
     * @param {string} data
     * @param {string} imagem
     * @returns {Informativo}
     */
    static criarInformativo(titulo, descricao, data, imagem) {
        return new Informativo(titulo, descricao, data, imagem);
    }

    /**
     * Cria uma nova instância de Usuario.
     * @param {string} nome
     * @param {string} email
     * @param {string} senha
     * @returns {Usuario}
     */
    static criarUsuario(nome, email, senha) {
        return new Usuario(nome, email, senha);
    }
}
