const express = require('express');
const router = express.Router();

const {
    obtenerComunidades,
    obtenerComunidadPorId,
    crearComunidad,
    actualizarComunidad,
    eliminarComunidad
} = require('../controllers/comunidadController');

router.get('/', obtenerComunidades);
router.get('/:id', obtenerComunidadPorId);
router.post('/', crearComunidad);
router.put('/:id', actualizarComunidad);
router.delete('/:id', eliminarComunidad);

module.exports = router;