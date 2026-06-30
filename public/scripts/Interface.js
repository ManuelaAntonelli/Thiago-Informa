/**
 * Interface (Facade Pattern)
 * Responsabilidade: ser o ponto de acesso único do sistema,
 * delegando operações para as controladoras especializadas.
 * 
 * Também gerencia a navegação entre abas e o calendário/agenda.
 */
class Interface {

    constructor() {
        this.controladoraAuth = new ControladoraAutenticacao();
        this.controladoraInfo = new ControladoraInformativo();
        this.controladoraProjetos = new ControladoraProjetos();

        this.dataAtualCalendario = new Date();
        this.mesesNomes = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

        this._carregarAvatarSalvo();

        // Verifica se está rodando via file:///
        if (window.location.protocol === 'file:') {
            setTimeout(() => {
                const aviso = document.getElementById('aviso-servidor');
                if (aviso) aviso.classList.remove('d-none');
            }, 50);
        }

        // Auto-login se já estiver autenticado no localStorage
        if (this.controladoraAuth.conta_logada && this.controladoraAuth.usuarioLogado) {
            setTimeout(() => {
                const elLogin = document.getElementById('tela-login');
                const elHome = document.getElementById('tela-home');
                if (elLogin && elHome) {
                    elLogin.classList.add('d-none');
                    elHome.classList.remove('d-none');

                    this.aplicarPermissoes();
                    this.navegarAba('inicio');

                    this.controladoraProjetos.exibirProjetos();
                    this.controladoraInfo.carregarInformativos();
                    this.controladoraInfo.carregarFixados();

                    this.preencherPerfil(this.controladoraAuth.usuarioLogado);
                }
            }, 100);
        }
    }

    // ========================
    // MÉTODOS DE EXIBIÇÃO (Facade)
    // ========================

    /**
     * Exibe a tela de projetos.
     */
    exibirProjeto() {
        this.navegarAba('projetos');
    }

    /**
     * Exibe a tela de informativos (início).
     */
    exibirInformativo() {
        this.navegarAba('inicio');
    }

    /**
     * Exibe a tela de edição de projeto (abre modal).
     * @param {number} id
     */
    exibirEdicaoProjeto(id) {
        this.controladoraProjetos.abrirModalEditar(id);
    }

    /**
     * Exibe a tela de agenda.
     */
    exibirAgenda() {
        this.navegarAba('agenda');
    }

    // ========================
    // AUTENTICAÇÃO (delegação)
    // ========================

    /**
     * Executa o login delegando para ControladoraAutenticacao.
     * @param {Event} event
     */

    preencherPerfil(usuario) {
        const elNome = document.getElementById("perfil-nome");
        if (elNome) elNome.textContent = usuario.nome;

        const elUser = document.getElementById("perfil-usuario") || document.getElementById("perfil-email");
        if (elUser) elUser.textContent = usuario.usuario;

        const elPapel = document.getElementById("perfil-papel");
        if (elPapel) elPapel.textContent = usuario.perfil;

        const elCampoNome = document.getElementById("perfil-campo-nome");
        if (elCampoNome) elCampoNome.textContent = usuario.nome;

        const elCampoUser = document.getElementById("perfil-campo-usuario") || document.getElementById("perfil-campo-email");
        if (elCampoUser) elCampoUser.textContent = usuario.usuario;

        const elCampoPapel = document.getElementById("perfil-campo-papel");
        if (elCampoPapel) elCampoPapel.textContent = usuario.perfil;
    }

    async executarLogin(event) {
        const sucesso = await this.controladoraAuth.verificaLogin(event);

        if (sucesso) {
            document.getElementById('tela-login').classList.add('d-none');
            document.getElementById('tela-home').classList.remove('d-none');

            this.aplicarPermissoes();

            this.navegarAba('inicio');

            this.controladoraProjetos.exibirProjetos();
            this.controladoraInfo.carregarInformativos();
            this.controladoraInfo.carregarFixados();

            this.preencherPerfil(this.controladoraAuth.usuarioLogado);
        }
    }

    mostraSenha() {
        const inputSenha = document.getElementById('senha');
        const iconeSenha = document.getElementById('iconeSenha');

        if (inputSenha.type === 'password') {
            inputSenha.type = 'text';
            iconeSenha.classList.replace('bi-eye-slash', 'bi-eye');
        } else {
            inputSenha.type = 'password';
            iconeSenha.classList.replace('bi-eye', 'bi-eye-slash');
        }
    }

    /**
     * Aplica permissões visuais com base no perfil do usuário logado.
     * Administradores vêem todos os controles.
     * Responsáveis só podem visualizar (sem criar, editar, excluir ou fixar).
     */
    aplicarPermissoes() {
        const telaHome = document.getElementById('tela-home');
        if (this.controladoraAuth.verificarAdm()) {
            telaHome.classList.remove('responsavel');
        } else {
            telaHome.classList.add('responsavel');
        }
    }



    /**
     * Cria um novo usuário do tipo Responsável.
     */
    criarResponsavel() {
        this.controladoraAuth.criarResponsavel();
    }

    /**
     * Abre o modal de edição de usuário.
     */
    abrirModalEditarUsuario() {
        this.controladoraAuth.abrirModalEditarUsuario();
    }

    /**
     * Salva edição do perfil do usuário.
     */
    salvarEdicaoUsuario() {
        this.controladoraAuth.salvarEdicaoUsuario();
    }

    /**
     * Exclui a conta do usuário logado.
     */
    excluirConta() {
        this.controladoraAuth.excluirConta(() => this.logout());
    }

    /**
     * Realiza o logout.
     */
    logout() {
        this.controladoraAuth.logout();

        document.getElementById('menu-opcoes').classList.add('d-none');
        document.getElementById('tela-home').classList.add('d-none');
        document.getElementById('tela-login').classList.remove('d-none');

        document.getElementById('loginForm').reset();
    }

    // ========================
    // PROJETOS (delegação)
    // ========================

    /**
     * Cria um novo projeto.
     */
    criarProjeto() {
        this.controladoraProjetos.criarProjeto();
    }

    /**
     * Exibe a lista de projetos.
     */
    exibirProjetos() {
        this.controladoraProjetos.exibirProjetos();
    }

    /**
     * Abre o modal de edição de projeto.
     * @param {number} id
     */
    abrirModalEditar(id) {
        this.controladoraProjetos.abrirModalEditar(id);
    }

    /**
     * Salva edição de projeto.
     */
    salvarEdicaoProjeto() {
        this.controladoraProjetos.editarProjeto();
    }

    /**
     * Exclui um projeto.
     * @param {number} id
     */
    excluirProjeto(id) {
        this.controladoraProjetos.excluirProjeto(id);
    }

    /**
     * Filtra os projetos por turma.
     * @param {string} turma 
     */
    filtrarProjetos(turma) {
        this.controladoraProjetos.filtrarProjetos(turma);
    }

    // ========================
    // INFORMATIVOS (delegação)
    // ========================

    /**
     * Carrega os informativos no feed.
     */
    carregarInformativos() {
        this.controladoraInfo.carregarInformativos();
        this.controladoraInfo.carregarFixados(); 
    }

    /**
     * Alterna o estado de fixação do post.
     * @param {number} id 
     */
    alternarFixado(id) {
        this.controladoraInfo.alternarFixado(id);
    }

    /**
     * Cria um novo informativo (post) no feed.
     */
    criarInformativo() {
        this.controladoraInfo.criarInformativo();
    }

    /**
     * Abre o modal de edição de informativo.
     * @param {number} id
     */
    abrirModalEditarInfo(id) {
        this.controladoraInfo.abrirModalEditarInfo(id);
    }

    /**
     * Salva as edições do informativo.
     */
    editarInformativo() {
        this.controladoraInfo.editarInformativo();
    }

    /**
     * Exclui um informativo do feed.
     * @param {number} id
     */
    excluirInfo(id) {
        this.controladoraInfo.excluirInfo(id);
    }

    /**
     * Gera o preview de imagem nos modais.
     */
    gerarPreviewImagem(inputElement, containerId) {
        this.controladoraInfo.gerarPreviewImagem(inputElement, containerId);
    }

    /**
     * Remove a imagem do preview nos modais.
     */
    removerPreviewImagem(containerId, hiddenInputId) {
        this.controladoraInfo.removerPreviewImagem(containerId, hiddenInputId);
    }

    /**
     * Carrega e salva a foto do avatar da tela de login.
     * @param {HTMLInputElement} inputElement
     */
    carregarAvatarLogin(inputElement) {
        if (inputElement.files && inputElement.files[0]) {
            const leitor = new FileReader();
            leitor.onload = function (e) {
                const base64 = e.target.result;
                localStorage.setItem('avatar_login_thiago_informa', base64);

                const preview = document.getElementById('loginAvatarPreview');
                const icone = document.getElementById('loginAvatarIcone');
                if (preview) {
                    if (icone) icone.style.display = 'none';
                    preview.style.backgroundImage = `url(${base64})`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                }
            };
            leitor.readAsDataURL(inputElement.files[0]);
        }
    }

    /**
     * Restaura o avatar salvo no localStorage ao carregar a página.
     * @private
     */
    _carregarAvatarSalvo() {
        const avatarSalvo = localStorage.getItem('avatar_login_thiago_informa');
        if (avatarSalvo) {
            const preview = document.getElementById('loginAvatarPreview');
            const icone = document.getElementById('loginAvatarIcone');
            if (preview) {
                if (icone) icone.style.display = 'none';
                preview.style.backgroundImage = `url(${avatarSalvo})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            }
        }
    }

    /**
     * Carrega e salva a foto do avatar da tela de perfil.
     * @param {HTMLInputElement} inputElement
     */
    carregarAvatarPerfil(inputElement) {
        if (inputElement.files && inputElement.files[0]) {
            const leitor = new FileReader();
            leitor.onload = function (e) {
                const base64 = e.target.result;
                localStorage.setItem('avatar_perfil_thiago_informa', base64);

                const preview = document.getElementById('perfilAvatarPreview');
                const icone = document.getElementById('perfilAvatarIcone');
                if (preview) {
                    if (icone) icone.style.display = 'none';
                    preview.style.backgroundImage = `url(${base64})`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                }
            };
            leitor.readAsDataURL(inputElement.files[0]);
        }
    }

    /**
     * Carrega os dados do usuário logado e preenche a aba de perfil.
     */
    carregarDadosPerfil() {
        const user = this.controladoraAuth.usuarioLogado;
        if (!user) return;

        const elNome = document.getElementById('perfil-nome');
        const elUser = document.getElementById('perfil-usuario') || document.getElementById('perfil-email');
        const elPapel = document.getElementById('perfil-papel');

        if (elNome) elNome.textContent = user.nome;
        if (elUser) elUser.textContent = user.usuario;
        if (elPapel) elPapel.textContent = user.perfil;

        this._carregarAvatarPerfilSalvo();
    }

    /**
     * Restaura o avatar do perfil salvo 
     * @private
     */
    _carregarAvatarPerfilSalvo() {
        const avatarSalvo = localStorage.getItem('avatar_perfil_thiago_informa');
        const preview = document.getElementById('perfilAvatarPreview');
        const icone = document.getElementById('perfilAvatarIcone');
        if (avatarSalvo && preview) {
            if (icone) icone.style.display = 'none';
            preview.style.backgroundImage = `url(${avatarSalvo})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        } else if (preview) {
            if (icone) icone.style.display = '';
            preview.style.backgroundImage = 'none';
        }
    }

    /**
     * Rola o carrossel de fixados manualmente.
     * @param {number} direcao 
     */
    scrollCarrossel(direcao) {
        this.controladoraInfo.scrollCarrossel(direcao);
    }

    /**
     * Abre o modal para visualizar o post completo.
     * @param {number} id
     */
    abrirModalVisualizarInfo(id) {
        this.controladoraInfo.abrirModalVisualizarInfo(id);
    }

    // ========================
    // NAVEGAÇÃO
    // ========================

    /**
     * Navega entre as abas da aplicação.
     * @param {string} abaNome - 'inicio', 'projetos' ou 'agenda'
     */
    navegarAba(abaNome) {
        document.getElementById('aba-inicio').classList.add('d-none');
        document.getElementById('aba-projetos').classList.add('d-none');
        document.getElementById('aba-agenda').classList.add('d-none');
        document.getElementById('aba-perfil').classList.add('d-none');
        
        const abaAdmin = document.getElementById('aba-admin');
        if (abaAdmin) abaAdmin.classList.add('d-none');

        document.getElementById('aba-' + abaNome).classList.remove('d-none');

        document.getElementById('nav-inicio').classList.remove('active');
        document.getElementById('nav-projetos').classList.remove('active');
        document.getElementById('nav-agenda').classList.remove('active');
        document.getElementById('nav-perfil').classList.remove('active');

        const navAdmin = document.getElementById('nav-admin');
        if (navAdmin) navAdmin.classList.remove('active');

        const navLink = document.getElementById('nav-' + abaNome);
        if (navLink) navLink.classList.add('active');
        
        document.getElementById('menu-opcoes').classList.add('d-none');

        if (abaNome === 'agenda') {
            this.renderizarCalendario();
            this.carregarFeriados();
            
            // Pega o dia ativo ou hoje
            const inputData = document.getElementById('inputDataAgenda');
            let dataFormatada = inputData ? inputData.value : "";
            if (!dataFormatada) {
                const hoje = new Date();
                const diaPadded = String(hoje.getDate()).padStart(2, '0');
                const mesPadded = String(hoje.getMonth() + 1).padStart(2, '0');
                dataFormatada = `${diaPadded}/${mesPadded}/${hoje.getFullYear()}`;
                if (inputData) inputData.value = dataFormatada;
            }
            this.exibirEventosDia(dataFormatada);
        }

        if (abaNome === 'perfil') {
            this.carregarDadosPerfil();
        }

        if (abaNome === 'admin') {
            this.adminCarregarResponsaveis();
        }
    }

    // ========================
    // PAINEL DE ADMINISTRAÇÃO
    // ========================

    async adminCarregarResponsaveis() {
        const container = document.getElementById('lista-usuarios-responsaveis');
        if (!container) return;

        container.innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div> Carregando...</td></tr>`;

        try {
            const users = await this.controladoraAuth.obterResponsaveis();
            container.innerHTML = "";

            if (users.length === 0) {
                container.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum usuário cadastrado.</td></tr>`;
                return;
            }

            const currentUser = this.controladoraAuth.usuarioLogado;

            users.forEach(user => {
                const isSelf = currentUser && currentUser._id === user._id;
                const deleteBtn = isSelf 
                    ? `<button class="btn btn-sm btn-outline-secondary" disabled title="Você não pode excluir sua própria conta"><i class="fa-solid fa-trash"></i> Excluir</button>`
                    : `<button class="btn btn-sm btn-outline-danger" onclick="app.adminExcluirResponsavel('${user._id}')"><i class="fa-solid fa-trash"></i> Excluir</button>`;

                container.innerHTML += `
                    <tr>
                        <td>${user.nome}</td>
                        <td>${user.usuario}</td>
                        <td><span class="badge ${user.perfil === 'Administrador' ? 'bg-primary' : 'bg-secondary'}">${user.perfil}</span></td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-warning" onclick="app.adminAbrirModalEditarSenha('${user._id}', '${user.nome}')">
                                    <i class="fa-solid fa-key"></i> Senha
                                </button>
                                ${deleteBtn}
                            </div>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            console.error(error);
            container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar usuários.</td></tr>`;
        }
    }

    async adminCriarResponsavel(event) {
        event.preventDefault();
        const nome = document.getElementById('adminCadNome').value;
        const usuario = document.getElementById('adminCadUsuario').value;
        const senha = document.getElementById('adminCadSenha').value;
        const perfil = document.getElementById('adminCadPerfil').value;

        try {
            await this.controladoraAuth.registrarResponsavel(nome, usuario, senha, perfil);
            document.getElementById('formAdminCadastrarResponsavel').reset();
            alert("Usuário cadastrado com sucesso!");
            this.adminCarregarResponsaveis();
        } catch (error) {
            alert(error.message || "Erro ao cadastrar usuário.");
        }
    }

    adminAbrirModalEditarSenha(id, nome) {
        document.getElementById('adminEditarSenhaUsuarioId').value = id;
        document.getElementById('adminEditarSenhaNome').value = nome;
        document.getElementById('adminEditarSenhaNova').value = "";
        new bootstrap.Modal(document.getElementById('modalAdminEditarSenha')).show();
    }

    async adminSalvarSenhaResponsavel(event) {
        event.preventDefault();
        const id = document.getElementById('adminEditarSenhaUsuarioId').value;
        const novaSenha = document.getElementById('adminEditarSenhaNova').value;

        try {
            await this.controladoraAuth.alterarSenhaResponsavel(id, novaSenha);
            bootstrap.Modal.getInstance(document.getElementById('modalAdminEditarSenha')).hide();
            alert("Senha atualizada com sucesso!");
        } catch (error) {
            alert(error.message || "Erro ao atualizar senha.");
        }
    }

    async adminExcluirResponsavel(id) {
        if (confirm("Deseja realmente excluir este responsável? Ele perderá acesso ao sistema.")) {
            try {
                await this.controladoraAuth.excluirResponsavel(id);
                alert("Responsável excluído.");
                this.adminCarregarResponsaveis();
            } catch (error) {
                alert(error.message || "Erro ao excluir responsável.");
            }
        }
    }

    /**
     * Alterna a visibilidade do menu de opções.
     */
    toggleMenuOpcoes() {
        const menu = document.getElementById('menu-opcoes');
        menu.classList.toggle('d-none');
    }

    // ========================
    // AGENDA / CALENDÁRIO
    // ========================

    /**
     * Seleciona um dia no calendário.
     * @param {HTMLElement} elementoClicado
     */
    selecionarDia(elementoClicado) {
        const todosOsDias = document.querySelectorAll('.dia-data');
        todosOsDias.forEach(dia => dia.classList.remove('ativo'));
        elementoClicado.classList.add('ativo');

        const diaText = elementoClicado.textContent.trim();
        const mes = this.dataAtualCalendario.getMonth();
        const ano = this.dataAtualCalendario.getFullYear();

        const diaPadded = String(diaText).padStart(2, '0');
        const mesPadded = String(mes + 1).padStart(2, '0');
        const dataFormatada = `${diaPadded}/${mesPadded}/${ano}`;

        const inputData = document.getElementById('inputDataAgenda');
        if (inputData) {
            inputData.value = dataFormatada;
        }

        this.exibirEventosDia(dataFormatada);
    }

    /**
     * Renderiza o calendário mensal.
     */
    renderizarCalendario() {
        const grid = document.getElementById('grid-dias');
        const displayMes = document.getElementById('display-mes');
        const displayAno = document.getElementById('display-ano');

        const ano = this.dataAtualCalendario.getFullYear();
        const mes = this.dataAtualCalendario.getMonth();

        displayMes.innerHTML = `${this.mesesNomes[mes]} <i class="fa-solid fa-caret-down ms-1" style="font-size: 0.7rem;"></i>`;
        displayAno.innerHTML = `${ano} <i class="fa-solid fa-caret-down ms-1" style="font-size: 0.7rem;"></i>`;

        let htmlDias = `
            <div class="dia-semana">D</div><div class="dia-semana">S</div><div class="dia-semana">T</div>
            <div class="dia-semana">Q</div><div class="dia-semana">Q</div><div class="dia-semana">S</div>
            <div class="dia-semana">S</div>
        `;

        const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
        const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();

        for (let i = primeiroDiaDoMes - 1; i >= 0; i--) {
            htmlDias += `<div class="dia-data text-muted opacity-25">${ultimoDiaMesAnterior - i}</div>`;
        }

        const hoje = new Date();
        for (let i = 1; i <= ultimoDiaDoMes; i++) {
            let classeAtivo = '';
            if (i === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                classeAtivo = 'ativo';
            }
            htmlDias += `<div class="dia-data ${classeAtivo}" onclick="app.selecionarDia(this)">${i}</div>`;
        }

        const diasUsados = primeiroDiaDoMes + ultimoDiaDoMes;
        const diasFaltantes = 42 - diasUsados;
        for (let i = 1; i <= diasFaltantes; i++) {
            htmlDias += `<div class="dia-data text-muted opacity-25">${i}</div>`;
        }

        grid.innerHTML = htmlDias;
    }

    /**
     * Avança ou retrocede o mês no calendário.
     * @param {number} direcao - 1 para próximo, -1 para anterior
     */
    mudarMes(direcao) {
        this.dataAtualCalendario.setMonth(this.dataAtualCalendario.getMonth() + direcao);
        this.renderizarCalendario();
    }

    /**
     * Avança ou retrocede o ano no calendário.
     * @param {number} direcao - 1 para próximo, -1 para anterior
     */
    mudarAno(direcao) {
        this.dataAtualCalendario.setFullYear(this.dataAtualCalendario.getFullYear() + direcao);
        this.renderizarCalendario();
    }

    /**
     * Carrega os feriados nacionais da API Brasil.
     */
    async carregarFeriados() {
        const container = document.getElementById('lista-feriados');
        const loader = document.getElementById('loader-api');

        try {
            const resposta = await fetch('https://brasilapi.com.br/api/feriados/v1/2026');
            const feriados = await resposta.json();

            if (loader) loader.remove();

            container.innerHTML = "";

            const primeirosFeriados = feriados.slice(0, 4);

            primeirosFeriados.forEach(feriado => {
                const dataPartes = feriado.date.split('-');
                const dataFormatada = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;

                container.innerHTML += `
                    <div class="col-12 col-md-6">
                        <div class="card card-feed p-2 d-flex flex-row align-items-center gap-3 border-primary" style="border-width: 2px;">
                            <div class="bg-light border border-primary rounded p-3 text-center text-primary" style="width: 80px; height: 70px;">
                                <span class="fw-bold fs-5">${dataPartes[2]}</span>
                                <span class="d-block" style="font-size: 0.6rem;">${dataPartes[1]}</span>
                            </div>
                            <div class="flex-grow-1">
                                <span class="fw-bold small d-block text-primary">${feriado.name}</span>
                                <p class="text-muted mb-0" style="font-size: 0.75rem;">Feriado Nacional</p>
                                <small class="text-secondary" style="font-size: 0.65rem;">Data: ${dataFormatada}</small>
                            </div>
                        </div>
                    </div>
                `;
            });

        } catch (erro) {
            console.error("Erro ao carregar a API:", erro);
            if (loader) loader.innerHTML = "<p class='text-danger small'>Falha ao carregar feriados. Verifique sua internet.</p>";
        }
    }

    /**
     * Abre o modal de cadastro de eventos na agenda, preenchendo a data selecionada.
     */
    agendaAbrirModalAdicionar() {
        const inputData = document.getElementById('inputDataAgenda');
        const activeDate = inputData ? inputData.value : "";
        
        document.getElementById('agendaModalData').value = activeDate;
        document.getElementById('agendaModalTitulo').value = "";
        document.getElementById('agendaModalDesc').value = "";
        
        new bootstrap.Modal(document.getElementById('modalAgenda')).show();
    }

    /**
     * Cria um novo evento no backend.
     */
    async criarEventoAgenda(event) {
        event.preventDefault();
        
        const data = document.getElementById('agendaModalData').value;
        const titulo = document.getElementById('agendaModalTitulo').value;
        const descricao = document.getElementById('agendaModalDesc').value;
        
        try {
            const resposta = await fetch('/api/events', {
                method: 'POST',
                headers: this.controladoraAuth.getAuthHeaders(),
                body: JSON.stringify({ titulo, descricao, data })
            });
            
            const resData = await resposta.json();
            
            if (!resposta.ok) {
                if (resposta.status === 401) {
                    this.logout();
                    return;
                }
                throw new Error(resData.message || "Erro ao criar evento.");
            }
            
            // Fecha modal e reseta formulário
            bootstrap.Modal.getInstance(document.getElementById('modalAgenda')).hide();
            document.getElementById('formAgenda').reset();
            
            alert("Evento agendado com sucesso!");
            
            // Recarrega eventos do dia
            this.exibirEventosDia(data);
        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao agendar compromisso.");
        }
    }

    /**
     * Exclui um evento da agenda no backend.
     */
    async excluirEventoAgenda(id, dataStr) {
        if (!confirm("Deseja realmente remover este compromisso da agenda?")) return;
        
        try {
            const resposta = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
                headers: this.controladoraAuth.getAuthHeaders()
            });
            
            const resData = await resposta.json();
            
            if (!resposta.ok) {
                if (resposta.status === 401) {
                    this.logout();
                    return;
                }
                throw new Error(resData.message || "Erro ao excluir evento.");
            }
            
            alert("Compromisso removido da agenda.");
            this.exibirEventosDia(dataStr);
        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao remover compromisso.");
        }
    }

    /**
     * Busca os eventos do dia e renderiza na tela.
     */
    async exibirEventosDia(dataFormatada) {
        const container = document.getElementById('lista-eventos-container');
        const tituloDia = document.getElementById('agenda-dia-titulo');
        if (!container) return;
        
        if (tituloDia) {
            tituloDia.textContent = dataFormatada;
        }
        
        container.innerHTML = `<div class="col-12 text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> Carregando compromissos...</div>`;
        
        try {
            const resposta = await fetch('/api/events', {
                method: 'GET',
                headers: this.controladoraAuth.getAuthHeaders()
            });
            
            if (!resposta.ok) {
                if (resposta.status === 401) {
                    this.logout();
                    return;
                }
                container.innerHTML = `<div class="col-12 text-center text-danger">Erro ao carregar compromissos.</div>`;
                return;
            }
            
            const eventos = await resposta.json();
            
            // Filtra os eventos da data selecionada
            const eventosDia = eventos.filter(ev => ev.data === dataFormatada);
            
            container.innerHTML = "";
            
            if (eventosDia.length === 0) {
                container.innerHTML = `<div class="col-12 text-center text-muted py-3">Nenhum compromisso agendado para este dia.</div>`;
                return;
            }
            
            eventosDia.forEach(ev => {
                const deleteBtn = this.controladoraAuth.verificarAdm() 
                    ? `<button class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2 apenas-admin" onclick="app.excluirEventoAgenda('${ev._id}', '${dataFormatada}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>`
                    : ``;
                    
                container.innerHTML += `
                    <div class="col-12">
                        <div class="card card-fixado p-3 border-2 position-relative">
                            ${deleteBtn}
                            <span class="fw-bold small d-block text-dark pe-4">${ev.titulo}</span>
                            <p class="text-muted small mb-0 mt-1">${ev.descricao}</p>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Erro ao exibir eventos:", error);
            container.innerHTML = `<div class="col-12 text-center text-danger">Erro ao processar compromissos.</div>`;
        }
    }

    /**
     * Carrega todos os informativos na aba Feed do Painel Admin.
     */
    async adminCarregarInformativos() {
        const container = document.getElementById('admin-lista-feed');
        if (!container) return;

        container.innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border spinner-border-sm text-success"></div> Carregando feed...</td></tr>`;

        try {
            const resposta = await fetch('/api/informatives', {
                method: 'GET',
                headers: this.controladoraAuth.getAuthHeaders()
            });

            if (!resposta.ok) {
                if (resposta.status === 401) {
                    this.logout();
                    return;
                }
                container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar feed.</td></tr>`;
                return;
            }

            const informativos = await resposta.json();
            container.innerHTML = "";

            if (informativos.length === 0) {
                container.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum informativo no feed.</td></tr>`;
                return;
            }

            // Mais novos primeiro
            informativos.slice().reverse().forEach(info => {
                const capa = info.imagem 
                    ? `<img src="${info.imagem}" style="width: 50px; height: 40px; object-fit: cover; border-radius: 4px;" alt="Capa">`
                    : `<div class="bg-light text-muted border text-center py-1" style="width: 50px; height: 40px; border-radius: 4px; font-size: 0.6rem;"><i class="fa-regular fa-image"></i></div>`;

                const pinIcon = info.fixado 
                    ? `<i class="fa-solid fa-thumbtack text-danger cursor-pointer fs-5" onclick="app.adminAlternarFixado('${info._id}')" title="Desfixar"></i>`
                    : `<i class="fa-solid fa-thumbtack text-secondary cursor-pointer fs-5" style="transform: rotate(45deg);" onclick="app.adminAlternarFixado('${info._id}')" title="Fixar"></i>`;

                container.innerHTML += `
                    <tr>
                        <td>${capa}</td>
                        <td class="text-truncate" style="max-width: 250px;"><strong>${info.titulo}</strong></td>
                        <td>${pinIcon}</td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-success" onclick="app.abrirModalEditarInfo('${info._id}')">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="app.adminExcluirInfo('${info._id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            console.error(error);
            container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro de rede ao carregar feed.</td></tr>`;
        }
    }

    async adminAlternarFixado(id) {
        try {
            await this.controladoraInfo.alternarFixado(id);
            this.adminCarregarInformativos();
        } catch (error) {
            console.error(error);
        }
    }

    async adminExcluirInfo(id) {
        if (confirm("Deseja realmente excluir este informativo permanentemente?")) {
            try {
                const resposta = await fetch(`/api/informatives/${id}`, {
                    method: 'DELETE',
                    headers: this.controladoraAuth.getAuthHeaders()
                });

                if (resposta.ok) {
                    alert("Informativo excluído.");
                    this.controladoraInfo.carregarInformativos();
                    this.controladoraInfo.carregarFixados();
                    this.adminCarregarInformativos();
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao excluir informativo.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão.");
            }
        }
    }

    /**
     * Carrega todos os projetos na aba Projetos do Painel Admin.
     */
    async adminCarregarProjetos() {
        const container = document.getElementById('admin-lista-projetos');
        if (!container) return;

        container.innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border spinner-border-sm text-warning"></div> Carregando projetos...</td></tr>`;

        try {
            const resposta = await fetch('/api/projects', {
                method: 'GET',
                headers: this.controladoraAuth.getAuthHeaders()
            });

            if (!resposta.ok) {
                if (resposta.status === 401) {
                    this.logout();
                    return;
                }
                container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar projetos.</td></tr>`;
                return;
            }

            const projetos = await resposta.json();
            container.innerHTML = "";

            if (projetos.length === 0) {
                container.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum projeto cadastrado.</td></tr>`;
                return;
            }

            projetos.slice().reverse().forEach(proj => {
                const capa = proj.imagem 
                    ? `<img src="${proj.imagem}" style="width: 50px; height: 40px; object-fit: cover; border-radius: 4px;" alt="Capa">`
                    : `<div class="bg-light text-muted border text-center py-1" style="width: 50px; height: 40px; border-radius: 4px; font-size: 0.6rem;"><i class="fa-regular fa-image"></i></div>`;

                container.innerHTML += `
                    <tr>
                        <td>${capa}</td>
                        <td class="text-truncate" style="max-width: 250px;"><strong>${proj.titulo}</strong></td>
                        <td><span class="badge bg-warning text-dark">${proj.turma}</span></td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-warning text-dark fw-bold" onclick="app.exibirEdicaoProjeto('${proj._id}')">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="app.adminExcluirProjeto('${proj._id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            console.error(error);
            container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro de rede ao carregar projetos.</td></tr>`;
        }
    }

    async adminExcluirProjeto(id) {
        if (confirm("Deseja realmente excluir este projeto permanentemente?")) {
            try {
                const resposta = await fetch(`/api/projects/${id}`, {
                    method: 'DELETE',
                    headers: this.controladoraAuth.getAuthHeaders()
                });

                if (resposta.ok) {
                    alert("Projeto excluído.");
                    this.controladoraProjetos.exibirProjetos();
                    this.adminCarregarProjetos();
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao excluir projeto.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão.");
            }
        }
    }

    /**
     * Carrega todos os eventos na aba Agenda do Painel Admin.
     */
    async adminCarregarEventos() {
        const container = document.getElementById('admin-lista-eventos');
        if (!container) return;

        container.innerHTML = `<tr><td colspan="4" class="text-center"><div class="spinner-border spinner-border-sm text-danger"></div> Carregando compromissos...</td></tr>`;

        try {
            const resposta = await fetch('/api/events', {
                method: 'GET',
                headers: this.controladoraAuth.getAuthHeaders()
            });

            if (!resposta.ok) {
                if (resposta.status === 401) {
                    this.logout();
                    return;
                }
                container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar compromissos.</td></tr>`;
                return;
            }

            const eventos = await resposta.json();
            container.innerHTML = "";

            if (eventos.length === 0) {
                container.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum evento na agenda.</td></tr>`;
                return;
            }

            eventos.slice().reverse().forEach(ev => {
                container.innerHTML += `
                    <tr>
                        <td><span class="badge bg-danger">${ev.data}</span></td>
                        <td class="text-truncate fw-bold" style="max-width: 180px;">${ev.titulo}</td>
                        <td class="text-truncate text-muted small" style="max-width: 250px;">${ev.descricao}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger" onclick="app.adminExcluirEvento('${ev._id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            console.error(error);
            container.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro de rede ao carregar compromissos.</td></tr>`;
        }
    }

    async adminExcluirEvento(id) {
        if (confirm("Deseja realmente excluir este compromisso da agenda permanentemente?")) {
            try {
                const resposta = await fetch(`/api/events/${id}`, {
                    method: 'DELETE',
                    headers: this.controladoraAuth.getAuthHeaders()
                });

                if (resposta.ok) {
                    alert("Compromisso excluído da agenda.");
                    this.adminCarregarEventos();
                    
                    const inputData = document.getElementById('inputDataAgenda');
                    if (inputData && inputData.value) {
                        this.exibirEventosDia(inputData.value);
                    }
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao excluir compromisso.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão.");
            }
        }
    }
}
