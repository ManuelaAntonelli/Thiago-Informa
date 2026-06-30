const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'thiago_secret_key_2026_super_secure');

            req.user = await User.findById(decoded.id).select('-senha');
            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
            }
            next();
        } catch (error) {
            console.error('Erro de autorização:', error);
            res.status(401).json({ message: 'Não autorizado, token inválido' });
        }
    } else {
        res.status(401).json({ message: 'Não autorizado, sem token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.perfil === 'Administrador') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado, apenas administradores permitidos' });
    }
};

module.exports = { protect, adminOnly };
