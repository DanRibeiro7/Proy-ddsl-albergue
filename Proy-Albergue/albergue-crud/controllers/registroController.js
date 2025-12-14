const db = require('../config/database');

// Registrar ingreso
const registrarIngreso = async (req, res) => {
    try {
        const { idpersona, idhabitacion, fecha_ingreso } = req.body;

        // capacidad
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

        await db.query(
            `INSERT INTO registro(idpersona, idhabitacion, fecha_ingreso)
             VALUES (?, ?, ?)`,
            [idpersona, idhabitacion, fecha_ingreso]
        );

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

        await db.query(
            `UPDATE registro
             SET fecha_salida=?, estado='FINALIZADO'
             WHERE idregistro=?`,
            [fecha_salida, idregistro]
        );

        const [[restantes]] = await db.query(
            `SELECT COUNT(*) total
             FROM registro
             WHERE idhabitacion=? AND estado='ACTIVO'`,
            [registro.idhabitacion]
        );

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
    registrarIngreso,
    registrarSalida,
    totalAlbergados
};
