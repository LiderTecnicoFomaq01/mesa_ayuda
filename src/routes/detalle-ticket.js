const express = require('express');
const path = require('path');
const router = express.Router();
const detalleTicketController = require('../controllers/detalle-ticket');

// Ruta para servir los archivos estáticos (uploads)
// La carpeta de subida está ubicada en "src/uploads"
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta para obtener los detalles completos del ticket
router.get('/:id', detalleTicketController.getTicketDetails);

module.exports = router;
