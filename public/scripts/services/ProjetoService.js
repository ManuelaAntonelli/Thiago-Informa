/**
 * ProjetoService
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — encapsular todas as chamadas HTTP relacionadas a projetos.
 *  - ISP: Interface segregada — apenas a ControladoraProjetos conhece este service;
 *         controllers de outras áreas não são forçados a depender de métodos de projeto.
 *  - DIP: Recebe um HttpClient via construtor; não instancia dependências internamente.
 */
class ProjetoService {

    /**
     * @param {HttpClient} httpClient - Cliente HTTP injetado
     */
    constructor(httpClient) {
        this.http = httpClient;
    }

    async getAll() {
        return this.http.get('/api/projects');
    }

    async create(dados) {
        return this.http.post('/api/projects', dados);
    }

    async update(id, dados) {
        return this.http.put(`/api/projects/${id}`, dados);
    }

    async remove(id) {
        return this.http.delete(`/api/projects/${id}`);
    }
}
