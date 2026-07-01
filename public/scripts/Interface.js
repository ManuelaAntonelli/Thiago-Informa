/**
 * Interface (Facade Pattern + Composition Root)
 *
 * Responsabilidade: ser o ponto de acesso único do sistema,
 * delegando operações para as controladoras especializadas.
 *
 * Também atua como Composition Root (DIP): instancia todos os services
 * e os injeta nas controladoras, sendo o único lugar no frontend onde
 * dependências concretas são criadas.
 *
 * Princípios SOLID aplicados:
 *  - DIP: Cria HttpClient e os services; injeta-os nas controladoras.
 *  - ISP: Cada controladora recebe apenas o service que utiliza.
 *  - OCP: Para trocar a implementação de um service, basta substituir
 *         a instância aqui sem modificar nenhuma controladora.
 */
class Interface {

    constructor() {
        // === COMPOSITION ROOT (DIP) ===
        // Único ponto no frontend onde dependências concretas são instanciadas.
        const httpClient = new HttpClient();

        // Services segregados por domínio (ISP)
        const authService = new AuthService(httpClient);
        const informativoService = new InformativoService(httpClient);
        const projetoService = new ProjetoService(httpClient);
        this.eventoService = new EventoService(httpClient);

        // Controllers recebem apenas o service que precisam (DIP + ISP)
        this.controladoraAuth = new ControladoraAutenticacao(authService);
        this.controladoraInfo = new ControladoraInformativo(informativoService);
        this.controladoraProjetos = new ControladoraProjetos(projetoService);

        this.dataAtualCalendario = new Date();
        this.mesesNomes = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

        // Verifica se está rodando via file:///
        if (window.location.protocol === 'file:') {
            setTimeout(() => {
                const aviso = document.getElementById('aviso-servidor');
                if (aviso) aviso.classList.remove('d-none');
            }, 50);
        }

        // Auto-login via cookie HttpOnly: verifica sessão ativa no servidor
        this.controladoraAuth.verificarSessao().then((logado) => {
            if (logado) {
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
                    this._carregarAvatarSalvo();
                }
            }
        });
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
     * Realiza o logout: limpa o cookie via API e retorna à tela de login.
     */
    async logout() {
        await this.controladoraAuth.logout();

        document.getElementById('menu-opcoes').classList.add('d-none');
        document.getElementById('tela-home').classList.add('d-none');
        document.getElementById('tela-login').classList.remove('d-none');

        document.getElementById('loginForm').reset();
    }

    // ========================
    // PROJETOS (delegação)
    // ========================

    /**
     * Abre o modal de novo projeto, resetando o cache de imagens antes.
     */
    abrirModalNovoProjeto() {
        this.controladoraProjetos.resetarModalCriar();
        new bootstrap.Modal(document.getElementById('modalProjeto')).show();
    }

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
     * Restaura o avatar do usuário logado (salvo no MongoDB) na UI.
     * Usado após login ou recarregamento via cookie.
     * @private
     */
    _carregarAvatarSalvo() {
        const user = this.controladoraAuth.usuarioLogado;
        if (!user || !user.avatar) return;

        // Avatar no perfil
        const previewPerfil = document.getElementById('perfilAvatarPreview');
        const iconePerfil = document.getElementById('perfilAvatarIcone');
        if (previewPerfil) {
            if (iconePerfil) iconePerfil.style.display = 'none';
            previewPerfil.style.backgroundImage = `url(${user.avatar})`;
            previewPerfil.style.backgroundSize = 'cover';
            previewPerfil.style.backgroundPosition = 'center';
        }
    }

    /**
     * Carrega a foto do avatar do perfil, salva no MongoDB via API e atualiza a UI.
     * @param {HTMLInputElement} inputElement
     */
    carregarAvatarPerfil(inputElement) {
        if (inputElement.files && inputElement.files[0]) {
            const leitor = new FileReader();
            leitor.onload = async (e) => {
                const base64 = e.target.result;

                // Atualiza preview imediatamente
                const preview = document.getElementById('perfilAvatarPreview');
                const icone = document.getElementById('perfilAvatarIcone');
                if (preview) {
                    if (icone) icone.style.display = 'none';
                    preview.style.backgroundImage = `url(${base64})`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                }

                // Persiste no MongoDB via AuthService (DIP)
                try {
                    const resposta = await this.controladoraAuth.authService.updateProfile({ avatar: base64 });

                    if (resposta.ok) {
                        const data = await resposta.json();
                        this.controladoraAuth.usuarioLogado = data;
                    } else {
                        console.error('Erro ao salvar avatar no MongoDB.');
                    }
                } catch (error) {
                    console.error('Erro de conexão ao salvar avatar:', error);
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

        // Carrega avatar do MongoDB (campo avatar do usuário logado)
        const preview = document.getElementById('perfilAvatarPreview');
        const icone = document.getElementById('perfilAvatarIcone');
        if (user.avatar && preview) {
            if (icone) icone.style.display = 'none';
            preview.style.backgroundImage = `url(${user.avatar})`;
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

        if (abaNome === 'inicio') {
            this.carregarInformativos();
        }

        if (abaNome === 'projetos') {
            this.exibirProjetos();
        }

        if (abaNome === 'agenda') {
            // Define o dia ativo: mantém o selecionado ou usa hoje
            if (!this._dataAtivaSelecionada) {
                this._dataAtivaSelecionada = new Date().toISOString().split('T')[0];
            }
            const inputData = document.getElementById('inputDataAgenda');
            if (inputData) inputData.value = this._isoParaBr(this._dataAtivaSelecionada);

            this.renderizarCalendario(); // já carrega feriados e eventos para o grid
            // carregarFeriados removido (seção de lista removida do HTML)
            this.exibirEventosDia(this._dataAtivaSelecionada);
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
        if (!confirm("Deseja realmente excluir este responsável? Ele perderá acesso ao sistema.")) return;
        
        try {
            await this.controladoraAuth.excluirResponsavel(id);
            alert("Responsável excluído.");
            this.adminCarregarResponsaveis();
        } catch (error) {
            alert(error.message || "Erro ao excluir responsável.");
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
     * Converte uma data no formato ISO (yyyy-mm-dd) para DD/MM/AAAA.
     * @param {string} iso
     * @returns {string}
     */
    _isoParaBr(iso) {
        const [a, m, d] = iso.split('-');
        return `${d}/${m}/${a}`;
    }

    /**
     * Converte uma data no formato DD/MM/AAAA para ISO (yyyy-mm-dd).
     * @param {string} br
     * @returns {string}
     */
    _brParaIso(br) {
        const [d, m, a] = br.split('/');
        return `${a}-${m}-${d}`;
    }

    /**
     * Seleciona um dia no calendário.
     * @param {HTMLElement} elementoClicado
     * @param {string} isoDate - data no formato yyyy-mm-dd
     */
    selecionarDia(elementoClicado, isoDate) {
        const todosOsDias = document.querySelectorAll('.dia-data');
        todosOsDias.forEach(dia => dia.classList.remove('ativo'));
        elementoClicado.classList.add('ativo');

        this._dataAtivaSelecionada = isoDate;

        const inputData = document.getElementById('inputDataAgenda');
        if (inputData) {
            inputData.value = this._isoParaBr(isoDate);
        }

        this.exibirEventosDia(isoDate);
    }

    /**
     * Renderiza o calendário mensal com pontos indicando eventos e feriados.
     */
    async renderizarCalendario() {
        const grid = document.getElementById('grid-dias');
        const displayMes = document.getElementById('display-mes');
        const displayAno = document.getElementById('display-ano');

        const ano = this.dataAtualCalendario.getFullYear();
        const mes = this.dataAtualCalendario.getMonth();

        displayMes.innerHTML = `${this.mesesNomes[mes]} <i class="fa-solid fa-caret-down ms-1" style="font-size: 0.7rem;"></i>`;
        displayAno.innerHTML = `${ano} <i class="fa-solid fa-caret-down ms-1" style="font-size: 0.7rem;"></i>`;

        // Busca em paralelo: eventos do MongoDB + feriados da API
        let eventosDates = new Set();
        let feriadosDates = new Map(); // 'yyyy-mm-dd' -> nome do feriado

        try {
            const [resEventos, feriados] = await Promise.all([
                this.eventoService.getAll(),
                this._obterFeriadosCache(ano)
            ]);

            if (resEventos.ok) {
                const eventos = await resEventos.json();
                eventos.forEach(ev => {
                    // eventos salvos como DD/MM/AAAA → converte para ISO para comparar
                    if (ev.data && ev.data.includes('/')) {
                        eventosDates.add(this._brParaIso(ev.data));
                    } else if (ev.data) {
                        eventosDates.add(ev.data);
                    }
                });
            }

            feriados.forEach(f => feriadosDates.set(f.date, f.name));
        } catch (e) {
            console.warn('Erro ao carregar marcadores do calendário:', e);
        }

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
            const mesPadded = String(mes + 1).padStart(2, '0');
            const diaPadded = String(i).padStart(2, '0');
            const isoDate = `${ano}-${mesPadded}-${diaPadded}`;

            const isHoje = (i === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear());
            const classeAtivo = isHoje ? 'ativo' : '';
            const temEvento = eventosDates.has(isoDate);
            const temFeriado = feriadosDates.has(isoDate);
            const nomeFeriado = feriadosDates.get(isoDate) || '';

            const tooltip = nomeFeriado ? ` title="${nomeFeriado}"` : '';

            const pontos = (temEvento || temFeriado) ? `
                <span class="dia-pontos">
                    ${temEvento ? '<span class="dia-ponto dia-ponto--evento"></span>' : ''}
                    ${temFeriado ? '<span class="dia-ponto dia-ponto--feriado"></span>' : ''}
                </span>` : '';

            htmlDias += `<div class="dia-data ${classeAtivo}" onclick="app.selecionarDia(this, '${isoDate}')"${tooltip}>${i}${pontos}</div>`;
        }

        const diasUsados = primeiroDiaDoMes + ultimoDiaDoMes;
        const diasFaltantes = 42 - diasUsados;
        for (let i = 1; i <= diasFaltantes; i++) {
            htmlDias += `<div class="dia-data text-muted opacity-25">${i}</div>`;
        }

        grid.innerHTML = htmlDias;

        // Se já havia um dia selecionado, re-seleciona
        if (this._dataAtivaSelecionada) {
            const diaEl = grid.querySelector(`[onclick*="${this._dataAtivaSelecionada}"]`);
            if (diaEl) {
                diaEl.classList.add('ativo');
            }
        }
    }

    /**
     * Obtém feriados do cache ou da API.
     * @param {number} ano
     * @returns {Promise<Array>}
     */
    async _obterFeriadosCache(ano) {
        if (!this._feriadosCache) this._feriadosCache = {};
        if (this._feriadosCache[ano]) return this._feriadosCache[ano];

        try {
            const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
            const feriados = await resposta.json();
            this._feriadosCache[ano] = Array.isArray(feriados) ? feriados : [];
        } catch (e) {
            console.warn('Brasil API indisponível:', e);
            this._feriadosCache[ano] = [];
        }
        return this._feriadosCache[ano];
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
     * Carrega os feriados nacionais da API Brasil e renderiza na seção da agenda.
     * Utiliza cache para evitar chamadas repetidas.
     */
    async carregarFeriados() {
        const container = document.getElementById('lista-feriados');
        const loader = document.getElementById('loader-api');

        try {
            const ano = new Date().getFullYear();
            const feriados = await this._obterFeriadosCache(ano);

            if (loader) loader.remove();
            container.innerHTML = "";

            if (!feriados || feriados.length === 0) {
                container.innerHTML = `<div class="col-12 text-center text-muted small">Nenhum feriado encontrado para ${ano}.</div>`;
                return;
            }

            // Mostra apenas os próximos 6 feriados a partir de hoje
            const hoje = new Date();
            const proximos = feriados
                .filter(f => new Date(f.date + 'T00:00:00') >= hoje)
                .slice(0, 6);

            const lista = proximos.length > 0 ? proximos : feriados.slice(0, 6);

            lista.forEach(feriado => {
                const dataPartes = feriado.date.split('-');
                const dataFormatada = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
                const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
                const nomeMes = meses[parseInt(dataPartes[1]) - 1];

                container.innerHTML += `
                    <div class="col-12 col-md-6">
                        <div class="card card-feed p-2 d-flex flex-row align-items-center gap-3 border-primary" style="border-width: 2px; cursor:pointer;"
                             onclick="app.selecionarDiaFeriado('${feriado.date}')" title="Ver ${feriado.date} no calendário">
                            <div class="bg-light border border-primary rounded p-3 text-center text-primary" style="width: 80px; height: 70px;">
                                <span class="fw-bold fs-5">${dataPartes[2]}</span>
                                <span class="d-block" style="font-size: 0.6rem;">${nomeMes}</span>
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
     * Navega o calendário até o mês do feriado e marca o dia.
     * @param {string} isoDate - formato yyyy-mm-dd
     */
    selecionarDiaFeriado(isoDate) {
        const [ano, mes] = isoDate.split('-').map(Number);
        this.dataAtualCalendario = new Date(ano, mes - 1, 1);
        this.renderizarCalendario().then(() => {
            const grid = document.getElementById('grid-dias');
            const diaEl = grid.querySelector(`[onclick*="${isoDate}"]`);
            if (diaEl) {
                diaEl.classList.add('ativo');
                this._dataAtivaSelecionada = isoDate;
                document.getElementById('inputDataAgenda').value = this._isoParaBr(isoDate);
                this.exibirEventosDia(isoDate);
                // Rola até o calendário
                document.getElementById('aba-agenda').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /**
     * Abre o modal de cadastro de eventos na agenda, preenchendo a data selecionada.
     */
    agendaAbrirModalAdicionar() {
        const iso = this._dataAtivaSelecionada || new Date().toISOString().split('T')[0];
        document.getElementById('agendaModalData').value = iso;
        document.getElementById('agendaModalTitulo').value = "";
        document.getElementById('agendaModalDesc').value = "";
        new bootstrap.Modal(document.getElementById('modalAgenda')).show();
    }

    /**
     * Cria um novo evento no backend.
     * O campo de data do modal agora é ISO (yyyy-mm-dd); converte para DD/MM/AAAA antes de salvar.
     */
    async criarEventoAgenda(event) {
        event.preventDefault();

        const isoDate = document.getElementById('agendaModalData').value;
        const titulo = document.getElementById('agendaModalTitulo').value;
        const descricao = document.getElementById('agendaModalDesc').value;

        // Converte para DD/MM/AAAA (formato armazenado no MongoDB)
        const data = this._isoParaBr(isoDate);

        try {
            const resposta = await this.eventoService.create({ titulo, descricao, data });
            const resData = await resposta.json();

            if (!resposta.ok) {
                if (resposta.status === 401) { this.logout(); return; }
                throw new Error(resData.message || "Erro ao criar evento.");
            }

            bootstrap.Modal.getInstance(document.getElementById('modalAgenda')).hide();
            document.getElementById('formAgenda').reset();

            alert("Evento agendado com sucesso!");

            // Atualiza o calendário e os eventos do dia
            await this.renderizarCalendario();
            this.exibirEventosDia(isoDate);

            // Atualiza painel admin se estiver aberto
            if (typeof this.adminCarregarEventos === 'function') {
                this.adminCarregarEventos();
            }
        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao agendar compromisso.");
        }
    }

    /**
     * Exclui um evento da agenda no backend.
     * @param {string} id
     * @param {string} isoDate - formato yyyy-mm-dd
     */
    async excluirEventoAgenda(id, isoDate) {
        if (!confirm("Deseja realmente remover este compromisso da agenda?")) return;

        try {
            const resposta = await this.eventoService.remove(id);
            const resData = await resposta.json();

            if (!resposta.ok) {
                if (resposta.status === 401) { this.logout(); return; }
                throw new Error(resData.message || "Erro ao excluir evento.");
            }

            alert("Compromisso removido da agenda.");
            await this.renderizarCalendario();
            this.exibirEventosDia(isoDate);
        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao remover compromisso.");
        }
    }

    /**
     * Busca os eventos do dia e renderiza na tela.
     * @param {string} isoDate - formato yyyy-mm-dd
     */
    async exibirEventosDia(isoDate) {
        const container = document.getElementById('lista-eventos-container');
        const tituloDia = document.getElementById('agenda-dia-titulo');
        if (!container) return;

        const dataBr = this._isoParaBr(isoDate);
        if (tituloDia) tituloDia.textContent = dataBr;

        container.innerHTML = `<div class="col-12 text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> Carregando compromissos...</div>`;

        try {
            const [resEventos, feriados] = await Promise.all([
                this.eventoService.getAll(),
                this._obterFeriadosCache(parseInt(isoDate.split('-')[0]))
            ]);

            if (!resEventos.ok) {
                if (resEventos.status === 401) { this.logout(); return; }
                container.innerHTML = `<div class="col-12 text-center text-danger">Erro ao carregar compromissos.</div>`;
                return;
            }

            const eventos = await resEventos.json();
            // Eventos armazenados como DD/MM/AAAA
            const eventosDia = eventos.filter(ev => ev.data === dataBr);

            // Verifica feriado
            const feriado = feriados.find(f => f.date === isoDate);

            container.innerHTML = "";

            // Card de feriado nacional (se houver)
            if (feriado) {
                container.innerHTML += `
                    <div class="col-12">
                        <div class="card p-3 border-primary border-2 d-flex flex-row align-items-center gap-3">
                            <i class="fa-solid fa-flag text-primary fs-4"></i>
                            <div>
                                <span class="fw-bold small d-block text-primary">Feriado Nacional</span>
                                <p class="mb-0 text-muted small">${feriado.name}</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (eventosDia.length === 0 && !feriado) {
                container.innerHTML = `<div class="col-12 text-center text-muted py-3">Nenhum compromisso agendado para este dia.</div>`;
                return;
            }

            eventosDia.forEach(ev => {
                const deleteBtn = this.controladoraAuth.verificarAdm()
                    ? `<button class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2" onclick="app.excluirEventoAgenda('${ev._id}', '${isoDate}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>`
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
            const resposta = await this.controladoraInfo.informativoService.getAll();

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
            const resposta = await this.controladoraInfo.informativoService.togglePin(id);
            
            if (!resposta.ok) {
                const data = await resposta.json();
                alert(data.message || 'Erro ao alternar fixação.');
                return;
            }
            
            this.controladoraInfo.carregarInformativos();
            this.controladoraInfo.carregarFixados();
            this.adminCarregarInformativos();
        } catch (error) {
            console.error(error);
            alert('Erro de conexão.');
        }
    }

    async adminExcluirInfo(id) {
        if (!confirm("Deseja realmente excluir este informativo permanentemente?")) return;
        
        try {
            const resposta = await this.controladoraInfo.informativoService.remove(id);
            
            if (!resposta.ok) {
                const data = await resposta.json();
                alert(data.message || "Erro ao excluir informativo.");
                return;
            }
            
            alert("Informativo excluído.");
            this.controladoraInfo.carregarInformativos();
            this.controladoraInfo.carregarFixados();
            this.adminCarregarInformativos();
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
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
            const resposta = await this.controladoraProjetos.projetoService.getAll();

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
                        <td class="text-truncate" style="max-width: 250px;"><strong>${proj.nome_projeto}</strong></td>
                        <td><span class="badge bg-warning text-dark">${proj.turma}</span></td>
                        <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-warning text-dark fw-bold" onclick="app.abrirModalEditar('${proj._id}')">
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
        if (!confirm("Deseja realmente excluir este projeto permanentemente?")) return;
        
        try {
            const resposta = await this.controladoraProjetos.projetoService.remove(id);
            
            if (!resposta.ok) {
                const data = await resposta.json();
                alert(data.message || "Erro ao excluir projeto.");
                return;
            }
            
            alert("Projeto excluído.");
            this.controladoraProjetos.exibirProjetos();
            this.adminCarregarProjetos();
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
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
            const resposta = await this.eventoService.getAll();

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
        if (!confirm("Deseja realmente excluir este compromisso da agenda permanentemente?")) return;
        
        try {
            const resposta = await this.eventoService.remove(id);

            if (!resposta.ok) {
                const data = await resposta.json();
                alert(data.message || "Erro ao excluir compromisso.");
                return;
            }
            
            alert("Compromisso excluído da agenda.");
            this.adminCarregarEventos();
            await this.renderizarCalendario();

            if (this._dataAtivaSelecionada) {
                this.exibirEventosDia(this._dataAtivaSelecionada);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
}
