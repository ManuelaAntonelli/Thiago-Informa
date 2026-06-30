const Informative = require('../models/Informative');

// @desc    Obter todos os informativos
// @route   GET /api/informatives
// @access  Private
const getInformatives = async (req, res) => {
    try {
        const informatives = await Informative.find({});
        res.json(informatives);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar informativos', error: error.message });
    }
};

// @desc    Criar um novo informativo
// @route   POST /api/informatives
// @access  Private (Admin only)
const createInformative = async (req, res) => {
    const { titulo, descricao, imagem } = req.body;

    try {
        if (!titulo || !descricao) {
            return res.status(400).json({ message: 'Título e descrição são obrigatórios' });
        }

        const informative = new Informative({
            titulo,
            descricao,
            imagem: imagem || '',
            fixado: false
        });

        const createdInformative = await informative.save();
        res.status(201).json(createdInformative);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar informativo', error: error.message });
    }
};

// @desc    Atualizar um informativo
// @route   PUT /api/informatives/:id
// @access  Private (Admin only)
const updateInformative = async (req, res) => {
    const { titulo, descricao, imagem } = req.body;

    try {
        const informative = await Informative.findById(req.params.id);

        if (informative) {
            informative.titulo = titulo || informative.titulo;
            informative.descricao = descricao || informative.descricao;
            if (imagem !== undefined) {
                informative.imagem = imagem;
            }

            const updatedInformative = await informative.save();
            res.json(updatedInformative);
        } else {
            res.status(404).json({ message: 'Informativo não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar informativo', error: error.message });
    }
};

// @desc    Alternar fixado do informativo
// @route   PUT /api/informatives/:id/pin
// @access  Private (Admin only)
const togglePinInformative = async (req, res) => {
    try {
        const informative = await Informative.findById(req.params.id);

        if (informative) {
            informative.fixado = !informative.fixado;
            const updatedInformative = await informative.save();
            res.json(updatedInformative);
        } else {
            res.status(404).json({ message: 'Informativo não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alternar fixado', error: error.message });
    }
};

// @desc    Deletar um informativo
// @route   DELETE /api/informatives/:id
// @access  Private (Admin only)
const deleteInformative = async (req, res) => {
    try {
        const informative = await Informative.findById(req.params.id);

        if (informative) {
            await Informative.deleteOne({ _id: informative._id });
            res.json({ message: 'Informativo removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Informativo não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar informativo', error: error.message });
    }
};

module.exports = {
    getInformatives,
    createInformative,
    updateInformative,
    togglePinInformative,
    deleteInformative
};
