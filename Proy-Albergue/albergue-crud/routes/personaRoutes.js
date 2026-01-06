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

// GET
router.get('/', obtenerPersonas);
router.get('/:id', obtenerPersonaPorId);
router.get('/tipo/:id', obtenerPersonasPorTipo);
router.get('/buscar/:dni', buscarPorDni);
// POST
router.post('/', crearPersona);

// PUT
router.put('/:id', actualizarPersona);

// DELETE
router.delete('/:id', eliminarPersona);

module.exports = router;
