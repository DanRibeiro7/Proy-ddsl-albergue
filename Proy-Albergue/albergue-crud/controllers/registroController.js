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
            ORDER BY r.idregistro DESC
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
        const connection = await db.getConnection(); 

        const [[huespedActivo]] = await connection.query(
            "SELECT r.idhabitacion, h.numero_habitacion FROM registro r JOIN habitacion h ON r.idhabitacion = h.idhabitacion WHERE r.idpersona = ? AND r.estado = 'ACTIVO'",
            [idpersona]
        );

        if (huespedActivo) {
            connection.release();
            return res.status(400).json({
                success: false,
                mensaje: `Esta persona ya está alojada en la Habitación ${huespedActivo.numero_habitacion}. Debe dar salida primero.`
            });
        }

        const [[hab]] = await connection.query(
            'SELECT capacidad FROM habitacion WHERE idhabitacion = ?',
            [idhabitacion]
        );

        const [[ocupados]] = await connection.query(
            "SELECT COUNT(*) total FROM registro WHERE idhabitacion = ? AND estado = 'ACTIVO'",
            [idhabitacion]
        );

        if (ocupados.total >= hab.capacidad) {
            connection.release();
            return res.status(400).json({ success: false, mensaje: 'Habitación sin cupos disponibles' });
        }

        await connection.query(
            "INSERT INTO registro(idpersona, idhabitacion, fecha_ingreso, estado) VALUES (?, ?, ?, 'ACTIVO')",
            [idpersona, idhabitacion, fecha_ingreso]
        );

        await connection.query(
            "UPDATE habitacion SET estado='OCUPADA' WHERE idhabitacion=?",
            [idhabitacion]
        );

        connection.release();

        res.status(201).json({ success: true, mensaje: 'Ingreso registrado correctamente' });

    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error al registrar ingreso', error: error.message });
    }
};

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

const liberarPorHabitacion = async (req, res) => {
    try {
        const { idhabitacion } = req.params;

        const [registros] = await db.query(
            "SELECT idregistro FROM registro WHERE idhabitacion = ? AND estado = 'ACTIVO'",
            [idhabitacion]
        );

        if (registros.length === 0) {
            return res.status(404).json({ 
                success: false, 
                mensaje: 'No hay nadie hospedado en esta habitación actualmente.' 
            });
        }

        const idregistro = registros[0].idregistro;
        const fechaSalida = new Date(); 

        await db.query(
            "UPDATE registro SET fecha_salida = ?, estado = 'FINALIZADO' WHERE idregistro = ?",
            [fechaSalida, idregistro]
        );

        await db.query(
            "UPDATE habitacion SET estado = 'DISPONIBLE' WHERE idhabitacion = ?",
            [idhabitacion]
        );

        res.json({ 
            success: true, 
            mensaje: 'Salida registrada y habitación liberada correctamente' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            mensaje: 'Error al liberar habitación', 
            error: error.message 
        });
    }
};
const obtenerRegistroPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT 
                r.*, 
                h.numero_habitacion, h.piso, h.tipo AS tipo_habitacion,
                p.nombres, p.apellidos, p.dni, p.telefono, p.idtipo_persona,
                
                -- CAMBIO: Nombre de la comunidad
                c.nombre AS nombre_comunidad, 
                
                -- Datos de Estudiante
                fe.institucion, fe.carrera, fe.ciclo_actual,
                -- Datos de Paciente
                fp.diagnostico, fp.hospital_origen, fp.codigo_sis
            
            FROM registro r
            JOIN habitacion h ON r.idhabitacion = h.idhabitacion
            JOIN persona p ON r.idpersona = p.idpersona
            
            -- JOIN CORREGIDO: Tabla 'comunidad_nativa' y campo 'id_comunidad'
            LEFT JOIN comunidad_nativa c ON p.id_comunidad = c.id_comunidad 
            
            LEFT JOIN ficha_estudiante fe ON p.idpersona = fe.idpersona
            LEFT JOIN ficha_paciente fp ON p.idpersona = fp.idpersona
            
            WHERE r.idregistro = ?
        `;

       
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, mensaje: 'Registro no encontrado' });
        }

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
module.exports = {
    obtenerRegistros, 
    registrarIngreso,
    registrarSalida,
    totalAlbergados,
    liberarPorHabitacion,
    obtenerRegistroPorId
};