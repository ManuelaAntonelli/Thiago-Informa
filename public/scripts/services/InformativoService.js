/**
 * InformativoService
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — encapsular todas as chamadas HTTP relacionadas a informativos.
 *  - ISP: Interface segregada — apenas a ControladoraInformativo e a Interface (para
 *         ações do painel admin) conhecem este service; outros controllers não precisam
 *         conhecer endpoints de informativos.
 *  - DIP: Recebe um HttpClient via construtor; não instancia dependências internamente.
 */
class InformativoService {

    /**
     * @param {HttpClient} httpClient - Cliente HTTP injetado
     */
    constructor(httpClient) {
        this.http = httpClient;
    }

    async getAll() {
        return this.http.get('/api/informatives');
    }

    async create(dados) {
        return this.http.post('/api/informatives', dados);
    }

    async update(id, dados) {
        return this.http.put(`/api/informatives/${id}`, dados);
    }

    async togglePin(id) {
        return this.http.put(`/api/informatives/${id}/pin`);
    }

    async remove(id) {
        return this.http.delete(`/api/informatives/${id}`);
    }
}
