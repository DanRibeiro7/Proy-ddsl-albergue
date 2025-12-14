const express = require('express');
const router = express.Router();

const {
    obtenerHabitaciones,
    obtenerHabitacionPorId,
    crearHabitacion,
    actualizarHabitacion,
    eliminarHabitacion
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

module.exports = router;
