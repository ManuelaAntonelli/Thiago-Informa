require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbInstance = require('./backend/config/db'); // Singleton Database Connection

const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');

const authRoutes = require('./backend/routes/authRoutes');
const projectRoutes = require('./backend/routes/projectRoutes');
const informativeRoutes = require('./backend/routes/informativeRoutes');
const eventRoutes = require('./backend/routes/eventRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/informatives', informativeRoutes);
app.use('/api/events', eventRoutes);

// Servir os arquivos estáticos do frontend (SPA)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback para qualquer rota não mapeada (serve o index.html da SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Porta do servidor
const PORT = process.env.PORT || 5000;

// Inicializa a conexão com banco de dados e semeia o Admin se necessário
dbInstance.connectPromise.then(async () => {
    try {
        const adminExists = await User.findOne({ usuario: 'admin' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await User.create({
                nome: 'Administrador',
                usuario: 'admin',
                senha: hashedPassword,
                perfil: 'Administrador'
            });
            console.log('Usuário administrador padrão criado (admin / admin123).');
        }
    } catch (error) {
        console.error('Erro ao semear o usuário admin padrão:', error);
    }

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Falha ao iniciar o servidor devido a erros no banco de dados:', err);
});
