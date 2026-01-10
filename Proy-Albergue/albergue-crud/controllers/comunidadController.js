const db = require('../config/database');

const obtenerComunidades = async (req, res) => {
    try {
       
        const [comunidades] = await db.query('SELECT * FROM comunidad_nativa ORDER BY nombre ASC');

        res.json({
            success: true,
            count: comunidades.length,
            data: comunidades
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener comunidades',
            error: error.message
        });
    }
};

const obtenerComunidadPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [comunidad] = await db.query('SELECT * FROM comunidad_nativa WHERE id_comunidad = ?', [id]);

        if (comunidad.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Comunidad no encontrada'
            });
        }

        res.json({
            success: true,
            data: comunidad[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener la comunidad',
            error: error.message
        });
    }
};

const crearComunidad = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre de la comunidad es obligatorio'
            });
        }

        const [resultado] = await db.query('INSERT INTO comunidad_nativa (nombre) VALUES (?)', [nombre]);

        res.status(201).json({
            success: true,
            mensaje: 'Comunidad registrada correctamente',
            data: {
                id_comunidad: resultado.insertId,
                nombre
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear comunidad',
            error: error.message
        });
    }
};

const actualizarComunidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const [existe] = await db.query('SELECT * FROM comunidad_nativa WHERE id_comunidad = ?', [id]);

        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Comunidad no encontrada'
            });
        }

        await db.query('UPDATE comunidad_nativa SET nombre = ? WHERE id_comunidad = ?', [nombre, id]);

        res.json({
            success: true,
            mensaje: 'Comunidad actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar comunidad',
            error: error.message
        });
    }
};

const eliminarComunidad = async (req, res) => {
    try {
        const { id } = req.params;
        const [existe] = await db.query('SELECT * FROM comunidad_nativa WHERE id_comunidad = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Comunidad no encontrada'
            });
        }

       
        const [enUso] = await db.query('SELECT idpersona FROM persona WHERE id_comunidad = ? LIMIT 1', [id]);
        if (enUso.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: 'No se puede eliminar: Hay personas registradas con esta comunidad.'
            });
        }

        await db.query('DELETE FROM comunidad_nativa WHERE id_ comunidad = ?', [id]);

        res.json({
            success: true,
            mensaje: 'Comunidad eliminada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar comunidad',
            error: error.message
        });
    }
};

module.exports = {
    obtenerComunidades,
    obtenerComunidadPorId,
    crearComunidad,
    actualizarComunidad,
    eliminarComunidad
};