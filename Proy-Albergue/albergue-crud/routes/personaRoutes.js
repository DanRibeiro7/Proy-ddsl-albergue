const express = require('express');
const router = express.Router();

const {
    obtenerPersonas,
    obtenerPersonaPorId,
    crearPersona,
    actualizarPersona,
    eliminarPersona,
    obtenerPersonasPorTipo
} = require('../controllers/personaController');

// GET
router.get('/', obtenerPersonas);
router.get('/:id', obtenerPersonaPorId);
router.get('/tipo/:id', obtenerPersonasPorTipo);

// POST
router.post('/', crearPersona);

// PUT
router.put('/:id', actualizarPersona);

// DELETE
router.delete('/:id', eliminarPersona);

module.exports = router;
