const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController');
const { exigirAutenticacao } = require('../middlewares/authSession');

// Exige sessao e retorna os itens do proprio cliente identificado no caminho.
router.get('/carrinho/:id_cliente', exigirAutenticacao, carrinhoController.buscar);

// Exige sessao; o controller associa o item ao cliente autenticado.
router.post('/carrinho', exigirAutenticacao, carrinhoController.adicionar);

// Exige sessao e remove somente um item pertencente ao cliente autenticado.
router.delete('/carrinho/:id_carrinho', exigirAutenticacao, carrinhoController.remover);

module.exports = router;