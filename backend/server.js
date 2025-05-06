require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Configuración CORS segura
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importación segura de rutas
try {
  const authRoutes = require('./src/routes/authRoutes');
  const areasRoutes = require('./src/routes/areasRoutes');
  const ticketsRoutes = require('./src/routes/ticketsRoutes');
  const filtrosRoutes = require('./src/routes/filtrosRoutes');
  app.use('/api/filtros', filtrosRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/areas', areasRoutes);
  app.use('/api/tickets', ticketsRoutes);
  
  console.log('Todas las rutas cargadas correctamente');
} catch (err) {
  console.error('Error al cargar rutas:', err);
  process.exit(1);
}

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});

// Manejo de cierre
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});