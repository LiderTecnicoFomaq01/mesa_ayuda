const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/solicitudesGeneralesTicketsController');

router.get('/solicitudesGeneralesTickets/:usuarioId', ticketController.getMisTickets);

module.exports = router;
