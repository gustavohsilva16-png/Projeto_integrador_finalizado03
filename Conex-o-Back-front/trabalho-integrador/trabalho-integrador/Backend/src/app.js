// Monta middlewares, rotas da API e arquivos estaticos do frontend.
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const database = require('./config/database');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const compraRoutes = require('./routes/compraRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const produtoRoutes = require('./routes/produtoRoutes');

// Cria a aplicacao sem abrir a porta, permitindo testar os endpoints isoladamente.
const app = express();
const origensPermitidas = new Set([
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    ...(process.env.FRONTEND_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
]);

// Habilita chamadas HTTP e converte JSON de entrada para req.body.
app.use((req, res, next) => cors({
    origin(origin, callback) {
        const mesmaOrigem = origin === `${req.protocol}://${req.get('host')}`;
        callback(null, !origin || mesmaOrigem || origensPermitidas.has(origin));
    },
    credentials: true
})(req, res, next));
app.use((req, res, next) => {
    const metodosAlteracao = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
    const origin = req.get('origin');
    const mesmaOrigem = origin === `${req.protocol}://${req.get('host')}`;

    if (
        metodosAlteracao.has(req.method)
        && origin
        && !mesmaOrigem
        && !origensPermitidas.has(origin)
    ) {
        return res.status(403).json({ error: 'Origem nao autorizada.' });
    }

    return next();
});
app.use(express.json());

// Garante corpo vazio em requisicoes sem JSON para as validacoes responderem 400.
app.use((req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        req.body = {};
    }
    next();
});

// Confirma que o processo HTTP esta ativo sem depender do banco.
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Testa a conexao configurada sem expor credenciais ou detalhes internos do banco.
app.get('/api/health/database', async (req, res) => {
    let connection;

    try {
        connection = await database.getConnection();
        await connection.query('SELECT 1');
        return res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Verificacao de conexao com o banco falhou:', error.code || error.message);
        return res.status(503).json({
            status: 'error',
            database: 'disconnected',
            code: error.code || 'DB_CONNECTION_FAILED'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Monta os endpoints publicos de login, logout e cadastro sob o prefixo /api.
app.use('/api', authRoutes);
// Monta consultas e alteracoes do carrinho sob /api/carrinho.
app.use('/api', carrinhoRoutes);
// Monta leitura e atualizacao de perfis sob /api/clientes.
app.use('/api', clienteRoutes);
// Monta a finalizacao de compras sob /api/finalizar-compra.
app.use('/api', compraRoutes);
// Monta o envio e a consulta de mensagens sob /api/consultas.
app.use('/api', consultaRoutes);
// Monta o catalogo sob /api/produtos.
app.use('/api', produtoRoutes);

// Publica estilos e scripts do frontend em /src e as paginas em /.
const frontendRoot = path.resolve(__dirname, '../../Front');
app.use('/src', express.static(path.join(frontendRoot, 'src')));
app.use(express.static(path.join(frontendRoot, 'public')));

// Trata JSON malformado e erros que nao foram tratados pelos controllers.
app.use(errorMiddleware);

module.exports = app;
