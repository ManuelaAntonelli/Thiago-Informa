/**
 * ControladoraAutenticacao (Singleton)
 * Responsabilidade única: gerenciar autenticação, cadastro e perfil de usuários
 * consumindo a API REST do backend Express + MongoDB.
 */
class ControladoraAutenticacao {

    constructor() {
        if (ControladoraAutenticacao.instancia) {
            return ControladoraAutenticacao.instancia;
        }

        const savedUser = localStorage.getItem('user_thiago_informa');
        const savedToken = localStorage.getItem('token_thiago_informa');

        if (savedUser && savedToken && savedToken !== "undefined" && savedToken !== "null" && savedToken.trim() !== "") {
            try {
                this.usuarioLogado = JSON.parse(savedUser);
                this.conta_logada = true;
                this.usuarioLogadoUsername = this.usuarioLogado.usuario;
            } catch (e) {
                this.logout();
            }
        } else {
            this.conta_logada = false;
            this.usuarioLogado = null;
            this.usuarioLogadoUsername = null;
            localStorage.removeItem('token_thiago_informa');
            localStorage.removeItem('user_thiago_informa');
        }

        ControladoraAutenticacao.instancia = this;
    }

    /**
     * Retorna os headers padrões com o token de autenticação JWT.
     */
    getAuthHeaders() {
        const token = localStorage.getItem('token_thiago_informa');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Verifica as credenciais e executa o login no backend.
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

            localStorage.setItem('token_thiago_informa', data.token);
            localStorage.setItem('user_thiago_informa', JSON.stringify(data));

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
                body: JSON.stringify(bodyData)
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                alert(data.message || "Erro ao atualizar perfil.");
                return;
            }

            this.usuarioLogado = data;
            this.usuarioLogadoUsername = data.usuario;
            localStorage.setItem('user_thiago_informa', JSON.stringify(data));

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
                    headers: this.getAuthHeaders()
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
     * Realiza o logout
     */
    logout() {
        this.conta_logada = false;
        this.usuarioLogado = null;
        this.usuarioLogadoUsername = null;

        localStorage.removeItem('token_thiago_informa');
        localStorage.removeItem('user_thiago_informa');
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
            const headers = this.getAuthHeaders();
            console.log("Headers de autenticação enviados:", headers);
            const resposta = await fetch('/api/auth/responsibles', {
                method: 'GET',
                headers: headers
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
                headers: this.getAuthHeaders()
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
