const Project = require('../models/Project');

// @desc    Obter todos os projetos
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
    }
};

// @desc    Criar um novo projeto
// @route   POST /api/projects
// @access  Private (Admin only)
const createProject = async (req, res) => {
    const { nome_projeto, descricao, turma, imagem } = req.body;

    try {
        if (!nome_projeto || !descricao) {
            return res.status(400).json({ message: 'Nome e descrição são obrigatórios' });
        }

        const project = new Project({
            nome_projeto,
            descricao,
            turma: turma || 'Todos',
            imagem: imagem || ''
        });

        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar projeto', error: error.message });
    }
};

// @desc    Atualizar um projeto
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
const updateProject = async (req, res) => {
    const { nome_projeto, descricao, turma, imagem } = req.body;

    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            project.nome_projeto = nome_projeto || project.nome_projeto;
            project.descricao = descricao || project.descricao;
            project.turma = turma || project.turma;
            if (imagem !== undefined) {
                project.imagem = imagem;
            }

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Projeto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar projeto', error: error.message });
    }
};

// @desc    Deletar um projeto
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            await Project.deleteOne({ _id: project._id });
            res.json({ message: 'Projeto removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Projeto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar projeto', error: error.message });
    }
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
};
