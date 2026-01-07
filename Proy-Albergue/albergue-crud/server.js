require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const personaRoutes = require('./routes/personaRoutes');
const habitacionRoutes = require('./routes/habitacionRoutes');
const registroRoutes = require('./routes/registroRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Rutas principales
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reportes', reporteRoutes);

// =====================
// Ruta raíz
// =====================
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API ALBERGUE - SISTEMA DE GESTIÓN'
    });
});

// =====================
// Inicializar servidor
// =====================
app.listen(PORT, () => {
    console.log(`Servidor inicializado en http://localhost:${PORT}`);
});
