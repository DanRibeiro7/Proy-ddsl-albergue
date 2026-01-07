const express = require('express');
const router = express.Router();

const {
    obtenerRegistros,
    registrarIngreso,
    registrarSalida,
    totalAlbergados,
    liberarPorHabitacion,
    obtenerRegistroPorId    
} = require('../controllers/registroController');

router.get('/', obtenerRegistros); 
router.post('/ingreso', registrarIngreso);
router.put('/salida', registrarSalida);
router.get('/total', totalAlbergados);
router.put('/liberar-habitacion/:idhabitacion', liberarPorHabitacion);
router.get('/:id', obtenerRegistroPorId);

module.exports = router;