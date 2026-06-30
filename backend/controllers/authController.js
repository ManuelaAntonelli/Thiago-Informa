const JWT_SECRET = process.env.JWT_SECRET || 'thiago_secret_key_2026_super_secure';

/**
 * AuthController (Classe com Injeção de Dependência)
 *
 * Princípios SOLID aplicados:
 *  - SRP: Responsabilidade única — gerenciar autenticação de usuários.
 *  - DIP: Recebe UserModel, bcrypt e jwt via construtor; não importa dependências diretamente.
 */
class AuthController {

    /**
     * @param {object} UserModel  - Modelo Mongoose de usuário (injetado)
     * @param {object} bcrypt     - Biblioteca de hash (injetada)
     * @param {object} jwt        - Biblioteca JWT (injetada)
     */
    constructor(UserModel, bcrypt, jwt) {
        this.User = UserModel;
        this.bcrypt = bcrypt;
        this.jwt = jwt;

        // Bind necessário para preservar o contexto quando usado como middleware do Express
        this.login = this.login.bind(this);
        this.getMe = this.getMe.bind(this);
        this.logout = this.logout.bind(this);
        this.register = this.register.bind(this);
        this.getResponsibles = this.getResponsibles.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.adminChangePassword = this.adminChangePassword.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    // ---- Helpers privados ----

    _generateToken(id) {
        return this.jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
    }

    _setTokenCookie(res, token) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
    }

    // ---- Handlers ----

    // @desc    Autenticar usuário e emitir cookie com token
    // @route   POST /api/auth/login
    // @access  Public
    async login(req, res) {
        const { usuario, senha } = req.body;
        try {
            const user = await this.User.findOne({ usuario });
            if (user && (await this.bcrypt.compare(senha, user.senha))) {
                const token = this._generateToken(user._id);
                this._setTokenCookie(res, token);
                res.json({ _id: user._id, nome: user.nome, usuario: user.usuario, perfil: user.perfil, turmas: user.turmas, avatar: user.avatar });
            } else {
                res.status(401).json({ message: 'Usuário ou senha incorretos' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor', error: error.message });
        }
    }

    // @desc    Retorna os dados do usuário logado
    // @route   GET /api/auth/me
    // @access  Private
    async getMe(req, res) {
        res.json({ _id: req.user._id, nome: req.user.nome, usuario: req.user.usuario, perfil: req.user.perfil, turmas: req.user.turmas, avatar: req.user.avatar });
    }

    // @desc    Realiza o logout limpando o cookie
    // @route   POST /api/auth/logout
    // @access  Private
    logout(req, res) {
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        res.json({ message: 'Logout realizado com sucesso' });
    }

    // @desc    Registrar um novo usuário
    // @route   POST /api/auth/register
    // @access  Private (Admin)
    async register(req, res) {
        const { nome, usuario, senha, perfil } = req.body;
        try {
            const userExists = await this.User.findOne({ usuario });
            if (userExists) {
                return res.status(400).json({ message: 'Nome de usuário já cadastrado' });
            }
            const salt = await this.bcrypt.genSalt(10);
            const hashedPassword = await this.bcrypt.hash(senha, salt);
            const user = await this.User.create({ nome, usuario, senha: hashedPassword, perfil: perfil || 'Administrador' });
            if (user) {
                res.status(201).json({ _id: user._id, nome: user.nome, usuario: user.usuario, perfil: user.perfil });
            } else {
                res.status(400).json({ message: 'Dados inválidos de usuário' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor', error: error.message });
        }
    }

    // @desc    Obter todos os usuários responsáveis
    // @route   GET /api/auth/responsibles
    // @access  Private (Admin only)
    async getResponsibles(req, res) {
        try {
            const users = await this.User.find({}).select('-senha');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor', error: error.message });
        }
    }

    // @desc    Excluir um usuário
    // @route   DELETE /api/auth/users/:id
    // @access  Private (Admin ou Próprio)
    async deleteUser(req, res) {
        try {
            const user = await this.User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
            if (req.user.perfil === 'Administrador' || req.user._id.toString() === user._id.toString()) {
                await this.User.deleteOne({ _id: user._id });
                res.json({ message: 'Usuário removido com sucesso' });
            } else {
                res.status(403).json({ message: 'Não autorizado para excluir este usuário' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor', error: error.message });
        }
    }

    // @desc    Alterar senha de um responsável
    // @route   PUT /api/auth/users/:id/password
    // @access  Private (Admin only)
    async adminChangePassword(req, res) {
        const { novaSenha } = req.body;
        try {
            const user = await this.User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
            const salt = await this.bcrypt.genSalt(10);
            user.senha = await this.bcrypt.hash(novaSenha, salt);
            await user.save();
            res.json({ message: 'Senha atualizada com sucesso pelo administrador' });
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor', error: error.message });
        }
    }

    // @desc    Atualizar perfil do próprio usuário
    // @route   PUT /api/auth/profile
    // @access  Private
    async updateProfile(req, res) {
        try {
            const user = await this.User.findById(req.user._id);
            if (user) {
                user.nome = req.body.nome || user.nome;
                if (req.body.usuario) user.usuario = req.body.usuario;
                if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
                if (req.body.senha) {
                    const salt = await this.bcrypt.genSalt(10);
                    user.senha = await this.bcrypt.hash(req.body.senha, salt);
                }
                const updatedUser = await user.save();
                const token = this._generateToken(updatedUser._id);
                this._setTokenCookie(res, token);
                res.json({ _id: updatedUser._id, nome: updatedUser.nome, usuario: updatedUser.usuario, perfil: updatedUser.perfil, turmas: updatedUser.turmas, avatar: updatedUser.avatar });
            } else {
                res.status(404).json({ message: 'Usuário não encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Erro no servidor', error: error.message });
        }
    }
}

module.exports = AuthController;
