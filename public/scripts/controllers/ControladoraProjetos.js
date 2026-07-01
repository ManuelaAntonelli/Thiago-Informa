/**
 * ControladoraProjetos
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — orquestrar a UI de projetos (DOM e estado).
 *  - DIP: Recebe projetoService via construtor em vez de instanciar fetch diretamente.
 */

// Cache global de imagens (evita problemas de contexto 'this' em eventos inline)
window._imgCache = { criar: [], editar: [] };

class ControladoraProjetos {

    constructor(projetoService) {
        this.projetoService = projetoService;
        this.listaProjetos = [];
    }

    // ========================
    // HELPERS DE IMAGEM
    // ========================

    /**
     * Converte um File para base64.
     * @param {File} file
     * @returns {Promise<string>}
     */
    _fileParaBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Falha ao ler arquivo: ' + file.name));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Adiciona imagens selecionadas ao cache global e renderiza miniaturas.
     * Chamado pelo onchange do input[type=file].
     * @param {HTMLInputElement} input
     * @param {string} containerId
     * @param {'criar'|'editar'} modo
     */
    async adicionarImagens(input, containerId, modo) {
        if (!input.files || input.files.length === 0) return;

        const cache = window._imgCache[modo];
        console.log(`[adicionarImagens] modo=${modo} | arquivos selecionados: ${input.files.length}`);

        for (const file of Array.from(input.files)) {
            try {
                const base64 = await this._fileParaBase64(file);
                cache.push(base64);
                console.log(`[adicionarImagens] adicionada: ${file.name} (${(base64.length / 1024).toFixed(0)} KB base64)`);
            } catch (err) {
                console.error('[adicionarImagens] Erro ao converter arquivo:', err);
            }
        }

        // Limpa o input para permitir re-seleção
        try { input.value = ''; } catch(e) {}

        this._renderizarMiniaturas(containerId, cache, modo);
        console.log(`[adicionarImagens] cache ${modo} agora tem ${cache.length} imagem(ns)`);
    }

    /**
     * Renderiza a grade de miniaturas.
     * @param {string} containerId
     * @param {string[]} imagens
     * @param {'criar'|'editar'} modo
     */
    _renderizarMiniaturas(containerId, imagens, modo) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[_renderizarMiniaturas] container não encontrado:', containerId);
            return;
        }

        if (!imagens || imagens.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fa-regular fa-image fs-1 mb-2 d-block"></i>
                    <span class="small">Nenhuma imagem selecionada</span>
                </div>`;
            return;
        }

        container.innerHTML = imagens.map((src, i) => `
            <div class="miniatura-img-wrapper position-relative">
                <img src="${src}" class="miniatura-img" alt="Imagem ${i + 1}">
                <button type="button" class="miniatura-remover"
                    onclick="app.controladoraProjetos.removerImagem(${i}, '${containerId}', '${modo}')"
                    title="Remover">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Remove uma imagem do cache pelo índice.
     */
    removerImagem(index, containerId, modo) {
        window._imgCache[modo].splice(index, 1);
        this._renderizarMiniaturas(containerId, window._imgCache[modo], modo);
    }

    // ========================
    // CRIAR PROJETO
    // ========================

    /**
     * Reseta o estado do modal de criação.
     * Chamado quando o modal #modalProjeto abre.
     */
    resetarModalCriar() {
        window._imgCache.criar = [];
        this._renderizarMiniaturas('previewContainerProjetoCriar', [], 'criar');
        const form = document.getElementById('formProjeto');
        if (form) form.reset();
        console.log('[resetarModalCriar] cache criar limpo');
    }

    async criarProjeto() {
        const nome = document.getElementById('inputNomeProjeto').value;
        const desc = document.getElementById('inputDescProjeto').value;
        const turma = document.getElementById('inputTurmaProjeto').value;

        if (!nome.trim() || !desc.trim()) {
            alert('Preencha o nome e a descrição do projeto!');
            return;
        }

        // Lê do cache global
        const imagensParaEnviar = [...window._imgCache.criar];
        console.log(`[criarProjeto] Enviando projeto "${nome}" com ${imagensParaEnviar.length} imagem(ns)`);

        try {
            const resposta = await this.projetoService.create({
                nome_projeto: nome,
                descricao: desc,
                turma,
                imagens: imagensParaEnviar
            });

            if (!resposta.ok) {
                const data = await resposta.json();
                console.error('[criarProjeto] Erro da API:', data);
                alert(data.message || 'Erro ao criar projeto.');
                return;
            }

            const criado = await resposta.json();
            console.log(`[criarProjeto] ✅ Projeto criado: ${criado.nome_projeto} | imagens salvas: ${criado.imagens?.length ?? 0}`);

            // Limpa estado
            window._imgCache.criar = [];
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalProjeto'));
            if (modal) modal.hide();

            this.exibirProjetos();
            if (typeof app.adminCarregarProjetos === 'function') app.adminCarregarProjetos();
        } catch (error) {
            console.error('[criarProjeto] Erro:', error);
            alert('Erro de conexão com o servidor.');
        }
    }

    // ========================
    // EDITAR PROJETO
    // ========================

    abrirModalEditar(id) {
        const projeto = this.listaProjetos.find(p => p._id === id);
        if (!projeto) return;

        document.getElementById('editIdProjeto').value = projeto._id;
        document.getElementById('editNomeProjeto').value = projeto.nome_projeto;
        document.getElementById('editDescProjeto').value = projeto.descricao;
        document.getElementById('editTurmaProjeto').value = projeto.turma;

        // Normaliza imagens existentes
        const existentes = Array.isArray(projeto.imagens) && projeto.imagens.length > 0
            ? projeto.imagens
            : (projeto.imagem ? [projeto.imagem] : []);

        window._imgCache.editar = [...existentes];
        this._renderizarMiniaturas('previewContainerProjetoEditar', window._imgCache.editar, 'editar');
        console.log(`[abrirModalEditar] projeto "${projeto.nome_projeto}" | imagens existentes: ${existentes.length}`);

        new bootstrap.Modal(document.getElementById('modalEditarProjeto')).show();
    }

    async editarProjeto() {
        const id = document.getElementById('editIdProjeto').value;
        const novoNome = document.getElementById('editNomeProjeto').value;
        const novaDesc = document.getElementById('editDescProjeto').value;
        const novaTurma = document.getElementById('editTurmaProjeto').value;

        if (!novoNome.trim() || !novaDesc.trim()) {
            alert('Preencha o nome e a descrição do projeto!');
            return;
        }

        const imagensParaEnviar = [...window._imgCache.editar];
        console.log(`[editarProjeto] Atualizando "${novoNome}" com ${imagensParaEnviar.length} imagem(ns)`);

        try {
            const resposta = await this.projetoService.update(id, {
                nome_projeto: novoNome,
                descricao: novaDesc,
                turma: novaTurma,
                imagens: imagensParaEnviar
            });

            if (!resposta.ok) {
                const data = await resposta.json();
                console.error('[editarProjeto] Erro da API:', data);
                alert(data.message || 'Erro ao atualizar projeto.');
                return;
            }

            const atualizado = await resposta.json();
            console.log(`[editarProjeto] ✅ Projeto atualizado: ${atualizado.nome_projeto} | imagens: ${atualizado.imagens?.length ?? 0}`);

            window._imgCache.editar = [];
            bootstrap.Modal.getInstance(document.getElementById('modalEditarProjeto')).hide();
            this.exibirProjetos();
            if (typeof app.adminCarregarProjetos === 'function') app.adminCarregarProjetos();
        } catch (error) {
            console.error('[editarProjeto] Erro:', error);
            alert('Erro de conexão com o servidor.');
        }
    }

    // ========================
    // VISUALIZAR PROJETO (CAROUSEL)
    // ========================

    abrirVisualizarProjeto(id) {
        const projeto = this.listaProjetos.find(p => p._id === id);
        if (!projeto) return;

        const imagens = Array.isArray(projeto.imagens) && projeto.imagens.length > 0
            ? projeto.imagens
            : (projeto.imagem ? [projeto.imagem] : []);

        document.getElementById('visualizarProjetoNome').textContent = projeto.nome_projeto;
        document.getElementById('visualizarProjetoTurma').textContent = projeto.turma;
        document.getElementById('visualizarProjetoDesc').textContent = projeto.descricao;
        document.getElementById('visualizarProjetoData').textContent = `Criado em: ${projeto.data_criacao}`;

        const carouselInner = document.getElementById('visualizarCarouselInner');
        const carouselIndicadores = document.getElementById('visualizarCarouselIndicadores');
        const semImagem = document.getElementById('visualizarSemImagem');
        const carouselEl = document.getElementById('visualizarCarousel');

        if (imagens.length === 0) {
            carouselEl.classList.add('d-none');
            semImagem.classList.remove('d-none');
            const isAdmin = typeof app !== 'undefined' && app.controladoraAuth && app.controladoraAuth.verificarAdm
                ? app.controladoraAuth.verificarAdm()
                : false;
            semImagem.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fa-regular fa-image fs-1 mb-2 d-block"></i>
                    <span class="small d-block">Sem imagens cadastradas</span>
                    ${isAdmin ? `<small class="text-primary mt-1 d-block">Clique em ✏️ no card para adicionar imagens</small>` : ''}
                </div>`;
        } else {
            semImagem.classList.add('d-none');
            carouselEl.classList.remove('d-none');

            carouselInner.innerHTML = imagens.map((src, i) => `
                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <img src="${src}" class="d-block w-100 carousel-projeto-img" alt="Imagem ${i + 1}">
                </div>
            `).join('');

            carouselIndicadores.innerHTML = imagens.length > 1
                ? imagens.map((_, i) => `
                    <button type="button" data-bs-target="#visualizarCarousel" data-bs-slide-to="${i}"
                        class="${i === 0 ? 'active' : ''}" aria-label="Slide ${i + 1}"></button>
                `).join('')
                : '';
        }

        new bootstrap.Modal(document.getElementById('modalVisualizarProjeto')).show();
    }

    // ========================
    // LISTAGEM E FILTRO
    // ========================

    filtrarProjetos(turmaSelecionada) {
        const label = document.getElementById('label-filtro-turma');
        if (label) label.innerText = turmaSelecionada;
        this.exibirProjetos(turmaSelecionada);
    }

    async exibirProjetos(filtroTurma = 'Todos') {
        const container = document.getElementById('lista-projetos');
        if (!container) return;

        try {
            const resposta = await this.projetoService.getAll();

            if (!resposta.ok) {
                if (resposta.status === 401) { app.logout(); return; }
                container.innerHTML = "<p class='text-center text-danger'>Erro ao carregar projetos.</p>";
                return;
            }

            const data = await resposta.json();
            this.listaProjetos = data;

            const listaFiltrada = filtroTurma === 'Todos'
                ? data
                : data.filter(proj => proj.turma === filtroTurma);

            container.innerHTML = '';

            if (listaFiltrada.length === 0) {
                container.innerHTML = "<p class='text-center text-muted w-100 my-4'>Nenhum projeto encontrado.</p>";
                return;
            }

            listaFiltrada.slice().reverse().forEach(proj => {
                const primeiraImagem = Array.isArray(proj.imagens) && proj.imagens.length > 0
                    ? proj.imagens[0]
                    : proj.imagem;

                const miniatura = primeiraImagem && primeiraImagem !== ''
                    ? `<img src="${primeiraImagem}" class="img-fluid rounded" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<i class="fa-regular fa-folder-open text-muted fs-4"></i>`;

                const qtdImagens = Array.isArray(proj.imagens) && proj.imagens.length > 0
                    ? proj.imagens.length
                    : (proj.imagem ? 1 : 0);

                const badgeImagens = qtdImagens > 1
                    ? `<span class="badge-imagens-count"><i class="fa-solid fa-images me-1"></i>${qtdImagens}</span>`
                    : '';

                container.innerHTML += `
                    <div class="col-12 col-md-6">
                        <div class="card card-feed p-2 d-flex flex-row align-items-center gap-3 position-relative pe-5 bg-white"
                             style="cursor: pointer;"
                             onclick="app.controladoraProjetos.abrirVisualizarProjeto('${proj._id}')">
                            <div class="position-absolute top-0 end-0 h-100 d-flex flex-column justify-content-center pe-2 gap-2 apenas-admin">
                                <button class="btn btn-sm btn-outline-warning rounded-circle"
                                    onclick="event.stopPropagation(); app.abrirModalEditar('${proj._id}')">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger rounded-circle"
                                    onclick="event.stopPropagation(); app.excluirProjeto('${proj._id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                            <div class="bg-light border rounded d-flex justify-content-center align-items-center position-relative"
                                 style="width: 80px; height: 70px; overflow: hidden; flex-shrink: 0;">
                                ${miniatura}
                                ${badgeImagens}
                            </div>
                            <div class="flex-grow-1 text-truncate">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fw-bold small d-block text-truncate">${proj.nome_projeto}</span>
                                    <span class="badge bg-danger rounded-pill text-white" style="font-size: 0.6rem;">${proj.turma}</span>
                                </div>
                                <p class="text-muted mb-0 text-truncate-2" style="font-size: 0.75rem;">${proj.descricao}</p>
                                <small class="text-primary" style="font-size: 0.65rem;">Criado em: ${proj.data_criacao}</small>
                            </div>
                        </div>
                    </div>`;
            });
        } catch (error) {
            console.error('[exibirProjetos] Erro:', error);
            container.innerHTML = "<p class='text-center text-danger'>Erro ao conectar com o servidor.</p>";
        }
    }

    // ========================
    // EXCLUIR PROJETO
    // ========================

    async excluirProjeto(id) {
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

        try {
            const resposta = await this.projetoService.remove(id);

            if (!resposta.ok) {
                const data = await resposta.json();
                alert(data.message || 'Erro ao excluir projeto.');
                return;
            }

            this.exibirProjetos();
            if (typeof app.adminCarregarProjetos === 'function') app.adminCarregarProjetos();
        } catch (error) {
            console.error('[excluirProjeto] Erro:', error);
            alert('Erro de conexão com o servidor.');
        }
    }
}
