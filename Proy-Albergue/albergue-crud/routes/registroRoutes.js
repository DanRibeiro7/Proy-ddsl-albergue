const express = require('express');
const router = express.Router();

const {
    obtenerRegistros,
    registrarIngreso,
    registrarSalida,
    totalAlbergados,
    liberarPorHabitacion
} = require('../controllers/registroController');

router.get('/', obtenerRegistros); 
router.post('/ingreso', registrarIngreso);
router.put('/salida', registrarSalida);
router.get('/total', totalAlbergados);
router.put('/liberar-habitacion/:idhabitacion', liberarPorHabitacion);

module.exports = router;