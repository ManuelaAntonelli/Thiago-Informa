/**
 * ControladoraAutenticacao (Singleton)
 * Responsabilidade única: gerenciar autenticação, cadastro e perfil de usuários
 * consumindo a API REST do backend Express + MongoDB.
 *
 * Sessão gerenciada via cookie HttpOnly — zero localStorage.
 */
class ControladoraAutenticacao {

    constructor() {
        if (ControladoraAutenticacao.instancia) {
            return ControladoraAutenticacao.instancia;
        }

        this.conta_logada = false;
        this.usuarioLogado = null;
        this.usuarioLogadoUsername = null;

        ControladoraAutenticacao.instancia = this;
    }

    /**
     * Verifica se existe uma sessão ativa consultando o servidor via cookie.
     * Deve ser chamado na inicialização da Interface.
     * @returns {Promise<boolean>}
     */
    async verificarSessao() {
        try {
            const resposta = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'same-origin'
            });

            if (resposta.ok) {
                const data = await resposta.json();
                this.conta_logada = true;
                this.usuarioLogado = data;
                this.usuarioLogadoUsername = data.usuario;
                return true;
            } else {
                this.conta_logada = false;
                this.usuarioLogado = null;
                this.usuarioLogadoUsername = null;
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return false;
        }
    }

    /**
     * Retorna os headers padrões para requisições autenticadas.
     * O token é enviado automaticamente via cookie — apenas Content-Type é necessário.
     */
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Verifica as credenciais e executa o login no backend.
     * O servidor define o cookie HttpOnly com o token JWT.
     * @param {Event} event
     * @returns {Promise<boolean>}
     */
    async verificaLogin(event) {
        event.preventDefault();

        const usuarioInput = document.getElementById('usuario').value;
        const senhaInput = document.getElementById('senha').value;

        try {
            const resposta = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ usuario: usuarioInput, senha: senhaInput })
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                alert(data.message || "Erro ao fazer login.");
                return false;
            }

            this.conta_logada = true;
            this.usuarioLogado = data;
            this.usuarioLogadoUsername = data.usuario;

            return true;
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
            return false;
        }
    }

    /**
     * Verifica se o usuário logado é administrador.
     * @returns {boolean}
     */
    verificarAdm() {
        return this.conta_logada && this.usuarioLogado && this.usuarioLogado.perfil === "Administrador";
    }

    /**
     * Cria um novo usuário do tipo Responsável (pelo modal do perfil)
     */
    async criarResponsavel() {
        const nome = document.getElementById('cadNomeResponsavel').value;
        const usuario = document.getElementById('cadUsuarioResponsavel').value;
        const senha = document.getElementById('cadSenhaResponsavel').value;

        if (!nome || !usuario || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const resposta = await fetch('/api/auth/register', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({ nome, usuario, senha, perfil: 'Responsável' })
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                alert(data.message || "Erro ao criar responsável.");
                return;
            }

            alert("Responsável criado com sucesso!");

            document.getElementById('formNovoResponsavel').reset();
            bootstrap.Modal.getInstance(document.getElementById('modalCadastrarResponsavel')).hide();
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        }
    }

    /**
     * Abre o modal de edição de perfil
     */
    abrirModalEditarUsuario() {
        if (this.usuarioLogado) {
            document.getElementById('editNomeUsuario').value = this.usuarioLogado.nome;
            document.getElementById('editSenhaUsuario').value = ""; // Vazio por segurança

            document.getElementById('menu-opcoes').classList.add('d-none');
            new bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
        }
    }

    /**
     * Salva as alterações do perfil do próprio usuário logado.
     * O avatar (se alterado) também é salvo no MongoDB.
     */
    async salvarEdicaoUsuario() {
        const novoNome = document.getElementById('editNomeUsuario').value;
        const novaSenha = document.getElementById('editSenhaUsuario').value;

        const bodyData = { nome: novoNome };
        if (novaSenha.trim() !== "") {
            bodyData.senha = novaSenha;
        }

        try {
            const resposta = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify(bodyData)
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                alert(data.message || "Erro ao atualizar perfil.");
                return;
            }

            this.usuarioLogado = data;
            this.usuarioLogadoUsername = data.usuario;

            // Atualiza campos na UI
            app.preencherPerfil(data);

            bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        }
    }

    /**
     * Exclui a conta do usuário logado.
     * @param {Function} onLogout
     */
    async excluirConta(onLogout) {
        if (!this.usuarioLogado) return;

        if (confirm("Tem certeza que deseja excluir sua conta DEFINITIVAMENTE? Você perderá o acesso.")) {
            try {
                const resposta = await fetch(`/api/auth/users/${this.usuarioLogado._id}`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders(),
                    credentials: 'same-origin'
                });

                if (resposta.ok) {
                    alert("Conta excluída.");
                    if (onLogout) onLogout();
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao excluir conta.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        }
    }

    /**
     * Realiza o logout limpando o cookie via API.
     */
    async logout() {
        this.conta_logada = false;
        this.usuarioLogado = null;
        this.usuarioLogadoUsername = null;

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });
        } catch (error) {
            console.error('Erro ao fazer logout no servidor:', error);
        }
    }

    // ======================================
    // MÉTODOS DO PAINEL ADMIN (Mapeados na API)
    // ======================================

    /**
     * Obtém a lista de responsáveis do banco de dados (Apenas Admin).
     */
    async obterResponsaveis() {
        console.log("Chamando obterResponsaveis...");
        try {
            const resposta = await fetch('/api/auth/responsibles', {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'same-origin'
            });

            console.log("Resposta obtida, status:", resposta.status);
            const data = await resposta.json();
            console.log("Dados do JSON decodificados:", data);

            if (!resposta.ok) {
                throw new Error(data.message || "Erro ao obter responsáveis.");
            }

            return data;
        } catch (error) {
            console.error("Erro na chamada obterResponsaveis:", error);
            throw error;
        }
    }

    /**
     * Registra um novo responsável pelo painel admin.
     */
    async registrarResponsavel(nome, usuario, senha, perfil = 'Responsável') {
        console.log("Chamando registrarResponsavel para:", usuario);
        try {
            const resposta = await fetch('/api/auth/register', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({ nome, usuario, senha, perfil })
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                throw new Error(data.message || "Erro ao registrar responsável.");
            }

            return data;
        } catch (error) {
            console.error("Erro na chamada registrarResponsavel:", error);
            throw error;
        }
    }

    /**
     * Altera a senha de um responsável pelo painel admin.
     */
    async alterarSenhaResponsavel(id, novaSenha) {
        console.log("Chamando alterarSenhaResponsavel para ID:", id);
        try {
            const resposta = await fetch(`/api/auth/users/${id}/password`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({ novaSenha })
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                throw new Error(data.message || "Erro ao alterar senha do responsável.");
            }

            return data;
        } catch (error) {
            console.error("Erro na chamada alterarSenhaResponsavel:", error);
            throw error;
        }
    }

    /**
     * Exclui um responsável pelo painel admin.
     */
    async excluirResponsavel(id) {
        console.log("Chamando excluirResponsavel para ID:", id);
        try {
            const resposta = await fetch(`/api/auth/users/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
                credentials: 'same-origin'
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                throw new Error(data.message || "Erro ao excluir responsável.");
            }

            return data;
        } catch (error) {
            console.error("Erro na chamada excluirResponsavel:", error);
            throw error;
        }
    }
}

ControladoraAutenticacao.instancia = null;
