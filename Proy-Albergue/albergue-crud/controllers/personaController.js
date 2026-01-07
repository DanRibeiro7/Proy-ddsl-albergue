const db = require('../config/database');

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

// 3. Crear o Actualizar Persona (LÓGICA CORREGIDA PARA EVITAR ERROR 500)
const crearPersona = async (req, res) => {
    // Iniciamos una conexión para transacción (importante para guardar en 2 tablas)
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction(); // INICIA TRANSACCIÓN

        const { 
            dni, nombres, apellidos, telefono, procedencia, idtipo_persona,
            // Datos extra que vendrán del formulario
            datosPaciente, // Objeto con { diagnostico, hospital... }
            datosEstudiante // Objeto con { institucion, carrera... }
        } = req.body;

        // 1. Validaciones básicas
        if (!dni || !nombres || !apellidos) {
            throw new Error("Faltan datos obligatorios");
        }

        // 2. Verificar existencia
        const [existente] = await connection.query('SELECT idpersona FROM persona WHERE dni = ?', [dni]);
        let idPersonaFinal;

        if (existente.length > 0) {
            // Actualizar
            idPersonaFinal = existente[0].idpersona;
            await connection.query(
                `UPDATE persona SET nombres=?, apellidos=?, telefono=?, procedencia=?, idtipo_persona=? WHERE idpersona=?`,
                [nombres, apellidos, telefono, procedencia, idtipo_persona, idPersonaFinal]
            );
        } else {
            // Insertar
            const [result] = await connection.query(
                `INSERT INTO persona (dni, nombres, apellidos, telefono, procedencia, idtipo_persona) VALUES (?, ?, ?, ?, ?, ?)`,
                [dni, nombres, apellidos, telefono, procedencia, idtipo_persona]
            );
            idPersonaFinal = result.insertId;
        }

        // 3. GUARDAR FICHA ESPECÍFICA SEGÚN EL TIPO
        
        // Si es PACIENTE (ID 1) y vienen datos
        if (idtipo_persona == 1 && datosPaciente) {
            // Usamos INSERT ... ON DUPLICATE KEY UPDATE por si ya existía la ficha
            await connection.query(
                `INSERT INTO ficha_paciente (idpersona, diagnostico, hospital_origen, codigo_sis) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE diagnostico=?, hospital_origen=?, codigo_sis=?`,
                [idPersonaFinal, datosPaciente.diagnostico, datosPaciente.hospital, datosPaciente.sis,
                 datosPaciente.diagnostico, datosPaciente.hospital, datosPaciente.sis]
            );
        }

        // Si es ESTUDIANTE (ID 2) y vienen datos
        if (idtipo_persona == 2 && datosEstudiante) {
            await connection.query(
                `INSERT INTO ficha_estudiante (idpersona, institucion, carrera, ciclo_actual) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE institucion=?, carrera=?, ciclo_actual=?`,
                [idPersonaFinal, datosEstudiante.institucion, datosEstudiante.carrera, datosEstudiante.ciclo,
                 datosEstudiante.institucion, datosEstudiante.carrera, datosEstudiante.ciclo]
            );
        }

        await connection.commit(); // CONFIRMA TODO
        connection.release();

        res.status(201).json({
            success: true,
            mensaje: "Persona y ficha registradas correctamente",
            data: { idpersona: idPersonaFinal }
        });

    } catch (error) {
        await connection.rollback(); // SI FALLA, DESHACE TODO
        connection.release();
        res.status(500).json({ success: false, mensaje: error.message });
    }
};

// 4. Actualizar persona (Endpoint explícito PUT)
const actualizarPersona = async (req, res) => {
    try {
        const { id } = req.params;
        const { dni, nombres, apellidos, telefono, procedencia, idtipo_persona, estado } = req.body;

        const [personaExistente] = await db.query('SELECT idpersona FROM persona WHERE idpersona = ?', [id]);

        if (personaExistente.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Persona no encontrada" });
        }

        await db.query(
            `UPDATE persona
             SET dni=?, nombres=?, apellidos=?, telefono=?, procedencia=?, idtipo_persona=?, estado=?
             WHERE idpersona=?`,
            [dni, nombres, apellidos, telefono, procedencia, idtipo_persona, estado, id]
        );

        res.status(201).json({ success: true, mensaje: "Persona actualizada correctamente" });
    } catch (error) {
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
const buscarPorDni = async (req, res) => {
    try {
        const { dni } = req.params;
        const [persona] = await db.query('SELECT * FROM persona WHERE dni = ?', [dni]);

        if (persona.length === 0) {
            return res.json({ success: true, data: null, mensaje: "Persona no encontrada" });
        }

        res.json({ success: true, data: persona[0] });
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