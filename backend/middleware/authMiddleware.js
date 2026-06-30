const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Tenta ler do cookie HttpOnly (fluxo principal)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // 2. Fallback: header Authorization (para testes com Postman/curl)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, sem token' });
    }

    try {
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
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.perfil === 'Administrador') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado, apenas administradores permitidos' });
    }
};

module.exports = { protect, adminOnly };
