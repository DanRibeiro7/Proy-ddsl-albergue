const db = require('../config/database');

// Obtener todas las habitaciones
const obtenerHabitaciones = async (req, res) => {
    try {
        const [habitaciones] = await db.query(
            'SELECT * FROM habitacion ORDER BY piso, numero_habitacion'
        );

        res.json({
            success: true,
            count: habitaciones.length,
            data: habitaciones
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener habitaciones',
            error: error.message
        });
    }
};

// Obtener habitación por ID
const obtenerHabitacionPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [habitacion] = await db.query(
            'SELECT * FROM habitacion WHERE idhabitacion = ?',
            [id]
        );

        if (habitacion.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Habitación no encontrada'
            });
        }

        res.json({
            success: true,
            data: habitacion[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener habitación',
            error: error.message
        });
    }
};

// Crear habitación
const crearHabitacion = async (req, res) => {
    try {
        const { numero_habitacion, piso, tipo, capacidad } = req.body;

        if (!numero_habitacion || !piso || !tipo || !capacidad) {
            return res.status(400).json({
                success: false,
                mensaje: 'Datos obligatorios faltantes'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO habitacion
             (numero_habitacion, piso, tipo, capacidad)
             VALUES (?, ?, ?, ?)`,
            [numero_habitacion, piso, tipo, capacidad]
        );

        res.status(201).json({
            success: true,
            mensaje: 'Habitación creada correctamente',
            data: {
                idhabitacion: resultado.insertId,
                numero_habitacion,
                piso,
                tipo,
                capacidad
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear habitación',
            error: error.message
        });
    }
};

// Actualizar habitación
const actualizarHabitacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_habitacion, piso, tipo, capacidad, estado } = req.body;

        const [existe] = await db.query(
            'SELECT * FROM habitacion WHERE idhabitacion = ?',
            [id]
        );

        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Habitación no encontrada'
            });
        }

        await db.query(
            `UPDATE habitacion
             SET numero_habitacion=?, piso=?, tipo=?, capacidad=?, estado=?
             WHERE idhabitacion=?`,
            [numero_habitacion, piso, tipo, capacidad, estado, id]
        );

        res.json({
            success: true,
            mensaje: 'Habitación actualizada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar habitación',
            error: error.message
        });
    }
};

// Eliminar habitación
const eliminarHabitacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [existe] = await db.query(
            'SELECT * FROM habitacion WHERE idhabitacion = ?',
            [id]
        );

        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: 'Habitación no encontrada'
            });
        }

        await db.query(
            'DELETE FROM habitacion WHERE idhabitacion = ?',
            [id]
        );

        res.json({
            success: true,
            mensaje: 'Habitación eliminada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar habitación',
            error: error.message
        });
    }
};

module.exports = {
    obtenerHabitaciones,
    obtenerHabitacionPorId,
    crearHabitacion,
    actualizarHabitacion,
    eliminarHabitacion
};
