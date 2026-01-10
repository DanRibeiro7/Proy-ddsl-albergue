const express = require('express');
const router = express.Router();

const {
    obtenerPersonas,
    obtenerPersonaPorId,
    crearPersona,
    buscarPorDni,
    actualizarPersona,
    eliminarPersona,
    obtenerPersonasPorTipo
} = require('../controllers/personaController');

router.get('/', obtenerPersonas);
router.get('/:id', obtenerPersonaPorId);
router.get('/tipo/:id', obtenerPersonasPorTipo);
router.get('/buscar/:dni', buscarPorDni);
router.post('/', crearPersona);

router.put('/:id', actualizarPersona);

router.delete('/:id', eliminarPersona);

module.exports = router;
