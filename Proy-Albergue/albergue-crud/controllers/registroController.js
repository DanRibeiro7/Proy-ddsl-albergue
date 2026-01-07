const db = require('../config/database');

const obtenerRegistros = async (req, res) => {
    try {
        const sql = `
            SELECT 
                r.idregistro,
                r.fecha_ingreso,
                r.fecha_salida,
                r.estado,
                CONCAT(p.nombres, ' ', p.apellidos) as nombre_huesped,
                p.dni,
                h.numero_habitacion,
                h.piso
            FROM registro r
            INNER JOIN persona p ON r.idpersona = p.idpersona
            INNER JOIN habitacion h ON r.idhabitacion = h.idhabitacion
            ORDER BY r.fecha_ingreso DESC
        `;

        const [registros] = await db.query(sql);

        res.json({
            success: true,
            data: registros
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            mensaje: 'Error al obtener registros',
            error: error.message 
        });
    }
};

const registrarIngreso = async (req, res) => {
    try {
        const { idpersona, idhabitacion, fecha_ingreso } = req.body;

        // Validar capacidad
        const [[hab]] = await db.query(
            'SELECT capacidad FROM habitacion WHERE idhabitacion = ?',
            [idhabitacion]
        );

        const [[ocupados]] = await db.query(
            `SELECT COUNT(*) total
             FROM registro
             WHERE idhabitacion = ? AND estado = 'ACTIVO'`,
            [idhabitacion]
        );

        if (ocupados.total >= hab.capacidad) {
            return res.status(400).json({
                success: false,
                mensaje: 'Habitación sin cupos disponibles'
            });
        }

        // Insertar registro
        await db.query(
            `INSERT INTO registro(idpersona, idhabitacion, fecha_ingreso, estado)
             VALUES (?, ?, ?, 'ACTIVO')`,
            [idpersona, idhabitacion, fecha_ingreso]
        );

        // Actualizar estado de habitación a OCUPADA
        await db.query(
            `UPDATE habitacion SET estado='OCUPADA'
             WHERE idhabitacion=?`,
            [idhabitacion]
        );

        res.status(201).json({
            success: true,
            mensaje: 'Ingreso registrado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al registrar ingreso',
            error: error.message
        });
    }
};

// Registrar salida
const registrarSalida = async (req, res) => {
    try {
        const { idregistro, fecha_salida } = req.body;

        const [[registro]] = await db.query(
            'SELECT idhabitacion FROM registro WHERE idregistro=?',
            [idregistro]
        );

        if (!registro) {
             return res.status(404).json({ success: false, mensaje: 'Registro no encontrado' });
        }

        await db.query(
            `UPDATE registro
             SET fecha_salida=?, estado='FINALIZADO'
             WHERE idregistro=?`,
            [fecha_salida, idregistro]
        );

        // Verificar si quedan personas en la habitación
        const [[restantes]] = await db.query(
            `SELECT COUNT(*) total
             FROM registro
             WHERE idhabitacion=? AND estado='ACTIVO'`,
            [registro.idhabitacion]
        );

        // Si ya no queda nadie, liberamos la habitación
        if (restantes.total === 0) {
            await db.query(
                `UPDATE habitacion SET estado='DISPONIBLE'
                 WHERE idhabitacion=?`,
                [registro.idhabitacion]
            );
        }

        res.json({
            success: true,
            mensaje: 'Salida registrada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al registrar salida',
            error: error.message
        });
    }
};

// Reporte total albergados activos
const totalAlbergados = async (req, res) => {
    try {
        const [[total]] = await db.query(
            `SELECT COUNT(*) total FROM registro WHERE estado='ACTIVO'`
        );

        res.json({
            success: true,
            total: total.total
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener reporte',
            error: error.message
        });
    }
};

module.exports = {
    obtenerRegistros, 
    registrarIngreso,
    registrarSalida,
    totalAlbergados
};