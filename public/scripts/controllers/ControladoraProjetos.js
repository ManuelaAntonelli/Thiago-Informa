/**
 * ControladoraProjetos
 * Responsabilidade única: gerenciar o CRUD de projetos com suporte a imagens
 * consumindo a API REST do backend Express + MongoDB.
 */
class ControladoraProjetos {

    constructor() {
        this.controladoraAuth = new ControladoraAutenticacao();
        this.listaProjetos = [];
    }

    /**
     * Cria um novo projeto enviando dados para a API do Express.
     */
    async criarProjeto() {
        const nome = document.getElementById('inputNomeProjeto').value;
        const desc = document.getElementById('inputDescProjeto').value;
        const turma = document.getElementById('inputTurmaProjeto').value;
        const inputImagem = document.getElementById('inputImagemProjeto');

        if (nome.trim() === "" || desc.trim() === "") {
            alert("Preencha o nome e a descrição do projeto!");
            return;
        }

        const enviarParaAPI = async (imagemBase64) => {
            try {
                const resposta = await fetch('/api/projects', {
                    method: 'POST',
                    headers: this.controladoraAuth.getAuthHeaders(),
                    body: JSON.stringify({ nome_projeto: nome, descricao: desc, turma, imagem: imagemBase64 })
                });

                if (resposta.ok) {
                    document.getElementById('formProjeto').reset();
                    app.removerPreviewImagem('previewContainerProjetoCriar', null);

                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalProjeto'));
                    if (modal) modal.hide();

                    this.exibirProjetos();
                    if (typeof app.adminCarregarProjetos === 'function') {
                        app.adminCarregarProjetos();
                    }
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao criar projeto.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        };

        if (inputImagem.files && inputImagem.files.length > 0) {
            const leitor = new FileReader();
            leitor.onload = function (e) { enviarParaAPI(e.target.result); };
            leitor.readAsDataURL(inputImagem.files[0]);
        } else {
            enviarParaAPI("");
        }
    }

    /**
     * Abre o modal de edição preenchido com dados do projeto.
     * @param {string} id
     */
    abrirModalEditar(id) {
        const projeto = this.listaProjetos.find(p => p._id === id);

        if (projeto) {
            document.getElementById('editIdProjeto').value = projeto._id;
            document.getElementById('editNomeProjeto').value = projeto.nome_projeto;
            document.getElementById('editDescProjeto').value = projeto.descricao;
            document.getElementById('editTurmaProjeto').value = projeto.turma;
            document.getElementById('editImagemProjetoAtual').value = projeto.imagem;

            const containerPreview = document.getElementById('previewContainerProjetoEditar');
            if (projeto.imagem && projeto.imagem !== "") {
                containerPreview.innerHTML = `<img src="${projeto.imagem}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                containerPreview.innerHTML = `<div class="text-center text-muted"><i class="fa-regular fa-image fs-1"></i></div>`;
            }

            new bootstrap.Modal(document.getElementById('modalEditarProjeto')).show();
        }
    }

    /**
     * Edita um projeto existente na API do Express.
     */
    async editarProjeto() {
        const id = document.getElementById('editIdProjeto').value;
        const novoNome = document.getElementById('editNomeProjeto').value;
        const novaDesc = document.getElementById('editDescProjeto').value;
        const novaTurma = document.getElementById('editTurmaProjeto').value;
        const imagemAtual = document.getElementById('editImagemProjetoAtual').value;
        const inputNovaImagem = document.getElementById('editNovaImagemProjeto');

        if (novoNome.trim() === "" || novaDesc.trim() === "") {
            alert("Preencha o nome e a descrição do projeto!");
            return;
        }

        const enviarPUT = async (imagemBase64) => {
            try {
                const resposta = await fetch(`/api/projects/${id}`, {
                    method: 'PUT',
                    headers: this.controladoraAuth.getAuthHeaders(),
                    body: JSON.stringify({ nome_projeto: novoNome, descricao: novaDesc, turma: novaTurma, imagem: imagemBase64 })
                });

                if (resposta.ok) {
                    document.getElementById('formEditarProjeto').reset();
                    bootstrap.Modal.getInstance(document.getElementById('modalEditarProjeto')).hide();
                    this.exibirProjetos();
                    if (typeof app.adminCarregarProjetos === 'function') {
                        app.adminCarregarProjetos();
                    }
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao atualizar projeto.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        };

        if (inputNovaImagem.files && inputNovaImagem.files[0]) {
            const leitor = new FileReader();
            leitor.onload = function (e) { enviarPUT(e.target.result); };
            leitor.readAsDataURL(inputNovaImagem.files[0]);
        } else {
            enviarPUT(imagemAtual);
        }
    }

    /**
     * Filtra projetos pela turma selecionada.
     */
    filtrarProjetos(turmaSelecionada) {
        const label = document.getElementById('label-filtro-turma');
        if (label) label.innerText = turmaSelecionada;
        this.exibirProjetos(turmaSelecionada);
    }

    /**
     * Renderiza a lista de projetos na tela a partir do backend.
     */
    async exibirProjetos(filtroTurma = 'Todos') {
        const container = document.getElementById('lista-projetos');
        if (!container) return;

        try {
            const resposta = await fetch('/api/projects', {
                method: 'GET',
                headers: this.controladoraAuth.getAuthHeaders()
            });

            if (!resposta.ok) {
                if (resposta.status === 401) {
                    app.logout();
                    return;
                }
                container.innerHTML = "<p class='text-center text-danger'>Erro ao carregar projetos.</p>";
                return;
            }

            const data = await resposta.json();
            this.listaProjetos = data;

            let listaFiltrada = data;
            if (filtroTurma !== 'Todos') {
                listaFiltrada = data.filter(proj => proj.turma === filtroTurma);
            }

            container.innerHTML = "";

            if (listaFiltrada.length === 0) {
                container.innerHTML = "<p class='text-center text-muted w-100 my-4'>Nenhum projeto encontrado.</p>";
                return;
            }

            listaFiltrada.slice().reverse().forEach(proj => {
                const miniatura = proj.imagem && proj.imagem !== ""
                    ? `<img src="${proj.imagem}" class="img-fluid rounded" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<i class="fa-regular fa-folder-open text-muted fs-4"></i>`;

                container.innerHTML += `
                    <div class="col-12 col-md-6">
                        <div class="card card-feed p-2 d-flex flex-row align-items-center gap-3 position-relative pe-5 bg-white">
                            <div class="position-absolute top-0 end-0 h-100 d-flex flex-column justify-content-center pe-2 gap-2 apenas-admin">
                                <button class="btn btn-sm btn-outline-warning rounded-circle" onclick="app.abrirModalEditar('${proj._id}')"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="app.excluirProjeto('${proj._id}')"><i class="fa-solid fa-trash"></i></button>
                            </div>
                            <div class="bg-light border rounded d-flex justify-content-center align-items-center" style="width: 80px; height: 70px; overflow: hidden; flex-shrink: 0;">
                                ${miniatura}
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
            console.error(error);
            container.innerHTML = "<p class='text-center text-danger'>Erro ao conectar com o servidor.</p>";
        }
    }

    /**
     * Exclui um projeto no backend.
     * @param {string} id
     */
    async excluirProjeto(id) {
        if (confirm("Tem certeza que deseja excluir este projeto?")) {
            try {
                const resposta = await fetch(`/api/projects/${id}`, {
                    method: 'DELETE',
                    headers: this.controladoraAuth.getAuthHeaders()
                });

                if (resposta.ok) {
                    this.exibirProjetos();
                    if (typeof app.adminCarregarProjetos === 'function') {
                        app.adminCarregarProjetos();
                    }
                } else {
                    const data = await resposta.json();
                    alert(data.message || "Erro ao excluir projeto.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de conexão com o servidor.");
            }
        }
    }
}