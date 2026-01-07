const express = require('express');
const router = express.Router();

// Importar el middleware de seguridad (asegúrate que el nombre del archivo sea correcto)
const { verificarToken } = require('../middleware/auth.middleware');

// Importar los 4 controladores nuevos para el Dashboard
const {
  totalHospedados,
  desglosePorTipo,    // Antes era reportePorTipo, ahora trae todo el grupo
  topProcedencias,    // Nuevo
  estadoHabitaciones  // Nuevo
} = require('../controllers/reporteController');

// ==========================================
// 🔐 RUTAS PROTEGIDAS (Requieren Token)
// Prefijo: /api/reportes
// ==========================================

// 1. Para la tarjeta azul (Total hospedados)
router.get('/total', verificarToken, totalHospedados);

// 2. Para el gráfico de torta (Estudiantes vs Pacientes)
router.get('/por-tipo', verificarToken, desglosePorTipo);

// 3. Para la tabla de comunidades (Top Procedencias)
router.get('/procedencias', verificarToken, topProcedencias);

// 4. Para calcular camas libres (Total - Ocupadas)
router.get('/habitaciones-estado', verificarToken, estadoHabitaciones);

module.exports = router;