const db = require('../config/database');

// 1. TOTAL DE HOSPEDADOS ACTIVOS
const totalHospedados = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total FROM registro WHERE estado = 'ACTIVO'
    `);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. COMPARATIVA POR TIPO (Para gráfico de torta)
const desglosePorTipo = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tp.nombre, COUNT(*) as cantidad
      FROM registro r
      JOIN persona p ON r.idpersona = p.idpersona
      JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
      WHERE r.estado = 'ACTIVO'
      GROUP BY tp.nombre
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. ESTADÍSTICA DE PROCEDENCIA (Top 5 lugares)
const topProcedencias = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.procedencia, COUNT(*) as cantidad
      FROM registro r
      JOIN persona p ON r.idpersona = p.idpersona
      WHERE r.estado = 'ACTIVO'
      GROUP BY p.procedencia
      ORDER BY cantidad DESC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. ESTADO DE HABITACIONES (Disponibles vs Ocupadas)
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

module.exports = {
  totalHospedados,
  desglosePorTipo,
  topProcedencias,
  estadoHabitaciones
};