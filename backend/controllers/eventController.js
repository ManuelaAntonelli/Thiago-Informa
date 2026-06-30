/**
 * EventController (Classe com Injeção de Dependência)
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — gerenciar operações CRUD de eventos da agenda.
 *  - DIP: Recebe o EventModel via construtor; não importa dependências diretamente.
 */
class EventController {

    /**
     * @param {object} EventModel - Modelo Mongoose de evento (injetado)
     */
    constructor(EventModel) {
        this.Event = EventModel;

        this.getEvents = this.getEvents.bind(this);
        this.createEvent = this.createEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
    }

    // @desc    Obter todos os eventos da agenda
    // @route   GET /api/events
    // @access  Private
    async getEvents(req, res) {
        try {
            const events = await this.Event.find({});
            res.json(events);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar eventos', error: error.message });
        }
    }

    // @desc    Criar um novo evento na agenda
    // @route   POST /api/events
    // @access  Private (Admin only)
    async createEvent(req, res) {
        const { titulo, descricao, data } = req.body;
        try {
            if (!titulo || !descricao || !data) {
                return res.status(400).json({ message: 'Título, descrição e data são obrigatórios' });
            }
            const event = new this.Event({ titulo, descricao, data });
            const createdEvent = await event.save();
            res.status(201).json(createdEvent);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
        }
    }

    // @desc    Excluir um evento
    // @route   DELETE /api/events/:id
    // @access  Private (Admin only)
    async deleteEvent(req, res) {
        try {
            const event = await this.Event.findById(req.params.id);
            if (event) {
                await this.Event.deleteOne({ _id: event._id });
                res.json({ message: 'Evento removido com sucesso' });
            } else {
                res.status(404).json({ message: 'Evento não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro ao deletar evento', error: error.message });
        }
    }
}

module.exports = EventController;
