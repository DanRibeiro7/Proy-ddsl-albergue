const express = require('express');
const router = express.Router();

const { 
    agregarAcompanante, 
    listarPorRegistro, 
    eliminarAcompanante 
} = require('../controllers/acompananteController');

router.post('/', agregarAcompanante);
router.get('/:idregistro', listarPorRegistro);
router.delete('/:id', eliminarAcompanante);

module.exports = router;