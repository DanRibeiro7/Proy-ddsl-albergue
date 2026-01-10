const express = require('express');
const router = express.Router();

const {
    listarInstituciones, 
    listarCentrosSalud
} = require('../controllers/maestroController');


router.get('/instituciones', listarInstituciones);
router.get('/centros-salud', listarCentrosSalud);

module.exports = router;