const db = require('../config/database');
const bcrypt = require('bcryptjs');

// =======================
// LISTAR usuarios
// =======================
const listarUsuarios = async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.idusuario, u.username, u.estado, r.nombre AS rol, u.idrol
    FROM usuario u
    INNER JOIN rol r ON u.idrol = r.idrol
  `);

  res.json({ success: true, data: rows });
};

// =======================
// CREAR usuario
// =======================
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

// =======================
// ACTUALIZAR usuario
// =======================
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { username, password, idrol } = req.body;

  try {
    // Si viene password, lo actualizamos
    if (password) {
      const hash = await bcrypt.hash(password, 10);

      await db.query(
        `UPDATE usuario
         SET username = ?, password = ?, idrol = ?
         WHERE idusuario = ?`,
        [username, hash, idrol, id]
      );
    } else {
      // Si NO viene password
      await db.query(
        `UPDATE usuario
         SET username = ?, idrol = ?
         WHERE idusuario = ?`,
        [username, idrol, id]
      );
    }

    res.json({
      success: true,
      mensaje: 'Usuario actualizado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar usuario'
    });
  }
};

// =======================
// CAMBIAR estado
// CAMBIAR ESTADO (ENUM)
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'ACTIVO' | 'INACTIVO'

  if (!estado || !['ACTIVO', 'INACTIVO'].includes(estado)) {
    return res.status(400).json({
      success: false,
      mensaje: 'Estado inválido'
    });
  }

  await db.query(
    'UPDATE usuario SET estado = ? WHERE idusuario = ?',
    [estado, id]
  );

  res.json({
    success: true,
    mensaje: 'Estado actualizado'
  });
};


module.exports = {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstado
};
