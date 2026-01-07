const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  const [usuarios] = await db.query(
    `SELECT u.idusuario, u.username, u.password, r.nombre AS rol
     FROM usuario u
     JOIN rol r ON u.idrol = r.idrol
     WHERE u.username = ? AND u.estado = 'ACTIVO'`,
    [username]
  );

  if (usuarios.length === 0) {
    return res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
  }

  const usuario = usuarios[0];
  const valido = await bcrypt.compare(password, usuario.password);

  if (!valido) {
    return res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    {
      idusuario: usuario.idusuario,
      username: usuario.username,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    mensaje: 'Login exitoso',
    token,
    usuario: {
      idusuario: usuario.idusuario,
      username: usuario.username,
      rol: usuario.rol
    }
  });
};

module.exports = { login };
