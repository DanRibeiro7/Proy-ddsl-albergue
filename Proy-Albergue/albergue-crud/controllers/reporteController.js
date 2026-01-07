const db = require('../config/database');

// 🥘 TOTAL DE HOSPEDADOS (para raciones)
const totalHospedados = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM registro
      WHERE estado = 'ACTIVO'
    `);

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error en reporte total'
    });
  }
};

// 👥 REPORTE POR TIPO (PACIENTE / ESTUDIANTE)
const reportePorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM registro r
      INNER JOIN persona p ON r.idpersona = p.idpersona
      INNER JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
      WHERE r.estado = 'ACTIVO'
        AND tp.nombre = ?
    `, [tipo]);

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      mensaje: 'Error en reporte por tipo'
    });
  }
};

module.exports = {
  totalHospedados,
  reportePorTipo
};
