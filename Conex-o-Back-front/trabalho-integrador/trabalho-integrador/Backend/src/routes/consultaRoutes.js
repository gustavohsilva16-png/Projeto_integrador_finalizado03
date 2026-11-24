const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { exigirAutenticacao } = require('../middlewares/authSession');

// Exige sessao e registra a mensagem vinculada ao cliente autenticado.
router.post('/consultas', exigirAutenticacao, consultaController.enviarMensagem);

// Exige sessao e lista somente as mensagens do proprio cliente.
router.get('/consultas/:id_cliente', exigirAutenticacao, consultaController.listar);

module.exports = router;