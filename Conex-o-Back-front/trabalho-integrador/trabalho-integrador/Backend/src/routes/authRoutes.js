const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const clienteMiddleware = require('../middlewares/clienteMiddleware');

// Recebe e-mail e senha; o controller valida a conta e cria o cookie de sessao.
router.post('/login', authController.login);

// Encerra a sessao removendo o cookie autenticado do navegador.
router.post('/logout', authController.logout);

// Valida os dados enviados e cria o cadastro do cliente junto com suas credenciais.
router.post('/cadastro', clienteMiddleware.validarCadastro, authController.cadastrar);

module.exports = router;