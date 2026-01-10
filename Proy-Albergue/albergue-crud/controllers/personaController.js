const db = require('../config/database');

const obtenerPersonas = async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.*, 
                tp.nombre AS tipoPersona,
                c.nombre AS nombre_comunidad,
                
                -- CAMPO CALCULADO: Sumamos si es Titular + si es Acompañante
                (
                    -- 1. Verificar si es Titular Activo
                    (SELECT COUNT(*) FROM registro r 
                     WHERE r.idpersona = p.idpersona AND r.estado = 'ACTIVO') 
                    +
                    -- 2. Verificar si es Acompañante Activo (vinculado a un registro activo)
                    (SELECT COUNT(*) FROM acompanante a
                     INNER JOIN registro r2 ON a.idregistro = r2.idregistro
                     WHERE a.idpersona = p.idpersona AND a.estado = 'ACTIVO' AND r2.estado = 'ACTIVO')
                ) AS es_hospedado,

                -- Datos de Estudiante
                fe.institucion, fe.carrera, fe.ciclo_actual,
                -- Datos de Paciente
                fp.diagnostico, fp.hospital_origen, fp.codigo_sis

            FROM persona p
            INNER JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
            LEFT JOIN comunidad_nativa c ON p.id_comunidad = c.id_comunidad
            LEFT JOIN ficha_estudiante fe ON p.idpersona = fe.idpersona
            LEFT JOIN ficha_paciente fp ON p.idpersona = fp.idpersona
            
            WHERE p.estado = 'ACTIVO'
            ORDER BY p.idpersona DESC
        `;

        const [personas] = await db.query(sql);

        res.json({
            success: true,
            count: personas.length,
            data: personas
        });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error", error: error.message });
    }
};  

const obtenerPersonaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [persona] = await db.query(`
            SELECT p.*, tp.nombre AS tipoPersona
            FROM persona p
            INNER JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
            WHERE p.idpersona = ?
        `, [id]);

        if (persona.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Persona no encontrada"
            });
        }

        res.json({
            success: true,
            data: persona[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener la persona",
            error: error.message
        });
    }
};

const crearPersona = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction(); 

        const { 
            dni, nombres, apellidos, telefono, id_comunidad, idtipo_persona,
            datosPaciente, datosEstudiante 
        } = req.body;

        if (!dni || !nombres || !apellidos) {
            throw new Error("Faltan datos obligatorios");
        }


        const [existente] = await connection.query('SELECT idpersona FROM persona WHERE dni = ?', [dni]);
        
        if (existente.length > 0) {
 
            await connection.rollback();
            connection.release();
            return res.status(400).json({ 
                success: false, 
                mensaje: `El DNI ${dni} ya está registrado en el sistema.` 
            });
        }

        const [result] = await connection.query(
            `INSERT INTO persona (dni, nombres, apellidos, telefono, id_comunidad, idtipo_persona) VALUES (?, ?, ?, ?, ?, ?)`,
            [dni, nombres, apellidos, telefono, id_comunidad, idtipo_persona]
        );
        const idPersonaFinal = result.insertId;

        if (idtipo_persona == 1 && datosPaciente) {
            await connection.query(
                `INSERT INTO ficha_paciente (idpersona, diagnostico, hospital_origen, codigo_sis) 
                 VALUES (?, ?, ?, ?)`,
                [idPersonaFinal, datosPaciente.diagnostico, datosPaciente.hospital, datosPaciente.sis]
            );
        }

        if (idtipo_persona == 2 && datosEstudiante) {
            await connection.query(
                `INSERT INTO ficha_estudiante (idpersona, institucion, carrera, ciclo_actual) 
                 VALUES (?, ?, ?, ?)`,
                [idPersonaFinal, datosEstudiante.institucion, datosEstudiante.carrera, datosEstudiante.ciclo]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            mensaje: "Persona registrada correctamente",
            data: { idpersona: idPersonaFinal }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        res.status(500).json({ 
            success: false, 
            mensaje: error.message || "Error interno del servidor"
        });
    }
};

const actualizarPersona = async (req, res) => {
    const connection = await db.getConnection(); 
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { 
            dni, nombres, apellidos, telefono, id_comunidad, idtipo_persona, 
            datosPaciente, datosEstudiante
        } = req.body;


        const [personaExistente] = await connection.query('SELECT idpersona FROM persona WHERE idpersona = ?', [id]);

        if (personaExistente.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ success: false, mensaje: "Persona no encontrada" });
        }

        await connection.query(
            `UPDATE persona
             SET dni=?, nombres=?, apellidos=?, telefono=?, id_comunidad=?, idtipo_persona=?
             WHERE idpersona=?`,
            [dni, nombres, apellidos, telefono, id_comunidad, idtipo_persona, id]
        );

        if (idtipo_persona == 1 && datosPaciente) {
            await connection.query(
                `INSERT INTO ficha_paciente (idpersona, diagnostico, hospital_origen, codigo_sis) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 diagnostico=?, hospital_origen=?, codigo_sis=?`,
                [id, datosPaciente.diagnostico, datosPaciente.hospital, datosPaciente.sis,
                 datosPaciente.diagnostico, datosPaciente.hospital, datosPaciente.sis]
            );
        }

        if (idtipo_persona == 2 && datosEstudiante) {
            await connection.query(
                `INSERT INTO ficha_estudiante (idpersona, institucion, carrera, ciclo_actual) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 institucion=?, carrera=?, ciclo_actual=?`,
                [id, datosEstudiante.institucion, datosEstudiante.carrera, datosEstudiante.ciclo,
                 datosEstudiante.institucion, datosEstudiante.carrera, datosEstudiante.ciclo]
            );
        }

        await connection.commit();
        connection.release();

        res.json({ success: true, mensaje: "Persona y ficha actualizadas correctamente" });

    } catch (error) {
        if (connection) await connection.rollback();
        connection.release();
        res.status(500).json({ success: false, mensaje: "Error al actualizar persona", error: error.message });
    }
};

const eliminarPersona = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { id } = req.params;

        const [persona] = await connection.query('SELECT idpersona FROM persona WHERE idpersona = ?', [id]);
        
        if (persona.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, mensaje: "Persona no encontrada" });
        }

        const [hospedajeActivo] = await connection.query(
            "SELECT idregistro FROM registro WHERE idpersona = ? AND estado = 'ACTIVO'", 
            [id]
        );

        if (hospedajeActivo.length > 0) {
            connection.release();
            return res.status(400).json({ 
                success: false, 
                mensaje: "No se puede eliminar: Esta persona está hospedada actualmente." 
            });
        }

        await connection.query(
            "UPDATE persona SET estado = 'INACTIVO' WHERE idpersona = ?", 
            [id]
        );

        connection.release();

        res.json({ success: true, mensaje: "Persona desactivada correctamente" });

    } catch (error) {
        connection.release();
        res.status(500).json({ 
            success: false, 
            mensaje: "Error al eliminar persona", 
            error: error.message 
        });
    }
};

const obtenerPersonasPorTipo = async (req, res) => {
    try {
        const { id } = req.params;
        const [personas] = await db.query(`
            SELECT p.*, tp.nombre AS tipoPersona
            FROM persona p
            INNER JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
            WHERE p.idtipo_persona = ?
        `, [id]);

        res.json({ success: true, count: personas.length, data: personas });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error al obtener personas por tipo", error: error.message });
    }
};


const buscarPorDni = async (req, res) => {
    try {
        const { dni } = req.params;

        const [persona] = await db.query('SELECT * FROM persona WHERE dni = ?', [dni]);

        if (persona.length === 0) {
            return res.json({ success: true, data: null, mensaje: "Persona no encontrada" });
        }

        const datosPersona = persona[0];

        if (datosPersona.idtipo_persona === 2) {
            const [ficha] = await db.query('SELECT * FROM ficha_estudiante WHERE idpersona = ?', [datosPersona.idpersona]);
            if (ficha.length > 0) {

                datosPersona.datosEstudiante = {
                    institucion: ficha[0].institucion,
                    carrera: ficha[0].carrera,
                    ciclo: ficha[0].ciclo_actual
                };
            }
        }

        if (datosPersona.idtipo_persona === 1) {
            const [ficha] = await db.query('SELECT * FROM ficha_paciente WHERE idpersona = ?', [datosPersona.idpersona]);
            if (ficha.length > 0) {
                datosPersona.datosPaciente = {
                    diagnostico: ficha[0].diagnostico,
                    hospital: ficha[0].hospital_origen,
                    sis: ficha[0].codigo_sis
                };
            }
        }

        res.json({ success: true, data: datosPersona });

    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error al buscar por DNI", error: error.message });
    }
};

module.exports = {
    obtenerPersonas,
    obtenerPersonaPorId,
    crearPersona,
    actualizarPersona,
    eliminarPersona,
    obtenerPersonasPorTipo,
    buscarPorDni
};