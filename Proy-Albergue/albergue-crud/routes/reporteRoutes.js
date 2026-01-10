const express = require('express');
const router = express.Router();


const {
  totalHospedados,
  desglosePorTipo,
  topProcedencias,
  estadoHabitaciones,
  estadiasProlongadas
} = require('../controllers/reporteController');

router.get('/total', totalHospedados);
router.get('/por-tipo', desglosePorTipo);
router.get('/procedencias', topProcedencias);
router.get('/habitaciones-estado', estadoHabitaciones);
router.get('/estadias-prolongadas', estadiasProlongadas);

module.exports = router;