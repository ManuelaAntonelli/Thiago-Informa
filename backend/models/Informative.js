const mongoose = require('mongoose');

const InformativeSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    data: {
        type: String,
        default: () => new Date().toLocaleDateString('pt-BR')
    },
    imagem: {
        type: String,
        default: ''
    },
    fixado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Informative', InformativeSchema);
