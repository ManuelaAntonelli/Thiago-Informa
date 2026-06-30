/**
 * AuthService
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — encapsular todas as chamadas HTTP relacionadas
 *         a autenticação e gerenciamento de usuários.
 *  - ISP: Interface segregada — apenas a ControladoraAutenticacao conhece e depende
 *         deste service; outros controllers não são forçados a depender de métodos
 *         de autenticação que não utilizam.
 *  - DIP: Recebe um HttpClient via construtor; não instancia dependências internamente.
 */
class AuthService {

    /**
     * @param {HttpClient} httpClient - Cliente HTTP injetado
     */
    constructor(httpClient) {
        this.http = httpClient;
    }

    async login(usuario, senha) {
        return this.http.post('/api/auth/login', { usuario, senha });
    }

    async getMe() {
        return this.http.get('/api/auth/me');
    }

    async logout() {
        return this.http.post('/api/auth/logout');
    }

    async register(nome, usuario, senha, perfil) {
        return this.http.post('/api/auth/register', { nome, usuario, senha, perfil });
    }

    async getResponsibles() {
        return this.http.get('/api/auth/responsibles');
    }

    async updateProfile(dados) {
        return this.http.put('/api/auth/profile', dados);
    }

    async changePassword(id, novaSenha) {
        return this.http.put(`/api/auth/users/${id}/password`, { novaSenha });
    }

    async deleteUser(id) {
        return this.http.delete(`/api/auth/users/${id}`);
    }
}
