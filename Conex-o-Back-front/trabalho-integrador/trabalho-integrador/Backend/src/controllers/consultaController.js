// Valida mensagens de contato e delega persistencia e listagem ao modelo.
const ConsultaModel = require('../models/consultaModel');

const consultaController = {
    // Registra uma mensagem enviada por um cliente.
    async enviarMensagem(req, res) {
        const { assunto, mensagem } = req.body;
        const idCliente = req.auth.id_cliente;

        if (typeof assunto !== 'string' || !assunto.trim()
            || typeof mensagem !== 'string' || !mensagem.trim()) {
            return res.status(400).json({
                error: 'assunto e mensagem sao obrigatorios.'
            });
        }

        try {
            const idConsulta = await ConsultaModel.criar({
                id_cliente: idCliente,
                assunto: assunto.trim(),
                mensagem: mensagem.trim()
            });
            return res.status(201).json({
                message: 'Consulta enviada com sucesso!',
                id_consulta: idConsulta
            });
        } catch (error) {
            console.error('Erro ao registrar consulta:', error);
            return res.status(500).json({ error: 'Falha ao registrar consulta.' });
        }
    },

    // Lista as mensagens enviadas por um cliente.
    async listar(req, res) {
        const idCliente = Number(req.params.id_cliente);
        if (!Number.isSafeInteger(idCliente) || idCliente < 1) {
            return res.status(400).json({ error: 'Identificador de cliente invalido.' });
        }
        if (idCliente !== req.auth.id_cliente) {
            return res.status(403).json({ error: 'Acesso restrito as proprias consultas.' });
        }

        try {
            const consultas = await ConsultaModel.listarPorCliente(idCliente);
            return res.status(200).json(consultas);
        } catch (error) {
            console.error('Erro ao listar consultas:', error);
            return res.status(500).json({ error: 'Falha ao listar consultas.' });
        }
    }
};

module.exports = consultaController;
