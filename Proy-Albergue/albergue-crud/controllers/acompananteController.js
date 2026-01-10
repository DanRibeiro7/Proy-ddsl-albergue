const db = require('../config/database');

const agregarAcompanante = async (req, res) => {
    try {
        const { idregistro, idpersona, parentesco } = req.body;
        const [esHuesped] = await db.query(
            "SELECT idregistro FROM registro WHERE idpersona = ? AND estado = 'ACTIVO'",
            [idpersona]
        );

        if (esHuesped.length > 0) {
            return res.status(400).json({ 
                success: false, 
                mensaje: 'Esta persona ya figura como HUÉSPED PRINCIPAL en una habitación activa.' 
            });
        }
        const [esAcompanante] = await db.query(`
            SELECT a.idacompanante 
            FROM acompanante a
            INNER JOIN registro r ON a.idregistro = r.idregistro
            WHERE a.idpersona = ? 
              AND a.estado = 'ACTIVO' 
              AND r.estado = 'ACTIVO'
        `, [idpersona]);

        if (esAcompanante.length > 0) {
            return res.status(400).json({ 
                success: false, 
                mensaje: 'Esta persona ya está registrada como ACOMPAÑANTE en otra habitación ocupada.' 
            });
        }
        const [infoCapacidad] = await db.query(`
            SELECT h.capacidad, 
                   (1 + (SELECT COUNT(*) FROM acompanante WHERE idregistro = ? AND estado = 'ACTIVO')) as total_actual
            FROM registro r
            JOIN habitacion h ON r.idhabitacion = h.idhabitacion
            WHERE r.idregistro = ?
        `, [idregistro, idregistro]);

        if (infoCapacidad.length > 0) {
            const { capacidad, total_actual } = infoCapacidad[0];
            if (total_actual >= capacidad) {
                return res.status(400).json({ 
                    success: false, 
                    mensaje: `La habitación ya alcanzó su capacidad máxima de ${capacidad} personas.` 
                });
            }
        }
        

        await db.query(
            "INSERT INTO acompanante (idregistro, idpersona, parentesco, estado) VALUES (?, ?, ?, 'ACTIVO')",
            [idregistro, idpersona, parentesco]
        );
        res.json({ success: true, mensaje: 'Acompañante agregado correctamente' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const listarPorRegistro = async (req, res) => {
    try {
        const { idregistro } = req.params;
        const [lista] = await db.query(`
            SELECT a.idacompanante, a.parentesco, p.nombres, p.apellidos, p.dni 
            FROM acompanante a
            JOIN persona p ON a.idpersona = p.idpersona
            WHERE a.idregistro = ? AND a.estado = 'ACTIVO'
        `, [idregistro]);
        res.json({ success: true, data: lista });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
const eliminarAcompanante = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE acompanante SET estado = 'ELIMINADO' WHERE idacompanante = ?", [id]);
        res.json({ success: true, mensaje: 'Acompañante retirado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
module.exports = { agregarAcompanante, listarPorRegistro,eliminarAcompanante };