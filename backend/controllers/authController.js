const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'thiago_secret_key_2026_super_secure';

/**
 * Gera um token JWT para o usuário.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Configura o cookie HttpOnly com o token JWT.
 * HttpOnly: JS do frontend não consegue ler o cookie.
 * SameSite=Strict: protege contra CSRF.
 */
const setTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,        // HTTPS only em produção
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000  // 30 dias em ms
    });
};

// @desc    Autenticar usuário e emitir cookie com token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const user = await User.findOne({ usuario });

        if (user && (await bcrypt.compare(senha, user.senha))) {
            const token = generateToken(user._id);
            setTokenCookie(res, token);

            res.json({
                _id: user._id,
                nome: user.nome,
                usuario: user.usuario,
                perfil: user.perfil,
                turmas: user.turmas,
                avatar: user.avatar
            });
        } else {
            res.status(401).json({ message: 'Usuário ou senha incorretos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Retorna os dados do usuário logado (via cookie)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user já foi populado pelo middleware protect
    res.json({
        _id: req.user._id,
        nome: req.user.nome,
        usuario: req.user.usuario,
        perfil: req.user.perfil,
        turmas: req.user.turmas,
        avatar: req.user.avatar
    });
};

// @desc    Realiza o logout limpando o cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)  // Expira imediatamente
    });
    res.json({ message: 'Logout realizado com sucesso' });
};

// @desc    Registrar um novo usuário (Admin ou Responsável)
// @route   POST /api/auth/register
// @access  Private (Admin)
const register = async (req, res) => {
    const { nome, usuario, senha, perfil } = req.body;

    try {
        const userExists = await User.findOne({ usuario });

        if (userExists) {
            return res.status(400).json({ message: 'Nome de usuário já cadastrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const user = await User.create({
            nome,
            usuario,
            senha: hashedPassword,
            perfil: perfil || 'Administrador'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                nome: user.nome,
                usuario: user.usuario,
                perfil: user.perfil
            });
        } else {
            res.status(400).json({ message: 'Dados inválidos de usuário' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Obter todos os usuários responsáveis
// @route   GET /api/auth/responsibles
// @access  Private (Admin only)
const getResponsibles = async (req, res) => {
    try {
        const users = await User.find({}).select('-senha');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Excluir um usuário
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin ou Próprio)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (req.user.perfil === 'Administrador' || req.user._id.toString() === user._id.toString()) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'Usuário removido com sucesso' });
        } else {
            res.status(403).json({ message: 'Não autorizado para excluir este usuário' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Alterar senha de um responsável
// @route   PUT /api/auth/users/:id/password
// @access  Private (Admin only)
const adminChangePassword = async (req, res) => {
    const { novaSenha } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(novaSenha, salt);
        await user.save();

        res.json({ message: 'Senha atualizada com sucesso pelo administrador' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Atualizar perfil do próprio usuário (nome, senha, avatar)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.nome = req.body.nome || user.nome;
            if (req.body.usuario) {
                user.usuario = req.body.usuario;
            }
            if (req.body.avatar !== undefined) {
                user.avatar = req.body.avatar;
            }

            if (req.body.senha) {
                const salt = await bcrypt.genSalt(10);
                user.senha = await bcrypt.hash(req.body.senha, salt);
            }

            const updatedUser = await user.save();

            // Renova o cookie com token atualizado
            const token = generateToken(updatedUser._id);
            setTokenCookie(res, token);

            res.json({
                _id: updatedUser._id,
                nome: updatedUser.nome,
                usuario: updatedUser.usuario,
                perfil: updatedUser.perfil,
                turmas: updatedUser.turmas,
                avatar: updatedUser.avatar
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

module.exports = {
    login,
    getMe,
    logout,
    register,
    getResponsibles,
    deleteUser,
    adminChangePassword,
    updateProfile
};
