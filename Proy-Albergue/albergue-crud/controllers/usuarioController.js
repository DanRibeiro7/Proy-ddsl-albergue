const db = require('../config/database');
const bcrypt = require('bcrypt');

// Crear usuario
const crearUsuario = async (req, res) => {
    try {
        const { username, password, idrol } = req.body;

        const hash = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO usuario(username, password, idrol)
             VALUES (?, ?, ?)`,
            [username, hash, idrol]
        );

        res.status(201).json({
            success: true,
            mensaje: 'Usuario creado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear usuario',
            error: error.message
        });
    }
};

module.exports = {
    crearUsuario
};
