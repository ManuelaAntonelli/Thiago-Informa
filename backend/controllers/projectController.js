/**
 * ProjectController (Classe com Injeção de Dependência)
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — gerenciar operações CRUD de projetos.
 *  - DIP: Recebe o ProjectModel via construtor; não importa dependências diretamente.
 */
class ProjectController {

    /**
     * @param {object} ProjectModel - Modelo Mongoose de projeto (injetado)
     */
    constructor(ProjectModel) {
        this.Project = ProjectModel;

        this.getProjects = this.getProjects.bind(this);
        this.createProject = this.createProject.bind(this);
        this.updateProject = this.updateProject.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
    }

    // @desc    Obter todos os projetos
    // @route   GET /api/projects
    // @access  Private
    async getProjects(req, res) {
        try {
            const projects = await this.Project.find({});
            res.json(projects);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
        }
    }

    // @desc    Criar um novo projeto
    // @route   POST /api/projects
    // @access  Private (Admin only)
    async createProject(req, res) {
        const { nome_projeto, descricao, turma, imagem } = req.body;
        try {
            if (!nome_projeto || !descricao) {
                return res.status(400).json({ message: 'Nome e descrição são obrigatórios' });
            }
            const project = new this.Project({ nome_projeto, descricao, turma: turma || 'Todos', imagem: imagem || '' });
            const createdProject = await project.save();
            res.status(201).json(createdProject);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar projeto', error: error.message });
        }
    }

    // @desc    Atualizar um projeto
    // @route   PUT /api/projects/:id
    // @access  Private (Admin only)
    async updateProject(req, res) {
        const { nome_projeto, descricao, turma, imagem } = req.body;
        try {
            const project = await this.Project.findById(req.params.id);
            if (project) {
                project.nome_projeto = nome_projeto || project.nome_projeto;
                project.descricao = descricao || project.descricao;
                project.turma = turma || project.turma;
                if (imagem !== undefined) project.imagem = imagem;
                const updatedProject = await project.save();
                res.json(updatedProject);
            } else {
                res.status(404).json({ message: 'Projeto não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar projeto', error: error.message });
        }
    }

    // @desc    Deletar um projeto
    // @route   DELETE /api/projects/:id
    // @access  Private (Admin only)
    async deleteProject(req, res) {
        try {
            const project = await this.Project.findById(req.params.id);
            if (project) {
                await this.Project.deleteOne({ _id: project._id });
                res.json({ message: 'Projeto removido com sucesso' });
            } else {
                res.status(404).json({ message: 'Projeto não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao deletar projeto', error: error.message });
        }
    }
}

module.exports = ProjectController;
