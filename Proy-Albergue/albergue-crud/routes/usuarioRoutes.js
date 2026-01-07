const express = require('express');
const router = express.Router();

// ✅ IMPORTAR AMBOS MIDDLEWARES
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

const {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstado
} = require('../controllers/usuarioController');

// 🔐 Rutas protegidas SOLO ADMIN
router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.put('/:id/estado', cambiarEstado);

module.exports = router;
