require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// ✅ Configuración CORS correcta
const allowedOrigins = [
  'http://127.0.0.1:5500', // entorno local
  'https://fomagmesayuda-0a68b8706cab.herokuapp.com' // frontend en producción (Heroku)
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// 🛡️ Aplica CORS a todas las rutas
app.use(cors(corsOptions));

// 🔁 Permitir preflight requests
app.options('*', cors(corsOptions));

// 🧩 Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 📁 Servir archivos estáticos desde 'src/uploads'
const uploadsPath = path.join(__dirname, 'src', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ✅ Cargar rutas
try {
  const cambioEstadoRoutes = require('./src/routes/cambioEstadoRoutes');
  const authRoutes = require('./src/routes/authRoutes');
  const areasRoutes = require('./src/routes/areasRoutes');
  const ticketsRoutes = require('./src/routes/ticketsRoutes');
  const filtrosRoutes = require('./src/routes/filtrosRoutes');
  const misSolicitudesTicketsRoutes = require('./src/routes/misSolicitudesTicketsRoutes');
  const misAsignadasTicketsRoutes = require('./src/routes/misAsignadasTicketsRoutes');
  const solicitudesGeneralesTicketsRoutes = require('./src/routes/solicitudesGeneralesTicketsRoutes');
  const detalleTicketRoutes = require('./src/routes/detalle-ticket');
  const solicitudesAtendidasTicketsRoutes = require('./src/routes/solicitudesAtendidasRoutes');
  const respuestaRoutes = require('./src/routes/respuestaRoutes');
  const satisfaccionRoutes = require('./src/routes/satisfaccionRoutes');
  const redireccionarRoutes = require('./src/routes/redireccionarRoutes');

  app.use('/api', redireccionarRoutes);
  app.use('/api', cambioEstadoRoutes);
  app.use('/api/detalle-ticket', detalleTicketRoutes);
  app.use('/api/filtros', filtrosRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/areas', areasRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api', misSolicitudesTicketsRoutes);
  app.use('/api/asignadas', misAsignadasTicketsRoutes);
  app.use('/api/generales', solicitudesGeneralesTicketsRoutes);
  app.use('/api/atendidas', solicitudesAtendidasTicketsRoutes);
  app.use('/api/responder', respuestaRoutes);
  app.use('/api', satisfaccionRoutes);

  console.log('✅ Todas las rutas cargadas correctamente');
} catch (err) {
  console.error('❌ Error al cargar rutas:', err);
  process.exit(1);
}

// 🩺 Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 🧯 Middleware global de errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});

// 🛑 Cierre limpio del servidor
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
