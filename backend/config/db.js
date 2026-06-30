const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        if (!DatabaseConnection.instance) {
            this.connectPromise = this.connect();
            DatabaseConnection.instance = this;
        }
        return DatabaseConnection.instance;
    }

    async connect() {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/thiago-informa';
        try {
            await mongoose.connect(mongoURI);
            console.log('MongoDB conectado com sucesso!');
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw error;
        }
    }
}

const dbInstance = new DatabaseConnection();
Object.freeze(dbInstance);

module.exports = dbInstance;
