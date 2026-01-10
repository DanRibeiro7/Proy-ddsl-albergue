require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const personaRoutes = require('./routes/personaRoutes');
const habitacionRoutes = require('./routes/habitacionRoutes');
const registroRoutes = require('./routes/registroRoutes');
const reporteRoutes = require('./routes/reporteRoutes'); // Tu nueva ruta
const comunidadRoutes = require('./routes/comunidadRoutes');
const acompananteRoutes = require('./routes/acompananteRoutes');
const maestroRoutes = require('./routes/maestroRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permite peticiones desde Angular
app.use(express.json()); // Permite recibir JSON en el body
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/reportes', reporteRoutes); // Aquí se conectan tus reportes
app.use('/api/comunidades', comunidadRoutes);
app.use('/api/acompanantes', acompananteRoutes);
app.use('/api/maestros', maestroRoutes);

app.get('/', (req, res) => {
    res.json({
        estado: 'Online',
        mensaje: 'API ALBERGUE YURÚA - SISTEMA DE GESTIÓN v1.0',
        fecha: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo exitosamente en: http://localhost:${PORT}`);
});