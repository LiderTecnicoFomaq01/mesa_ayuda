const express = require('express');
const path = require('path');
const router = express.Router();
const detalleTicketController = require('../controllers/detalle-ticket');

// Ruta para servir los archivos estáticos (archivos)
// La carpeta de subida está ubicada en "src/archivos"
router.use('/archivos', express.static(path.join(__dirname, '../archivos')));

// Ruta para obtener los detalles completos del ticket
router.get('/:id', detalleTicketController.getTicketDetails);

module.exports = router;
