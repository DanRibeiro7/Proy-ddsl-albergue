require('dotenv').config();
const express = require('express');
const cors = require('cors');

// =====================
// Importar Rutas
// =====================
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const personaRoutes = require('./routes/personaRoutes');
const habitacionRoutes = require('./routes/habitacionRoutes');
const registroRoutes = require('./routes/registroRoutes');
const reporteRoutes = require('./routes/reporteRoutes'); // Tu nueva ruta

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares Globales
// =====================
app.use(cors()); // Permite peticiones desde Angular
app.use(express.json()); // Permite recibir JSON en el body
app.use(express.urlencoded({ extended: true }));

// =====================
// Definición de Endpoints
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/reportes', reporteRoutes); // Aquí se conectan tus reportes

// =====================
// Ruta raíz de prueba
// =====================
app.get('/', (req, res) => {
    res.json({
        estado: 'Online',
        mensaje: 'API ALBERGUE YURÚA - SISTEMA DE GESTIÓN v1.0',
        fecha: new Date()
    });
});

// =====================
// Inicializar Servidor
// =====================
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo exitosamente en: http://localhost:${PORT}`);
});