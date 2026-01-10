const express = require('express');
const router = express.Router();

const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

const {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstado
} = require('../controllers/usuarioController');

router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.put('/:id/estado', cambiarEstado);

module.exports = router;
