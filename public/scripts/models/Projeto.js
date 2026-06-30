/**
 * Classe Projeto
 * Responsabilidade única: representar os dados de um projeto.
 */
class Projeto {
    constructor(nome, descricao, turma, imagem) {
        this.id = Date.now();
        this.nome_projeto = nome;
        this.descricao = descricao;
        this.turma = turma || "Todos"; 
        this.imagem = imagem || ""; 
        this.data = new Date();
        this.atualizacoes = [];
        this.data_criacao = new Date().toLocaleDateString('pt-BR');
    }

    /**
     * Valida se os dados obrigatórios do projeto estão preenchidos.
     * @returns {boolean}
     */
    validar_dados() {
        return this.nome_projeto.trim() !== "" && this.descricao.trim() !== "";
    }
}
