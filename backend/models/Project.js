const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    nome_projeto: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    turma: {
        type: String,
        default: 'Todos'
    },
    // Campo legado (compatibilidade) — mantido para não quebrar dados antigos
    imagem: {
        type: String,
        default: ''
    },
    // Novo: array de imagens em base64
    imagens: {
        type: [String],
        default: []
    },
    data_criacao: {
        type: String,
        default: () => new Date().toLocaleDateString('pt-BR')
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
