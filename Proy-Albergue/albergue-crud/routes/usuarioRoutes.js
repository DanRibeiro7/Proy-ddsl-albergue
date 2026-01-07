const express = require('express');
const router = express.Router();

// ✅ IMPORTAR AMBOS MIDDLEWARES
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

const {
  listarUsuarios,
  crearUsuario,
  cambiarEstado
} = require('../controllers/usuarioController');

// 🔐 Rutas protegidas SOLO ADMIN
router.get('/', verificarToken, soloAdmin, listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id/estado', verificarToken, soloAdmin, cambiarEstado);

module.exports = router;
