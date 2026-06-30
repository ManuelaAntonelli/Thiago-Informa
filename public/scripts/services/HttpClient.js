/**
 * HttpClient
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — encapsular a configuração de requisições HTTP.
 *  - OCP: Aberto para extensão (pode-se herdar ou compor para adicionar headers,
 *         interceptores, base URLs), fechado para modificação nos serviços filhos.
 *         Exemplo: para adicionar autenticação por Bearer token no futuro, basta
 *         sobrescrever _buildOptions() sem tocar nos services específicos.
 */
class HttpClient {

    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    /**
     * Monta as opções padrão de uma requisição.
     * Ponto de extensão central (OCP): subclasses ou composições podem
     * sobrescrever ou enriquecer este método sem modificar os services.
     * @param {string} method
     * @param {object|null} body
     * @returns {object}
     */
    _buildOptions(method, body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        };
        if (body !== null) {
            options.body = JSON.stringify(body);
        }
        return options;
    }

    async get(endpoint) {
        return fetch(this.baseUrl + endpoint, this._buildOptions('GET'));
    }

    async post(endpoint, body) {
        return fetch(this.baseUrl + endpoint, this._buildOptions('POST', body));
    }

    async put(endpoint, body = null) {
        return fetch(this.baseUrl + endpoint, this._buildOptions('PUT', body));
    }

    async delete(endpoint) {
        return fetch(this.baseUrl + endpoint, this._buildOptions('DELETE'));
    }
}
