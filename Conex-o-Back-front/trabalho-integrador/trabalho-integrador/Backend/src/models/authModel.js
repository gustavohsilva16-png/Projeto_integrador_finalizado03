// Executa consultas de autenticacao e acesso a partir da tabela login.
const database = require('../config/database');

const AuthModel = {
    // Busca credenciais e nome do cliente pelo e-mail informado.
    async buscarPorEmail(email) {
        let connection;

        try {
            connection = await database.getConnection();
            return await connection.query(
                `SELECT l.id_login, l.id_cliente, l.senha, l.ativo, l.papel, c.nome
                 FROM login l
                 INNER JOIN cliente c ON l.id_cliente = c.id_cliente
                 WHERE TRIM(l.email) = ?`,
                [email]
            );
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    // Cria cliente e login na mesma transacao, para nao sobrar cliente sem conta.
    async criarConta({ nome, cpf_cnpj, telefone, email, senhaHash }) {
        let connection;
        let transactionStarted = false;

        try {
            connection = await database.getConnection();
            await connection.beginTransaction();
            transactionStarted = true;

            const cliente = await connection.query(
                'INSERT INTO cliente (nome, cpf_cnpj, telefone) VALUES (?, ?, ?)',
                [nome, cpf_cnpj, telefone || null]
            );
            const idCliente = Number(cliente.insertId);

            await connection.query(
                'INSERT INTO login (id_cliente, email, senha, ativo) VALUES (?, ?, ?, TRUE)',
                [idCliente, email, senhaHash]
            );

            await connection.commit();
            return idCliente;
        } catch (error) {
            if (transactionStarted) {
                await connection.rollback();
            }
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    // Atualiza o horario do ultimo login confirmado.
    async atualizarUltimoAcesso(idLogin) {
        let connection;

        try {
            connection = await database.getConnection();
            await connection.query(
                'UPDATE login SET ultimo_acesso = NOW() WHERE id_login = ?',
                [idLogin]
            );
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    // Migra a senha legada para hash depois de um login validado.
    async atualizarSenha(idLogin, senhaHash) {
        let connection;

        try {
            connection = await database.getConnection();
            await connection.query(
                'UPDATE login SET senha = ? WHERE id_login = ?',
                [senhaHash, idLogin]
            );
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
};

module.exports = AuthModel;
