const express = require('express');
const router = express.Router();
const produtoMiddleware = require('../middlewares/produtoMiddleware');
const produtoController = require('../controllers/produtoController');
const { exigirAutenticacao, exigirAdministrador } = require('../middlewares/authSession');

// Disponibiliza a listagem publica do catalogo.
router.get('/produtos', produtoController.listar);

// Exige sessao de administrador e valida os campos antes de cadastrar.
router.post('/produtos', exigirAutenticacao, exigirAdministrador, produtoMiddleware, produtoController.cadastrar);

// Exige sessao de administrador e valida os campos antes de atualizar pelo ID.
router.put('/produtos/:id', exigirAutenticacao, exigirAdministrador, produtoMiddleware, produtoController.atualizar);

// Exige sessao de administrador antes de excluir o produto identificado pelo ID.
router.delete('/produtos/:id', exigirAutenticacao, exigirAdministrador, produtoController.excluir);

module.exports = router;