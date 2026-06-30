/**
 * ControladoraInformativo
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — orquestrar a UI de informativos e o carrossel.
 *         Toda comunicação com a API é delegada ao InformativoService injetado.
 *  - DIP: Recebe informativoService via construtor em vez de instanciar fetch diretamente.
 */
class ControladoraInformativo {

    /**
     * @param {InformativoService} informativoService - Service de informativos injetado (DIP)
     */
    constructor(informativoService) {
        this.informativoService = informativoService;
        this.listaInformativos = [];

        // Estado do Carrossel de Fixados
        this.carrosselIntervalo = null;
        this.tempoRolagem = 3500;
        this.isScrolling = false;
        this.deveGirarCarrossel = false;
    }

    /**
     * Carrega e renderiza a lista de informativos do backend.
     */
    async carregarInformativos() {
        const container = document.getElementById('container-feed');
        if (!container) return;

        try {
            const resposta = await this.informativoService.getAll();

            if (!resposta.ok) {
                if (resposta.status === 401) { app.logout(); return; }
                container.innerHTML = "<p class='text-center text-danger mt-4'>Erro ao carregar feed.</p>";
                return;
            }

            const data = await resposta.json();
            this.listaInformativos = data;
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "<p class='text-center text-muted mt-4'>Nenhum informativo publicado no momento.</p>";
                return;
            }

            data.slice().reverse().forEach(info => {
                const blocoImagem = info.imagem && info.imagem !== ""
                    ? `<img src="${info.imagem}" class="img-fluid rounded w-100 shadow-sm bg-light" style="object-fit: cover; height: 100%; min-height: 150px; border: 1px solid #dee2e6;" alt="Capa do post">`
                    : `<div class="img-preview-box w-100 shadow-sm" style="height: 100%; min-height: 150px;">
                            <div class="text-center text-muted">
                                <i class="fa-regular fa-image fs-1 mb-2"></i>
                                <span class="fw-bold d-block small">NO IMAGE AVAILABLE</span>
                            </div>
                       </div>`;

                const corAlfinete = info.fixado ? "text-danger" : "text-dark";

                container.innerHTML += `
                    <div class="col-12">
                        <div class="card p-3 shadow-sm mb-3 position-relative modal-figma-border bg-white">
                            <div class="position-absolute top-0 end-0 p-3 d-flex gap-2 z-1 apenas-admin">
                                <button class="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 35px; height: 35px; border: 2px solid #000;" onclick="app.alternarFixado('${info._id}')" title="Fixar Post">
                                    <i class="fa-solid fa-thumbtack ${corAlfinete}"></i>
                                </button>
                                <button class="btn btn-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 35px; height: 35px; border: 2px solid #000;" onclick="app.abrirModalEditarInfo('${info._id}')" title="Editar">
                                    <i class="fa-solid fa-pen-to-square text-dark"></i>
                                </button>
                                <button class="btn btn-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 35px; height: 35px; border: 2px solid #000;" onclick="app.excluirInfo('${info._id}')" title="Excluir">
                                    <i class="fa-solid fa-trash text-white"></i>
                                </button>
                            </div>
                            <div class="d-md-none mb-3 pe-5">
                                <span class="fw-bold fs-6 text-dark d-block">${info.titulo}</span>
                                <small class="text-muted fw-bold d-block mt-1" style="font-size: 0.75rem;">
                                    <i class="fa-regular fa-clock me-1"></i> ${info.data}
                                </small>
                            </div>
                            <div class="row g-3">
                                <div class="col-12 col-md-4 col-lg-4">${blocoImagem}</div>
                                <div class="col-12 col-md-8 col-lg-8 d-flex flex-column justify-content-center">
                                    <div class="d-none d-md-block pe-5 mb-2">
                                        <span class="fw-bold fs-6 text-dark d-block">${info.titulo}</span>
                                        <small class="text-muted fw-bold d-block mt-1" style="font-size: 0.75rem;">
                                            <i class="fa-regular fa-clock me-1"></i> ${info.data}
                                        </small>
                                    </div>
                                    <p class="text-dark small mb-0 mt-2" style="text-align: justify;">${info.descricao}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error(error);
            container.innerHTML = "<p class='text-center text-danger mt-4'>Erro ao se conectar ao servidor.</p>";
        }
    }

    /**
     * Carrega e renderiza os informativos fixados do backend.
     */
    async carregarFixados() {
        const container = document.getElementById('container-fixados-scroll');
        const btnPrev = document.getElementById('btn-prev-fixado');
        const btnNext = document.getElementById('btn-next-fixado');
        if (!container) return;

        try {
            const resposta = await this.informativoService.getAll();

            if (!resposta.ok) {
                if (resposta.status === 401) { app.logout(); }
                return;
            }

            const data = await resposta.json();
            const fixados = data.filter(info => info.fixado).reverse();
            container.innerHTML = "";

            if (fixados.length === 0) {
                container.innerHTML = "<p class='text-muted small px-3 mt-2'>Nenhum post fixado no momento.</p>";
                if (btnPrev) btnPrev.className = "btn p-0 border-0 position-absolute start-0 top-50 translate-middle-y z-3 d-none";
                if (btnNext) btnNext.className = "btn p-0 border-0 position-absolute end-0 top-50 translate-middle-y z-3 d-none";
                this.deveGirarCarrossel = false;
                clearInterval(this.carrosselIntervalo);
                return;
            }

            fixados.forEach(info => {
                container.innerHTML += `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card card-fixado p-3 position-relative h-100 modal-figma-border bg-white">
                            <i class="fa-solid fa-thumbtack position-absolute top-0 end-0 m-2 text-danger cursor-pointer apenas-admin" style="transform: rotate(45deg); z-index: 2;" onclick="app.alternarFixado('${info._id}')" title="Desfixar"></i>
                            <div onclick="app.abrirModalVisualizarInfo('${info._id}')" style="cursor: pointer;" class="h-100 d-flex flex-column">
                                <span class="fw-bold small d-block text-truncate pe-4 text-dark">${info.titulo}</span>
                                <p class="text-muted small mb-0 mt-1 text-truncate-2" style="text-align: justify;">${info.descricao}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            if (fixados.length <= 4) {
                if (btnPrev) btnPrev.className = "btn p-0 border-0 position-absolute start-0 top-50 translate-middle-y z-3 d-none";
                if (btnNext) btnNext.className = "btn p-0 border-0 position-absolute end-0 top-50 translate-middle-y z-3 d-none";
                this.deveGirarCarrossel = false;
                clearInterval(this.carrosselIntervalo);
            } else {
                if (btnPrev) btnPrev.className = "btn p-0 border-0 position-absolute start-0 top-50 translate-middle-y z-3 d-none d-md-block";
                if (btnNext) btnNext.className = "btn p-0 border-0 position-absolute end-0 top-50 translate-middle-y z-3 d-none d-md-block";
                this.deveGirarCarrossel = true;
                this.iniciarCarrossel();
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Cria um novo informativo (post).
     */
    async criarInformativo() {
        const titulo = document.getElementById('inputTituloInfo').value;
        const desc = document.getElementById('inputDescInfo').value;
        const inputImagem = document.getElementById('inputImagemInfo');

        if (titulo.trim() === "" || desc.trim() === "") {
            alert("Preencha o título e a descrição do post!");
            return;
        }

        const enviarParaAPI = async (imagemBase64) => {
            try {
                const resposta = await this.informativoService.create({
                    titulo, descricao: desc, imagem: imagemBase64
                });

                if (resposta.ok) {
                    document.getElementById('formInformativo').reset();
                    this.removerPreviewImagem('previewContainerCriar', null);
                    const modalInstancia = bootstrap.Modal.getInstance(document.getElementById('modalInformativo'));
                    if (modalInstancia) modalInstancia.hide();
                    this.carregarInformativos();
                    this.carregarFixados();
                    if (typeof app.adminCarregarInformativos === 'function') app.adminCarregarInformativos();
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao criar post.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        };

        if (inputImagem.files && inputImagem.files[0]) {
            const leitor = new FileReader();
            leitor.onload = function (evento) { enviarParaAPI(evento.target.result); };
            leitor.readAsDataURL(inputImagem.files[0]);
        } else {
            enviarParaAPI("");
        }
    }

    /**
     * Abre o modal de edição preenchido com os dados do post.
     * @param {string} id
     */
    abrirModalEditarInfo(id) {
        const info = this.listaInformativos.find(i => i._id === id);
        if (info) {
            document.getElementById('editIdInfo').value = info._id;
            document.getElementById('editTituloInfo').value = info.titulo;
            document.getElementById('editDescInfo').value = info.descricao;
            document.getElementById('editImagemInfoAtual').value = info.imagem;

            const containerPreview = document.getElementById('previewContainerEditar');
            if (info.imagem && info.imagem !== "") {
                containerPreview.innerHTML = `<img src="${info.imagem}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                containerPreview.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fa-regular fa-image fs-1 mb-2"></i>
                        <span class="fw-bold d-block small">NO IMAGE AVAILABLE</span>
                    </div>
                `;
            }
            new bootstrap.Modal(document.getElementById('modalEditarInformativo')).show();
        }
    }

    /**
     * Salva as edições do post.
     */
    async editarInformativo() {
        const id = document.getElementById('editIdInfo').value;
        const novoTitulo = document.getElementById('editTituloInfo').value;
        const novaDesc = document.getElementById('editDescInfo').value;
        const imagemAtual = document.getElementById('editImagemInfoAtual').value;
        const inputNovaImagem = document.getElementById('editNovaImagemInfo');

        if (novoTitulo.trim() === "" || novaDesc.trim() === "") {
            alert("O título e a descrição não podem ficar vazios.");
            return;
        }

        const enviarPUT = async (imagemBase64) => {
            try {
                const resposta = await this.informativoService.update(id, {
                    titulo: novoTitulo, descricao: novaDesc, imagem: imagemBase64
                });

                if (resposta.ok) {
                    document.getElementById('formEditarInformativo').reset();
                    const modalInstancia = bootstrap.Modal.getInstance(document.getElementById('modalEditarInformativo'));
                    if (modalInstancia) modalInstancia.hide();
                    this.carregarInformativos();
                    this.carregarFixados();
                    if (typeof app.adminCarregarInformativos === 'function') app.adminCarregarInformativos();
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao editar post.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        };

        if (inputNovaImagem.files && inputNovaImagem.files[0]) {
            const leitor = new FileReader();
            leitor.onload = function (evento) { enviarPUT(evento.target.result); };
            leitor.readAsDataURL(inputNovaImagem.files[0]);
        } else {
            enviarPUT(imagemAtual);
        }
    }

    /**
     * Exclui um post pelo ID.
     * @param {string} id
     */
    async excluirInfo(id) {
        if (confirm("Tem certeza que deseja excluir este post permanentemente?")) {
            try {
                const resposta = await this.informativoService.remove(id);
                if (resposta.ok) {
                    this.carregarInformativos();
                    this.carregarFixados();
                    if (typeof app.adminCarregarInformativos === 'function') app.adminCarregarInformativos();
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao excluir post.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        }
    }

    /**
     * Alterna o estado de fixado de um post.
     * @param {string} id
     */
    async alternarFixado(id) {
        try {
            const resposta = await this.informativoService.togglePin(id);
            if (resposta.ok) {
                this.carregarInformativos();
                this.carregarFixados();
                if (typeof app.adminCarregarInformativos === 'function') app.adminCarregarInformativos();
            } else {
                const data = await resposta.json();
                alert(data.message || "Erro ao alternar fixação.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        }
    }

    /**
     * Gera o preview visual de uma imagem selecionada.
     */
    gerarPreviewImagem(inputElement, containerId) {
        const container = document.getElementById(containerId);
        if (inputElement.files && inputElement.files[0]) {
            const leitor = new FileReader();
            leitor.onload = function (e) {
                container.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">`;
            };
            leitor.readAsDataURL(inputElement.files[0]);
        }
    }

    /**
     * Remove a imagem do preview e zera os campos ocultos.
     */
    removerPreviewImagem(containerId, hiddenInputId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="fa-regular fa-image fs-1 mb-2"></i>
                <span class="fw-bold d-block small">NO IMAGE AVAILABLE</span>
            </div>
        `;
        const inputFisico = containerId === 'previewContainerCriar'
            ? document.getElementById('inputImagemInfo')
            : document.getElementById('editNovaImagemInfo');
        if (inputFisico) inputFisico.value = "";
        if (hiddenInputId) document.getElementById(hiddenInputId).value = "";
    }

    /**
     * Inicia o motor do carrossel.
     */
    iniciarCarrossel() {
        clearInterval(this.carrosselIntervalo);
        this.carrosselIntervalo = setInterval(() => this.scrollCarrossel(1), this.tempoRolagem);
    }

    /**
     * Rola o carrossel para a esquerda ou direita.
     * @param {number} direcao (1 para direita, -1 para esquerda)
     */
    scrollCarrossel(direcao) {
        if (!this.deveGirarCarrossel) return;
        const container = document.getElementById('container-fixados-scroll');
        if (!container || this.isScrolling) return;

        this.isScrolling = true;
        clearInterval(this.carrosselIntervalo);
        this.carrosselIntervalo = setInterval(() => this.scrollCarrossel(1), this.tempoRolagem);

        const primeiroCartao = container.firstElementChild;
        if (!primeiroCartao) { this.isScrolling = false; return; }
        const quantidadeScroll = primeiroCartao.offsetWidth + 16;

        if (direcao === 1) {
            container.style.scrollBehavior = 'smooth';
            container.scrollBy({ left: quantidadeScroll });
            setTimeout(() => {
                container.style.scrollBehavior = 'auto';
                container.appendChild(primeiroCartao);
                container.scrollLeft -= quantidadeScroll;
                this.isScrolling = false;
            }, 600);
        } else {
            container.style.scrollBehavior = 'auto';
            const ultimoCartao = container.lastElementChild;
            container.insertBefore(ultimoCartao, primeiroCartao);
            container.scrollLeft += quantidadeScroll;
            requestAnimationFrame(() => {
                container.style.scrollBehavior = 'smooth';
                container.scrollBy({ left: -quantidadeScroll });
                setTimeout(() => { this.isScrolling = false; }, 600);
            });
        }
    }

    /**
     * Abre o modal de visualização preenchido com o post completo.
     * @param {string} id
     */
    abrirModalVisualizarInfo(id) {
        const info = this.listaInformativos.find(i => i._id === id);
        if (info) {
            const container = document.getElementById('conteudoVisualizarInformativo');
            const blocoImagem = info.imagem && info.imagem !== ""
                ? `<img src="${info.imagem}" class="img-fluid rounded w-100 shadow-sm bg-light" style="object-fit: cover; height: 100%; min-height: 150px; border: 1px solid #dee2e6;" alt="Capa do post">`
                : `<div class="img-preview-box w-100 shadow-sm" style="height: 100%; min-height: 150px;">
                        <div class="text-center text-muted">
                            <i class="fa-regular fa-image fs-1 mb-2"></i>
                            <span class="fw-bold d-block small">NO IMAGE AVAILABLE</span>
                        </div>
                   </div>`;

            container.innerHTML = `
                <div class="d-md-none mb-3">
                    <span class="fw-bold fs-6 text-dark d-block">${info.titulo}</span>
                    <small class="text-muted fw-bold d-block mt-1" style="font-size: 0.75rem;">
                        <i class="fa-regular fa-clock me-1"></i> ${info.data}
                    </small>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-md-4 col-lg-4">${blocoImagem}</div>
                    <div class="col-12 col-md-8 col-lg-8 d-flex flex-column justify-content-start">
                        <div class="d-none d-md-block mb-2">
                            <span class="fw-bold fs-6 text-dark d-block">${info.titulo}</span>
                            <small class="text-muted fw-bold d-block mt-1" style="font-size: 0.75rem;">
                                <i class="fa-regular fa-clock me-1"></i> ${info.data}
                            </small>
                        </div>
                        <p class="text-dark small mb-0 mt-2" style="text-align: justify;">${info.descricao}</p>
                    </div>
                </div>
            `;
            new bootstrap.Modal(document.getElementById('modalVisualizarInformativo')).show();
        }
    }
}
