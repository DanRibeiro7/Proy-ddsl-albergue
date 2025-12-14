const db = require('../config/database');

// Obtener todas las personas
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

// Obtener persona por ID
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

// Crear persona
const crearPersona = async (req, res) => {
    try {
        const {
            dni,
            nombres,
            apellidos,
            telefono,
            procedencia,
            idtipo_persona
        } = req.body;

        if (!dni || !nombres || !apellidos || !idtipo_persona) {
            return res.status(400).json({
                success: false,
                mensaje: "Datos obligatorios faltantes"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO persona
             (dni, nombres, apellidos, telefono, procedencia, idtipo_persona)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [dni, nombres, apellidos, telefono, procedencia, idtipo_persona]
        );

        res.status(201).json({
            success: true,
            mensaje: "Persona registrada correctamente",
            data: {
                idpersona: resultado.insertId,
                dni,
                nombres,
                apellidos,
                telefono,
                procedencia,
                idtipo_persona
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al registrar persona",
            error: error.message
        });
    }
};

// Actualizar persona
const actualizarPersona = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            dni,
            nombres,
            apellidos,
            telefono,
            procedencia,
            idtipo_persona,
            estado
        } = req.body;

        const [personaExistente] = await db.query(
            'SELECT * FROM persona WHERE idpersona = ?',
            [id]
        );

        if (personaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Persona no encontrada"
            });
        }

        await db.query(
            `UPDATE persona
             SET dni=?, nombres=?, apellidos=?, telefono=?, procedencia=?, 
                 idtipo_persona=?, estado=?
             WHERE idpersona=?`,
            [dni, nombres, apellidos, telefono, procedencia, idtipo_persona, estado, id]
        );

        res.status(201).json({
            success: true,
            mensaje: "Persona actualizada correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar persona",
            error: error.message
        });
    }
};

// Eliminar persona
const eliminarPersona = async (req, res) => {
    try {
        const { id } = req.params;

        const [personaExistente] = await db.query(
            'SELECT * FROM persona WHERE idpersona = ?',
            [id]
        );

        if (personaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Persona no encontrada"
            });
        }

        await db.query(
            'DELETE FROM persona WHERE idpersona = ?',
            [id]
        );

        res.json({
            success: true,
            mensaje: "Persona eliminada correctamente"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar persona",
            error: error.message
        });
    }
};

// Obtener personas por tipo
const obtenerPersonasPorTipo = async (req, res) => {
    try {
        const { id } = req.params;

        const [personas] = await db.query(`
            SELECT p.*, tp.nombre AS tipoPersona
            FROM persona p
            INNER JOIN tipo_persona tp ON p.idtipo_persona = tp.idtipo_persona
            WHERE p.idtipo_persona = ?
        `, [id]);

        res.json({
            success: true,
            count: personas.length,
            data: personas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener personas por tipo",
            error: error.message
        });
    }
};

module.exports = {
    obtenerPersonas,
    obtenerPersonaPorId,
    crearPersona,
    actualizarPersona,
    eliminarPersona,
    obtenerPersonasPorTipo
};
