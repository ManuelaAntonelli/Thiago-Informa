const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    usuario: {
        type: String,
        required: true,
        unique: true
    },
    senha: {
        type: String,
        required: true
    },
    perfil: {
        type: String,
        required: true,
        enum: ['Administrador', 'Responsável'],
        default: 'Responsável'
    },
    turmas: {
        type: [String],
        default: []
    },
    avatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
