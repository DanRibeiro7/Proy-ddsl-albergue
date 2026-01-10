const db = require('../config/database');

const listarInstituciones = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM institucion_educativa WHERE estado = 'ACTIVO' ORDER BY idinstitucion");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const listarCentrosSalud = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM centro_salud WHERE estado = 'ACTIVO' ORDER BY idcentro_salud");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { listarInstituciones, listarCentrosSalud };