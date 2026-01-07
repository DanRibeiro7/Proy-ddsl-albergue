const db = require('../config/database');
//tu viejo hilario
// 1. Obtener todas las personas
const obtenerPersonas = async (req, res) => {
    try {
        const [personas] = await db.query(`
            SELECT p.*, tp.nombre AS tipoPersona
            FROM persona p
            INNER JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
            ORDER BY p.idpersona DESC
        `);

        res.json({
            success: true,
            count: personas.length,
            data: personas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener personas",
            error: error.message
        });
    }
};

// 2. Obtener persona por ID
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
// 3. Crear Persona (CORREGIDO: Valida duplicados)
const crearPersona = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction(); 

        const { 
            dni, nombres, apellidos, telefono, procedencia, idtipo_persona,
            datosPaciente, datosEstudiante 
        } = req.body;

        // 1. Validaciones básicas
        if (!dni || !nombres || !apellidos) {
            throw new Error("Faltan datos obligatorios");
        }

        // 2. VALIDACIÓN DE UNICIDAD (CAMBIO IMPORTANTE AQUÍ)
        const [existente] = await connection.query('SELECT idpersona FROM persona WHERE dni = ?', [dni]);
        
        if (existente.length > 0) {
            // Si ya existe, NO actualizamos. Cancelamos y devolvemos error.
            await connection.rollback();
            connection.release();
            return res.status(400).json({ 
                success: false, 
                mensaje: `El DNI ${dni} ya está registrado en el sistema.` 
            });
        }

        // 3. Insertar Persona (Solo si no existe)
        const [result] = await connection.query(
            `INSERT INTO persona (dni, nombres, apellidos, telefono, procedencia, idtipo_persona) VALUES (?, ?, ?, ?, ?, ?)`,
            [dni, nombres, apellidos, telefono, procedencia, idtipo_persona]
        );
        const idPersonaFinal = result.insertId;

        // 4. Guardar Ficha Específica
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
        // Enviamos el mensaje de error al frontend
        res.status(500).json({ 
            success: false, 
            mensaje: error.message || "Error interno del servidor"
        });
    }
};
// 4. Actualizar persona (Endpoint explícito PUT)
// personaController.js

const actualizarPersona = async (req, res) => {
    const connection = await db.getConnection(); // Usamos transacción
    
    try {
        await connection.beginTransaction();

        const { id } = req.params; // ID de la persona
        const { 
            dni, nombres, apellidos, telefono, procedencia, idtipo_persona, 
            datosPaciente, datosEstudiante // <--- IMPORTANTE: Recibir estos datos
        } = req.body;

        // 1. Verificar si existe
        const [personaExistente] = await connection.query('SELECT idpersona FROM persona WHERE idpersona = ?', [id]);

        if (personaExistente.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ success: false, mensaje: "Persona no encontrada" });
        }

        // 2. Actualizar datos básicos
        await connection.query(
            `UPDATE persona
             SET dni=?, nombres=?, apellidos=?, telefono=?, procedencia=?, idtipo_persona=?
             WHERE idpersona=?`,
            [dni, nombres, apellidos, telefono, procedencia, idtipo_persona, id]
        );

        // 3. ACTUALIZAR/INSERTAR FICHA (Aquí estaba el problema)
        
        // Si es PACIENTE (1)
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

        // Si es ESTUDIANTE (2)
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

// 5. Eliminar persona
const eliminarPersona = async (req, res) => {
    try {
        const { id } = req.params;
        const [personaExistente] = await db.query('SELECT idpersona FROM persona WHERE idpersona = ?', [id]);

        if (personaExistente.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Persona no encontrada" });
        }

        await db.query('DELETE FROM persona WHERE idpersona = ?', [id]);

        res.json({ success: true, mensaje: "Persona eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error al eliminar persona", error: error.message });
    }
};

// 6. Obtener personas por tipo
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

// 7. Buscar por DNI (Para autocompletar)
// personaController.js

const buscarPorDni = async (req, res) => {
    try {
        const { dni } = req.params;
        
        // Traemos datos básicos
        const [persona] = await db.query('SELECT * FROM persona WHERE dni = ?', [dni]);

        if (persona.length === 0) {
            return res.json({ success: true, data: null, mensaje: "Persona no encontrada" });
        }

        const datosPersona = persona[0];

        // SI ES ESTUDIANTE (2), BUSCAMOS SU FICHA
        if (datosPersona.idtipo_persona === 2) {
            const [ficha] = await db.query('SELECT * FROM ficha_estudiante WHERE idpersona = ?', [datosPersona.idpersona]);
            if (ficha.length > 0) {
                // Agregamos los datos al objeto de respuesta
                datosPersona.datosEstudiante = {
                    institucion: ficha[0].institucion,
                    carrera: ficha[0].carrera,
                    ciclo: ficha[0].ciclo_actual
                };
            }
        }

        // SI ES PACIENTE (1), BUSCAMOS SU FICHA
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