/**
 * EventoService
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — encapsular todas as chamadas HTTP relacionadas a eventos.
 *  - ISP: Interface segregada — apenas a Interface (que gerencia a agenda) conhece
 *         este service; controllers de outras áreas não precisam depender dele.
 *  - DIP: Recebe um HttpClient via construtor; não instancia dependências internamente.
 */
class EventoService {

    /**
     * @param {HttpClient} httpClient - Cliente HTTP injetado
     */
    constructor(httpClient) {
        this.http = httpClient;
    }

    async getAll() {
        return this.http.get('/api/events');
    }

    async create(dados) {
        return this.http.post('/api/events', dados);
    }

    async remove(id) {
        return this.http.delete(`/api/events/${id}`);
    }
}
