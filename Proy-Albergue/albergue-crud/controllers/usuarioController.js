const db = require('../config/database');
const bcrypt = require('bcryptjs');

// LISTAR usuarios
const listarUsuarios = async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.idusuario, u.username, u.estado, r.nombre AS rol
    FROM usuario u
    INNER JOIN rol r ON u.idrol = r.idrol
  `);

  res.json({ success: true, data: rows });
};

// CREAR usuario
const crearUsuario = async (req, res) => {
  const { username, password, idrol } = req.body;

  if (!username || !password || !idrol) {
    return res.status(400).json({
      success: false,
      mensaje: 'Datos incompletos'
    });
  }

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO usuario (username, password, idrol) VALUES (?, ?, ?)',
    [username, hash, idrol]
  );

  res.status(201).json({
    success: true,
    mensaje: 'Usuario creado correctamente'
  });
};

// CAMBIAR estado
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  await db.query(
    'UPDATE usuario SET estado = ? WHERE idusuario = ?',
    [estado, id]
  );

  res.json({ success: true, mensaje: 'Estado actualizado' });
};

module.exports = {
  listarUsuarios,
  crearUsuario,
  cambiarEstado
};
