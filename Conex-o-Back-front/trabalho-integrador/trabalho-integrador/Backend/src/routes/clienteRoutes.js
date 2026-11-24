const express = require('express');
const router = express.Router();
const clienteMiddleware = require('../middlewares/clienteMiddleware');
const clienteController = require('../controllers/clienteController');
const { exigirAutenticacao } = require('../middlewares/authSession');

// Exige sessao e permite consultar somente o perfil do proprio cliente.
router.get('/clientes/:id', exigirAutenticacao, clienteController.buscarPerfil);

// Exige sessao, valida os campos do endereco e salva no perfil autenticado.
router.post(
    '/clientes/endereco',
    exigirAutenticacao,
    clienteMiddleware.validarEndereco,
    clienteController.salvarEndereco
);

module.exports = router;