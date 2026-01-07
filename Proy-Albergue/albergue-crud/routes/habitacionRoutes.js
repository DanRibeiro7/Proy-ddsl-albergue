const express = require('express');
const router = express.Router();

const {
    obtenerHabitaciones,
    obtenerHabitacionPorId,
    crearHabitacion,
    actualizarHabitacion,
    eliminarHabitacion,
    obtenerDetalleOcupacion
} = require('../controllers/habitacionController');

// GET
router.get('/', obtenerHabitaciones);
router.get('/:id', obtenerHabitacionPorId);

// POST
router.post('/', crearHabitacion);

// PUT
router.put('/:id', actualizarHabitacion);

// DELETE
router.delete('/:id', eliminarHabitacion);
router.get('/:idhabitacion/detalle', obtenerDetalleOcupacion);

module.exports = router;
