// Coordena a validacao das credenciais e as consultas do modelo de autenticacao.
const AuthModel = require('../models/authModel');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { criarCookie, limparCookie } = require('../middlewares/authSession');

const authController = {
    // Autentica o usuario sem gravar credenciais em logs.
    async login(req, res) {
        const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
        const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha sao obrigatorios.' });
        }

        if (email.length > 150 || senha.length > 200) {
            return res.status(400).json({ error: 'E-mail ou senha invalidos.' });
        }

        try {
            const usuarios = await AuthModel.buscarPorEmail(email);

            if (usuarios.length === 0) {
                return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
            }

            const usuario = usuarios[0];
            if (!usuario.ativo) {
                return res.status(403).json({ message: 'Conta de usuario inativa.' });
            }

            if (!conferirSenha(senha, usuario.senha)) {
                return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
            }

            if (!String(usuario.senha).startsWith('scrypt$')) {
                await AuthModel.atualizarSenha(usuario.id_login, gerarHash(senha));
            }

            await AuthModel.atualizarUltimoAcesso(usuario.id_login);
            const secure = req.secure || process.env.NODE_ENV === 'production';
            res.setHeader('Set-Cookie', criarCookie(usuario, secure));
            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                id_cliente: usuario.id_cliente,
                nome: usuario.nome
            });
        } catch (error) {
            console.error('Erro ao autenticar usuario:', error);
            return res.status(500).json({ error: 'Falha ao autenticar usuario.' });
        }
    },

    // Cadastra cliente e login; os campos ja chegam validados pelo middleware.
    async cadastrar(req, res) {
        const { nome, cpf_cnpj, telefone, email, senha } = req.body;

        try {
            const idCliente = await AuthModel.criarConta({
                nome,
                cpf_cnpj,
                telefone,
                email,
                senhaHash: gerarHash(senha)
            });

            return res.status(201).json({
                message: 'Conta criada com sucesso!',
                id_cliente: idCliente,
                nome
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                const campo = String(error.message).includes('email') ? 'E-mail' : 'CPF/CNPJ';
                return res.status(409).json({ error: `${campo} ja cadastrado.` });
            }

            console.error('Erro ao cadastrar usuario:', error);
            return res.status(500).json({ error: 'Falha ao criar conta.' });
        }
    },

    logout(req, res) {
        const secure = req.secure || process.env.NODE_ENV === 'production';
        res.setHeader('Set-Cookie', limparCookie(secure));
        return res.status(200).json({ message: 'Sessao encerrada.' });
    }
};

module.exports = authController;
