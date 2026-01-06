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
    try {
        const { dni, nombres, apellidos, telefono, procedencia, idtipo_persona } = req.body;

        // Validaciones básicas (Apellidos es obligatorio en tu BD)
        if (!dni || !nombres || !apellidos) {
            return res.status(400).json({
                success: false,
                mensaje: "Faltan datos obligatorios (DNI, Nombres o Apellidos)"
            });
        }

        // VERIFICACIÓN INTELIGENTE: ¿Existe ya este DNI?
        const [existente] = await db.query('SELECT idpersona FROM persona WHERE dni = ?', [dni]);

        if (existente.length > 0) {
            // === SI EXISTE: ACTUALIZAMOS (UPDATE) ===
            const id = existente[0].idpersona;
            await db.query(
                `UPDATE persona 
                 SET nombres=?, apellidos=?, telefono=?, procedencia=?, idtipo_persona=? 
                 WHERE idpersona=?`,
                [nombres, apellidos, telefono, procedencia, idtipo_persona, id]
            );
            
            return res.json({
                success: true,
                mensaje: 'Datos de persona actualizados correctamente',
                data: { idpersona: id } // Devolvemos el ID para que el frontend pueda seguir
            });

        } else {
            // === SI NO EXISTE: CREAMOS (INSERT) ===
            const [resultado] = await db.query(
                `INSERT INTO persona (dni, nombres, apellidos, telefono, procedencia, idtipo_persona, estado)
                 VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`,
                [dni, nombres, apellidos, telefono, procedencia, idtipo_persona || 2] // Default a 2 (Estudiante) si falta
            );

            return res.status(201).json({
                success: true,
                mensaje: "Persona registrada correctamente",
                data: { idpersona: resultado.insertId }
            });
        }

    } catch (error) {
        console.error("Error SQL al guardar persona:", error);
        res.status(500).json({
            success: false,
            mensaje: "Error al registrar persona",
            error: error.message
        });
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