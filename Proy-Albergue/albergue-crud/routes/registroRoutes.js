const express = require('express');
const router = express.Router();

const {
    obtenerRegistros,
    registrarIngreso,
    registrarSalida
} = require('../controllers/registroController');

router.get('/', obtenerRegistros); 
router.post('/', registrarIngreso);
router.put('/salida', registrarSalida);

module.exports = router;