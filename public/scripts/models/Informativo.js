/**
 * Classe Informativo
 * Responsabilidade única: representar os dados de um informativo/notícia (Post).
 */
class Informativo {
    constructor(titulo, descricao, data, imagem, fixado = false) {
        this.id = Date.now(); 
        this.titulo = titulo;
        this.descricao = descricao;
        this.data = data || new Date().toLocaleDateString('pt-BR');
        this.imagem = imagem || "";
        this.fixado = fixado;
    }

    /**
     * Valida se os dados obrigatórios do informativo estão preenchidos.
     * @returns {boolean}
     */
    validar_dados() {
        return this.titulo.trim() !== "" && this.descricao.trim() !== "";
    }
}