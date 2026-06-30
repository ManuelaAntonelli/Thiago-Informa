const Event = require('../models/Event');

// @desc    Obter todos os eventos da agenda
// @route   GET /api/events
// @access  Private (Qualquer logado)
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar eventos', error: error.message });
    }
};

// @desc    Criar um novo evento na agenda
// @route   POST /api/events
// @access  Private (Admin only)
const createEvent = async (req, res) => {
    const { titulo, descricao, data } = req.body;

    try {
        if (!titulo || !descricao || !data) {
            return res.status(400).json({ message: 'Título, descrição e data são obrigatórios' });
        }

        const event = new Event({
            titulo,
            descricao,
            data
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
    }
};

// @desc    Excluir um evento
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            await Event.deleteOne({ _id: event._id });
            res.json({ message: 'Evento removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Evento não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar evento', error: error.message });
    }
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent
};
