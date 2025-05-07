require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

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

// Configuración para servir archivos estáticos desde la carpeta 'uploads'
const uploadsPath = path.join(__dirname, 'src', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Importación segura de rutas
try {
  const authRoutes = require('./src/routes/authRoutes');
  const areasRoutes = require('./src/routes/areasRoutes');
  const ticketsRoutes = require('./src/routes/ticketsRoutes');
  const filtrosRoutes = require('./src/routes/filtrosRoutes');
  const misSolicitudesTicketsRoutes = require('./src/routes/misSolicitudesTicketsRoutes');
  const detalleTicketRoutes = require('./src/routes/detalle-ticket');

  app.use('/api/detalle-ticket', detalleTicketRoutes);
  app.use('/api/filtros', filtrosRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/areas', areasRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api', misSolicitudesTicketsRoutes);
  
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