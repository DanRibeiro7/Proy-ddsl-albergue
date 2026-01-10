const db = require('../config/database');

const totalHospedados = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        (
          (SELECT COUNT(*) FROM registro WHERE estado = 'ACTIVO') 
          + 
          (SELECT COUNT(*) FROM acompanante a 
           INNER JOIN registro r ON a.idregistro = r.idregistro 
           WHERE r.estado = 'ACTIVO' AND a.estado = 'ACTIVO')
        ) AS total_real_personas
    `);
    res.json({ success: true, data: { total: rows[0].total_real_personas } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const desglosePorTipo = async (req, res) => {
  try {
    const [rows] = await db.query(`
      -- 1. Contar Estudiantes y Pacientes (Titulares)
      SELECT tp.nombre, COUNT(*) as cantidad
      FROM registro r
      JOIN persona p ON r.idpersona = p.idpersona
      JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
      WHERE r.estado = 'ACTIVO'
      GROUP BY tp.nombre

      UNION ALL

      -- 2. Contar Acompañantes Activos
      SELECT 'ACOMPAÑANTE' as nombre, COUNT(*) as cantidad
      FROM acompanante a
      JOIN registro r ON a.idregistro = r.idregistro
      WHERE r.estado = 'ACTIVO' AND a.estado = 'ACTIVO'
    `);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const topProcedencias = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.nombre AS procedencia, COUNT(*) as cantidad
      FROM registro r
      JOIN persona p ON r.idpersona = p.idpersona
      -- Hacemos JOIN con la nueva tabla comunidad_nativa
      JOIN comunidad_nativa c ON p.id_comunidad = c.id_comunidad
      WHERE r.estado = 'ACTIVO'
      GROUP BY c.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const estadoHabitaciones = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM habitacion
      GROUP BY estado
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const estadiasProlongadas = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT p.nombres, p.apellidos, r.fecha_ingreso,
      DATEDIFF(NOW(), r.fecha_ingreso) as dias_estadia
      FROM registro r
      JOIN persona p ON r.idpersona = p.idpersona
      WHERE r.estado = 'ACTIVO'
      ORDER BY dias_estadia DESC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  totalHospedados,
  desglosePorTipo,
  topProcedencias,
  estadoHabitaciones,
  estadiasProlongadas
};