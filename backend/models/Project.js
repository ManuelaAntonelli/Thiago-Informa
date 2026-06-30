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
    imagem: {
        type: String,
        default: ''
    },
    data_criacao: {
        type: String,
        default: () => new Date().toLocaleDateString('pt-BR')
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
