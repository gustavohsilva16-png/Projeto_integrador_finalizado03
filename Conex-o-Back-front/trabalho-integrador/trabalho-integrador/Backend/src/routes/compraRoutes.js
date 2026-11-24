const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const { exigirAutenticacao } = require('../middlewares/authSession');

// Exige sessao e finaliza a compra usando o cliente autenticado.
router.post('/finalizar-compra', exigirAutenticacao, compraController.finalizar);

module.exports = router;