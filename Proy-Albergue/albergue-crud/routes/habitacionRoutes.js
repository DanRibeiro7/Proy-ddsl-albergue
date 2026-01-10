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

router.get('/', obtenerHabitaciones);
router.get('/:id', obtenerHabitacionPorId);
router.post('/', crearHabitacion);


router.put('/:id', actualizarHabitacion);

router.delete('/:id', eliminarHabitacion);
router.get('/:idhabitacion/detalle', obtenerDetalleOcupacion);

module.exports = router;
