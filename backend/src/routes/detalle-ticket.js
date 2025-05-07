const express = require('express');
const router = express.Router();
const detalleTicketController = require('../controllers/detalle-ticket');

// Ruta para obtener los detalles completos del ticket
router.get('/:id', detalleTicketController.getTicketDetails);

module.exports = router;
