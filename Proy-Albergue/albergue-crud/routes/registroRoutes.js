const express = require('express');
const router = express.Router();

const {
    registrarIngreso,
    registrarSalida,
    totalAlbergados
} = require('../controllers/registroController');

// POST
router.post('/ingreso', registrarIngreso);
router.post('/salida', registrarSalida);

// GET
router.get('/total', totalAlbergados);

module.exports = router;
