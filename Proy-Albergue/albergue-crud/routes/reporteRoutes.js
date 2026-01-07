const express = require('express');
const router = express.Router();

const { verificarToken } = require('../middleware/auth.middleware');
const {
  totalHospedados,
  reportePorTipo
} = require('../controllers/reporteController');

// 🔐 Todas protegidas
router.get('/total', verificarToken, totalHospedados);
router.get('/tipo/:tipo', verificarToken, reportePorTipo);

module.exports = router;
