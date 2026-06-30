const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    data: {
        type: String, // formato "DD/MM/AAAA"
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
