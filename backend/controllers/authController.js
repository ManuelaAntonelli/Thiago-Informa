const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'thiago_secret_key_2026_super_secure', {
        expiresIn: '30d'
    });
};

// @desc    Autenticar usuário e obter token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const user = await User.findOne({ usuario });

        if (user && (await bcrypt.compare(senha, user.senha))) {
            res.json({
                _id: user._id,
                nome: user.nome,
                usuario: user.usuario,
                perfil: user.perfil,
                turmas: user.turmas,
                avatar: user.avatar,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Usuário ou senha incorretos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

// @desc    Registrar um novo usuário (Admin ou Responsável)
// @route   POST /api/auth/register
// @access  Public / Private (Admin)
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
                perfil: user.perfil,
                token: generateToken(user._id)
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

// @desc    Atualizar perfil do próprio usuário
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

            res.json({
                _id: updatedUser._id,
                nome: updatedUser.nome,
                usuario: updatedUser.usuario,
                perfil: updatedUser.perfil,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser._id)
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
    register,
    getResponsibles,
    deleteUser,
    adminChangePassword,
    updateProfile
};
